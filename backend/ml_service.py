"""
Service central : chargement des modeles ML + acces aux donnees des lieux
d'Azemmour + logique de generation d'itineraire.

Tout le reste de l'app (routes Flask) passe par ce module plutot que de
manipuler les modeles/donnees directement.
"""
import json
import math
import os

import joblib
import pandas as pd

import sklearn_compat  # noqa: F401 - doit etre importe avant joblib.load

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODELS_DIR = os.path.join(BASE_DIR, "models")
DATA_DIR = os.path.join(BASE_DIR, "data")

CSV_PATH = os.path.join(DATA_DIR, "azemmour_attractions_enrichi_v3.csv")
STORE_PATH = os.path.join(DATA_DIR, "places_store.json")

CLASSIFICATION_MODEL_PATH = os.path.join(MODELS_DIR, "model_classification.joblib")
REGRESSION_MODEL_PATH = os.path.join(MODELS_DIR, "model_regression_duree.joblib")

STATIC_PHOTOS_DIR = os.path.join(BASE_DIR, "static", "photos")
PHOTO_EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp"]

VITESSE_KMH = 30  # vitesse moyenne de deplacement en ville, utilisee pour les trajets
VILLE_CIBLE = "Azemmour"

CATEGORIES = [
    "monument", "religieux", "plage", "nature",
    "artisanat", "art", "evenementiel",
    "restaurant", "cafe", "hotel",
]

# --------------------------------------------------------------------------
# Chargement des modeles (une seule fois, au demarrage du process Flask)
# --------------------------------------------------------------------------
print("Chargement du modele de classification...")
classification_model = joblib.load(CLASSIFICATION_MODEL_PATH)

print("Chargement du modele de regression (duree de visite)...")
regression_model = joblib.load(REGRESSION_MODEL_PATH)

print("Modeles charges avec succes.")


# --------------------------------------------------------------------------
# Chargement / initialisation du store des lieux (JSON, persistant sur disque)
# --------------------------------------------------------------------------
def _init_store_from_csv():
    """Cree le fichier de store JSON a partir du CSV source, limite a Azemmour."""
    df = pd.read_csv(CSV_PATH)
    df = df[df["ville"] == VILLE_CIBLE].copy()

    places = []
    for _, row in df.iterrows():
        note_val = row["note"]
        # df.where(...) ne suffit pas a convertir NaN -> None sur une colonne
        # float64 (l'assignation redevient NaN) : on verifie avec pd.isna ici.
        note_clean = None if pd.isna(note_val) else float(note_val)
        adresse_val = None if pd.isna(row["adresse"]) else row["adresse"]

        places.append({
            "id": int(row["id"]),
            "nom": row["nom"],
            "categorie": row["categorie"],
            "description": row["description"],
            "latitude": float(row["latitude"]),
            "longitude": float(row["longitude"]),
            "note": note_clean,
            "adresse": adresse_val,
            "ville": row["ville"],
            "photo_url": None,          # pas de vraie photo pour l'instant -> placeholder cote frontend
        })

    with open(STORE_PATH, "w", encoding="utf-8") as f:
        json.dump(places, f, ensure_ascii=False, indent=2)

    return places


def _load_store():
    if not os.path.exists(STORE_PATH):
        return _init_store_from_csv()
    with open(STORE_PATH, "r", encoding="utf-8") as f:
        return json.load(f)


# --------------------------------------------------------------------------
# Photos : chaque lieu a son propre dossier backend/static/photos/<id>/
# contenant une ou plusieurs images.
# --------------------------------------------------------------------------
def _photos_for(place_id):
    """Renvoie la liste des URLs de toutes les photos d'un lieu (dossier
    static/photos/<id>/), ou une liste vide si aucune photo n'existe.
    Verifie a chaque appel (pas de cache) pour qu'une photo ajoutee soit
    prise en compte sans redemarrer le serveur."""
    folder = os.path.join(STATIC_PHOTOS_DIR, str(place_id))
    if not os.path.isdir(folder):
        return []
    fichiers = sorted(
        f for f in os.listdir(folder)
        if os.path.splitext(f)[1].lower() in PHOTO_EXTENSIONS
    )
    return [f"/static/photos/{place_id}/{f}" for f in fichiers]


def _with_photo(place):
    place = dict(place)
    photos = _photos_for(place["id"])
    place["photos"] = photos
    place["photo_url"] = photos[0] if photos else None
    return place


# --------------------------------------------------------------------------
# API publique du service
# --------------------------------------------------------------------------
def get_all_places():
    return [_with_photo(p) for p in _load_store()]


def get_place_by_id(place_id):
    for p in _load_store():
        if p["id"] == place_id:
            return _with_photo(p)
    return None


def get_categories():
    return CATEGORIES


def predict_category(nom, description):
    """Predit la categorie a partir du nom + description (Modele 1)."""
    texte = f"{nom or ''} . {description or ''}"
    proba = classification_model.predict_proba([texte])[0]
    classes = classification_model.classes_
    ranked = sorted(zip(classes, proba), key=lambda x: x[1], reverse=True)
    return {
        "categorie_predite": ranked[0][0],
        "confiance": round(float(ranked[0][1]), 3),
        "toutes_probabilites": {c: round(float(p), 3) for c, p in ranked},
    }


def predict_duration(categorie, note, description):
    """Predit la duree de visite en minutes (Modele 2)."""
    longueur_description = len(description or "")
    note_val = 4.0 if note is None or (isinstance(note, float) and math.isnan(note)) else note
    sample = pd.DataFrame([{
        "categorie": categorie,
        "note": note_val,
        "longueur_description": longueur_description,
    }])
    pred = regression_model.predict(sample)[0]
    return round(float(pred))


# --------------------------------------------------------------------------
# Generation d'itineraire (heuristique plus proche voisin + haversine)
# --------------------------------------------------------------------------
def _haversine_km(lat1, lon1, lat2, lon2):
    R = 6371.0
    phi1, phi2 = math.radians(lat1), math.radians(lat2)
    dphi = math.radians(lat2 - lat1)
    dlambda = math.radians(lon2 - lon1)
    a = math.sin(dphi / 2) ** 2 + math.cos(phi1) * math.cos(phi2) * math.sin(dlambda / 2) ** 2
    return 2 * R * math.asin(math.sqrt(a))


def _ordonner_plus_proche_voisin(lieux):
    if not lieux:
        return []
    restants = lieux[:]
    ordre = [restants.pop(0)]
    while restants:
        dernier = ordre[-1]
        idx_plus_proche = min(
            range(len(restants)),
            key=lambda i: _haversine_km(
                dernier["latitude"], dernier["longitude"],
                restants[i]["latitude"], restants[i]["longitude"],
            ),
        )
        ordre.append(restants.pop(idx_plus_proche))
    return ordre


def generer_itineraire(categories_choisies):
    """Genere un itineraire optimise pour les lieux d'Azemmour correspondant
    aux categories choisies."""
    if not categories_choisies:
        return {"erreur": "Au moins une catégorie doit être sélectionnée."}

    places = [_with_photo(p) for p in _load_store() if p["categorie"] in categories_choisies]
    if not places:
        return {"erreur": "Aucun lieu trouvé pour ces catégories."}

    ordre = _ordonner_plus_proche_voisin(places)

    etapes = []
    duree_visites = 0.0
    duree_trajets = 0.0
    for i, lieu in enumerate(ordre):
        duree_visite = predict_duration(lieu["categorie"], lieu["note"], lieu["description"])
        duree_visites += duree_visite

        trajet_km = trajet_min = 0.0
        if i > 0:
            prev = ordre[i - 1]
            trajet_km = _haversine_km(prev["latitude"], prev["longitude"], lieu["latitude"], lieu["longitude"])
            trajet_min = trajet_km / VITESSE_KMH * 60
            duree_trajets += trajet_min

        etapes.append({
            "ordre": i + 1,
            "id": lieu["id"],
            "nom": lieu["nom"],
            "categorie": lieu["categorie"],
            "photo_url": lieu["photo_url"],
            "latitude": lieu["latitude"],
            "longitude": lieu["longitude"],
            "duree_visite_min": duree_visite,
            "trajet_depuis_precedent_km": round(trajet_km, 2),
            "trajet_depuis_precedent_min": round(trajet_min),
        })

    return {
        "nb_lieux": len(ordre),
        "duree_visites_min": round(duree_visites),
        "duree_trajets_min": round(duree_trajets),
        "duree_totale_min": round(duree_visites + duree_trajets),
        "duree_totale_h": round((duree_visites + duree_trajets) / 60, 1),
        "etapes": etapes,
    }

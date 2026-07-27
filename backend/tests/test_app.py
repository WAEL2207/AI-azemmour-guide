"""
Tests de la Flask API. Utilisent le vrai app.py + ml_service.py (modeles et
donnees reels) via le test client Flask - pas de mocks, ce sont des tests
d'integration legers plutot que des tests unitaires purs.

Lancer avec : cd backend && pytest
"""
import app as flask_app_module
import ml_service
import pytest


@pytest.fixture
def client():
    flask_app_module.app.config["TESTING"] = True
    with flask_app_module.app.test_client() as client:
        yield client


# ---------------------------------------------------------------------------
# Sante / info
# ---------------------------------------------------------------------------
def test_health(client):
    res = client.get("/api/health")
    assert res.status_code == 200
    data = res.get_json()
    assert data["status"] == "ok"
    assert data["ville"] == "Azemmour"


def test_categories(client):
    res = client.get("/api/categories")
    assert res.status_code == 200
    cats = res.get_json()
    assert set(cats) == set(ml_service.CATEGORIES)
    assert len(cats) == 10


# ---------------------------------------------------------------------------
# Lieux
# ---------------------------------------------------------------------------
def test_list_places(client):
    res = client.get("/api/places")
    assert res.status_code == 200
    places = res.get_json()
    assert isinstance(places, list)
    assert len(places) > 0
    for p in places:
        assert "id" in p
        assert "nom" in p
        assert "categorie" in p
        assert "photos" in p  # liste de la galerie, meme vide


def test_list_places_filtered_by_categorie(client):
    res = client.get("/api/places?categorie=monument")
    assert res.status_code == 200
    places = res.get_json()
    assert len(places) > 0
    assert all(p["categorie"] == "monument" for p in places)


def test_get_place_found(client):
    all_places = client.get("/api/places").get_json()
    first_id = all_places[0]["id"]

    res = client.get(f"/api/places/{first_id}")
    assert res.status_code == 200
    assert res.get_json()["id"] == first_id


def test_get_place_not_found(client):
    res = client.get("/api/places/999999")
    assert res.status_code == 404


def test_add_and_delete_place_routes_removed(client):
    # Retires volontairement avec la fonctionnalite "ajouter un lieu".
    assert client.post("/api/places", json={"nom": "x"}).status_code == 405
    assert client.delete("/api/places/1").status_code == 405


# ---------------------------------------------------------------------------
# Modele 1 : classification
# ---------------------------------------------------------------------------
def test_classify_requires_nom_or_description(client):
    res = client.post("/api/classify", json={})
    assert res.status_code == 400


def test_classify_returns_known_category(client):
    res = client.post("/api/classify", json={
        "nom": "Riad test",
        "description": "Maison d'hotes traditionnelle avec chambres et petit-dejeuner marocain.",
    })
    assert res.status_code == 200
    data = res.get_json()
    assert data["categorie_predite"] in ml_service.CATEGORIES
    assert 0 <= data["confiance"] <= 1
    assert set(data["toutes_probabilites"]) == set(ml_service.CATEGORIES)


# ---------------------------------------------------------------------------
# Modele 2 : duree de visite
# ---------------------------------------------------------------------------
def test_predict_duration_for_every_category(client):
    for cat in ml_service.CATEGORIES:
        res = client.post("/api/predict-duration", json={
            "categorie": cat, "note": 4.0, "description": "une description de test",
        })
        assert res.status_code == 200, f"categorie={cat}"
        assert res.get_json()["duree_visite_estimee_min"] > 0


def test_predict_duration_missing_categorie(client):
    res = client.post("/api/predict-duration", json={"note": 4.0})
    assert res.status_code == 400


def test_predict_duration_unknown_categorie(client):
    res = client.post("/api/predict-duration", json={"categorie": "inexistante"})
    assert res.status_code == 400


# ---------------------------------------------------------------------------
# Itineraire
# ---------------------------------------------------------------------------
def test_itineraire_requires_categories(client):
    res = client.post("/api/itineraire", json={})
    assert res.status_code == 400


def test_itineraire_unknown_category_returns_error(client):
    res = client.post("/api/itineraire", json={"categories": ["inexistante"]})
    assert res.status_code == 400


def test_itineraire_generates_ordered_route(client):
    res = client.post("/api/itineraire", json={"categories": ["monument", "religieux"]})
    assert res.status_code == 200
    data = res.get_json()

    assert data["nb_lieux"] == len(data["etapes"])
    assert data["nb_lieux"] > 0

    ordres = [e["ordre"] for e in data["etapes"]]
    assert ordres == list(range(1, len(ordres) + 1))

    # la premiere etape n'a pas de trajet depuis une etape precedente
    assert data["etapes"][0]["trajet_depuis_precedent_km"] == 0
    assert data["etapes"][0]["trajet_depuis_precedent_min"] == 0

    assert data["duree_totale_min"] == data["duree_visites_min"] + data["duree_trajets_min"]

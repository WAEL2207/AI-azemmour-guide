"""
API Flask - Guide touristique IA d'Azemmour.

Endpoints :
  GET    /api/health
  GET    /api/categories
  GET    /api/places                 (optionnel: ?categorie=monument)
  GET    /api/places/<id>
  POST   /api/classify               ({nom, description} -> categorie predite)
  POST   /api/predict-duration       ({categorie, note, description} -> duree en min)
  POST   /api/itineraire             ({categories: [...]})

En production (voir render.yaml), ce meme process sert aussi le frontend
React deja compile (frontend/dist/) pour n'avoir qu'un seul service a
deployer. En dev, le frontend tourne separement via `npm run dev` (Vite,
port 5173) et proxie /api + /static vers ce serveur Flask (port 5000) -
voir frontend/vite.config.js.
"""
import os

from flask import Flask, jsonify, request, send_from_directory

import ml_service

app = Flask(__name__)

FRONTEND_DIST = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "frontend", "dist")

# ---------------------------------------------------------------------------
# CORS "maison" (flask-cors n'est pas requis) : autorise le frontend React
# (Vite dev server, generalement sur http://localhost:5173) a appeler l'API.
# ---------------------------------------------------------------------------
@app.after_request
def add_cors_headers(response):
    response.headers["Access-Control-Allow-Origin"] = "*"
    response.headers["Access-Control-Allow-Headers"] = "Content-Type"
    response.headers["Access-Control-Allow-Methods"] = "GET, POST, DELETE, OPTIONS"
    return response


@app.route("/api/<path:_any>", methods=["OPTIONS"])
def cors_preflight(_any):
    return "", 204


# ---------------------------------------------------------------------------
# Sante / info
# ---------------------------------------------------------------------------
@app.route("/api/health")
def health():
    return jsonify({"status": "ok", "ville": ml_service.VILLE_CIBLE})


@app.route("/api/categories")
def categories():
    return jsonify(ml_service.get_categories())


# ---------------------------------------------------------------------------
# Lieux
# ---------------------------------------------------------------------------
@app.route("/api/places", methods=["GET"])
def list_places():
    categorie = request.args.get("categorie")
    places = ml_service.get_all_places()
    if categorie:
        places = [p for p in places if p["categorie"] == categorie]
    return jsonify(places)


@app.route("/api/places/<int:place_id>", methods=["GET"])
def get_place(place_id):
    place = ml_service.get_place_by_id(place_id)
    if place is None:
        return jsonify({"erreur": "Lieu introuvable."}), 404
    return jsonify(place)


# ---------------------------------------------------------------------------
# Modele 1 : classification (utilisable seul, sans creer de lieu)
# ---------------------------------------------------------------------------
@app.route("/api/classify", methods=["POST"])
def classify():
    body = request.get_json(force=True, silent=True) or {}
    nom = body.get("nom", "")
    description = body.get("description", "")
    if not nom and not description:
        return jsonify({"erreur": "Fournir au moins 'nom' ou 'description'."}), 400
    return jsonify(ml_service.predict_category(nom, description))


# ---------------------------------------------------------------------------
# Modele 2 : regression (duree de visite), utilisable seul
# ---------------------------------------------------------------------------
@app.route("/api/predict-duration", methods=["POST"])
def predict_duration_route():
    body = request.get_json(force=True, silent=True) or {}
    categorie = body.get("categorie")
    if not categorie:
        return jsonify({"erreur": "Le champ 'categorie' est requis."}), 400
    if categorie not in ml_service.CATEGORIES:
        return jsonify({"erreur": f"Catégorie inconnue. Valeurs possibles : {ml_service.CATEGORIES}"}), 400

    duree = ml_service.predict_duration(
        categorie=categorie,
        note=body.get("note"),
        description=body.get("description", ""),
    )
    return jsonify({"duree_visite_estimee_min": duree})


# ---------------------------------------------------------------------------
# Generation d'itineraire
# ---------------------------------------------------------------------------
@app.route("/api/itineraire", methods=["POST"])
def itineraire():
    body = request.get_json(force=True, silent=True) or {}
    categories_choisies = body.get("categories")
    if not categories_choisies or not isinstance(categories_choisies, list):
        return jsonify({"erreur": "Le champ 'categories' (liste) est requis."}), 400

    result = ml_service.generer_itineraire(categories_choisies)
    if "erreur" in result:
        return jsonify(result), 400
    return jsonify(result)


# ---------------------------------------------------------------------------
# Frontend compile (production uniquement - voir docstring en haut de fichier)
# ---------------------------------------------------------------------------
@app.route("/", defaults={"path": ""})
@app.route("/<path:path>")
def serve_frontend(path):
    if not os.path.isdir(FRONTEND_DIST):
        return jsonify({
            "erreur": "Frontend non compile. Lance 'npm run build' dans frontend/, "
                      "ou utilise 'npm run dev' (port 5173) en developpement.",
        }), 404

    target = os.path.join(FRONTEND_DIST, path)
    if path and os.path.isfile(target):
        return send_from_directory(FRONTEND_DIST, path)
    return send_from_directory(FRONTEND_DIST, "index.html")


if __name__ == "__main__":
    app.run(debug=True, port=5000)

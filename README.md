# Azemmour · Guide touristique IA

Application web (Flask + React) integrant :
- **Modele 1** : classification automatique de la categorie d'un lieu (texte -> categorie)
- **Modele 2** : prediction de la duree de visite
- **Generation d'itineraire** optimise (plus proche voisin + distance haversine)

10 categories sont supportees : les 7 categories touristiques d'origine
(`monument`, `religieux`, `plage`, `nature`, `artisanat`, `art`, `evenementiel`)
plus `restaurant`, `cafe` et `hotel`.

Chaque lieu peut avoir une ou plusieurs vraies photos (galerie avec navigation) ;
tant qu'aucune photo n'est ajoutee, un **"tampon"** colore par categorie sert de
repli visuel (voir section "Photos" plus bas).

L'interface est disponible en **francais et en anglais** (bouton FR/EN en haut a
droite de l'entete, choix retenu d'une visite a l'autre).

## Structure

```
webapp/
  render.yaml       config de deploiement Render (voir section "Deploiement")
  backend/          Flask API (Python)
    app.py                 routes HTTP
    ml_service.py          chargement des modeles + logique metier
    sklearn_compat.py      shim de compatibilite scikit-learn (voir plus bas)
    requirements.txt       dependances pour lancer l'app
    requirements-notebooks.txt   dependances additionnelles pour reentrainer les modeles
    requirements-test.txt        dependance additionnelle pour lancer les tests (pytest)
    conftest.py             config pytest (sys.path)
    tests/
      test_app.py             tests de tous les endpoints de l'API
    models/
      model_classification.joblib
      model_regression_duree.joblib
    notebooks/              notebooks Jupyter pour (re)entrainer les 2 modeles
      train_classification_model.ipynb
      train_regression_model.ipynb
      data/
        morocco_restaurants_cafes_hotels_training.csv   lieux reels (restaurant/cafe/hotel,
                                                          autres villes) utilises pour l'entrainement
    data/
      azemmour_attractions_enrichi_v3.csv   dataset source (94 lieux, 14 villes marocaines)
      places_store.json                      lieux affiches par l'app (filtres sur Azemmour)
    static/photos/<id>/     photos de chaque lieu (voir section "Photos")
  frontend/          React + Vite
    src/
      App.jsx
      api.js                 client HTTP vers le backend
      categories.js          couleurs/libelles des 10 categories (FR + EN)
      i18n/
        strings.js             dictionnaire de chaines UI FR/EN
        placeTranslations.js   traductions EN du nom/description des lieux
        LanguageContext.jsx    contexte React (langue courante, persistee en localStorage)
      components/
        ErrorBoundary.jsx    filet de securite : evite une page blanche en cas de crash
        LanguageToggle.jsx   bouton FR/EN
      *.test.js(x)           tests (Vitest + React Testing Library), a cote du code teste
```

## Lancer le backend

```bash
cd backend
python3 -m venv venv
source venv/bin/activate        # Windows : venv\Scripts\activate
pip install -r requirements.txt
python3 app.py
```

L'API tourne sur **http://localhost:5000**. Les lieux affiches par l'app vivent
dans `data/places_store.json` (deja rempli) ; si ce fichier n'existe pas, il est
recree automatiquement a partir du CSV source, filtre sur Azemmour uniquement.

Verifie que ca fonctionne : http://localhost:5000/api/health

## Lancer le frontend

Dans un **autre terminal** :

```bash
cd frontend
npm install
npm run dev
```

Ouvre **http://localhost:5173**. Le frontend appelle l'API via `/api/...` et les
photos via `/static/...`, que Vite redirige automatiquement vers
`http://localhost:5000` (voir `vite.config.js`) — donc le backend doit deja
tourner.

## Deploiement (Render, gratuit)

En production, un seul process Flask sert a la fois l'API et le frontend React
deja compile (`frontend/dist/`) - pas besoin d'heberger deux services separes.
`render.yaml` a la racine du repo decrit ce service pour Render.

**Etapes :**

1. Pousse ce repo sur GitHub (Render deploie depuis un repo Git).
2. Cree un compte gratuit sur [render.com](https://render.com) (pas de carte
   bancaire requise pour le plan free).
3. Dashboard Render -> **New** -> **Blueprint** -> selectionne ce repo. Render
   lit `render.yaml` automatiquement (build : installe les dependances Python
   + compile le frontend ; start : `gunicorn` sur le port fourni par Render).
4. Clique **Apply**. Le premier build prend quelques minutes (installe
   scikit-learn/pandas + build React) ; l'app est ensuite disponible sur une
   URL publique du type `https://azemmour-guide.onrender.com`, utilisable
   depuis n'importe quel telephone ou PC, sans rien installer cote visiteur.

**⚠️ Important pour une presentation en direct** : le plan gratuit de Render
met le service en veille apres 15 minutes d'inactivite ; la requete suivante
le reveille en 30-60 secondes. Ouvre le lien toi-meme quelques minutes avant
de presenter pour eviter ce delai devant le jury.

**Tester le mode production en local** (optionnel, avant de deployer) :

```bash
cd frontend && npm run build && cd ..
cd backend && python3 app.py
```

Puis ouvre **http://localhost:5000** directement (plus besoin de Vite/port
5173 dans ce mode - Flask sert le build React tel quel).

## Photos

Chaque lieu a son propre dossier `backend/static/photos/<id>/`. Depose-y une ou
plusieurs images (`.jpg`, `.jpeg`, `.png`, `.webp`) et elles apparaissent
automatiquement dans la galerie du lieu — pas besoin de modifier de code ni de
redemarrer le serveur. S'il n'y a aucune image dans le dossier (ou si le
dossier n'existe pas), l'app affiche le tampon de categorie en repli.

L'`id` de chaque dossier correspond au champ `id` du lieu dans
`data/places_store.json`.

## Reentrainer les modeles ML

Les 2 modeles sont reentrainables via les notebooks dans `backend/notebooks/` :

```bash
cd backend
pip install -r requirements-notebooks.txt
python -m ipykernel install --user --name azemmour-guide --display-name "Azemmour Guide (venv)"
cd notebooks
jupyter nbconvert --to notebook --execute --inplace --ExecutePreprocessor.kernel_name=azemmour-guide train_classification_model.ipynb
jupyter nbconvert --to notebook --execute --inplace --ExecutePreprocessor.kernel_name=azemmour-guide train_regression_model.ipynb
```

Chaque notebook ecrit directement son `.joblib` dans `backend/models/` -
redemarre le serveur Flask ensuite pour charger la nouvelle version.

- **Classification** (`train_classification_model.ipynb`) : entraine sur les
  lieux reels d'Azemmour (`data/places_store.json`) + les lieux reels d'autres
  villes marocaines deja presents dans le CSV source + un jeu de restaurants/
  cafes/hotels reels d'autres villes (`notebooks/data/`). Aucune donnee
  synthetique. Rejoue ce notebook des que `places_store.json` change
  (ajout/suppression/renommage de lieux, changement de categorie...).
- **Regression** (`train_regression_model.ipynb`) : la duree de visite est
  estimee a partir d'une base par categorie documentee dans le notebook (aucune
  donnee reelle de duree de visite n'existe), donc il n'a pas besoin d'etre
  rejoue quand `places_store.json` change.

## ⚠️ Compatibilite des versions scikit-learn

Les modeles `.joblib` actuels ont ete reentraines localement avec la version de
scikit-learn du `venv` (voir `requirements.txt`), donc ce probleme ne devrait
plus se poser. Si tu vois neanmoins une erreur du type :

```
AttributeError: Can't get attribute '_RemainderColsList' on ...
```

c'est un modele entraine avec une version de scikit-learn differente de celle
installee. Deux solutions :

1. **Recommandee** : reentraine les modeles localement via les notebooks
   ci-dessus (ils utiliseront automatiquement la version installee).
2. `sklearn_compat.py` contient un correctif qui permet de charger un modele
   meme avec une version differente ; il est importe automatiquement par
   `ml_service.py`.

## Tests

**Backend** (pytest, teste les vrais endpoints Flask avec les vrais modeles/donnees) :

```bash
cd backend
pip install -r requirements-test.txt
pytest
```

**Frontend** (Vitest + React Testing Library) :

```bash
cd frontend
npm test
```

## Fonctionnalites

### Explorer
Grille des lieux d'Azemmour, filtrable par categorie. Clique sur un lieu pour
voir sa galerie photo, sa description complete et sa duree de visite estimee.
Si un composant plante pendant le rendu, un `ErrorBoundary` affiche un message
de repli au lieu d'une page blanche (le header/la nav restent utilisables).

### Itineraire
Choisis les categories de lieux qui t'interessent, l'app genere un itineraire
ordonne (plus proche voisin) avec duree de visite + duree de trajet estimees
entre chaque etape.

### Langue (FR/EN)
Bouton FR/EN en haut a droite de l'entete, visible sur les deux onglets. Traduit
l'interface entiere ainsi que le nom et la description des lieux affiches. Le
backend (`places_store.json`) reste la source de verite en francais ; les
traductions anglaises vivent uniquement cote frontend
(`frontend/src/i18n/placeTranslations.js`), indexees par `id` de lieu - si un
nouveau lieu est ajoute sans entree correspondante, son nom/sa description
restent simplement affiches en francais meme en mode EN (pas de crash, juste un
repli silencieux). Les rares messages d'erreur renvoyes par le backend (ex:
"Lieu introuvable.") restent en francais dans les deux modes.

## Endpoints API

| Methode | Route | Description |
|---|---|---|
| GET | `/api/health` | Etat de l'API |
| GET | `/api/categories` | Liste des 10 categories |
| GET | `/api/places` | Tous les lieux d'Azemmour (`?categorie=...` pour filtrer) |
| GET | `/api/places/<id>` | Detail d'un lieu (inclut `photos`, liste des URLs de sa galerie) |
| POST | `/api/classify` | `{nom, description}` -> categorie predite + probabilites |
| POST | `/api/predict-duration` | `{categorie, note, description}` -> duree en minutes |
| POST | `/api/itineraire` | `{categories: [...]}` -> itineraire optimise |

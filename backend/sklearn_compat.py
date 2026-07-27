"""
Shim de compatibilite scikit-learn.

Les modeles .joblib ont ete entraines sur Google Colab avec une version de
scikit-learn differente de celle installee ici. Certaines classes internes
ont ete renommees/supprimees entre versions (ex: _RemainderColsList dans
ColumnTransformer), ce qui empeche le chargement direct du fichier .joblib.

Ce module doit etre importe AVANT tout joblib.load() des modeles.

Si tu deploies avec exactement la meme version de scikit-learn que celle
utilisee pour l'entrainement (voir requirements.txt), ce shim n'est pas
necessaire mais reste inoffensif.
"""
import sklearn.compose._column_transformer as _ct

if not hasattr(_ct, "_RemainderColsList"):
    class _RemainderColsList(list):
        """Classe interne de versions recentes de scikit-learn, absente
        dans certaines versions plus anciennes/recentes. Un simple
        sous-type de list suffit pour permettre le unpickling."""
        pass

    _ct._RemainderColsList = _RemainderColsList

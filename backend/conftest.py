import os
import sys

# Permet a pytest de trouver `app` et `ml_service` quel que soit le
# repertoire depuis lequel les tests sont lances.
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

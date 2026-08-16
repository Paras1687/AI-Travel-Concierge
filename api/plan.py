import sys
import os

# Ensure backend directory is first in sys.path
back_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "AI-Travel-Concierge-back"))
if back_path not in sys.path:
    sys.path.insert(0, back_path)

from server import app

import sys
import os

back_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "AI-Travel-Concierge-back"))
if back_dir not in sys.path:
    sys.path.insert(0, back_dir)

from server import app

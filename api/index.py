import sys
import os

# Add AI-Travel-Concierge-back to Python sys.path
back_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "AI-Travel-Concierge-back"))
if back_path not in sys.path:
    sys.path.insert(0, back_path)

from server import app

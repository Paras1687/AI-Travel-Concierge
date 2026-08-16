import os
import sys

# Ensure parent directory is in sys.path so llm_factory can be imported
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from state import ItineraryState
from dotenv import load_dotenv

load_dotenv()

def research_node(state: ItineraryState) -> dict:
    print("Researching attractions...")
    dest = (state.get("destination") or "").lower().strip()
    
    if "goa" in dest:
        notes = "Baga Beach, Calangute Beach, Fort Aguada, Anjuna Flea Market, Dudhsagar Waterfalls, Panjim Church, Basilica of Bom Jesus, Curlies Beach Shack"
    elif "kashmir" in dest or "srinagar" in dest or "gulmarg" in dest:
        notes = "Dal Lake Shikara Ride, Nishat Bagh, Shalimar Bagh, Gulmarg Gondola Ride, Pahalgam Betaab Valley, Shankaracharya Temple, Hazratbal Shrine"
    elif "kerala" in dest or "kochi" in dest or "munnar" in dest:
        notes = "Alleppey Houseboat Cruise, Tea Gardens Munnar, Eravikulam National Park, Fort Kochi Chinese Fishing Nets, Mattupetty Dam, Athirappilly Falls"
    elif "jaipur" in dest or "rajasthan" in dest or "udaipur" in dest:
        notes = "Amber Fort, City Palace, Hawa Mahal, Jantar Mantar, Nahargarh Fort Sunset View, Chokhi Dhani Cultural Village, Jal Mahal"
    elif "rishikesh" in dest or "mussoorie" in dest:
        notes = "Triveni Ghat Ganga Aarti, Laxman Jhula, Ram Jhula, Kunjapuri Temple Sunrise, Beatles Ashram, Shivpuri River Rafting, Neer Garh Waterfall"
    else:
        notes = f"Top iconic attractions, heritage sites, local markets, cultural landmarks, and scenic viewpoints in {state.get('destination', 'the city')}."

    return {
        "research_notes": notes
    }

from typing import TypedDict, List, Dict, Any, Optional

class ItineraryState(TypedDict):
    user_message: str
    origin: str
    destination: str
    days: int
    start_date: str          # ISO format, e.g. "2026-08-15"
    end_date: str             # ISO format, e.g. "2026-08-20"
    date_list: List[str]      # e.g. ["15 August 2026", "16 August 2026", ...]
    budget: str
    interests: str
    flight_info: str
    transport_options: Optional[Dict[str, Any]]  # Multi-modal breakdown (Flight, Train, Road)
    weather_info: str
    research_notes: str
    final_itinerary: str
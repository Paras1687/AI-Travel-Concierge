from typing import TypedDict, List

class ItineraryState(TypedDict):
    user_message: str
    destination: str
    days: int
    start_date: str          # ISO format, e.g. "2026-08-15"
    end_date: str             # ISO format, e.g. "2026-08-20"
    date_list: List[str]      # e.g. ["15 August 2026", "16 August 2026", ...]
    budget: str
    interests: str
    # flight_status: str
    weather_info: str
    research_notes: str
    final_itinerary: str
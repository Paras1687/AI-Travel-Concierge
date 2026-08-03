from typing import TypedDict

class ItineraryState(TypedDict):
    user_message: str
    destination: str
    days: int
    budget: str
    interests: str
    # flight_status: str
    weather_info: str
    research_notes: str
    final_itinerary: str
import os
import requests
from state import ItineraryState
import json
from dotenv import load_dotenv
from google import genai

load_dotenv()

def planner_node(state: ItineraryState) -> dict:
    print("Creating itinerary...")
    
    api_key = os.getenv("GEMINI_PLANNER_API_KEY")
    if not api_key:
        raise ValueError("Missing GEMINI_PLANNER_API_KEY in .env file!")

    client = genai.Client(api_key=api_key)

    # prompt = f"""
    # You are an expert travel planner specializing in personalized trips.
    # Create a realistic day-by-day itinerary using the research provided.
    # Traveler Information:
    # Destination:
    # {state['destination']}
    # Trip Duration:
    # {state['days']} days
    # Budget:
    # {state['budget']}
    # Weather:
    # {state['weather_info']}
    # Available Research:
    # {state['research_notes']}
    # Planning Rules:
    # - Create a practical itinerary, not just a list of places.
    # - Group nearby locations together to reduce unnecessary travel.
    # - Balance sightseeing, food, relaxation, and exploration.
    # - Consider weather conditions.
    # - Respect the user's budget.
    # - Do not schedule too many activities in one day.
    # - Prioritize experiences matching the user's interests.
    # For each day use this format:
    # ## Day X
    # ### Morning
    # - Place/activity
    # - Reason for visiting
    # - Approximate duration
    # ### Afternoon
    # - Place/activity
    # - Food recommendation nearby
    # ### Evening
    # - Place/activity
    # - Relaxation or cultural experience
    # ### Budget Estimate
    # - Approximate spending for the day
    # ### Travel Tip
    # - One useful practical suggestion
    # Make the itinerary feel like it was created by a human travel expert.
    # """
    # The exact calendar date for every day of the trip is computed
    # deterministically in server.py (from start_date/end_date) and handed
    # to this node via state["date_list"], so the model never has to guess
    # or do date arithmetic itself — it only has to map content onto dates
    # we already know are correct.
    date_list = state.get("date_list") or []
    num_days = len(date_list) if date_list else (state['days'] if state['days'] else 3)
    first_date = date_list[0] if date_list else "Day 1"
    last_date = date_list[-1] if date_list else f"Day {num_days}"
    date_list_str = "\n".join(
        f"    Day {i + 1}: {d}" for i, d in enumerate(date_list)
    ) if date_list else "    (no explicit dates provided — use Day 1, Day 2, ... as labels)"

    prompt = f"""
    You are an expert travel planner specializing in personalized trips.

    Create a realistic day-by-day itinerary using the research provided.

    Traveler Information:
    Destination: {state['destination']}
    Trip Duration: {num_days} days
    Travel Dates: {state.get('start_date', '')} to {state.get('end_date', '')}
    Budget: {state['budget']}
    Weather: {state['weather_info']}
    Interests: {state['interests']}

    This trip covers exactly these calendar dates, in order — use them
    verbatim as the "date" field for the matching day, do not invent or
    recalculate dates yourself:
    {date_list_str}

    Research:
    {state['research_notes']}

    Pacing rules (very important):
    - The FIRST day ({first_date}) is an ARRIVAL day. Assume the traveler
      lands and checks in, so keep it light: a check-in/arrival activity,
      then only 1-2 relaxed activities nearby. Do not schedule a full,
      high-intensity day of sightseeing on the arrival day.
    - The LAST day ({last_date}) is a DEPARTURE day. Assume the traveler
      needs to check out and head to the airport/station, so keep it light:
      at most 1-2 short activities in the morning, then a checkout/airport
      transfer entry. Do not schedule evening or night activities on the
      departure day.
    - Middle days can be fuller, balanced across morning/afternoon/evening,
      but should still avoid overloading any single day.
    - Group nearby locations together to reduce unnecessary travel, respect
      the budget, and consider the weather.
    - If there is only 1 day total, treat it as both arrival and departure:
      keep it realistic and not overly packed.

    Return ONLY valid JSON matching this EXACT structure. The "days" array
    must contain exactly {num_days} entries, one per date listed above, in
    the same order:

    {{
      "trip_summary": {{
        "destination": "{state['destination']}",
        "start_date": "{state.get('start_date', '')}",
        "end_date": "{state.get('end_date', '')}",
        "days": {num_days},
        "budget": "{state['budget'] if state['budget'] else 'Flexible'}",
        "travel_style": "{state['interests'] if state['interests'] else 'Sightseeing'}",
        "weather": {{
          "condition": "Clear",
          "temperature": "{state['weather_info'] if state['weather_info'] else '25°C'}",
          "icon": "sun"
        }}
      }},
      "days": [
        {{
          "day": 1,
          "date": "{first_date}",
          "day_type": "arrival",
          "theme": "Arrival & Easy City Introduction",
          "activities": {{
            "morning": [
              {{
                "name": "Main Attraction",
                "time": "09:00 AM",
                "duration": "2 hrs",
                "description": "Detailed description of activity.",
                "image": ""
              }}
            ],
            "afternoon": [
              {{
                "name": "Culture Spot",
                "time": "01:30 PM",
                "duration": "2 hrs",
                "description": "Detailed description of afternoon plan.",
                "image": ""
              }}
            ],
            "evening": [
              {{
                "name": "Evening Walk or Viewpoint",
                "time": "06:00 PM",
                "duration": "1.5 hrs",
                "description": "Detailed description of evening activity.",
                "image": ""
              }}
            ]
          }},
          "restaurants": [
            {{
              "name": "Top Local Restaurant",
              "cuisine": "Local Speciality",
              "rating": 4.6,
              "description": "Popular local dining spot.",
              "image": ""
            }}
          ],
          "hotel": {{
            "name": "Central Boutique Hotel",
            "rating": 4.4,
            "price": "Moderate",
            "description": "Conveniently located stay.",
            "image": ""
          }}
        }}
      ],
      "travel_tips": [
        "Use local public transport or metro for quick travel.",
        "Keep local currency handy for small street vendors.",
        "Book popular museum/attraction tickets online in advance."
      ],
      "gallery": []
    }}

    Notes on the schema above:
    - "day" is the 1-based day number, "date" is the exact calendar date
      from the list above for that day (e.g. "15 August 2026").
    - "day_type" should be "arrival" for day 1, "departure" for the last
      day, and "regular" for everything in between.
    - On the departure day, the "evening" array should be an empty list []
      since the traveler is leaving.
    - Every one of the {num_days} days needs its own object in "days" —
      do not skip days or merge them together.
    """
    response = client.models.generate_content(
        model="gemini-flash-latest",
        contents=prompt
    )
    return {
        "final_itinerary": response.text
    }

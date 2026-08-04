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
    prompt = f"""
    You are an expert travel planner specializing in personalized trips.

    Create a realistic day-by-day itinerary using the research provided.

    Traveler Information:
    Destination: {state['destination']}
    Trip Duration: {state['days']} days
    Budget: {state['budget']}
    Weather: {state['weather_info']}
    Interests: {state['interests']}

    Research:
    {state['research_notes']}

    Return ONLY valid JSON matching this EXACT structure:

    {{
      "trip_summary": {{
        "destination": "{state['destination']}",
        "days": {state['days'] if state['days'] else 3},
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
          "theme": "City Exploration & Landmarks",
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
    """
    response = client.models.generate_content(
        model="gemma-4-26b-a4b-it",
        contents=prompt
    )
    return {
        "final_itinerary": response.text
    }

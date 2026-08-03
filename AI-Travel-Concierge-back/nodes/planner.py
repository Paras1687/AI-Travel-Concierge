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

    Research:
    {state['research_notes']}

    Planning Rules:
    - Group nearby locations together.
    - Balance sightseeing, food, relaxation, exploration.
    - Consider weather.
    - Respect budget.
    - Avoid overloading days.
    - Match user interests.

    Return ONLY valid JSON.

    Format:

    {{
    "destination": "...",
    "days": [
        {{
        "day": 1,
        "morning": {{
            "place": "...",
            "activity": "...",
            "duration": "...",
            "image_query": "..."
        }},
        "afternoon": {{
            "place": "...",
            "food_recommendation": "...",
            "image_query": "..."
        }},
        "evening": {{
            "place": "...",
            "experience": "...",
            "image_query": "..."
        }},
        "budget_estimate": "...",
        "travel_tip": "..."
        }}
    ]
    }}

    For image_query:
    - Provide a concise search query suitable for an image search API.
    - Include location names.
    - Prefer visually recognizable landmarks.
    """
    response = client.models.generate_content(
        model="gemini-flash-latest",
        contents=prompt
    )
    return {
        "final_itinerary": response.text
    }

import os
import requests
from state import ItineraryState
import json
from dotenv import load_dotenv
from google import genai

load_dotenv()

def research_node(state: ItineraryState) -> dict:
    print("Researching attractions...")

    api_key = os.getenv("GEMINI_RESEARCH_API_KEY")
    if not api_key:
        raise ValueError("Missing GEMINI_RESEARCH_API_KEY in .env file!")

    client = genai.Client(api_key=api_key)


    prompt = f"""
    You are a professional travel research assistant.
    Your job is to collect useful information for another AI agent that will create a final itinerary.
    Traveler Details:
    Destination:
    {state['destination']}
    Trip Duration:
    {state['days']} days
    Travel Dates:
    {state.get('start_date', '')} to {state.get('end_date', '')}
    Budget:
    {state['budget']}
    Traveler Interests:
    {state['interests']}
    Weather Conditions:
    {state['weather_info']}
    Research Task:
    Find 8-12 relevant places, restaurants, cafes, and experiences that match the traveler's preferences.
    For every recommendation, provide:
    1. Name of place
    2. Category (Temple, Museum, Food, Nature, Shopping, Adventure, etc.)
    3. Why this place matches the user's interests
    4. Estimated time required for visiting
    5. Best time of day to visit
    6. Budget level (Low / Medium / High)
    7. Any important tips
    Important Instructions:
    - Prioritize places that are genuinely relevant to the user's interests.
    - Avoid generic tourist lists.
    - Include a mix of famous attractions and lesser-known experiences.
    - Consider the weather while selecting outdoor activities.
    - Do not create an itinerary yet. Only provide researched options.
    Return the information in a clear structured format.
    """
    response = client.models.generate_content(
        model="gemini-flash-latest",
        contents=prompt
    )
    return {
        "research_notes": response.text
    }

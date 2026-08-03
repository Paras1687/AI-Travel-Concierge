import os
import requests
from state import ItineraryState
import json
from dotenv import load_dotenv
from google import genai

load_dotenv()

def weather_node(state: ItineraryState) -> dict:
    print("Fetching live weather data...")
    weather_key = os.getenv("OPENWEATHER_API_KEY")
    if not weather_key:
        print("No weather API key found.")
        return {
            "weather_info": "Standard seasonal weather expected."
        }
    try:
        url = (
            f"https://api.openweathermap.org/data/2.5/weather?"
            f"q={state['destination']}"
            f"&appid={weather_key}"
            f"&units=metric"
        )
        response = requests.get(url, timeout=5)
        if response.status_code == 200:
            data = response.json()
            desc = data["weather"][0]["description"].title()
            temp = data["main"]["temp"]
            weather_str = (
                f"Live Forecast: {desc}, "
                f"Temperature: {temp}°C"
            )

            print("weather extracted:", weather_str)
            return {
                "weather_info": weather_str
            }
        else:

            return {
                "weather_info": "Standard seasonal weather expected."
            }
    except Exception as e:
        print("Weather error:", e)
        return {
            "weather_info": "Standard seasonal weather expected."
        }
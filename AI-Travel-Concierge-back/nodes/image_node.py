# nodes/image_node.py
import os
import requests

UNSPLASH_KEY = os.getenv("UNSPLASH_ACCESS_KE")

def fetch_unsplash_image(query: str) -> str:
    if not UNSPLASH_KEY:
        return ""
    try:
        url = f"https://api.unsplash.com/search/photos?query={query}&per_page=1&client_id={UNSPLASH_KEY}"
        res = requests.get(url, timeout=5)
        if res.status_code == 200:
            data = res.json()
            if data["results"]:
                return data["results"][0]["urls"]["regular"]
    except Exception as e:
        print(f"Unsplash error for '{query}':", e)
    return ""

def image_node(state: dict) -> dict:
    print("Fetching images for itinerary locations...")
    itinerary = state.get("itinerary")
    
    if isinstance(itinerary, dict) and "days" in itinerary:
        for day in itinerary["days"]:
            for time_of_day in ["morning", "afternoon", "evening"]:
                if time_of_day in day and "image_query" in day[time_of_day]:
                    query = day[time_of_day]["image_query"]
                    # Attach image URL directly to the itinerary object
                    day[time_of_day]["image_url"] = fetch_unsplash_image(query)
                    
    return {"itinerary": itinerary}
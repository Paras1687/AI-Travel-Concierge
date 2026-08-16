import os
import requests
from dotenv import load_dotenv

load_dotenv()

ACCESS_KEY = os.getenv("UNSPLASH_ACCESS_KEY") or os.getenv("UNSPLASH_ACCESS_KE")
def get_image(query):

    url = "https://api.unsplash.com/search/photos"

    params = {
        "query": query,
        "client_id": ACCESS_KEY,
        "per_page": 1,
        "orientation": "landscape"
    }

    response = requests.get(url, params=params)

    data = response.json()

    if len(data["results"]) == 0:
        return None

    image = data["results"][0]
    return {
        "image_url": image["urls"]["regular"],
        "description": image["alt_description"]
    }
print(get_image("delhi"))
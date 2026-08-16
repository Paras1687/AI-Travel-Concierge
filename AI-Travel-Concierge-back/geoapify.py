import os
import json
import requests
from dotenv import load_dotenv
load_dotenv()
key=os.getenv("GEOAPIFY_API_KEY")
categories=input("enter categories: ")
if not key:
    print("api key not found!!")
try:
    url=(
        f"https://api.geoapify.com/v2/places?"
        f"categories={categories}&filter=rect%3A10.716463143326969%2C48.755151258420966%2C10.835314015356737%2C48.680903341613316&limit=20&"
        f"apiKey={key}"
    )
except Exception as e:
    print("Error: ", e)
response = requests.get(url)
# print(response.status_code)
data = response.json()
for place in data["features"]:
    name = place["properties"].get("name")
    if name:
        print(name)
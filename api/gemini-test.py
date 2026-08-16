from google import genai
import os
from dotenv import load_dotenv
load_dotenv()
client = genai.Client(api_key=os.getenv("GEMINI_PLANNER_API_KEY"))

response = client.models.generate_content(
    model="gemma-4-26b-a4b-it",
    contents="Say hello in one sentence."
)

print(response.text)
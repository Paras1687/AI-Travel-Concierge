import os
import json
import requests
from dotenv import load_dotenv
from google import genai
from state import ItineraryState

load_dotenv()

def extractor_node(state: ItineraryState) -> dict:
    print("Extracting travel preferences...")
    
    # Retrieve key at execution time
    api_key = os.getenv("GEMINI_RESEARCH_API_KEY")
    if not api_key:
        raise ValueError("Missing Gemini API key in .env file for Extractor Node!")

    client = genai.Client(api_key=api_key)
    user_message = state["user_message"]

    # NOTE: trip duration is no longer extracted from free text — the caller
    # (server.py) now computes `days`/`date_list` directly from the
    # start_date/end_date the user picked, and injects them into the state
    # before this graph runs. This node only fills in destination/budget/
    # interests, and must not touch "days" so it doesn't clobber that value.
    prompt = f"""
    You are an information extraction assistant.
    Extract travel details from the user's request.
    Return ONLY valid JSON.
    Format:
    {{
        "destination": "",
        "budget": "",
        "interests": ""
    }}
    User request:
    {user_message}
    """

    response = client.models.generate_content(
        model="gemini-flash-latest",
        contents=prompt
    )

    extracted_text = response.text
    extracted_text = extracted_text.replace("```json", "").replace("```", "").strip()
    extracted = json.loads(extracted_text)
    print("Information Extracted:", extracted)

    return {
        "destination": extracted.get("destination", ""),
        "budget": extracted.get("budget", ""),
        "interests": extracted.get("interests", "")
    }
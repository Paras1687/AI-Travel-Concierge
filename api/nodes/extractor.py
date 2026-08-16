import os
import sys

# Ensure parent directory is in sys.path so llm_factory can be imported
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import json
import re
from dotenv import load_dotenv
from json_repair import repair_json
from state import ItineraryState
from llm_factory import generate_text

load_dotenv()

def extractor_node(state: ItineraryState) -> dict:
    print("Extracting travel parameters from user message...")
    user_msg = state.get("user_message", "")
    existing_origin = (state.get("origin") or "").strip()
    existing_destination = (state.get("destination") or "").strip()

    prompt = f"""Extract all travel details from the user query into JSON. Return JSON ONLY with no explanations.

User Request: {user_msg}

Extraction rules:
- 'destination': target city or country specified by user.
- 'origin': city user is departing/leaving from. If not mentioned, set to "".
- 'budget': monetary budget or preference specified by user (e.g. "30k", "$2000", "flexible"). If not mentioned, set to "".
- 'interests': style, food, or activities requested (e.g. "local stay, food", "hiking", "beaches"). If not mentioned, set to "".
- 'days': trip duration as an integer number of days. If not mentioned, set to 3.

JSON Output Format:
{{
  "destination": "Extracted Destination",
  "origin": "Extracted Origin",
  "budget": "Extracted Budget",
  "interests": "Extracted Interests",
  "days": 3
}}
"""

    try:
        raw_text = generate_text(prompt)
        parsed_data = repair_json(raw_text, return_objects=True)
        if not isinstance(parsed_data, dict):
            parsed_data = {}

        extracted_dest = str(parsed_data.get("destination") or "").strip()
        extracted_origin = str(parsed_data.get("origin") or "").strip()
        extracted_budget = str(parsed_data.get("budget") or "").strip()
        extracted_interests = str(parsed_data.get("interests") or "").strip()

        start_d = str(state.get("start_date") or "").strip()
        end_d = str(state.get("end_date") or "").strip()

        if start_d and end_d and start_d.lower() not in ['null', 'none', ''] and end_d.lower() not in ['null', 'none', '']:
            try:
                s_dt = datetime.strptime(start_d, "%Y-%m-%d")
                e_dt = datetime.strptime(end_d, "%Y-%m-%d")
                final_days = max(1, (e_dt - s_dt).days + 1)
            except Exception:
                final_days = state.get("days") or 3
        else:
            try:
                extracted_days = int(parsed_data.get("days", 3))
            except (ValueError, TypeError):
                extracted_days = state.get("days") or 3
            final_days = extracted_days if extracted_days > 0 else (state.get("days") or 3)

        final_dest = extracted_dest if extracted_dest else existing_destination
        final_origin = existing_origin if existing_origin else extracted_origin
        final_budget = extracted_budget if extracted_budget else state.get("budget", "")
        final_interests = extracted_interests if extracted_interests else state.get("interests", "")

        print(f"Dynamic Extraction -> Destination: '{final_dest}' | Origin: '{final_origin}' | Budget: '{final_budget}' | Interests: '{final_interests}' | Days: {final_days}")

        has_budget_constraint = bool(final_budget and str(final_budget).strip().lower() not in ['', 'null', 'none', 'flexible'])
        budget_note = "" if has_budget_constraint else "💡 Note: No budget constraint was specified. We assumed a standard budget of ₹30,000 for 2 guests. Would you like to refine your budget?"

        return {
            "destination": final_dest,
            "origin": final_origin,
            "budget": final_budget if final_budget else "30,000",
            "has_budget_constraint": has_budget_constraint,
            "budget_note": budget_note,
            "interests": final_interests,
            "days": final_days
        }
    except Exception as e:
        print(f"Extraction error: {e}")
        return {
            "destination": existing_destination,
            "origin": existing_origin,
            "budget": state.get("budget", ""),
            "interests": state.get("interests", ""),
            "days": state.get("days", 3)
        }
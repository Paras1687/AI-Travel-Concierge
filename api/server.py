# import json
# import traceback
# from datetime import date, datetime, timedelta
# from dotenv import load_dotenv

# load_dotenv()

# from fastapi import FastAPI, HTTPException
# from fastapi.middleware.cors import CORSMiddleware
# from pydantic import BaseModel, field_validator

# from graph import app

# server = FastAPI(title="AI Travel Concierge API")

# # Enable CORS so your React frontend can talk to this backend
# server.add_middleware(
#     CORSMiddleware,
#     allow_origins=[
#         "http://localhost:5173",
#         "http://127.0.0.1:5173"
#     ],
#     allow_credentials=True,
#     allow_methods=["*"],
#     allow_headers=["*"],
# )

# class TripRequest(BaseModel):
#     user_message: str
#     start_date: str  # ISO format "YYYY-MM-DD"
#     end_date: str     # ISO format "YYYY-MM-DD"

#     @field_validator("start_date", "end_date")
#     @classmethod
#     def validate_date_format(cls, value: str) -> str:
#         try:
#             datetime.strptime(value, "%Y-%m-%d")
#         except ValueError:
#             raise ValueError("Dates must be in YYYY-MM-DD format.")
#         return value


# def _compute_trip_dates(start_date_str: str, end_date_str: str):
#     """
#     Turns start_date/end_date (ISO strings) into:
#       - duration in days (inclusive of both start and end date)
#       - a list of human-readable calendar dates, one per trip day
#     Example: 2026-08-15 -> 2026-08-20 => 6 days,
#     ["15 August 2026", ..., "20 August 2026"]
#     """
#     start = datetime.strptime(start_date_str, "%Y-%m-%d").date()
#     end = datetime.strptime(end_date_str, "%Y-%m-%d").date()

#     if end < start:
#         raise ValueError("End date cannot be before start date.")

#     duration = (end - start).days + 1  # inclusive day count
#     date_list = [
#         (start + timedelta(days=offset)).strftime("%d %B %Y")
#         for offset in range(duration)
#     ]
#     return duration, date_list


# @server.post("/api/plan")
# async def plan_trip(request: TripRequest):
#     try:
#         # Trip duration is now derived from the date range instead of being
#         # supplied directly by the client.
#         try:
#             days, date_list = _compute_trip_dates(request.start_date, request.end_date)
#         except ValueError as ve:
#             raise HTTPException(status_code=400, detail=str(ve))

#         # Initialize state dictionary
#         initial_state = {
#             "user_message": request.user_message,
#             "destination": "",
#             "days": days,
#             "start_date": request.start_date,
#             "end_date": request.end_date,
#             "date_list": date_list,
#             "budget": "",
#             "interests": "",
#             "weather_info": "",
#             "research_notes": "",
#             "final_itinerary": ""
#         }

#         # Run the LangGraph workflow
#         final_output = app.invoke(initial_state)

#         # Retrieve and parse final itinerary
#         itinerary = final_output.get("final_itinerary", "")
        
#         # Strip markdown formatting if returned as raw string
#         if isinstance(itinerary, str):
#             clean_json = itinerary.replace("```json", "").replace("```", "").strip()
#             try:
#                 itinerary = json.loads(clean_json)
#             except Exception:
#                 pass

#         return {
#             "destination": final_output.get("destination"),
#             "days": final_output.get("days"),
#             "start_date": final_output.get("start_date"),
#             "end_date": final_output.get("end_date"),
#             "budget": final_output.get("budget"),
#             "interests": final_output.get("interests"),
#             "weather_info": final_output.get("weather_info"),
#             "itinerary": itinerary
#         }

#     except HTTPException:
#         raise
#     except Exception as e:
#         traceback.print_exc()
#         raise HTTPException(status_code=500, detail=str(e))

# if __name__ == "__main__":
#     import uvicorn
#     uvicorn.run("server:server", host="0.0.0.0", port=8000, reload=True)
    
from __future__ import annotations
import sys
import os

sys.path.append(os.path.dirname(os.path.abspath(__file__)))

import json
import traceback
from typing import Optional
from datetime import date, datetime, timedelta
from dotenv import load_dotenv

load_dotenv()

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field, field_validator
from langchain_core.output_parsers import PydanticOutputParser
from langchain_core.prompts import PromptTemplate
from llm_factory import get_langchain_llm

from graph import app as graph_app

app = FastAPI(title="AI Travel Concierge API")
server = app

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class TripRequest(BaseModel):
    user_message: str = "Plan a 3 day trip"
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    origin: Optional[str] = None 
    budget: Optional[str] = None

    @field_validator("start_date", "end_date", mode="before")
    @classmethod
    def validate_date_format(cls, value: Optional[str]) -> str:
        if not value or str(value).strip().lower() in ['null', 'none', '']:
            return (datetime.now() + timedelta(days=30)).strftime("%Y-%m-%d")
        try:
            datetime.strptime(str(value), "%Y-%m-%d")
        except ValueError:
            return (datetime.now() + timedelta(days=30)).strftime("%Y-%m-%d")
        return str(value)

import re
from llm_factory import generate_text, get_langchain_llm

def extract_entities_from_query(query: str):
    prompt = f"""Extract travel details from the user query as JSON ONLY with no markdown wrappers.
Query: {query}
Respond in format:
{{"origin": "departure city or null", "destination": "destination city or null", "budget": "budget mentioned like 30k or null"}}
"""
    try:
        raw = generate_text(prompt)
        clean = re.sub(r"```(?:json)?", "", raw).strip()
        data = json.loads(clean)
        return data.get("origin"), data.get("destination"), data.get("budget")
    except Exception as e:
        print(f"Extraction failed: {e}")
        return None, None, None

def _compute_trip_dates(start_date_str: Optional[str], end_date_str: Optional[str], user_message: str = ""):
    req_days = 3
    if user_message:
        match = re.search(r'(\d+)\s*(?:-| )\s*day', user_message, re.IGNORECASE)
        if match:
            try:
                parsed_days = int(match.group(1))
                if 1 <= parsed_days <= 30:
                    req_days = parsed_days
            except Exception:
                pass

    default_start = (datetime.now() + timedelta(days=30)).date()
    default_end = default_start + timedelta(days=req_days - 1)

    try:
        start = datetime.strptime(str(start_date_str), "%Y-%m-%d").date() if start_date_str else default_start
    except Exception:
        start = default_start

    try:
        end = datetime.strptime(str(end_date_str), "%Y-%m-%d").date() if (end_date_str and start_date_str) else default_end
    except Exception:
        end = default_end

    if end < start:
        end = start + timedelta(days=req_days - 1)

    duration = (end - start).days + 1  
    date_list = [
        (start + timedelta(days=offset)).strftime("%d %B %Y")
        for offset in range(duration)
    ]
    return duration, date_list


from json_repair import repair_json

@server.post("/api/plan")
async def plan_trip(request: TripRequest):
    try:
        try:
            days, date_list = _compute_trip_dates(request.start_date, request.end_date, request.user_message)
        except ValueError as ve:
            raise HTTPException(status_code=400, detail=str(ve))

        o, d, b = extract_entities_from_query(request.user_message)
        extracted_origin = request.origin if (request.origin and str(request.origin).strip().lower() not in ['', 'null', 'none']) else (o if o else "")
        extracted_destination = d if d else ""
        extracted_budget = request.budget if (request.budget and str(request.budget).strip().lower() not in ['', 'null', 'none']) else (b if (b and str(b).strip().lower() not in ['null', 'none', '']) else "")

        if not extracted_origin:
            return {
                "status": "requires_clarification",
                "missing_field": "origin",
                "message": "I'd love to plan this! Where will you be flying or traveling out from?"
            }

        if not extracted_budget:
            return {
                "status": "requires_clarification",
                "missing_field": "budget",
                "message": "What is your allocated budget for this trip? (e.g. ₹20,000, ₹35,000, ₹50,000, or Flexible)"
            }

        initial_state = {
            "user_message": request.user_message,
            "origin": extracted_origin,
            "destination": extracted_destination, 
            "days": days,
            "start_date": request.start_date,
            "end_date": request.end_date,
            "date_list": date_list,
            "budget": extracted_budget if extracted_budget else "30,000",
            "interests": "",
            "weather_info": "",
            "research_notes": "",
            "final_itinerary": ""
        }

        final_output = graph_app.invoke(initial_state)

        raw_itinerary = final_output.get("final_itinerary", "")
        
        if isinstance(raw_itinerary, dict):
            itinerary = raw_itinerary
        else:
            try:
                itinerary = repair_json(str(raw_itinerary), return_objects=True)
            except Exception:
                itinerary = {}

        if not isinstance(itinerary, dict):
            itinerary = {}

        transport_opts = final_output.get("transport_options") or (
            itinerary.get("trip_summary", {}).get("transport_options") if isinstance(itinerary, dict) else None
        )

        if "trip_summary" not in itinerary or not isinstance(itinerary["trip_summary"], dict):
            itinerary["trip_summary"] = {}
        
        itinerary["trip_summary"]["destination"] = final_output.get("destination") or itinerary["trip_summary"].get("destination") or ""
        itinerary["trip_summary"]["origin"] = final_output.get("origin") or itinerary["trip_summary"].get("origin") or ""
        itinerary["trip_summary"]["start_date"] = final_output.get("start_date") or itinerary["trip_summary"].get("start_date") or ""
        itinerary["trip_summary"]["end_date"] = final_output.get("end_date") or itinerary["trip_summary"].get("end_date") or ""
        itinerary["trip_summary"]["days"] = final_output.get("days") or itinerary["trip_summary"].get("days") or days
        itinerary["trip_summary"]["budget"] = final_output.get("budget") or itinerary["trip_summary"].get("budget") or ""
        itinerary["trip_summary"]["travel_style"] = final_output.get("interests") or itinerary["trip_summary"].get("travel_style") or ""
        itinerary["trip_summary"]["transport_options"] = transport_opts
        itinerary["trip_summary"]["budget_breakdown"] = final_output.get("budget_breakdown") or itinerary["trip_summary"].get("budget_breakdown")
        if not itinerary["trip_summary"].get("flights"):
            itinerary["trip_summary"]["flights"] = final_output.get("flight_info", "")

        return {
            "status": "success",
            "destination": final_output.get("destination"),
            "origin": final_output.get("origin"),
            "days": final_output.get("days"),
            "start_date": final_output.get("start_date"),
            "end_date": final_output.get("end_date"),
            "budget": final_output.get("budget"),
            "interests": final_output.get("interests"),
            "weather_info": final_output.get("weather_info"),
            "transport_options": transport_opts,
            "itinerary": itinerary
        }

    except HTTPException:
        raise
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("server:server", host="0.0.0.0", port=8000, reload=True)
    
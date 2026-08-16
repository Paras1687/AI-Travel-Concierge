from __future__ import annotations
import sys
import os

sys.path.append(os.path.dirname(os.path.abspath(__file__)))

import json
import re
import traceback
from typing import Optional
from datetime import date, datetime, timedelta
from dotenv import load_dotenv

load_dotenv()

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field, field_validator
from llm_factory import generate_text

from nodes.extractor import extractor_node
from nodes.flight import flight_node
from nodes.weather import weather_node
from nodes.research import research_node
from nodes.planner import planner_node

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

def run_pipeline(initial_state: dict) -> dict:
    state = dict(initial_state)
    s1 = extractor_node(state)
    state.update(s1)
    s2 = flight_node(state)
    state.update(s2)
    s3 = weather_node(state)
    state.update(s3)
    s4 = research_node(state)
    state.update(s4)
    s5 = planner_node(state)
    state.update(s5)
    return state

@server.get("/")
@server.get("/api/plan")
async def health_check():
    return {
        "status": "online",
        "service": "AI Travel Concierge API",
        "message": "Backend server is running and ready for trip requests!"
    }

@server.post("/api/plan")
async def plan_trip(request: TripRequest):
    try:
        try:
            days, date_list = _compute_trip_dates(request.start_date, request.end_date, request.user_message)
        except ValueError as ve:
            raise HTTPException(status_code=400, detail=str(ve))

        o, d, b = extract_entities_from_query(request.user_message)
        
        # User explicit params override LLM extraction
        req_origin = str(request.origin).strip() if (request.origin and str(request.origin).strip().lower() not in ['', 'null', 'none']) else ""
        req_budget = str(request.budget).strip() if (request.budget and str(request.budget).strip().lower() not in ['', 'null', 'none']) else ""

        o, d, b = extract_entities_from_query(request.user_message)

        extracted_destination = d if d else ""

        has_budget_in_prompt = bool(re.search(r'\b\d+\s*k\b|\b\d+\s*lakh\b|₹|\bbudget\b|\bunder\b', request.user_message, re.IGNORECASE))
        has_origin_in_prompt = bool(re.search(r'\bfrom\b|\bout of\b', request.user_message, re.IGNORECASE))

        # 1. Ask for Origin if user has not explicitly provided it
        if not req_origin and not has_origin_in_prompt:
            return {
                "status": "requires_clarification",
                "missing_field": "origin",
                "message": "I'd love to plan this! Where will you be flying or traveling out from?"
            }

        # 2. Ask for Budget if user has not explicitly provided it
        if not req_budget and not has_budget_in_prompt:
            std_budget = f"₹{days * 10000:,}"
            return {
                "status": "requires_clarification",
                "missing_field": "budget",
                "message": f"What is your allocated budget for this {days}-day trip? (Standardized recommendation: {std_budget} for {days} days)"
            }

        extracted_origin = req_origin if req_origin else (o if o else "Delhi")
        extracted_budget = req_budget if req_budget else (b if (b and str(b).strip().lower() not in ['null', 'none', '']) else f"₹{days * 10000:,}")
        final_budget_val = extracted_budget

        initial_state = {
            "user_message": request.user_message,
            "origin": extracted_origin,
            "destination": extracted_destination, 
            "days": days,
            "start_date": request.start_date,
            "end_date": request.end_date,
            "date_list": date_list,
            "budget": final_budget_val,
            "interests": "",
            "weather_info": "",
            "research_notes": "",
            "final_itinerary": ""
        }

        final_output = run_pipeline(initial_state)

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
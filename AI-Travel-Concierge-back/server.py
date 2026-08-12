import json
import traceback
from datetime import date, datetime, timedelta
from dotenv import load_dotenv

load_dotenv()

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, field_validator

from graph import app

server = FastAPI(title="AI Travel Concierge API")

# Enable CORS so your React frontend can talk to this backend
server.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class TripRequest(BaseModel):
    user_message: str
    start_date: str  # ISO format "YYYY-MM-DD"
    end_date: str     # ISO format "YYYY-MM-DD"

    @field_validator("start_date", "end_date")
    @classmethod
    def validate_date_format(cls, value: str) -> str:
        try:
            datetime.strptime(value, "%Y-%m-%d")
        except ValueError:
            raise ValueError("Dates must be in YYYY-MM-DD format.")
        return value


def _compute_trip_dates(start_date_str: str, end_date_str: str):
    """
    Turns start_date/end_date (ISO strings) into:
      - duration in days (inclusive of both start and end date)
      - a list of human-readable calendar dates, one per trip day
    Example: 2026-08-15 -> 2026-08-20 => 6 days,
    ["15 August 2026", ..., "20 August 2026"]
    """
    start = datetime.strptime(start_date_str, "%Y-%m-%d").date()
    end = datetime.strptime(end_date_str, "%Y-%m-%d").date()

    if end < start:
        raise ValueError("End date cannot be before start date.")

    duration = (end - start).days + 1  # inclusive day count
    date_list = [
        (start + timedelta(days=offset)).strftime("%d %B %Y")
        for offset in range(duration)
    ]
    return duration, date_list


@server.post("/api/plan")
async def plan_trip(request: TripRequest):
    try:
        # Trip duration is now derived from the date range instead of being
        # supplied directly by the client.
        try:
            days, date_list = _compute_trip_dates(request.start_date, request.end_date)
        except ValueError as ve:
            raise HTTPException(status_code=400, detail=str(ve))

        # Initialize state dictionary
        initial_state = {
            "user_message": request.user_message,
            "destination": "",
            "days": days,
            "start_date": request.start_date,
            "end_date": request.end_date,
            "date_list": date_list,
            "budget": "",
            "interests": "",
            "weather_info": "",
            "research_notes": "",
            "final_itinerary": ""
        }

        # Run the LangGraph workflow
        final_output = app.invoke(initial_state)

        # Retrieve and parse final itinerary
        itinerary = final_output.get("final_itinerary", "")
        
        # Strip markdown formatting if returned as raw string
        if isinstance(itinerary, str):
            clean_json = itinerary.replace("```json", "").replace("```", "").strip()
            try:
                itinerary = json.loads(clean_json)
            except Exception:
                pass

        return {
            "destination": final_output.get("destination"),
            "days": final_output.get("days"),
            "start_date": final_output.get("start_date"),
            "end_date": final_output.get("end_date"),
            "budget": final_output.get("budget"),
            "interests": final_output.get("interests"),
            "weather_info": final_output.get("weather_info"),
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
    
import json
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

# Import your compiled LangGraph pipeline
from graph import app

server = FastAPI(title="AI Travel Concierge API")

# Enable CORS so your React frontend can talk to this backend
server.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class TripRequest(BaseModel):
    user_message: str

@server.post("/api/plan")
async def plan_trip(request: TripRequest):
    try:
        # Initialize state dictionary
        initial_state = {
            "user_message": request.user_message,
            "destination": "",
            "days": 0,
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
            "budget": final_output.get("budget"),
            "interests": final_output.get("interests"),
            "weather_info": final_output.get("weather_info"),
            "itinerary": itinerary
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("server:server", host="0.0.0.0", port=8000, reload=True)
    
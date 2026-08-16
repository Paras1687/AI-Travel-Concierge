import sys
import os
import traceback
from typing import Optional
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

app = FastAPI(title="AI Travel Concierge API")

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

@app.post("/api/plan")
async def plan_trip(request: TripRequest):
    try:
        api_dir = os.path.dirname(os.path.abspath(__file__))
        if api_dir not in sys.path:
            sys.path.insert(0, api_dir)

        # Lazy import backend logic inside request handler
        from server import plan_trip as server_plan_trip
        return await server_plan_trip(request)
    except HTTPException:
        raise
    except Exception as e:
        err_msg = traceback.format_exc()
        print("Vercel Execution Error:", err_msg)
        return {
            "status": "error",
            "detail": str(e),
            "traceback": err_msg
        }

import sys
import os
import traceback
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Optional

app = FastAPI()

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
async def plan_endpoint(req: TripRequest):
    try:
        api_dir = os.path.dirname(os.path.abspath(__file__))
        if api_dir not in sys.path:
            sys.path.insert(0, api_dir)
        
        import server
        return await server.plan_trip(req)
    except Exception as e:
        err_trace = traceback.format_exc()
        print("Vercel Server Error:", err_trace)
        return {
            "status": "error",
            "detail": str(e),
            "traceback": err_trace
        }

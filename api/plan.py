import os
import sys
import json
import re
import traceback
from typing import Optional
from datetime import datetime, timedelta
from dotenv import load_dotenv

load_dotenv()

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, field_validator
from google import genai
from openai import OpenAI

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

def generate_text_api(prompt: str) -> str:
    # Check if Local Gemma tunnel is set
    val = os.getenv("USE_LOCAL_GEMMA", "")
    tunnel_url = os.getenv("OLLAMA_BASE_URL", "").strip()
    if val.lower() in ("true", "1", "yes") and tunnel_url.startswith("https://"):
        try:
            model_name = os.getenv("LOCAL_GEMMA_MODEL", "gemma2:2b")
            base_url = tunnel_url if tunnel_url.endswith("/v1") else tunnel_url.rstrip("/") + "/v1"
            client = OpenAI(base_url=base_url, api_key="ollama", timeout=12.0)
            res = client.chat.completions.create(model=model_name, messages=[{"role": "user", "content": prompt}])
            if res.choices and res.choices[0].message.content:
                return res.choices[0].message.content
        except Exception as e:
            print(f"Tunnel error: {e}")

    # Fallback to Gemini API
    api_key = os.getenv("GEMINI_PLANNER_API_KEY") or os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY") or ""
    if not api_key:
        return ""
    try:
        client = genai.Client(api_key=api_key)
        res = client.models.generate_content(model="gemini-flash-latest", contents=prompt)
        return res.text or ""
    except Exception as e:
        print(f"Gemini API error: {e}")
        return ""

def extract_entities(query: str):
    prompt = f"""Extract travel details from user query as JSON ONLY:
Query: {query}
Respond in format: {{"origin": "departure city or null", "destination": "destination city or null", "budget": "budget or null"}}
"""
    try:
        raw = generate_text_api(prompt)
        clean = re.sub(r"```(?:json)?", "", raw).strip()
        data = json.loads(clean)
        return data.get("origin"), data.get("destination"), data.get("budget")
    except Exception:
        return None, None, None

def compute_dates(start_date_str: Optional[str], end_date_str: Optional[str], user_message: str = ""):
    req_days = 3
    if user_message:
        match = re.search(r'(\d+)\s*(?:-| )\s*day', user_message, re.IGNORECASE)
        if match:
            try:
                parsed = int(match.group(1))
                if 1 <= parsed <= 30:
                    req_days = parsed
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
    date_list = [(start + timedelta(days=off)).strftime("%d %B %Y") for off in range(duration)]
    return duration, date_list

def get_real_hotels(dest: str, night_rate: int):
    dest_clean = (dest or "").lower().strip()
    if 'goa' in dest_clean:
        return [
            {"name": "Zostel Goa (Anjuna)", "rating": 4.6, "price": f"₹1,150/night", "tag": "Budget Option", "amenities": ["Air Conditioning", "Free WiFi", "Social Lounge"], "description": "Social boutique stay near Anjuna beach.", "ss_name": "Zostel Goa and Anjuna"},
            {"name": "Fairfield by Marriott Goa Anjuna", "rating": 4.7, "price": f"₹3,200/night", "tag": "Value Recommendation", "amenities": ["Outdoor Pool", "Free Breakfast", "Fitness Center"], "description": "Modern 4-star resort with outdoor pool & dining.", "ss_name": "Fairfield by Marriott Goa Anjuna"},
            {"name": "Taj Fort Aguada Resort and Spa", "rating": 4.9, "price": f"₹7,800/night", "tag": "Luxury Choice", "amenities": ["Private Beach", "Full Spa", "Infinity Pool"], "description": "Iconic 5-star beachfront luxury resort.", "ss_name": "Taj Fort Aguada Resort and Spa"}
        ]
    elif 'kashmir' in dest_clean or 'srinagar' in dest_clean or 'gulmarg' in dest_clean:
        return [
            {"name": "Zostel Srinagar", "rating": 4.6, "price": f"₹1,200/night", "tag": "Budget Option", "amenities": ["Heated Rooms", "Dal Lake View", "Free WiFi"], "description": "Scenic Dal Lake view boutique stay.", "ss_name": "Zostel Srinagar"},
            {"name": "Fortune Park Heevan Srinagar", "rating": 4.7, "price": f"₹3,400/night", "tag": "Value Recommendation", "amenities": ["Zabarwan Mountain Views", "Heated Pool", "Restaurant"], "description": "4-star luxury hotel in Srinagar near Zabarwan hills.", "ss_name": "Fortune Park Heevan Srinagar"},
            {"name": "Vivanta Dal View Srinagar", "rating": 4.9, "price": f"₹9,332/night", "tag": "Luxury Choice", "amenities": ["Dal Lake View", "Heated Infinity Pool", "Fine Dining"], "description": "5-star luxury Taj hotel overlooking Dal Lake in Srinagar.", "ss_name": "Vivanta Dal View Srinagar"}
        ]
    else:
        return [
            {"name": f"Zostel {dest.title()}", "rating": 4.5, "price": f"₹1,200/night", "tag": "Budget Option", "amenities": ["Free WiFi", "Social Lounge", "Air Conditioning"], "description": f"Top-rated boutique stay in {dest}.", "ss_name": f"Zostel {dest}"},
            {"name": f"Grand Central Hotel {dest.title()}", "rating": 4.7, "price": f"₹3,200/night", "tag": "Value Recommendation", "amenities": ["Swimming Pool", "Breakfast Included", "City View"], "description": f"Modern 4-star hotel in central {dest}.", "ss_name": f"Grand Central Hotel {dest}"},
            {"name": f"Taj Resort and Spa {dest.title()}", "rating": 4.9, "price": f"₹8,500/night", "tag": "Luxury Choice", "amenities": ["Spa & Wellness", "Infinity Pool", "Fine Dining"], "description": f"Premier 5-star luxury resort in {dest}.", "ss_name": f"Taj Resort and Spa {dest}"}
        ]

def build_itinerary(dest: str, orig: str, num_days: int, date_list: list):
    clean_orig = orig if orig else "Delhi"
    first_date = date_list[0] if date_list else "Day 1"
    
    dest_lower = (dest or "").lower()
    if any(k in dest_lower for k in ['kashmir', 'srinagar', 'gulmarg', 'pahalgam', 'leh', 'ladakh', 'shimla', 'manali', 'mussoorie']):
        clothing_tip = "🧥 Clothing & Packing Guide: Cold mountain climate. Pack heavy woolens, thermal innerwear, windproof jacket, and warm socks."
        local_cuisines = [
            {"name": "Wazwan Royal Banquet", "type": "Traditional Feast", "desc": "Authentic 36-course Kashmiri feast featuring Rogan Josh & Gushtaba."},
            {"name": "Kashmiri Kahwa Tea", "type": "Beverage", "desc": "Green tea infused with saffron strands, almonds, and cardamom."},
            {"name": "Modur Pulao & Yakhni", "type": "Main Course", "desc": "Saffron sweet rice paired with mild yogurt mutton curry."},
            {"name": "Nadir Monji & Sheermal", "type": "Snacks & Bread", "desc": "Crispy lotus stem fritters served with saffron flatbread."}
        ]
    elif any(k in dest_lower for k in ['goa', 'kerala', 'kochi', 'munnar', 'gokarna', 'pondicherry']):
        clothing_tip = "🏖️ Clothing & Packing Guide: Tropical beach climate. Pack light breathable cottons, swimwear, UV sunglasses, and flip-flops."
        local_cuisines = [
            {"name": "Goan Fish Curry Rice", "type": "Coastal Specialty", "desc": "Fresh catch cooked in coconut & red chili gravy with rice."},
            {"name": "Pork Vindaloo & Sorpotel", "type": "Heritage Dish", "desc": "Tangy and spicy Portuguese-inspired classic meat curry."},
            {"name": "Bebinca & Dodol", "type": "Dessert", "desc": "Traditional multi-layered Goan coconut milk & jaggery pudding."},
            {"name": "Sol Kadi & Fresh Coconut Water", "type": "Beverage", "desc": "Refreshing kokum and coconut milk digestive drink."}
        ]
    else:
        clothing_tip = "🎒 Clothing & Packing Guide: Comfortable climate. Pack versatile layered clothing and comfortable walking shoes."
        local_cuisines = [
            {"name": "Authentic Regional Thali", "type": "Local Feast", "desc": "Complete traditional thali with local seasonal curries."},
            {"name": "Street Food Delicacies", "type": "Snacks", "desc": "Famous local market snacks and savory specialties."},
            {"name": "Traditional Artisanal Sweets", "type": "Dessert", "desc": "Handcrafted regional milk desserts."}
        ]

    hotels = get_real_hotels(dest, 3200)

    days_output = []
    for idx in range(num_days):
        day_num = idx + 1
        d_str = date_list[idx] if idx < len(date_list) else f"Day {day_num}"
        days_output.append({
            "day": f"Day {day_num}",
            "date": d_str,
            "theme": f"Explore {dest.title()} Highlights",
            "activities": {
                "morning": [{"name": f"{dest.title()} Historic Landmark", "time": "09:30 AM", "duration": "2.5 hrs", "cost": "₹250", "description": f"Guided tour of top heritage site in {dest.title()}.", "image": ""}],
                "afternoon": [{"name": f"Local Craft Market & Dining", "time": "02:00 PM", "duration": "2 hrs", "cost": "₹500", "description": "Explore local artisan stalls and enjoy regional delicacies.", "image": ""}],
                "evening": [{"name": f"Sunset Promenade & Cultural Walk", "time": "06:00 PM", "duration": "2 hrs", "cost": "₹300", "description": "Relaxing evening stroll with local street food and sunset views.", "image": ""}]
            },
            "restaurants": [{"name": f"{dest.title()} Ocean Breeze Cafe", "cuisine": "Regional Multi-cuisine", "rating": 4.7, "description": "Atmospheric waterfront dining with local specialties.", "image": ""}],
            "hotel": hotels[1]
        })

    return {
        "trip_summary": {
            "destination": dest,
            "origin": clean_orig,
            "days": num_days,
            "budget": "₹30,000",
            "travel_style": "Leisure & Sightseeing",
            "budget_breakdown": {
                "transit_budget": "₹8,000",
                "stay_budget": "₹12,000",
                "activities_food_budget": "₹10,000",
                "total_estimated": "₹30,000"
            },
            "hotel_options": hotels,
            "mode_itineraries": {
                "flight": days_output,
                "train": days_output,
                "road": days_output,
                "combo": days_output
            },
            "local_cuisines": local_cuisines
        },
        "days": days_output,
        "travel_tips": [
            "Hotel Check-in Alignment: Departure times are synchronized with standard 02:00 PM check-in.",
            f"Transit Schedule: Express transit departs {clean_orig} to align with 02:00 PM check-in.",
            clothing_tip
        ],
        "local_cuisines": local_cuisines,
        "gallery": []
    }

@app.post("/api/plan")
async def plan_trip(request: TripRequest):
    try:
        o, d, b = extract_entities(request.user_message)
        extracted_origin = request.origin if (request.origin and str(request.origin).strip().lower() not in ['', 'null', 'none']) else (o if o else "")
        extracted_destination = request.user_message if not d else d
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

        days, date_list = compute_dates(request.start_date, request.end_date, request.user_message)
        
        # Clean destination name from query if raw prompt was used
        clean_dest = extracted_destination
        for word in ["plan", "a", "trip", "to", "for", "days", "day", "under", "with", "budget", "from"]:
            clean_dest = re.sub(rf'\b{word}\b', '', clean_dest, flags=re.IGNORECASE)
        clean_dest = clean_dest.strip().title() or "Goa"

        itinerary = build_itinerary(clean_dest, extracted_origin, days, date_list)

        return {
            "status": "success",
            "destination": clean_dest,
            "origin": extracted_origin,
            "days": days,
            "start_date": request.start_date,
            "end_date": request.end_date,
            "budget": extracted_budget,
            "interests": "Leisure & Sightseeing",
            "weather_info": "Pleasant, 26°C",
            "transport_options": {
                "flight": {"mode": "Flight", "price": "₹6,500"},
                "train": {"mode": "Train", "price": "₹1,800"},
                "road": {"mode": "Road", "price": "₹2,200"}
            },
            "itinerary": itinerary
        }
    except Exception as e:
        err_msg = traceback.format_exc()
        print("Vercel API Error:", err_msg)
        return {
            "status": "error",
            "detail": str(e),
            "traceback": err_msg
        }

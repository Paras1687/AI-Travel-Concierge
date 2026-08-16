from http.server import BaseHTTPRequestHandler
import json
import re
import os
from datetime import datetime, timedelta

def compute_dates(start_date_str, end_date_str, user_message=""):
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

def get_real_hotels(dest: str):
    dest_clean = (dest or "").lower().strip()
    if 'goa' in dest_clean:
        return [
            {"name": "Zostel Goa (Anjuna)", "rating": 4.6, "price": "₹1,150/night", "tag": "Budget Option", "amenities": ["Air Conditioning", "Free WiFi", "Social Lounge"], "description": "Social boutique stay near Anjuna beach.", "ss_name": "Zostel Goa and Anjuna"},
            {"name": "Fairfield by Marriott Goa Anjuna", "rating": 4.7, "price": "₹3,200/night", "tag": "Value Recommendation", "amenities": ["Outdoor Pool", "Free Breakfast", "Fitness Center"], "description": "Modern 4-star resort with outdoor pool & dining.", "ss_name": "Fairfield by Marriott Goa Anjuna"},
            {"name": "Taj Fort Aguada Resort and Spa", "rating": 4.9, "price": "₹7,800/night", "tag": "Luxury Choice", "amenities": ["Private Beach", "Full Spa", "Infinity Pool"], "description": "Iconic 5-star beachfront luxury resort.", "ss_name": "Taj Fort Aguada Resort and Spa"}
        ]
    elif 'kashmir' in dest_clean or 'srinagar' in dest_clean or 'gulmarg' in dest_clean:
        return [
            {"name": "Zostel Srinagar", "rating": 4.6, "price": "₹1,200/night", "tag": "Budget Option", "amenities": ["Heated Rooms", "Dal Lake View", "Free WiFi"], "description": "Scenic Dal Lake view boutique stay.", "ss_name": "Zostel Srinagar"},
            {"name": "Fortune Park Heevan Srinagar", "rating": 4.7, "price": "₹3,400/night", "tag": "Value Recommendation", "amenities": ["Zabarwan Mountain Views", "Heated Pool", "Restaurant"], "description": "4-star luxury hotel in Srinagar near Zabarwan hills.", "ss_name": "Fortune Park Heevan Srinagar"},
            {"name": "Vivanta Dal View Srinagar", "rating": 4.9, "price": "₹9,332/night", "tag": "Luxury Choice", "amenities": ["Dal Lake View", "Heated Infinity Pool", "Fine Dining"], "description": "5-star luxury Taj hotel overlooking Dal Lake in Srinagar.", "ss_name": "Vivanta Dal View Srinagar"}
        ]
    else:
        return [
            {"name": f"Zostel {dest.title()}", "rating": 4.5, "price": "₹1,200/night", "tag": "Budget Option", "amenities": ["Free WiFi", "Social Lounge", "Air Conditioning"], "description": f"Top-rated boutique stay in {dest}.", "ss_name": f"Zostel {dest}"},
            {"name": f"Grand Central Hotel {dest.title()}", "rating": 4.7, "price": "₹3,200/night", "tag": "Value Recommendation", "amenities": ["Swimming Pool", "Breakfast Included", "City View"], "description": f"Modern 4-star hotel in central {dest}.", "ss_name": f"Grand Central Hotel {dest}"},
            {"name": f"Taj Resort and Spa {dest.title()}", "rating": 4.9, "price": "₹8,500/night", "tag": "Luxury Choice", "amenities": ["Spa & Wellness", "Infinity Pool", "Fine Dining"], "description": f"Premier 5-star luxury resort in {dest}.", "ss_name": f"Taj Resort and Spa {dest}"}
        ]

def build_itinerary(dest: str, orig: str, num_days: int, date_list: list):
    clean_orig = orig if orig else "Delhi"
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

    hotels = get_real_hotels(dest)

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

class handler(BaseHTTPRequestHandler):
    def do_POST(self):
        try:
            content_length = int(self.headers.get('Content-Length', 0))
            post_data = self.rfile.read(content_length)
            body = json.loads(post_data.decode('utf-8')) if post_data else {}

            user_message = str(body.get('user_message', 'Plan a 3 day trip')).strip()
            origin = str(body.get('origin', '')).strip()
            budget = str(body.get('budget', '')).strip()
            start_date = body.get('start_date')
            end_date = body.get('end_date')

            if not origin and ("from" not in user_message.lower()):
                res = {
                    "status": "requires_clarification",
                    "missing_field": "origin",
                    "message": "I'd love to plan this! Where will you be flying or traveling out from?"
                }
            elif not budget and ("budget" not in user_message.lower() and "under" not in user_message.lower() and "₹" not in user_message):
                res = {
                    "status": "requires_clarification",
                    "missing_field": "budget",
                    "message": "What is your allocated budget for this trip? (e.g. ₹20,000, ₹35,000, ₹50,000, or Flexible)"
                }
            else:
                extracted_orig = origin if origin else "Delhi"
                extracted_budg = budget if budget else "30,000"
                
                # Extract destination from prompt
                clean_dest = user_message
                for word in ["plan", "a", "trip", "to", "for", "days", "day", "under", "with", "budget", "from"]:
                    clean_dest = re.sub(rf'\b{word}\b', '', clean_dest, flags=re.IGNORECASE)
                clean_dest = clean_dest.strip().title() or "Goa"

                days, date_list = compute_dates(start_date, end_date, user_message)
                itinerary = build_itinerary(clean_dest, extracted_orig, days, date_list)

                res = {
                    "status": "success",
                    "destination": clean_dest,
                    "origin": extracted_orig,
                    "days": days,
                    "start_date": start_date,
                    "end_date": end_date,
                    "budget": extracted_budg,
                    "interests": "Leisure & Sightseeing",
                    "weather_info": "Pleasant, 26°C",
                    "transport_options": {
                        "flight": {"mode": "Flight", "price": "₹6,500"},
                        "train": {"mode": "Train", "price": "₹1,800"},
                        "road": {"mode": "Road", "price": "₹2,200"}
                    },
                    "itinerary": itinerary
                }

            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.send_header('Access-Control-Allow-Methods', 'POST, GET, OPTIONS')
            self.send_header('Access-Control-Allow-Headers', 'Content-Type')
            self.end_headers()
            self.wfile.write(json.dumps(res).encode('utf-8'))
        except Exception as e:
            self.send_response(500)
            self.send_header('Content-type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(json.dumps({"status": "error", "message": str(e)}).encode('utf-8'))

    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'POST, GET, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()

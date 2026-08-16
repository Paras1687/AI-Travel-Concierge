import os
from duffel_api import Duffel
from langchain_core.tools import tool

@tool
def search_optimal_flights(origin_iata: str, destination_iata: str, outbound_date: str, return_date: str, total_budget: int) -> str:
    """
    Searches for the best flight options between two airports using Duffel.
    Dynamically allocates 30% of the total trip budget to flights.
    """
    # 1. The Dynamic Budget Heuristic
    max_flight_price = total_budget * 0.30
    
    access_token = os.getenv("DUFFEL_ACCESS_TOKEN")
    if not access_token:
        return "Error: DUFFEL_ACCESS_TOKEN environment variable not set."
        
    client = Duffel(access_token=access_token)
    
    try:
        # 2. Create the Offer Request
        # Duffel requires you to build slices for each leg of the journey
        offer_request = client.offer_requests.create(
            slices=[
                {
                    "origin": origin_iata,
                    "destination": destination_iata,
                    "departure_date": outbound_date,
                },
                {
                    "origin": destination_iata,
                    "destination": origin_iata,
                    "departure_date": return_date,
                },
            ],
            passengers=[{"type": "adult"}],
            cabin_class="economy",
        )
        
        offers = offer_request.offers
        
        if not offers:
            return "No flights found for these dates."
            
        # 3. The Optimization Engine
        viable_flights = []
        for offer in offers:
            price = float(offer.total_amount)
            currency = offer.total_currency
            
            # Filter strictly by our calculated flight budget
            if price <= max_flight_price:
                # Extract airline and timing from the outbound slice
                outbound_slice = offer.slices[0]
                airline = outbound_slice.segments[0].operating_carrier.name
                
                viable_flights.append({
                    "airline": airline,
                    "price": f"{currency} {price}",
                    "raw_price": price,
                    "outbound_duration": outbound_slice.duration,
                    "offer_id": offer.id 
                })
        
        # Sort by lowest price first
        viable_flights.sort(key=lambda x: x["raw_price"])
        
        if not viable_flights:
            return f"No flights found under the heuristically allocated budget of {max_flight_price:,.0f}."
            
        # Strip out the raw_price before sending to the LLM to save tokens
        for flight in viable_flights:
            del flight["raw_price"]
            
        return f"Top 3 flight options under budget (Max {max_flight_price}): {viable_flights[:3]}"
        
    except Exception as e:
        return f"Flight search API failed: {str(e)}"
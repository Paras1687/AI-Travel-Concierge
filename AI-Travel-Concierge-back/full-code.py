# import os
# import requests
# import json
# from typing import TypedDict
# from dotenv import load_dotenv
# from google import genai
# from langgraph.graph import StateGraph, START, END
# from state import ItineraryState

# load_dotenv()

# client = genai.Client()

# class ItineraryState(TypedDict):
#     user_message: str
#     destination: str
#     days: int
#     budget: str
#     interests: str
#     # flight_status: str
#     weather_info: str
#     research_notes: str
#     final_itinerary: str

# def extractor_node(state: ItineraryState) -> dict:
#     print("Extracting travel preferences...")
#     user_message = state["user_message"]
#     prompt = f"""
#     You are an information extraction assistant.
#     Extract travel details from the user's request.
#     Return ONLY valid JSON.
#     Format:
#     {{
#         "destination": "",
#         "days": 0,
#         "budget": "",
#         "interests": ""
#     }}
#     User request:
#     {user_message}
#     """
#     response = client.models.generate_content(
#         model="gemini-flash-latest",
#         contents=prompt
#     )
    # extracted_text = response.text
    # extracted_text = extracted_text.replace("```json", "")
    # extracted_text = extracted_text.replace("```", "")
    # extracted_text = extracted_text.strip()
    # extracted = json.loads(extracted_text)
    # print("Information Extracted:", extracted)
    # return {
    #     "destination": extracted["destination"],
    #     "days": extracted["days"],
    #     "budget": extracted["budget"],
    #     "interests": extracted["interests"]
    # }

# def flight_node(state: ItineraryState) -> dict:
#     print("Fetching flight data....")
#     flight_key = os.getenv("FLIGHT_API_KEY")
#     if not flight_key:
#         print("Flight API key not found")
#         return {
#             "flight_status":"none"
#         }
#     try:
#         url = (
#             f""
#         )
# i just realised ye api realtime flight status batata hai not future 😭😭😭

# def weather_node(state: ItineraryState) -> dict:
#     print("Fetching live weather data...")
#     weather_key = os.getenv("OPENWEATHER_API_KEY")
#     if not weather_key:
#         print("No weather API key found.")
#         return {
#             "weather_info": "Standard seasonal weather expected."
#         }
#     try:
#         url = (
#             f"https://api.openweathermap.org/data/2.5/weather?"
#             f"q={state['destination']}"
#             f"&appid={weather_key}"
#             f"&units=metric"
#         )
#         response = requests.get(url, timeout=5)
#         if response.status_code == 200:
#             data = response.json()
#             desc = data["weather"][0]["description"].title()
#             temp = data["main"]["temp"]
#             weather_str = (
#                 f"Live Forecast: {desc}, "
#                 f"Temperature: {temp}°C"
#             )

#             print("weather extracted:", weather_str)
#             return {
#                 "weather_info": weather_str
#             }
#         else:

#             return {
#                 "weather_info": "Standard seasonal weather expected."
#             }
#     except Exception as e:
#         print("Weather error:", e)
#         return {
#             "weather_info": "Standard seasonal weather expected."
#         }

# def research_node(state: ItineraryState) -> dict:

#     print("Researching attractions...")


#     prompt = f"""
#     You are a professional travel research assistant.
#     Your job is to collect useful information for another AI agent that will create a final itinerary.
#     Traveler Details:
#     Destination:
#     {state['destination']}
#     Trip Duration:
#     {state['days']} days
#     Budget:
#     {state['budget']}
#     Traveler Interests:
#     {state['interests']}
#     Weather Conditions:
#     {state['weather_info']}
#     Research Task:
#     Find 8-12 relevant places, restaurants, cafes, and experiences that match the traveler's preferences.
#     For every recommendation, provide:
#     1. Name of place
#     2. Category (Temple, Museum, Food, Nature, Shopping, Adventure, etc.)
#     3. Why this place matches the user's interests
#     4. Estimated time required for visiting
#     5. Best time of day to visit
#     6. Budget level (Low / Medium / High)
#     7. Any important tips
#     Important Instructions:
#     - Prioritize places that are genuinely relevant to the user's interests.
#     - Avoid generic tourist lists.
#     - Include a mix of famous attractions and lesser-known experiences.
#     - Consider the weather while selecting outdoor activities.
#     - Do not create an itinerary yet. Only provide researched options.
#     Return the information in a clear structured format.
#     """
#     response = client.models.generate_content(
#         model="gemini-flash-latest",
#         contents=prompt
#     )
#     return {
#         "research_notes": response.text
#     }

# def planner_node(state: ItineraryState) -> dict:

#     print("Creating itinerary...")
#     prompt = f"""
#     You are an expert travel planner specializing in personalized trips.
#     Create a realistic day-by-day itinerary using the research provided.
#     Traveler Information:
#     Destination:
#     {state['destination']}
#     Trip Duration:
#     {state['days']} days
#     Budget:
#     {state['budget']}
#     Weather:
#     {state['weather_info']}
#     Available Research:
#     {state['research_notes']}
#     Planning Rules:
#     - Create a practical itinerary, not just a list of places.
#     - Group nearby locations together to reduce unnecessary travel.
#     - Balance sightseeing, food, relaxation, and exploration.
#     - Consider weather conditions.
#     - Respect the user's budget.
#     - Do not schedule too many activities in one day.
#     - Prioritize experiences matching the user's interests.
#     For each day use this format:
#     ## Day X
#     ### Morning
#     - Place/activity
#     - Reason for visiting
#     - Approximate duration
#     ### Afternoon
#     - Place/activity
#     - Food recommendation nearby
#     ### Evening
#     - Place/activity
#     - Relaxation or cultural experience
#     ### Budget Estimate
#     - Approximate spending for the day
#     ### Travel Tip
#     - One useful practical suggestion
#     Make the itinerary feel like it was created by a human travel expert.
#     """
#     response = client.models.generate_content(
#         model="gemini-flash-latest",
#         contents=prompt
#     )
#     return {
#         "final_itinerary": response.text
#     }

# creating the graph
# builder = StateGraph(ItineraryState)
# builder.add_node("extractor", extractor_node)
# builder.add_node("weather", weather_node)
# builder.add_node("researcher", research_node)
# builder.add_node("planner", planner_node)

# #  graph ka flow
# builder.add_edge(START, "extractor")
# builder.add_edge("extractor", "weather")
# builder.add_edge("weather", "researcher")
# builder.add_edge("researcher", "planner")
# builder.add_edge("planner", END)
# app = builder.compile()


# if __name__ == "__main__":

#     user_text = input(
#         "\nTell me about your trip:\n> "
#     )
#     user_request = {
#         "user_message": user_text,
#         "destination": "",
#         "days": 0,
#         "budget": "",
#         "interests": "",
#         "weather_info": "",
#         "research_notes": "",
#         "final_itinerary": ""
#     }
#     final_output = app.invoke(user_request)
#     print("FINAL ITINERARY:\n")
#     print(final_output["final_itinerary"])
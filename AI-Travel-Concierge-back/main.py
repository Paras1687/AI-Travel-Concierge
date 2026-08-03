from dotenv import load_dotenv
from graph import app

load_dotenv()


if __name__ == "__main__":

    user_text = input(
        "\nTell me about your trip:\n> "
    )

    user_request = {
        "user_message": user_text,
        "destination": "",
        "days": 0,
        "budget": "",
        "interests": "",
        "weather_info": "",
        "research_notes": "",
        "final_itinerary": ""
    }

    final_output = app.invoke(user_request)

    print("\nFINAL ITINERARY:\n")
    print(final_output["final_itinerary"])
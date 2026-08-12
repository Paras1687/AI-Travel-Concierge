from datetime import datetime, timedelta
from dotenv import load_dotenv
from graph import app

load_dotenv()


if __name__ == "__main__":

    user_text = input(
        "\nTell me about your trip:\n> "
    )
    start_date_str = input("Start date (YYYY-MM-DD): ").strip()
    end_date_str = input("End date (YYYY-MM-DD): ").strip()

    start_date = datetime.strptime(start_date_str, "%Y-%m-%d").date()
    end_date = datetime.strptime(end_date_str, "%Y-%m-%d").date()
    days = (end_date - start_date).days + 1
    date_list = [
        (start_date + timedelta(days=i)).strftime("%d %B %Y")
        for i in range(days)
    ]

    user_request = {
        "user_message": user_text,
        "destination": "",
        "days": days,
        "start_date": start_date_str,
        "end_date": end_date_str,
        "date_list": date_list,
        "budget": "",
        "interests": "",
        "weather_info": "",
        "research_notes": "",
        "final_itinerary": ""
    }

    final_output = app.invoke(user_request)

    print("\nFINAL ITINERARY:\n")
    print(final_output["final_itinerary"])
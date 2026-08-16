# TripWeave

TripWeave is an AI-powered travel planning application that combines trip requirements, transportation, accommodation, weather information, and itinerary generation into a single workflow.

The user provides a travel prompt and selects the required travel dates. TripWeave then collects any missing information, retrieves relevant travel data, and generates a personalized itinerary based on the available information and user constraints.

## Overview

Trip planning generally requires users to search across multiple services for transportation, hotels, weather information, activities, and costs. TripWeave brings these steps together through a single interface.

The application follows a structured workflow:

```text
Travel Prompt
      |
      v
Date Selection
      |
      v
Check Starting Point
      |
      +---- Provided
      |
      +---- Missing -> Ask User
      |
      v
Check Budget
      |
      +---- Provided
      |
      +---- Missing -> Ask User
      |
      v
Transportation and Travel Data
      |
      +---- Flights
      +---- Other Transport Modes
      +---- Hotels
      +---- Weather
      |
      v
Itinerary Generation
      |
      v
Final Travel Plan
```

The system ensures that important trip constraints, such as dates, starting point, and budget, are available before generating the final itinerary.

## Features

### Natural Language Input

Users can describe their travel requirements through a natural-language prompt. The system processes the prompt to identify relevant trip information and preferences.

For example:

```text
Plan a five-day trip to Manali with a budget of Rs. 25,000.
```

The extracted information is used as part of the itinerary-generation process.

### Date Selection

Travel dates are selected through a calendar interface.

The user provides:

- Starting date
- Ending date

The selected date range determines the duration of the trip and is passed to the backend for itinerary generation.

### Starting Point Validation

TripWeave checks whether a starting location has been provided.

If the starting point is present in the user's input, it is used directly. If it is not available, the application asks the user to provide it explicitly.

This information is particularly important for transportation and route planning.

### Budget Handling

TripWeave also checks whether a travel budget has been specified.

If a budget is already available, it is used as a constraint during planning. Otherwise, the application asks the user to provide one.

This allows the generated plan to remain within the user's specified spending range.

### Transportation

TripWeave integrates transportation information and provides users with available modes of travel.

The system supports travel planning around options such as:

- Flights
- Trains
- Buses
- Other available transportation modes

A dedicated transportation section allows users to view the available options separately from the itinerary.

### Hotel Recommendations

The application retrieves hotel options for the destination and presents them as part of the overall travel plan.

Accommodation information can be considered alongside the itinerary and budget while planning the trip.

### Weather Information

TripWeave retrieves weather information for the destination.

Weather data is used as an additional input while planning activities and organizing the itinerary.

### Itinerary Generation

The itinerary is generated after the required trip information has been collected.

The generation process considers available information such as:

- Destination
- Travel dates
- Trip duration
- Starting point
- Budget
- Transportation
- Hotel options
- Weather
- User preferences

The output is a structured day-by-day travel plan.

## System Architecture

The backend is implemented using FastAPI and LangGraph, with Google Gemini used for LLM-based processing and generation.

The high-level architecture is:

```text
                         Frontend
                            |
                            v
                         FastAPI
                            |
                            v
                        LangGraph
                            |
             +--------------+--------------+
             |              |              |
             v              v              v
        Trip Details   Travel APIs    Weather Data
             |              |              |
             +--------------+--------------+
                            |
                            v
                       Gemini / LLM
                            |
                            v
                    Itinerary Generation
                            |
                            v
                         Frontend
```

LangGraph manages the workflow and state between the different stages of the travel-planning process. External services provide travel, accommodation, transportation, and weather information, while Gemini is used for language understanding and itinerary generation.

## Workflow

The application follows these main stages:

### 1. User Input

The user enters a natural-language description of the intended trip.

### 2. Date Selection

The user selects the starting and ending dates using the calendar interface.

### 3. Information Validation

The system checks whether required information is available.

The starting point and budget are specifically validated. If either is missing, the application requests the missing information from the user.

### 4. Data Collection

The backend collects relevant information required for planning, including:

- Transportation options
- Flight information
- Hotel options
- Weather information

### 5. Itinerary Generation

The collected information and user requirements are passed through the itinerary-generation workflow.

The resulting itinerary is based on the available travel data and the constraints provided by the user.

### 6. Response

The frontend presents the generated itinerary along with relevant transportation, accommodation, and weather information.

## Itinerary Generation

The itinerary-generation process is not limited to generating a list of destinations.

The system combines multiple inputs before generating the final plan:

```text
Destination
Travel Dates
Starting Point
Budget
Transportation
Accommodation
Weather
User Preferences
        |
        v
Itinerary Generation
        |
        v
Day-by-Day Travel Plan
```

This allows the generated itinerary to be aligned with the actual trip requirements rather than being based only on the destination.

## Technology Stack

### Frontend

- HTML
- CSS
- JavaScript

### Backend

- Python
- FastAPI
- LangGraph
- Google Gemini / Google GenAI

### APIs and Services

- Flight and transportation data services
- Hotel data services
- Weather data services

### Development

- Git
- GitHub
- Visual Studio Code

## Project Structure

The project is organized into frontend and backend components.

```text
TripWeave/
|
├── frontend/
│   ├── ...
│   └── README.md
|
├── backend/
│   ├── ...
│   └── README.md
|
└── README.md
```

The root `README.md` provides an overview of the complete project.

The frontend README contains frontend-specific setup and implementation details.

The backend README contains backend architecture, workflow, API, environment variables, and backend-specific setup instructions.

## Setup

### Prerequisites

The following tools are required:

- Python 3.x
- Git
- A modern web browser
- API keys for the services used by the application

### Clone the Repository

```bash
git clone <repository-url>
cd TripWeave
```

### Backend Setup

Navigate to the backend directory:

```bash
cd backend
```

Create a virtual environment:

```bash
python -m venv venv
```

Activate the environment.

Windows:

```bash
venv\Scripts\activate
```

macOS/Linux:

```bash
source venv/bin/activate
```

Install the dependencies:

```bash
pip install -r requirements.txt
```

Configure the required environment variables before starting the application.

### Start the Backend

The FastAPI server can be started using the project's configured entry point.

For example:

```bash
uvicorn main:app --reload
```

The exact command may vary depending on the final backend entry file.

### Frontend

Follow the instructions in `frontend/README.md` to start the frontend application.

## Environment Variables

API credentials and other sensitive configuration values should be stored in environment variables and should not be committed to the repository.

Example:

```env
GEMINI_API_KEY=your_gemini_api_key
TRAVEL_API_KEY=your_travel_api_key
WEATHER_API_KEY=your_weather_api_key
```

The exact environment variables depend on the services configured in the backend.

A local `.env` file can be used for development and should be included in `.gitignore`.

## Backend Documentation

The backend has its own README because it contains implementation details that are not required in the main project documentation.

The backend README should cover:

- LangGraph workflow
- Nodes and state
- Gemini integration
- FastAPI routes
- External API integrations
- Request and response formats
- Environment variables
- Backend setup
- Error handling

Keeping this documentation separate allows the root README to remain focused on the overall project while providing detailed technical documentation for backend development.

## Future Scope

Potential extensions to TripWeave include:

- Real-time price comparison
- Direct booking integrations
- Additional transportation providers
- Dynamic itinerary modification
- Weather-based itinerary updates
- Multi-city trip planning
- Route visualization
- Expense tracking
- Saved trips and user accounts
- Collaborative trip planning
- Voice-based trip planning

## License

Add the appropriate license for the project.

## Contributors

TripWeave was developed as a collaborative project involving frontend development, backend development, API integration, workflow design, and generative AI integration.

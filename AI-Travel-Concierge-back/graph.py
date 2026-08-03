from langgraph.graph import StateGraph, START, END

from state import ItineraryState

from nodes.extractor import extractor_node
from nodes.weather import weather_node
from nodes.research import research_node
from nodes.planner import planner_node
from nodes.image_node import image_node

builder = StateGraph(ItineraryState)

builder.add_node("extractor", extractor_node)
builder.add_node("weather", weather_node)
builder.add_node("researcher", research_node)
builder.add_node("planner", planner_node)
builder.add_node("image_fetcher", image_node)

builder.add_edge(START, "extractor")
builder.add_edge("extractor", "weather")
builder.add_edge("weather", "researcher")
builder.add_edge("researcher", "planner")
builder.add_edge("planner", "image_fetcher")
builder.add_edge("image_fetcher", END)


app = builder.compile()

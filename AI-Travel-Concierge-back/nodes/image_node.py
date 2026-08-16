import json

def strip_images(obj):
    if isinstance(obj, dict):
        new_dict = {}
        for k, v in obj.items():
            if k in ["image", "gallery"]:
                continue
            new_dict[k] = strip_images(v)
        return new_dict
    elif isinstance(obj, list):
        return [strip_images(item) for item in obj]
    return obj

def image_node(state: dict) -> dict:
    print("Stripping all images from itinerary as requested...")
    raw_itinerary = state.get("final_itinerary", "")
    
    if isinstance(raw_itinerary, str):
        clean_json = raw_itinerary.replace("```json", "").replace("```", "").strip()
        try:
            itinerary = json.loads(clean_json)
        except Exception:
            itinerary = raw_itinerary
    else:
        itinerary = raw_itinerary

    if isinstance(itinerary, dict):
        itinerary = strip_images(itinerary)
        itinerary["gallery"] = []

    return {"final_itinerary": itinerary}
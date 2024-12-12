from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from typing import List
from models import Event, EventCreate, EventUpdate
from database import events_collection
from auth import get_current_user
from bson.objectid import ObjectId
from datetime import datetime
import asyncio
from utils import geocode_address, upload_image_to_cloudinary

router = APIRouter()


# Get events near a location
@router.get("/", response_model=List[Event])
async def get_events(lat: float, lon: float):
    min_lat = lat - 0.2
    max_lat = lat + 0.2
    min_lon = lon - 0.2
    max_lon = lon + 0.2

    query = {
        "lat": {"$gte": min_lat, "$lte": max_lat},
        "lon": {"$gte": min_lon, "$lte": max_lon},
        "timestamp": {"$gte": datetime.now()},
    }
    events_cursor = events_collection.find(query).sort("timestamp", 1)
    events = []
    async for event in events_cursor:
        event["id"] = str(event["_id"])
        events.append(Event(**event))
    return events


# Create a new event
@router.post("/", response_model=Event)
async def create_event(
    event: EventCreate,
    image: UploadFile = File(None),
    current_user: str = Depends(get_current_user),
):
    # Geocode address to get lat and lon
    try:
        # Run the blocking function in a separate thread
        lat, lon = await asyncio.to_thread(geocode_address, event.lugar)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

    event_dict = event.model_dump()
    event_dict["lat"] = lat
    event_dict["lon"] = lon
    event_dict["organizador"] = current_user

    # Upload image if provided
    if image is not None:
        try:
            image_url = await asyncio.to_thread(upload_image_to_cloudinary, image)
            event_dict["imagen"] = image_url
        except Exception as e:
            raise HTTPException(status_code=500, detail="Image upload failed")

    result = await events_collection.insert_one(event_dict)
    event_dict["id"] = str(result.inserted_id)
    return Event(**event_dict)


# Get event details
@router.get("/{event_id}", response_model=Event)
async def get_event(event_id: str):
    event = await events_collection.find_one({"_id": ObjectId(event_id)})
    if event is None:
        raise HTTPException(status_code=404, detail="Event not found")
    event["id"] = str(event["_id"])
    return Event(**event)


# Update an event
@router.put("/{event_id}", response_model=Event)
async def update_event(
    event_id: str,
    event_update: EventUpdate,
    image: UploadFile = File(None),
    current_user: str = Depends(get_current_user),
):
    event = await events_collection.find_one({"_id": ObjectId(event_id)})
    if event is None:
        raise HTTPException(status_code=404, detail="Event not found")
    if event["organizador"] != current_user:
        raise HTTPException(
            status_code=403, detail="Not authorized to update this event"
        )

    update_data = event_update.model_dump(exclude_unset=True)

    # Geocode new address if 'lugar' is updated
    if "lugar" in update_data:
        try:
            lat, lon = await asyncio.to_thread(geocode_address, update_data["lugar"])
            update_data["lat"] = lat
            update_data["lon"] = lon
        except Exception as e:
            raise HTTPException(status_code=400, detail=str(e))

    # Upload new image if provided
    if image is not None:
        try:
            image_url = await asyncio.to_thread(upload_image_to_cloudinary, image)
            update_data["imagen"] = image_url
        except Exception as e:
            raise HTTPException(status_code=500, detail="Image upload failed")

    await events_collection.update_one(
        {"_id": ObjectId(event_id)}, {"$set": update_data}
    )
    updated_event = await events_collection.find_one({"_id": ObjectId(event_id)})
    updated_event["id"] = str(updated_event["_id"])
    return Event(**updated_event)


# Delete an event
@router.delete("/{event_id}")
async def delete_event(event_id: str, current_user: str = Depends(get_current_user)):
    event = await events_collection.find_one({"_id": ObjectId(event_id)})
    if event is None:
        raise HTTPException(status_code=404, detail="Event not found")
    if event["organizador"] != current_user:
        raise HTTPException(
            status_code=403, detail="Not authorized to delete this event"
        )

    await events_collection.delete_one({"_id": ObjectId(event_id)})
    return {"detail": "Event deleted"}

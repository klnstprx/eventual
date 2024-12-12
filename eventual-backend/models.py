from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime


class EventBase(BaseModel):
    nombre: str
    timestamp: datetime
    lugar: str
    organizador: EmailStr


class EventCreate(EventBase):
    pass


class EventUpdate(BaseModel):
    nombre: Optional[str]
    timestamp: Optional[datetime]
    lugar: Optional[str]


class Event(EventBase):
    id: str = Field(...)

    lat: float
    lon: float
    imagen: Optional[str] = None

    class Config:
        populate_by_name = True

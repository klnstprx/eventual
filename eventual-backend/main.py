from fastapi import FastAPI
from auth import router as auth_router
from events import router as events_router

app = FastAPI()

app.include_router(auth_router, prefix="/auth", tags=["Authentication"])
app.include_router(events_router, prefix="/events", tags=["Events"])

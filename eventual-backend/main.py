import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from auth import router as auth_router
from events import router as events_router

app = FastAPI()

# CORS Configuration
origins = [
    os.getenv("FRONTEND_URL"),
    "https://your-app.herokuapp.com",  # Update with your Heroku app URL
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router, prefix="/auth", tags=["Authentication"])
app.include_router(events_router, prefix="/events", tags=["Events"])

# Path to the frontend's built static files
frontend_path = os.path.join(os.path.dirname(__file__), "../eventual-frontend/dist")

if os.path.exists(frontend_path):
    app.mount("/", StaticFiles(directory=frontend_path, html=True), name="static")
else:
    print(
        "Frontend build directory not found. Make sure the frontend is built before starting the server."
    )

from fastapi import FastAPI
from auth import router as auth_router
from events import router as events_router

# Include CORS middleware
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()


origins = [
    "https://eventual-blond.vercel.app",
    "https://eventual-ignacys-projects-6607d153.vercel.app",
    "https://eventual-git-main-ignacys-projects-6607d153.vercel.app",
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

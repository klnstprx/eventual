from fastapi import APIRouter, Depends, HTTPException, Request, Header
from fastapi.responses import RedirectResponse
from fastapi.security import OAuth2PasswordBearer
import os
import requests
from jose import jwt, JWTError
from datetime import datetime, timedelta
from database import logs_collection
from utils import create_access_token
import asyncio

router = APIRouter()

# Configuration
GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")
GOOGLE_CLIENT_SECRET = os.getenv("GOOGLE_CLIENT_SECRET")
GOOGLE_REDIRECT_URI = os.getenv("GOOGLE_REDIRECT_URI")
SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = "HS256"

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/token")


@router.get("/login")
def login():
    google_auth_endpoint = "https://accounts.google.com/o/oauth2/v2/auth"
    scope = "openid email"
    access_type = "offline"
    response_type = "code"
    prompt = "consent"

    auth_url = (
        f"{google_auth_endpoint}?client_id={GOOGLE_CLIENT_ID}"
        f"&redirect_uri={GOOGLE_REDIRECT_URI}"
        f"&response_type={response_type}"
        f"&scope={scope}"
        f"&access_type={access_type}"
        f"&prompt={prompt}"
    )
    return RedirectResponse(auth_url)


@router.get("/callback")
async def callback(request: Request):
    code = request.query_params.get("code")
    if not code:
        raise HTTPException(status_code=400, detail="Code not found in callback")

    token_endpoint = "https://oauth2.googleapis.com/token"
    token_params = {
        "client_id": GOOGLE_CLIENT_ID,
        "client_secret": GOOGLE_CLIENT_SECRET,
        "code": code,
        "grant_type": "authorization_code",
        "redirect_uri": GOOGLE_REDIRECT_URI,
    }

    # Using asyncio.to_thread to make the blocking call in a separate thread
    token_response = await asyncio.to_thread(
        requests.post, token_endpoint, data=token_params
    )
    if token_response.status_code != 200:
        raise HTTPException(status_code=400, detail="Failed to fetch token")

    token_data = token_response.json()
    id_token = token_data.get("id_token")
    if not id_token:
        raise HTTPException(status_code=400, detail="ID token not received")

    try:
        payload = jwt.decode(id_token, options={"verify_signature": False})
        email = payload.get("email")
        if not email:
            raise HTTPException(status_code=400, detail="Email not found in token")
    except JWTError:
        raise HTTPException(status_code=400, detail="Invalid ID token")

    access_token_expires = timedelta(hours=1)
    access_token = create_access_token(
        data={"sub": email}, expires_delta=access_token_expires
    )

    # Log the login event
    log = {
        "timestamp": datetime.now(),
        "usuario": email,
        "caducidad": datetime.now() + access_token_expires,
        "token": access_token,
    }
    await logs_collection.insert_one(log)

    frontend_redirect_uri = os.getenv("FRONTEND_REDIRECT_URI")
    redirect_url = f"{frontend_redirect_uri}?access_token={access_token}"
    return RedirectResponse(redirect_url)


async def get_current_user(token: str = Depends(oauth2_scheme)):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise HTTPException(
                status_code=401, detail="Invalid authentication credentials"
            )
        return email
    except JWTError:
        raise HTTPException(
            status_code=401, detail="Invalid authentication credentials"
        )

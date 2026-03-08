"""
ClosetAI - FastAPI Backend
Main application entry point.
"""

import os
from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from dotenv import load_dotenv

from database import engine, Base
from routers import clothing, outfits

load_dotenv()

# ── App setup ─────────────────────────────────────────────────────────────────

app = FastAPI(
    title="ClosetAI API",
    description="AI-powered digital closet management and outfit recommendation API",
    version="1.0.0",
)

# CORS configuration — allow frontend dev server and production origin
origins_env = os.getenv("CORS_ORIGINS", "http://localhost:5173,http://localhost:3000")
origins = [o.strip() for o in origins_env.split(",") if o.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Database ──────────────────────────────────────────────────────────────────

# Create all tables on startup
Base.metadata.create_all(bind=engine)

# ── Static file serving ───────────────────────────────────────────────────────

UPLOAD_DIR = Path(os.getenv("UPLOAD_DIR", "./uploads"))
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=str(UPLOAD_DIR)), name="uploads")

# ── Routers ───────────────────────────────────────────────────────────────────

app.include_router(clothing.router)
app.include_router(outfits.router)


# ── Health check ──────────────────────────────────────────────────────────────

@app.get("/api/health")
def health_check():
    """Health check endpoint."""
    return {"status": "ok", "service": "ClosetAI API"}


@app.get("/")
def root():
    return {"message": "Welcome to ClosetAI API. Visit /docs for the API documentation."}

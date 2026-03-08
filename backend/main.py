"""
FastAPI application entrypoint for ClosetAI backend.
"""

import os
from contextlib import asynccontextmanager
from pathlib import Path

from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from database import Base, UPLOAD_DIR, create_upload_dir, engine
from routers import clothing, outfits

load_dotenv()


# ---------------------------------------------------------------------------
# Startup / shutdown lifecycle
# ---------------------------------------------------------------------------
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Create DB tables (idempotent)
    Base.metadata.create_all(bind=engine)
    # Ensure uploads directory exists
    create_upload_dir()
    yield
    # (nothing to clean up on shutdown)


# ---------------------------------------------------------------------------
# App factory
# ---------------------------------------------------------------------------
app = FastAPI(
    title="ClosetAI API",
    description="AI-powered wardrobe management backend",
    version="1.0.0",
    lifespan=lifespan,
)

# ---- CORS ----
raw_origins = os.getenv(
    "CORS_ORIGINS",
    "http://localhost:19000,http://localhost:19001,exp://localhost:19000",
)
origins = [o.strip() for o in raw_origins.split(",") if o.strip()]
# In development we also allow any origin for convenience
origins += ["*"]  # Remove this in production and restrict to known origins

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=False,   # must be False when allow_origins=["*"]
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---- Static files (uploaded images) ----
upload_path = Path(UPLOAD_DIR)
upload_path.mkdir(parents=True, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=str(upload_path)), name="uploads")

# ---- Routers ----
app.include_router(clothing.router)
app.include_router(outfits.router)


# ---------------------------------------------------------------------------
# Health check
# ---------------------------------------------------------------------------
@app.get("/health", tags=["Health"])
async def health_check():
    return {"status": "ok", "service": "ClosetAI API", "version": "1.0.0"}


@app.get("/", tags=["Health"])
async def root():
    return {"message": "Welcome to ClosetAI API 👗✨", "docs": "/docs"}

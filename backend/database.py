"""
Database engine, session factory, and dependency injection for FastAPI.
"""

import os
from pathlib import Path

from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./closetai.db")
UPLOAD_DIR = os.getenv("UPLOAD_DIR", "./uploads")

# SQLite specific: allow multiple threads (needed by FastAPI async routes)
connect_args = {"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}

engine = create_engine(DATABASE_URL, connect_args=connect_args)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def get_db():
    """FastAPI dependency that yields a DB session and closes it when done."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def create_upload_dir() -> None:
    """Ensure the uploads directory exists on startup."""
    Path(UPLOAD_DIR).mkdir(parents=True, exist_ok=True)

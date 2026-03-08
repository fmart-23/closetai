"""
SQLAlchemy database models for ClosetAI.
Defines ClothingItem and Outfit tables.
"""

from datetime import datetime
from sqlalchemy import Column, Integer, String, DateTime, Text, JSON
from database import Base


class ClothingItem(Base):
    """Represents a single clothing item in the user's closet."""

    __tablename__ = "clothing_items"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    image_path = Column(String(500), nullable=True)

    # AI-classified attributes
    clothing_type = Column(String(100), nullable=True)   # shirt, pants, dress, etc.
    color = Column(String(100), nullable=True)           # primary color
    secondary_color = Column(String(100), nullable=True) # secondary color
    pattern = Column(String(100), nullable=True)         # solid, striped, plaid, etc.
    style = Column(String(100), nullable=True)           # casual, formal, sporty, etc.
    season = Column(String(100), nullable=True)          # summer, winter, all-season, etc.
    description = Column(Text, nullable=True)            # AI-generated description

    # User-provided metadata
    brand = Column(String(100), nullable=True)
    notes = Column(Text, nullable=True)
    tags = Column(JSON, nullable=True)                   # List of user tags

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class Outfit(Base):
    """Represents a saved outfit combination."""

    __tablename__ = "outfits"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=True)
    occasion = Column(String(100), nullable=True)
    weather = Column(String(100), nullable=True)
    style_preference = Column(String(100), nullable=True)

    # List of clothing item IDs that make up the outfit
    item_ids = Column(JSON, nullable=False)

    # AI-generated description and styling tips
    description = Column(Text, nullable=True)
    styling_tips = Column(Text, nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow)

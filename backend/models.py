"""
SQLAlchemy ORM models and Pydantic schemas for ClosetAI.
"""

import json
from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel
from sqlalchemy import Column, DateTime, Integer, String, Text, func

from database import Base


# ---------------------------------------------------------------------------
# ORM Models
# ---------------------------------------------------------------------------


class ClothingItem(Base):
    __tablename__ = "clothing_items"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(200), nullable=True)
    category = Column(String(100), nullable=False, index=True)
    color = Column(String(100), nullable=True)
    pattern = Column(String(100), nullable=True)
    style = Column(String(100), nullable=True)
    season = Column(String(100), nullable=True)
    image_path = Column(String(500), nullable=True)   # filesystem path
    image_url = Column(String(500), nullable=True)    # public URL
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=func.now(), nullable=False)
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now(), nullable=False)


class Outfit(Base):
    __tablename__ = "outfits"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(200), nullable=False)
    occasion = Column(String(100), nullable=True)
    style = Column(String(100), nullable=True)
    description = Column(Text, nullable=True)
    tips = Column(Text, nullable=True)
    # Stored as a JSON string: "[1, 3, 7]"
    item_ids_json = Column(Text, nullable=False, default="[]")
    created_at = Column(DateTime, default=func.now(), nullable=False)

    @property
    def item_ids(self) -> List[int]:
        try:
            return json.loads(self.item_ids_json)
        except Exception:
            return []

    @item_ids.setter
    def item_ids(self, value: List[int]):
        self.item_ids_json = json.dumps(value)


# ---------------------------------------------------------------------------
# Pydantic Schemas
# ---------------------------------------------------------------------------


class ClothingItemBase(BaseModel):
    name: Optional[str] = None
    category: Optional[str] = None
    color: Optional[str] = None
    pattern: Optional[str] = None
    style: Optional[str] = None
    season: Optional[str] = None
    notes: Optional[str] = None


class ClothingItemCreate(ClothingItemBase):
    category: str  # required on create


class ClothingItemUpdate(ClothingItemBase):
    pass


class ClothingItemResponse(ClothingItemBase):
    id: int
    image_url: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class OutfitBase(BaseModel):
    name: str
    occasion: Optional[str] = None
    style: Optional[str] = None
    description: Optional[str] = None
    tips: Optional[str] = None


class OutfitCreate(OutfitBase):
    items: List[int] = []   # list of ClothingItem IDs


class OutfitResponse(OutfitBase):
    id: int
    items: List[ClothingItemResponse] = []
    created_at: datetime

    model_config = {"from_attributes": True}


class OutfitRecommendRequest(BaseModel):
    occasion: str = "Casual"
    weather: str = "Warm"
    style: str = "Classic"


class OutfitRecommendResponse(BaseModel):
    name: str
    occasion: Optional[str] = None
    style: Optional[str] = None
    description: Optional[str] = None
    tips: Optional[str] = None
    items: List[ClothingItemResponse] = []

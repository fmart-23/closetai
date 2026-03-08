"""
Clothing CRUD endpoints for ClosetAI.
Handles upload, classification, listing, updating, and deleting clothing items.
"""

import os
import uuid
import shutil
from pathlib import Path
from typing import Optional

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from sqlalchemy.orm import Session

from database import get_db
from models import ClothingItem
from services.vision import classify_clothing

router = APIRouter(prefix="/api/clothing", tags=["clothing"])

UPLOAD_DIR = Path(os.getenv("UPLOAD_DIR", "./uploads"))
ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp", ".gif"}
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10 MB


# ── Pydantic schemas ──────────────────────────────────────────────────────────

class ClothingItemResponse(BaseModel):
    id: int
    name: str
    image_path: Optional[str] = None
    clothing_type: Optional[str] = None
    color: Optional[str] = None
    secondary_color: Optional[str] = None
    pattern: Optional[str] = None
    style: Optional[str] = None
    season: Optional[str] = None
    description: Optional[str] = None
    brand: Optional[str] = None
    notes: Optional[str] = None
    tags: Optional[list] = None
    created_at: str
    updated_at: str

    class Config:
        from_attributes = True


class ClothingItemUpdate(BaseModel):
    name: Optional[str] = None
    clothing_type: Optional[str] = None
    color: Optional[str] = None
    secondary_color: Optional[str] = None
    pattern: Optional[str] = None
    style: Optional[str] = None
    season: Optional[str] = None
    description: Optional[str] = None
    brand: Optional[str] = None
    notes: Optional[str] = None
    tags: Optional[list] = None


# ── Helper ────────────────────────────────────────────────────────────────────

def _item_to_dict(item: ClothingItem) -> dict:
    return {
        "id": item.id,
        "name": item.name,
        "image_path": item.image_path,
        "clothing_type": item.clothing_type,
        "color": item.color,
        "secondary_color": item.secondary_color,
        "pattern": item.pattern,
        "style": item.style,
        "season": item.season,
        "description": item.description,
        "brand": item.brand,
        "notes": item.notes,
        "tags": item.tags or [],
        "created_at": item.created_at.isoformat() if item.created_at else None,
        "updated_at": item.updated_at.isoformat() if item.updated_at else None,
    }


# ── Endpoints ─────────────────────────────────────────────────────────────────

@router.post("", status_code=201)
async def upload_clothing(
    image: UploadFile = File(...),
    name: str = Form(""),
    brand: str = Form(""),
    notes: str = Form(""),
    db: Session = Depends(get_db),
):
    """Upload a clothing photo, classify it with AI, and save to the closet."""
    # Validate file extension
    ext = Path(image.filename).suffix.lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(status_code=400, detail=f"File type '{ext}' not allowed. Use JPG, PNG, or WEBP.")

    # Save image to uploads directory
    UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
    unique_name = f"{uuid.uuid4()}{ext}"
    save_path = UPLOAD_DIR / unique_name

    with open(save_path, "wb") as f:
        content = await image.read()
        if len(content) > MAX_FILE_SIZE:
            raise HTTPException(status_code=400, detail="File too large. Maximum size is 10 MB.")
        f.write(content)

    # AI classification
    classification = await classify_clothing(str(save_path), image.filename)

    # Create DB record
    item_name = name.strip() or f"{classification.get('color', '')} {classification.get('clothing_type', 'Item')}".strip()
    db_item = ClothingItem(
        name=item_name,
        image_path=f"/uploads/{unique_name}",
        clothing_type=classification.get("clothing_type"),
        color=classification.get("color"),
        secondary_color=classification.get("secondary_color"),
        pattern=classification.get("pattern"),
        style=classification.get("style"),
        season=classification.get("season"),
        description=classification.get("description"),
        brand=brand.strip() or None,
        notes=notes.strip() or None,
        tags=[],
    )
    db.add(db_item)
    db.commit()
    db.refresh(db_item)

    return _item_to_dict(db_item)


@router.get("")
def list_clothing(
    clothing_type: Optional[str] = None,
    color: Optional[str] = None,
    style: Optional[str] = None,
    season: Optional[str] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db),
):
    """List all clothing items with optional filters."""
    query = db.query(ClothingItem)

    if clothing_type:
        query = query.filter(ClothingItem.clothing_type.ilike(f"%{clothing_type}%"))
    if color:
        query = query.filter(ClothingItem.color.ilike(f"%{color}%"))
    if style:
        query = query.filter(ClothingItem.style.ilike(f"%{style}%"))
    if season:
        query = query.filter(ClothingItem.season.ilike(f"%{season}%"))
    if search:
        query = query.filter(
            ClothingItem.name.ilike(f"%{search}%")
            | ClothingItem.description.ilike(f"%{search}%")
        )

    items = query.order_by(ClothingItem.created_at.desc()).all()
    return [_item_to_dict(item) for item in items]


@router.get("/{item_id}")
def get_clothing_item(item_id: int, db: Session = Depends(get_db)):
    """Get a single clothing item by ID."""
    item = db.query(ClothingItem).filter(ClothingItem.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Clothing item not found.")
    return _item_to_dict(item)


@router.put("/{item_id}")
def update_clothing_item(item_id: int, data: ClothingItemUpdate, db: Session = Depends(get_db)):
    """Update a clothing item's metadata."""
    item = db.query(ClothingItem).filter(ClothingItem.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Clothing item not found.")

    update_data = data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(item, key, value)

    db.commit()
    db.refresh(item)
    return _item_to_dict(item)


@router.delete("/{item_id}", status_code=204)
def delete_clothing_item(item_id: int, db: Session = Depends(get_db)):
    """Delete a clothing item and its associated image."""
    item = db.query(ClothingItem).filter(ClothingItem.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Clothing item not found.")

    # Remove image file from disk
    if item.image_path:
        file_path = Path("." + item.image_path)
        if file_path.exists():
            file_path.unlink()

    db.delete(item)
    db.commit()
    return JSONResponse(status_code=204, content=None)

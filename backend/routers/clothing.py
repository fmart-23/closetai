"""
CRUD endpoints for clothing items.
"""

import os
import uuid
from pathlib import Path
from typing import List, Optional

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile, status
from sqlalchemy.orm import Session

from database import UPLOAD_DIR, get_db
from models import ClothingItem, ClothingItemResponse, ClothingItemUpdate
from services.vision import classify_clothing

router = APIRouter(prefix="/api/clothing", tags=["Clothing"])


# ---------------------------------------------------------------------------
# Helper — build the public image URL from the stored filename
# ---------------------------------------------------------------------------
def _image_url(filename: Optional[str]) -> Optional[str]:
    if not filename:
        return None
    # Return a path relative to the server root; the static mount handles it
    return f"/uploads/{filename}"


# ---------------------------------------------------------------------------
# POST /api/clothing  — upload image + create item
# ---------------------------------------------------------------------------
@router.post("", response_model=ClothingItemResponse, status_code=status.HTTP_201_CREATED)
async def create_clothing_item(
    image: UploadFile = File(...),
    name: Optional[str] = Form(None),
    category: Optional[str] = Form(None),
    color: Optional[str] = Form(None),
    pattern: Optional[str] = Form(None),
    style: Optional[str] = Form(None),
    season: Optional[str] = Form(None),
    notes: Optional[str] = Form(None),
    db: Session = Depends(get_db),
):
    # ---- Save image to disk ----
    ext = Path(image.filename).suffix if image.filename else ".jpg"
    filename = f"{uuid.uuid4().hex}{ext}"
    file_path = Path(UPLOAD_DIR) / filename

    contents = await image.read()
    with open(file_path, "wb") as f:
        f.write(contents)

    # ---- AI classification (falls back to mock if no API key) ----
    classification = await classify_clothing(str(file_path))

    # Form fields override AI classification when provided
    item = ClothingItem(
        name=name or classification.get("name"),
        category=category or classification.get("category", "Tops"),
        color=color or classification.get("color"),
        pattern=pattern or classification.get("pattern"),
        style=style or classification.get("style"),
        season=season or classification.get("season"),
        notes=notes,
        image_path=str(file_path),
        image_url=_image_url(filename),
    )
    db.add(item)
    db.commit()
    db.refresh(item)
    return item


# ---------------------------------------------------------------------------
# GET /api/clothing  — list items with optional filters
# ---------------------------------------------------------------------------
@router.get("", response_model=List[ClothingItemResponse])
def list_clothing_items(
    category: Optional[str] = None,
    color: Optional[str] = None,
    style: Optional[str] = None,
    season: Optional[str] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db),
):
    q = db.query(ClothingItem)
    if category:
        q = q.filter(ClothingItem.category.ilike(category))
    if color:
        q = q.filter(ClothingItem.color.ilike(f"%{color}%"))
    if style:
        q = q.filter(ClothingItem.style.ilike(f"%{style}%"))
    if season:
        q = q.filter(ClothingItem.season.ilike(f"%{season}%"))
    if search:
        term = f"%{search}%"
        q = q.filter(
            ClothingItem.name.ilike(term)
            | ClothingItem.color.ilike(term)
            | ClothingItem.style.ilike(term)
            | ClothingItem.pattern.ilike(term)
        )
    return q.order_by(ClothingItem.created_at.desc()).all()


# ---------------------------------------------------------------------------
# GET /api/clothing/{id}  — get single item
# ---------------------------------------------------------------------------
@router.get("/{item_id}", response_model=ClothingItemResponse)
def get_clothing_item(item_id: int, db: Session = Depends(get_db)):
    item = db.query(ClothingItem).filter(ClothingItem.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    return item


# ---------------------------------------------------------------------------
# PUT /api/clothing/{id}  — update metadata
# ---------------------------------------------------------------------------
@router.put("/{item_id}", response_model=ClothingItemResponse)
def update_clothing_item(
    item_id: int,
    data: ClothingItemUpdate,
    db: Session = Depends(get_db),
):
    item = db.query(ClothingItem).filter(ClothingItem.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")

    update_fields = data.model_dump(exclude_unset=True)
    for field, value in update_fields.items():
        setattr(item, field, value)

    db.commit()
    db.refresh(item)
    return item


# ---------------------------------------------------------------------------
# DELETE /api/clothing/{id}  — remove item + image file
# ---------------------------------------------------------------------------
@router.delete("/{item_id}", status_code=status.HTTP_200_OK)
def delete_clothing_item(item_id: int, db: Session = Depends(get_db)):
    item = db.query(ClothingItem).filter(ClothingItem.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")

    # Delete the image file from disk
    if item.image_path and Path(item.image_path).exists():
        try:
            os.remove(item.image_path)
        except OSError:
            pass  # log in production; don't fail the request

    db.delete(item)
    db.commit()
    return {"message": "Item deleted successfully", "id": item_id}

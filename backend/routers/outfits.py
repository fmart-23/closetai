"""
Outfit recommendation and management endpoints for ClosetAI.
"""

from typing import Optional
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from database import get_db
from models import ClothingItem, Outfit
from services.recommender import recommend_outfit

router = APIRouter(prefix="/api/outfits", tags=["outfits"])


# ── Pydantic schemas ──────────────────────────────────────────────────────────

class RecommendRequest(BaseModel):
    occasion: str = "casual"
    weather: str = "mild"
    style_preference: str = "classic"


class SaveOutfitRequest(BaseModel):
    name: Optional[str] = None
    occasion: Optional[str] = None
    weather: Optional[str] = None
    style_preference: Optional[str] = None
    item_ids: list[int]
    description: Optional[str] = None
    styling_tips: Optional[str] = None


# ── Helper ────────────────────────────────────────────────────────────────────

def _outfit_to_dict(outfit: Outfit, items: list) -> dict:
    return {
        "id": outfit.id,
        "name": outfit.name,
        "occasion": outfit.occasion,
        "weather": outfit.weather,
        "style_preference": outfit.style_preference,
        "item_ids": outfit.item_ids,
        "items": items,
        "description": outfit.description,
        "styling_tips": outfit.styling_tips,
        "created_at": outfit.created_at.isoformat() if outfit.created_at else None,
    }


def _get_items_for_ids(item_ids: list, db: Session) -> list:
    items = db.query(ClothingItem).filter(ClothingItem.id.in_(item_ids)).all()
    return [
        {
            "id": item.id,
            "name": item.name,
            "image_path": item.image_path,
            "clothing_type": item.clothing_type,
            "color": item.color,
            "style": item.style,
            "season": item.season,
        }
        for item in items
    ]


# ── Endpoints ─────────────────────────────────────────────────────────────────

@router.post("/recommend")
async def get_outfit_recommendation(
    request: RecommendRequest,
    db: Session = Depends(get_db),
):
    """Generate an AI-powered outfit recommendation from the user's wardrobe."""
    # Fetch all clothing items
    wardrobe = db.query(ClothingItem).all()
    wardrobe_list = [
        {
            "id": item.id,
            "name": item.name,
            "clothing_type": item.clothing_type,
            "color": item.color,
            "secondary_color": item.secondary_color,
            "pattern": item.pattern,
            "style": item.style,
            "season": item.season,
            "image_path": item.image_path,
        }
        for item in wardrobe
    ]

    result = await recommend_outfit(
        wardrobe=wardrobe_list,
        occasion=request.occasion,
        weather=request.weather,
        style_preference=request.style_preference,
    )

    # Resolve item details for the recommended IDs
    item_ids = result.get("outfit_item_ids", [])
    items = _get_items_for_ids(item_ids, db)

    return {
        "item_ids": item_ids,
        "items": items,
        "description": result.get("description", ""),
        "styling_tips": result.get("styling_tips", ""),
        "occasion": request.occasion,
        "weather": request.weather,
        "style_preference": request.style_preference,
    }


@router.get("")
def list_outfits(db: Session = Depends(get_db)):
    """List all saved outfits."""
    outfits = db.query(Outfit).order_by(Outfit.created_at.desc()).all()
    result = []
    for outfit in outfits:
        items = _get_items_for_ids(outfit.item_ids or [], db)
        result.append(_outfit_to_dict(outfit, items))
    return result


@router.post("", status_code=201)
def save_outfit(request: SaveOutfitRequest, db: Session = Depends(get_db)):
    """Save a recommended or custom outfit."""
    # Validate all item IDs exist
    if request.item_ids:
        count = db.query(ClothingItem).filter(ClothingItem.id.in_(request.item_ids)).count()
        if count != len(request.item_ids):
            raise HTTPException(status_code=400, detail="One or more clothing item IDs not found.")

    outfit = Outfit(
        name=request.name or f"{request.occasion or 'My'} Outfit",
        occasion=request.occasion,
        weather=request.weather,
        style_preference=request.style_preference,
        item_ids=request.item_ids,
        description=request.description,
        styling_tips=request.styling_tips,
    )
    db.add(outfit)
    db.commit()
    db.refresh(outfit)

    items = _get_items_for_ids(outfit.item_ids or [], db)
    return _outfit_to_dict(outfit, items)


@router.get("/{outfit_id}")
def get_outfit(outfit_id: int, db: Session = Depends(get_db)):
    """Get a single outfit by ID."""
    outfit = db.query(Outfit).filter(Outfit.id == outfit_id).first()
    if not outfit:
        raise HTTPException(status_code=404, detail="Outfit not found.")
    items = _get_items_for_ids(outfit.item_ids or [], db)
    return _outfit_to_dict(outfit, items)


@router.delete("/{outfit_id}", status_code=204)
def delete_outfit(outfit_id: int, db: Session = Depends(get_db)):
    """Delete a saved outfit."""
    outfit = db.query(Outfit).filter(Outfit.id == outfit_id).first()
    if not outfit:
        raise HTTPException(status_code=404, detail="Outfit not found.")
    db.delete(outfit)
    db.commit()

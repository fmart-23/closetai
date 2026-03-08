"""
Outfit recommendation and CRUD endpoints.
"""

from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from database import get_db
from models import (
    ClothingItem,
    ClothingItemResponse,
    Outfit,
    OutfitCreate,
    OutfitRecommendRequest,
    OutfitRecommendResponse,
    OutfitResponse,
)
from services.recommender import recommend_outfit

router = APIRouter(prefix="/api/outfits", tags=["Outfits"])


# ---------------------------------------------------------------------------
# Helper — hydrate Outfit ORM object → OutfitResponse (resolve item IDs)
# ---------------------------------------------------------------------------
def _hydrate_outfit(outfit: Outfit, db: Session) -> dict:
    items = (
        db.query(ClothingItem)
        .filter(ClothingItem.id.in_(outfit.item_ids))
        .all()
    )
    return {
        "id": outfit.id,
        "name": outfit.name,
        "occasion": outfit.occasion,
        "style": outfit.style,
        "description": outfit.description,
        "tips": outfit.tips,
        "created_at": outfit.created_at,
        "items": items,
    }


# ---------------------------------------------------------------------------
# POST /api/outfits/recommend  — AI recommendation (does NOT save)
# ---------------------------------------------------------------------------
@router.post("/recommend", response_model=OutfitRecommendResponse)
async def get_outfit_recommendation(
    request: OutfitRecommendRequest,
    db: Session = Depends(get_db),
):
    # Fetch the full wardrobe so the AI has context
    wardrobe = db.query(ClothingItem).all()

    if not wardrobe:
        raise HTTPException(
            status_code=400,
            detail="Your closet is empty. Add some clothing items first!",
        )

    result = await recommend_outfit(
        wardrobe_items=[
            {
                "id": item.id,
                "name": item.name,
                "category": item.category,
                "color": item.color,
                "pattern": item.pattern,
                "style": item.style,
                "season": item.season,
            }
            for item in wardrobe
        ],
        preferences={
            "occasion": request.occasion,
            "weather": request.weather,
            "style": request.style,
        },
    )

    # Resolve the returned item IDs to full ClothingItem objects
    selected_ids = result.get("item_ids", [])
    selected_items = (
        db.query(ClothingItem).filter(ClothingItem.id.in_(selected_ids)).all()
        if selected_ids
        else []
    )

    return {
        "name": result.get("name", "Your Outfit"),
        "occasion": request.occasion,
        "style": request.style,
        "description": result.get("description"),
        "tips": result.get("tips"),
        "items": selected_items,
    }


# ---------------------------------------------------------------------------
# GET /api/outfits  — list all saved outfits
# ---------------------------------------------------------------------------
@router.get("", response_model=List[OutfitResponse])
def list_outfits(db: Session = Depends(get_db)):
    outfits = db.query(Outfit).order_by(Outfit.created_at.desc()).all()
    return [_hydrate_outfit(o, db) for o in outfits]


# ---------------------------------------------------------------------------
# POST /api/outfits  — save an outfit
# ---------------------------------------------------------------------------
@router.post("", response_model=OutfitResponse, status_code=status.HTTP_201_CREATED)
def save_outfit(data: OutfitCreate, db: Session = Depends(get_db)):
    outfit = Outfit(
        name=data.name,
        occasion=data.occasion,
        style=data.style,
        description=data.description,
        tips=data.tips,
    )
    outfit.item_ids = data.items
    db.add(outfit)
    db.commit()
    db.refresh(outfit)
    return _hydrate_outfit(outfit, db)


# ---------------------------------------------------------------------------
# GET /api/outfits/{id}  — get a single saved outfit
# ---------------------------------------------------------------------------
@router.get("/{outfit_id}", response_model=OutfitResponse)
def get_outfit(outfit_id: int, db: Session = Depends(get_db)):
    outfit = db.query(Outfit).filter(Outfit.id == outfit_id).first()
    if not outfit:
        raise HTTPException(status_code=404, detail="Outfit not found")
    return _hydrate_outfit(outfit, db)


# ---------------------------------------------------------------------------
# DELETE /api/outfits/{id}  — delete a saved outfit
# ---------------------------------------------------------------------------
@router.delete("/{outfit_id}", status_code=status.HTTP_200_OK)
def delete_outfit(outfit_id: int, db: Session = Depends(get_db)):
    outfit = db.query(Outfit).filter(Outfit.id == outfit_id).first()
    if not outfit:
        raise HTTPException(status_code=404, detail="Outfit not found")
    db.delete(outfit)
    db.commit()
    return {"message": "Outfit deleted", "id": outfit_id}

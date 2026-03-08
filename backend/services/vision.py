"""
OpenAI Vision API clothing classifier with a mock fallback.

When OPENAI_API_KEY is not set (or the API call fails), classify_clothing()
returns a randomly generated but realistic classification so the app is
fully testable without any API credentials.
"""

import base64
import os
import random
from pathlib import Path
from typing import Dict

from dotenv import load_dotenv

load_dotenv()

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "")

# ---------------------------------------------------------------------------
# Mock data pools
# ---------------------------------------------------------------------------
_MOCK_CATEGORIES = ["Tops", "Bottoms", "Dresses", "Outerwear", "Shoes", "Accessories"]
_MOCK_COLORS = ["Black", "White", "Navy", "Grey", "Beige", "Blue", "Red", "Green", "Pink", "Brown"]
_MOCK_PATTERNS = ["Solid", "Striped", "Plaid", "Floral", "Abstract", "Checkered"]
_MOCK_STYLES = ["Classic", "Casual", "Minimalist", "Trendy", "Formal", "Sporty"]
_MOCK_SEASONS = ["Spring", "Summer", "Fall", "Winter", "All Season"]

_MOCK_NAMES = {
    "Tops": ["Cotton T-Shirt", "Button-Down Shirt", "Blouse", "Tank Top", "Polo Shirt", "Sweater"],
    "Bottoms": ["Slim Jeans", "Chino Pants", "Skirt", "Shorts", "Joggers", "Trousers"],
    "Dresses": ["Midi Dress", "Wrap Dress", "Sundress", "Maxi Dress", "Shift Dress"],
    "Outerwear": ["Denim Jacket", "Trench Coat", "Puffer Jacket", "Blazer", "Cardigan"],
    "Shoes": ["Sneakers", "Loafers", "Ankle Boots", "Heels", "Sandals", "Oxford Shoes"],
    "Accessories": ["Tote Bag", "Leather Belt", "Silk Scarf", "Baseball Cap", "Watch"],
}


def _mock_classify() -> Dict[str, str]:
    """Return a plausible mock classification for testing without an API key."""
    category = random.choice(_MOCK_CATEGORIES)
    color = random.choice(_MOCK_COLORS)
    name_base = random.choice(_MOCK_NAMES[category])
    return {
        "name": f"{color} {name_base}",
        "category": category,
        "color": color,
        "pattern": random.choice(_MOCK_PATTERNS),
        "style": random.choice(_MOCK_STYLES),
        "season": random.choice(_MOCK_SEASONS),
    }


# ---------------------------------------------------------------------------
# Real OpenAI Vision classification
# ---------------------------------------------------------------------------
async def classify_clothing(image_path: str) -> Dict[str, str]:
    """
    Classify a clothing item from a local image file.

    Returns a dict with keys: name, category, color, pattern, style, season.
    Falls back to _mock_classify() when no API key is available or on error.
    """
    if not OPENAI_API_KEY or OPENAI_API_KEY == "your_openai_api_key_here":
        return _mock_classify()

    try:
        from openai import AsyncOpenAI  # lazy import — only needed with real key

        client = AsyncOpenAI(api_key=OPENAI_API_KEY)

        # Encode image as base64 for the Vision API
        image_data = Path(image_path).read_bytes()
        b64_image = base64.b64encode(image_data).decode("utf-8")

        # Determine MIME type from extension
        ext = Path(image_path).suffix.lower().lstrip(".")
        mime = "image/jpeg" if ext in ("jpg", "jpeg") else f"image/{ext}"

        prompt = (
            "You are a fashion expert AI. Analyze the clothing item in this image "
            "and respond with ONLY a JSON object (no markdown, no code fences) with "
            "the following fields:\n"
            "- name: short descriptive name (e.g. 'Navy Blue Denim Jacket')\n"
            "- category: one of Tops, Bottoms, Dresses, Outerwear, Shoes, Accessories\n"
            "- color: primary color name\n"
            "- pattern: one of Solid, Striped, Plaid, Floral, Abstract, Checkered, Animal Print\n"
            "- style: one of Classic, Casual, Minimalist, Trendy, Formal, Sporty, Bold\n"
            "- season: one of Spring, Summer, Fall, Winter, All Season\n\n"
            "Example: {\"name\": \"Navy Blue Denim Jacket\", \"category\": \"Outerwear\", "
            "\"color\": \"Navy\", \"pattern\": \"Solid\", \"style\": \"Classic\", \"season\": \"Fall\"}"
        )

        response = await client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {
                    "role": "user",
                    "content": [
                        {"type": "text", "text": prompt},
                        {
                            "type": "image_url",
                            "image_url": {"url": f"data:{mime};base64,{b64_image}", "detail": "low"},
                        },
                    ],
                }
            ],
            max_tokens=200,
            temperature=0.2,
        )

        import json
        raw = response.choices[0].message.content.strip()
        # Strip any accidental markdown code fences
        if raw.startswith("```"):
            raw = raw.split("```")[1]
            if raw.startswith("json"):
                raw = raw[4:]
        result = json.loads(raw)

        # Ensure all expected keys are present, fallback to mock values for missing ones
        mock = _mock_classify()
        return {
            "name": result.get("name") or mock["name"],
            "category": result.get("category") or mock["category"],
            "color": result.get("color") or mock["color"],
            "pattern": result.get("pattern") or mock["pattern"],
            "style": result.get("style") or mock["style"],
            "season": result.get("season") or mock["season"],
        }

    except Exception as exc:
        # Log the error but don't crash — return mock data so the app keeps working
        print(f"[vision] Classification failed ({type(exc).__name__}: {exc}), using mock.")
        return _mock_classify()

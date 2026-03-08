"""
GPT-powered outfit recommender with a mock fallback.

When OPENAI_API_KEY is not set, recommend_outfit() picks items from the
wardrobe at random and returns a plausible-sounding outfit description so
the app is fully testable without API credentials.
"""

import os
import random
from typing import Any, Dict, List

from dotenv import load_dotenv

load_dotenv()

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "")


# ---------------------------------------------------------------------------
# Mock fallback
# ---------------------------------------------------------------------------
_MOCK_DESCRIPTIONS = [
    "A perfectly balanced look that mixes comfort with style. The pieces complement each other's colors and textures for a cohesive, put-together appearance.",
    "This combination strikes the ideal balance between casual ease and polished refinement. Each piece adds to the overall harmony of the outfit.",
    "A curated selection that flows naturally together. The color palette is cohesive and the proportions work well for the occasion.",
    "Effortlessly stylish — these pieces were made to be worn together. The neutral tones create a sophisticated foundation with just the right amount of interest.",
]

_MOCK_TIPS = [
    "Tuck in your top for a more polished silhouette. Add a minimal accessory to elevate the look.",
    "Roll up the sleeves slightly for a relaxed feel. A simple belt can define the waist beautifully.",
    "Layer strategically — start with the lightest layer and build up. Keep accessories simple to let the outfit speak.",
    "Choose shoes that echo one of the colors in your outfit to tie the look together effortlessly.",
]

_OUTFIT_NAMES = [
    "The Classic Edit",
    "Weekend Ready",
    "Smart Casual",
    "Effortless Chic",
    "The Modern Mix",
    "Power Dressing",
    "Off-Duty Cool",
    "The Minimalist",
]


def _mock_recommend(wardrobe_items: List[Dict], preferences: Dict) -> Dict[str, Any]:
    """Pick a sensible subset of wardrobe items and generate a mock outfit."""
    occasion = preferences.get("occasion", "Casual")
    style = preferences.get("style", "Classic")

    # Group items by category
    by_category: Dict[str, List[Dict]] = {}
    for item in wardrobe_items:
        cat = (item.get("category") or "Other").lower()
        by_category.setdefault(cat, []).append(item)

    selected: List[Dict] = []

    # Try to build a complete outfit: top + bottom (or dress) + optional outerwear + optional shoes
    if "dresses" in by_category:
        selected.append(random.choice(by_category["dresses"]))
    else:
        if "tops" in by_category:
            selected.append(random.choice(by_category["tops"]))
        if "bottoms" in by_category:
            selected.append(random.choice(by_category["bottoms"]))

    if "shoes" in by_category:
        selected.append(random.choice(by_category["shoes"]))

    if "outerwear" in by_category and random.random() > 0.4:
        selected.append(random.choice(by_category["outerwear"]))

    if "accessories" in by_category and random.random() > 0.5:
        selected.append(random.choice(by_category["accessories"]))

    # If we couldn't build anything meaningful, just pick up to 3 random items
    if not selected:
        selected = random.sample(wardrobe_items, min(3, len(wardrobe_items)))

    return {
        "name": random.choice(_OUTFIT_NAMES),
        "description": random.choice(_MOCK_DESCRIPTIONS),
        "tips": random.choice(_MOCK_TIPS),
        "item_ids": [item["id"] for item in selected],
    }


# ---------------------------------------------------------------------------
# Real OpenAI recommendation
# ---------------------------------------------------------------------------
async def recommend_outfit(
    wardrobe_items: List[Dict], preferences: Dict
) -> Dict[str, Any]:
    """
    Generate an outfit recommendation from the user's wardrobe.

    Returns a dict with keys: name, description, tips, item_ids (list of ints).
    Falls back to _mock_recommend() when no API key is present or on error.
    """
    if not OPENAI_API_KEY or OPENAI_API_KEY == "your_openai_api_key_here":
        return _mock_recommend(wardrobe_items, preferences)

    try:
        from openai import AsyncOpenAI
        import json

        client = AsyncOpenAI(api_key=OPENAI_API_KEY)

        occasion = preferences.get("occasion", "Casual")
        weather = preferences.get("weather", "Warm")
        style = preferences.get("style", "Classic")

        # Format wardrobe as a compact list for the prompt
        wardrobe_text = "\n".join(
            f"- ID {item['id']}: {item.get('name') or item.get('category')} "
            f"({item.get('category')}, {item.get('color')}, {item.get('style')}, {item.get('season')})"
            for item in wardrobe_items
        )

        prompt = (
            f"You are a personal stylist AI. A user wants an outfit for:\n"
            f"- Occasion: {occasion}\n"
            f"- Weather: {weather}\n"
            f"- Style: {style}\n\n"
            f"Their wardrobe:\n{wardrobe_text}\n\n"
            "Select 2–5 items that work well together and respond with ONLY a JSON object "
            "(no markdown, no code fences) with these fields:\n"
            "- name: creative outfit name (string)\n"
            "- description: 2-3 sentence styling description (string)\n"
            "- tips: one practical styling tip (string)\n"
            "- item_ids: array of selected item IDs (integers)\n\n"
            "Example: {\"name\": \"Weekend Chic\", \"description\": \"...\", "
            "\"tips\": \"...\", \"item_ids\": [1, 3, 7]}"
        )

        response = await client.chat.completions.create(
            model="gpt-4o",
            messages=[{"role": "user", "content": prompt}],
            max_tokens=400,
            temperature=0.7,
        )

        raw = response.choices[0].message.content.strip()
        if raw.startswith("```"):
            raw = raw.split("```")[1]
            if raw.startswith("json"):
                raw = raw[4:]
        result = json.loads(raw)

        # Validate item_ids are real wardrobe IDs
        valid_ids = {item["id"] for item in wardrobe_items}
        result["item_ids"] = [
            i for i in result.get("item_ids", []) if i in valid_ids
        ]

        if not result["item_ids"]:
            # AI returned nonsense IDs — fall back to mock selection
            fallback = _mock_recommend(wardrobe_items, preferences)
            result["item_ids"] = fallback["item_ids"]

        return result

    except Exception as exc:
        print(f"[recommender] Recommendation failed ({type(exc).__name__}: {exc}), using mock.")
        return _mock_recommend(wardrobe_items, preferences)

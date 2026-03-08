"""
AI Outfit Recommender service using OpenAI GPT.
Falls back to a rule-based mock when no API key is available.
"""

import json
import os
import re
import random

from dotenv import load_dotenv

load_dotenv()

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "")


def _mock_recommend(wardrobe: list, occasion: str, weather: str, style_preference: str) -> dict:
    """
    Rule-based outfit recommendation for testing without an API key.
    """
    if not wardrobe:
        return {
            "outfit_items": [],
            "description": "Your closet is empty! Start by uploading some clothing items.",
            "styling_tips": "Upload photos of your clothes to get personalized outfit recommendations.",
        }

    # Simple rule: pick one of each major category if available
    tops = [i for i in wardrobe if i.get("clothing_type", "").lower() in
            ("t-shirt", "shirt", "blouse", "sweater", "top", "hoodie", "tank top")]
    bottoms = [i for i in wardrobe if i.get("clothing_type", "").lower() in
               ("jeans", "pants", "shorts", "skirt", "trousers")]
    dresses = [i for i in wardrobe if i.get("clothing_type", "").lower() in
               ("dress", "jumpsuit", "romper")]
    outerwear = [i for i in wardrobe if i.get("clothing_type", "").lower() in
                 ("jacket", "coat", "blazer", "cardigan")]
    shoes = [i for i in wardrobe if i.get("clothing_type", "").lower() in
             ("shoes", "sneakers", "boots", "sandals", "heels", "loafers")]

    selected = []
    if dresses:
        selected.append(random.choice(dresses))
    else:
        if tops:
            selected.append(random.choice(tops))
        if bottoms:
            selected.append(random.choice(bottoms))
    if outerwear and weather in ("cold", "cool", "rainy"):
        selected.append(random.choice(outerwear))
    if shoes:
        selected.append(random.choice(shoes))

    # Fallback: pick random items if no matching categories
    if not selected:
        selected = random.sample(wardrobe, min(3, len(wardrobe)))

    item_ids = [item["id"] for item in selected]
    item_names = [f"{item.get('color', '')} {item.get('clothing_type', 'item')}".strip() for item in selected]

    description = (
        f"A great {occasion} outfit for {weather} weather with a {style_preference} style. "
        f"This combination features: {', '.join(item_names)}."
    )
    styling_tips = (
        "Try tucking in the top for a more polished look. "
        "Accessorize with a belt or minimal jewelry to elevate the outfit."
    )

    return {
        "outfit_item_ids": item_ids,
        "description": description,
        "styling_tips": styling_tips,
    }


async def recommend_outfit(
    wardrobe: list,
    occasion: str,
    weather: str,
    style_preference: str,
) -> dict:
    """
    Generate an outfit recommendation from the user's wardrobe.

    Args:
        wardrobe: List of ClothingItem dicts (id, name, clothing_type, color, style, season, etc.)
        occasion: e.g. "casual", "work", "date night", "formal event"
        weather: e.g. "hot", "cold", "rainy"
        style_preference: e.g. "classic", "trendy", "minimalist"

    Returns:
        dict with outfit_item_ids, description, styling_tips
    """
    if not OPENAI_API_KEY or OPENAI_API_KEY == "your_openai_api_key_here":
        return _mock_recommend(wardrobe, occasion, weather, style_preference)

    if not wardrobe:
        return {
            "outfit_item_ids": [],
            "description": "Your closet is empty! Start by uploading some clothing items.",
            "styling_tips": "Upload photos of your clothes to get personalized outfit recommendations.",
        }

    try:
        from openai import AsyncOpenAI

        client = AsyncOpenAI(api_key=OPENAI_API_KEY)

        # Build wardrobe description for the prompt
        wardrobe_text = "\n".join(
            f"- ID {item['id']}: {item.get('color', '')} {item.get('clothing_type', 'item')} "
            f"({item.get('style', '')}, {item.get('season', '')}, pattern: {item.get('pattern', '')})"
            for item in wardrobe
        )

        prompt = f"""You are a professional fashion stylist. Based on the following wardrobe, create an outfit recommendation.

WARDROBE:
{wardrobe_text}

REQUIREMENTS:
- Occasion: {occasion}
- Weather/Season: {weather}
- Style preference: {style_preference}

Select 2-4 items that work well together and respond with a JSON object:
{{
  "outfit_item_ids": [<list of item IDs from the wardrobe>],
  "description": "<2-3 sentence description of the outfit and why it works>",
  "styling_tips": "<1-2 practical styling tips>"
}}

Only include item IDs that exist in the wardrobe above. Respond with only the JSON object."""

        response = await client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[{"role": "user", "content": prompt}],
            max_tokens=500,
        )

        content = response.choices[0].message.content.strip()

        # Strip markdown code fences if present
        content = re.sub(r"^```(?:json)?\s*", "", content)
        content = re.sub(r"\s*```$", "", content)

        result = json.loads(content)
        return result

    except Exception as exc:
        print(f"Recommender API error, using mock: {exc}")
        return _mock_recommend(wardrobe, occasion, weather, style_preference)

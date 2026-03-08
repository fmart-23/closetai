"""
AI Vision service for classifying clothing items using OpenAI Vision API.
Falls back to mock classification when no API key is available.
"""

import base64
import json
import os
import re
from pathlib import Path

from dotenv import load_dotenv

load_dotenv()

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "")


def _mock_classify(filename: str) -> dict:
    """
    Return a mock classification result for testing without an API key.
    Cycles through a few realistic examples based on filename hash.
    """
    mock_results = [
        {
            "clothing_type": "T-Shirt",
            "color": "White",
            "secondary_color": "None",
            "pattern": "Solid",
            "style": "Casual",
            "season": "All-Season",
            "description": "A classic white crew-neck t-shirt, perfect for everyday casual wear.",
        },
        {
            "clothing_type": "Jeans",
            "color": "Blue",
            "secondary_color": "None",
            "pattern": "Solid",
            "style": "Casual",
            "season": "All-Season",
            "description": "Classic blue denim jeans with a straight-leg cut.",
        },
        {
            "clothing_type": "Dress",
            "color": "Black",
            "secondary_color": "None",
            "pattern": "Solid",
            "style": "Formal",
            "season": "All-Season",
            "description": "An elegant black dress suitable for formal occasions.",
        },
        {
            "clothing_type": "Jacket",
            "color": "Navy",
            "secondary_color": "None",
            "pattern": "Solid",
            "style": "Business",
            "season": "Fall",
            "description": "A smart navy blazer, ideal for business or smart-casual settings.",
        },
        {
            "clothing_type": "Sneakers",
            "color": "White",
            "secondary_color": "Grey",
            "pattern": "Solid",
            "style": "Casual",
            "season": "All-Season",
            "description": "Clean white sneakers with grey accents, versatile for daily wear.",
        },
    ]
    idx = hash(filename) % len(mock_results)
    return mock_results[idx]


def _encode_image(image_path: str) -> str:
    """Encode an image file to a base64 string."""
    with open(image_path, "rb") as f:
        return base64.b64encode(f.read()).decode("utf-8")


async def classify_clothing(image_path: str, filename: str) -> dict:
    """
    Classify a clothing item using OpenAI Vision API.
    Returns a dict with: clothing_type, color, secondary_color, pattern, style, season, description.

    Falls back to mock data if OPENAI_API_KEY is not set.
    """
    if not OPENAI_API_KEY or OPENAI_API_KEY == "your_openai_api_key_here":
        return _mock_classify(filename)

    try:
        from openai import AsyncOpenAI

        client = AsyncOpenAI(api_key=OPENAI_API_KEY)

        # Encode image as base64
        image_data = _encode_image(image_path)

        # Determine MIME type from extension
        ext = Path(image_path).suffix.lower()
        mime_map = {".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".png": "image/png", ".webp": "image/webp"}
        mime_type = mime_map.get(ext, "image/jpeg")

        prompt = """Analyze this clothing item and provide a JSON response with the following fields:
{
  "clothing_type": "<type of clothing, e.g. T-Shirt, Jeans, Dress, Jacket, Shoes, etc.>",
  "color": "<primary color>",
  "secondary_color": "<secondary color or 'None'>",
  "pattern": "<pattern, e.g. Solid, Striped, Plaid, Floral, Checkered, etc.>",
  "style": "<style, e.g. Casual, Formal, Sporty, Business, Streetwear, etc.>",
  "season": "<season suitability, e.g. Summer, Winter, Fall, Spring, All-Season>",
  "description": "<brief 1-2 sentence description of the item>"
}

Respond with only the JSON object, no additional text."""

        response = await client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {
                    "role": "user",
                    "content": [
                        {
                            "type": "image_url",
                            "image_url": {
                                "url": f"data:{mime_type};base64,{image_data}",
                                "detail": "low",
                            },
                        },
                        {"type": "text", "text": prompt},
                    ],
                }
            ],
            max_tokens=500,
        )

        content = response.choices[0].message.content.strip()

        # Strip markdown code fences if present
        content = re.sub(r"^```(?:json)?\s*", "", content)
        content = re.sub(r"\s*```$", "", content)

        result = json.loads(content)
        return result

    except Exception as exc:
        # Fall back to mock on any error
        print(f"Vision API error, using mock: {exc}")
        return _mock_classify(filename)

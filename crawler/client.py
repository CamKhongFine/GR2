from dotenv import load_dotenv
import os
import json
import re
from typing import Any, Dict, Optional
from google import genai

load_dotenv()

api_key = os.getenv("GEMINI_API_KEY")
if not api_key:
    raise ValueError("GEMINI_API_KEY không được tìm thấy. Hãy kiểm tra file .env.")

client = genai.Client()
model_name = "gemini-2.5-flash"

system_prompt = """
You are an information extraction assistant for the humanitarian data platform Rescue Lens.\nYour task is to extract structured metadata about disaster and rescue situations in Vietnam from a given news article.\nYou must analyze the article carefully and return data strictly in JSON format suitable for database insertion.
"""

user_prompt = """
Below is the article content collected by the crawler.
Please extract the key information and return a JSON object matching the following database schema.

--- ARTICLE INPUT ---
Title: {title}
Description: {description}
Origin: {origin}
Published Time: {published_time}
Content:
{raw_content}
----------------------

Your output must follow this exact JSON format:

{{
  "title": "...",
  "description": "...",
  "disaster_type": "...",
  "location": "...",
  "status": "...",
  "origin": "..."
}}

Rules:
1. title – keep or shorten (max 120 chars).
2. description – 1–2 sentences summarizing the event.
3. disaster_type – one of: Flood, Storm, Landslide, Earthquake, Fire, Drought, Other.
4. location – main affected area.
5. status – ONGOING / RESOLVED / UNVERIFIED.
6. origin – domain (vnexpress.net, tuoitre.vn, etc.).
7. Return only the JSON object.
"""

def _parse_json_strict(text: str) -> Optional[Dict[str, Any]]:
    if not text:
        return None
    text = text.strip()
    try:
        return json.loads(text)
    except Exception:
        pass
    m = re.search(r"\{[\s\S]*?\}", text)
    if m:
        try:
            return json.loads(m.group(0))
        except Exception:
            return None
    return None

def extract_article_json(
    article: Dict[str, Any],
    model: str = model_name,
) -> Optional[Dict[str, Any]]:
    filled_user = user_prompt.format(
        title=article.get("title", ""),
        description=article.get("description", ""),
        origin=article.get("origin", ""),
        published_time=article.get("published_time", ""),
        raw_content=article.get("raw_content", ""),
    )
    prompt = f"{system_prompt}\n\n{filled_user}"
    try:
        response = client.models.generate_content(
            model=model,
            contents=prompt,
        )
        content = getattr(response, 'text', None) or str(response)
        return _parse_json_strict(content)
    except Exception as e:
        print(f"Đã xảy ra lỗi khi gọi Gemini API: {e}")
        return None

if __name__ == "__main__":
    demo_article = {
        "title": "Một vụ tai nạn xảy ra tại Vincom Center Phạm Ngọc Thạch Hà Nội",
        "description": "Vụ tai nạn đã khiến 1 người tử vong và 1 người bị thương nặng.",
        "origin": "zingnews.vn",
        "published_time": "2025-10-30T08:45:00+07:00",
        "raw_content": "Theo ghi nhận, vụ tai nạn xảy ra vào lúc 17:00 ngày 30/10/2025 tại Vincom Center Phạm Ngọc Thạch Hà Nội. Vụ tai nạn đã khiến 1 người tử vong và 1 người bị thương nặng."
    }
    parsed = extract_article_json(demo_article)
    print(json.dumps(parsed or {}, ensure_ascii=False, indent=2))

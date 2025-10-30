import os
import json
import re
import time
from typing import Any, Dict, List, Optional
from openai import OpenAI

system_prompt = """
You are an information extraction assistant for the humanitarian data platform Rescue Lens.
Your task is to extract structured metadata about disaster and rescue situations in Vietnam from a given news article.
You must analyze the article carefully and return data strictly in JSON format suitable for database insertion.
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

def get_client() -> OpenAI:
    return OpenAI(
        base_url="https://openrouter.ai/api/v1",
        api_key=os.getenv("OPENROUTER_API_KEY", "<OPENROUTER_API_KEY>"),
    )

def chat(
    messages: List[Dict[str, Any]],
    model: str = "deepseek/deepseek-chat-v3.1:free",
    extra_headers: Optional[Dict[str, str]] = None,
    extra_body: Optional[Dict[str, Any]] = None,
):
    client = get_client()
    completion = client.chat.completions.create(
        extra_headers=extra_headers
        or {
            "HTTP-Referer": os.getenv("OPENROUTER_SITE_URL", "<YOUR_SITE_URL>"),
            "X-Title": os.getenv("OPENROUTER_SITE_NAME", "<YOUR_SITE_NAME>"),
        },
        extra_body=extra_body or {},
        model=model,
        messages=messages,
        response_format={"type": "json_object"},
    )
    return completion

def safe_chat(messages, model="deepseek/deepseek-chat-v3.1:free", retries=3):
    for attempt in range(retries):
        try:
            return chat(messages=messages, model=model)
        except Exception as e:
            print(f"⚠️ API error (attempt {attempt+1}/{retries}): {e}")
            time.sleep(2)
    return None

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

def extract_article_json(article: Dict[str, Any], model="deepseek/deepseek-chat-v3.1:free") -> Optional[Dict[str, Any]]:
    filled_user = user_prompt.format(
        title=article.get("title", ""),
        description=article.get("description", ""),
        origin=article.get("origin", ""),
        published_time=article.get("published_time", ""),
        raw_content=article.get("raw_content", ""),
    )
    messages = [
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": filled_user},
    ]
    resp = safe_chat(messages=messages, model=model)
    if not resp or not getattr(resp, "choices", []):
        return None
    content = getattr(resp.choices[0].message, "content", "")
    return _parse_json_strict(content)

if __name__ == "__main__":
    demo_article = {
        "title": "Mưa lũ tại Huế gây thiệt hại nặng",
        "description": "Mưa lớn kéo dài khiến nhiều tuyến đường ngập sâu.",
        "origin": "vnexpress.net",
        "published_time": "2025-10-30T08:45:00+07:00",
        "raw_content": "Theo ghi nhận, mưa lũ khiến hàng trăm hộ dân phải di dời..."
    }

    print("🚀 Extracting structured data...")
    parsed = extract_article_json(demo_article)
    print("\nExtraction Result:")
    print(json.dumps(parsed or {}, ensure_ascii=False, indent=2))
import argparse
import json
import os
import random
import re
import sys
import time
from datetime import datetime
from typing import List, Dict, Optional, Set
from urllib.parse import urlparse, quote

from selenium import webdriver
from selenium.webdriver.chrome.options import Options as ChromeOptions
from selenium.webdriver.chrome.service import Service as ChromeService
from webdriver_manager.chrome import ChromeDriverManager
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException, NoSuchElementException, WebDriverException

from client import extract_article_json

DISALLOWED_SEGMENTS = [
    "video", "multimedia", "photo", "hinh-anh", "infographic", "podcast", "tuong-tac"
]
SUPPORTED_DOMAINS = [
    "vnexpress.net", "tuoitre.vn", "dantri.com.vn", "zingnews.vn"
]

DISASTER_KEYWORDS = [
    "bão", "lũ", "lũ lụt", "sạt lở", "ngập lụt", "thiên tai",
    "động đất", "cháy rừng", "mưa lớn", "áp thấp nhiệt đới",
]

RESCUE_KEYWORDS = [
    "cứu hộ", "cứu nạn", "tìm kiếm cứu nạn", "cứu trợ", "hỗ trợ khẩn cấp",
    "phát hàng cứu trợ", "bộ đội cứu hộ", "lực lượng chức năng", "điểm sơ tán",
    "chữa cháy", "cháy nổ", "tai nạn giao thông", "sập nhà", "người mất tích",
]

ALL_KEYWORDS = DISASTER_KEYWORDS + RESCUE_KEYWORDS

def create_driver(headless: bool = True) -> webdriver.Chrome:
    options = ChromeOptions()
    if headless:
        options.add_argument("--headless=new")
    options.add_argument("--disable-gpu")
    options.add_argument("--no-sandbox")
    options.add_argument("--disable-dev-shm-usage")
    options.add_argument("--lang=vi-VN")
    options.add_argument("--window-size=1200,1600")
    options.add_argument("--blink-settings=imagesEnabled=false")
    options.add_argument("--disable-notifications")
    service = ChromeService(ChromeDriverManager().install())
    driver = webdriver.Chrome(service=service, options=options)
    driver.set_page_load_timeout(45)
    return driver

def random_delay(a: float = 1.2, b: float = 2.8) -> None:
    time.sleep(random.uniform(a, b))
def safe_text(el) -> str:
    try:
        return el.text.strip()
    except Exception:
        return ""
def get_meta_content(driver: webdriver.Chrome, names: List[str]) -> Optional[str]:
    for name in names:
        try:
            selector = f'meta[name="{name}"]'
            el = driver.find_element(By.CSS_SELECTOR, selector)
            content = el.get_attribute("content")
            if content:
                return content.strip()
        except NoSuchElementException:
            pass
    return None
def get_meta_property(driver: webdriver.Chrome, properties: List[str]) -> Optional[str]:
    for prop in properties:
        try:
            selector = f'meta[property="{prop}"]'
            el = driver.find_element(By.CSS_SELECTOR, selector)
            content = el.get_attribute("content")
            if content:
                return content.strip()
        except NoSuchElementException:
            pass
    return None
def close_cookie_banners(driver: webdriver.Chrome) -> None:
    selectors = [
        "button[aria-label='Close']", "button[aria-label='close']", "button[aria-label='Đóng']", "button[aria-label='Tắt']",
        "button[aria-label='dismiss']", "button[aria-label='Got it']", "button[aria-label='Accept']", "button[aria-label='I agree']",
        "button.btn-accept", "button.accept", ".qc-cmp2-summary-buttons .qc-cmp2-summary-buttons-accept-all",
        ".qc-cmp2-footer .qc-cmp2-btn.qc-cmp2-accept-all", ".btn-consent, .btn-accept, .cookie-accept, .cookie-approve",
        "#onetrust-accept-btn-handler", ".ot-sdk-container #onetrust-accept-btn-handler",
    ]
    for css in selectors:
        try:
            els = driver.find_elements(By.CSS_SELECTOR, css)
            for el in els:
                if el.is_displayed():
                    el.click()
                    random_delay(0.2, 0.5)
        except Exception:
            pass
def is_probable_article(url: str) -> bool:
    u = url.lower()
    if any(seg in u for seg in DISALLOWED_SEGMENTS):
        return False
    path = urlparse(u).path
    if not path or path == "/":
        return False
    if re.search(r"\d{5,}", path):
        return True
    return path.count("-") >= 2 and len(path) > 12
def normalize_url(url: str) -> str:
    return url.split("#")[0].split("?")[0].strip()
def collect_links_from_search(driver: webdriver.Chrome, url: str, limit: int) -> List[str]:
    links: List[str] = []
    seen: Set[str] = set()
    try:
        driver.get(url)
        WebDriverWait(driver, 20).until(EC.presence_of_element_located((By.TAG_NAME, "body")))
        random_delay()
        close_cookie_banners(driver)
        random_delay(0.4, 0.8)
        candidates = driver.find_elements(By.CSS_SELECTOR, "a[href]")
        for a in candidates:
            href = a.get_attribute("href")
            if not href:
                continue
            href = normalize_url(href)
            host = urlparse(href).hostname or ""
            if not any(host.endswith(d) for d in SUPPORTED_DOMAINS):
                continue
            if is_probable_article(href) and href not in seen:
                seen.add(href)
                links.append(href)
                if len(links) >= limit:
                    break
    except Exception:
        pass
    return links
def search_articles(keyword: str, limit: int = 40, driver: Optional[webdriver.Chrome] = None) -> List[str]:
    should_quit = False
    if driver is None:
        driver = create_driver(headless=True)
        should_quit = True
    encoded = quote(keyword)
    search_pages = [
        f"https://tuoitre.vn/tim-kiem.htm?keywords={encoded}",
        f"https://dantri.com.vn/tim-kiem.htm?keywords={encoded}",
        f"https://zingnews.vn/tim-kiem.html?q={encoded}",
        f"https://vnexpress.net/tim-kiem?q={encoded}",
    ]
    results: List[str] = []
    seen: Set[str] = set()
    per_site_limit = max(6, min(20, limit // 4 + 2))
    for sp in search_pages:
        links = collect_links_from_search(driver, sp, per_site_limit)
        for l in links:
            if l not in seen:
                seen.add(l)
                results.append(l)
                if len(results) >= limit:
                    break
        if len(results) >= limit:
            break
    if should_quit:
        try:
            driver.quit()
        except Exception:
            pass
    return results
def extract_published_time(driver: webdriver.Chrome) -> Optional[str]:
    meta_time = get_meta_property(driver, [
        "article:published_time", "og:published_time", "article:modified_time", "og:updated_time"
    ])
    if meta_time:
        return meta_time
    selectors = ["time[datetime]", ".date, .time, .ArticleDate, .article-time, .publish-time"]
    for css in selectors:
        try:
            el = driver.find_element(By.CSS_SELECTOR, css)
            attr = el.get_attribute("datetime")
            if attr:
                return attr.strip()
            txt = safe_text(el)
            if txt:
                return txt
        except NoSuchElementException:
            pass
    return None
def collect_article_paragraphs(driver: webdriver.Chrome) -> List[str]:
    containers = [
        "article", ".fck_detail", ".article-body", ".the-article-body", ".main", ".container"
    ]
    paras: List[str] = []
    for css in containers:
        els = driver.find_elements(By.CSS_SELECTOR, f"{css} p")
        for p in els:
            text = safe_text(p)
            if len(text) >= 30 and not text.lower().startswith(("ảnh:", "video:")):
                paras.append(text)
        if paras:
            break
    return paras
def parse_article(url: str, driver: Optional[webdriver.Chrome] = None) -> Optional[Dict[str, str]]:
    should_quit = False
    if driver is None:
        driver = create_driver(headless=True)
        should_quit = True
    try:
        driver.get(url)
        WebDriverWait(driver, 30).until(EC.presence_of_element_located((By.TAG_NAME, "body")))
        random_delay()
        close_cookie_banners(driver)
        random_delay(0.3, 0.6)
        title = ""
        try:
            title_el = driver.find_element(By.CSS_SELECTOR, "h1, .title-detail, .article-title, .the-article-title h1")
            title = safe_text(title_el)
        except NoSuchElementException:
            pass
        if not title:
            title = get_meta_property(driver, ["og:title"]) or ""
        description = get_meta_content(driver, ["description"]) or ""
        origin = (urlparse(url).hostname or "").lower()
        published_time = extract_published_time(driver) or ""
        paras = collect_article_paragraphs(driver)
        raw_content = "\n\n".join(paras).strip()
        if not raw_content:
            return None
        return {
            "title": title,
            "description": description,
            "origin": origin,
            "url": url,
            "published_time": published_time,
            "raw_content": raw_content,
        }
    except (TimeoutException, WebDriverException):
        return None
    finally:
        if should_quit:
            try:
                driver.quit()
            except Exception:
                pass
def write_json_utf8(data: List[Dict[str, str]], keyword: str, output_path: Optional[str] = None, prefix: str = "ai_output") -> str:
    os.makedirs("result", exist_ok=True)
    slug = re.sub(r"\W+", "_", keyword.strip()).strip("_").lower()
    ts = datetime.now().strftime("%Y%m%d_%H%M%S")
    fname = output_path or os.path.join("crawler", f"{prefix}_{slug}_{ts}.json")
    with open(fname, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    return fname

def main():
    parser = argparse.ArgumentParser(description="Vietnam Disaster News Crawler (multi-keyword)")
    parser.add_argument("--limit", type=int, default=40, help="Max articles per keyword (30-50 recommended)")
    parser.add_argument("--headless", action="store_true", help="Run headless Chrome")
    parser.add_argument("--output", help="Output dir (default 'result/')")
    args = parser.parse_args()

    headless = True if args.headless else False
    output_dir = args.output or "result"
    os.makedirs(output_dir, exist_ok=True)
    global_seen_links = set()
    for keyword in ALL_KEYWORDS:
        print(f"\n--- Crawling keyword: {keyword}")
        try:
            driver = create_driver(headless=headless)
        except Exception as e:
            print(f"Failed to start browser for '{keyword}': {e}")
            continue
        try:
            links = search_articles(keyword, limit=args.limit, driver=driver)
            print(f"Collected {len(links)} links for '{keyword}'")
            if not links:
                print(f"!!! No links found for '{keyword}' => skip !!!")
                continue
            unique_links = []
            for u in links:
                if u not in global_seen_links:
                    global_seen_links.add(u)
                    unique_links.append(u)
                if len(unique_links) >= args.limit:
                    break
            print(f"Unique non-duplicate links: {len(unique_links)}")
            ai_results = []
            for u in unique_links:
                random_delay(0.9, 2.2)
                art = parse_article(u, driver=driver)
                if art:
                    try:
                        ai_obj = extract_article_json(art) or {}
                        if "origin" not in ai_obj or not ai_obj.get("origin"):
                            ai_obj["origin"] = art.get("origin", "")
                        ai_results.append(ai_obj)
                    except Exception as ex:
                        print(f"Error extracting AI info for {u}: {ex}")
                if len(ai_results) >= args.limit:
                    break
            slug = re.sub(r"\W+", "_", keyword.strip()).strip("_").lower()
            ts = datetime.now().strftime("%Y%m%d_%H%M%S")
            fname = os.path.join(output_dir, f"ai_output_{slug}_{ts}.json")
            with open(fname, "w", encoding="utf-8") as f:
                json.dump(ai_results, f, ensure_ascii=False, indent=2)
            print(f"Saved: {fname}")
            print(f"Total AI articles extracted: {len(ai_results)}\n")
        finally:
            try:
                driver.quit()
            except Exception:
                pass
        random_delay(3, 5)

if __name__ == "__main__":
    main()

# Rescue Lens - Vietnam Disaster News Crawler

Selenium crawler that searches Vietnamese news sites for disaster-related articles and outputs structured JSON.

## Sites
- https://vnexpress.net
- https://tuoitre.vn
- https://dantri.com.vn
- https://zingnews.vn

## Requirements
- Python 3.9+
- Google Chrome installed

Install deps:
```bash
pip install -r crawler/requirements.txt
```

## Usage
```bash
python crawler/vn_disaster_crawler.py --keyword "lũ lụt" --limit 40 --headless
```

Outputs a UTF-8 JSON file named like:
```
crawler/output_lu_lut_YYYYMMDD_HHMMSS.json
```

Notes:
- Headless Chrome via Selenium 4
- Driver auto-managed via webdriver-manager
- Skips likely non-news (video/photo) pages
- Randomized delays and WebDriverWait for stability

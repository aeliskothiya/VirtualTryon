# AI Wardrobe - Image Extractor (FastAPI)

This backend extracts product images from e-commerce product pages (Amazon, Myntra, Ajio, Flipkart) using Playwright and FastAPI.

Setup (Windows):

1. Create virtualenv

```powershell
python -m venv venv
venv\Scripts\activate
pip install --upgrade pip
pip install -r requirements.txt
```

2. Install Playwright browsers

```powershell
python -m playwright install chromium
```

3. Run the server

```powershell
uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

API

POST /extract-image

Request body:
```
{ "url": "https://example.com/product" }
```

Response:
```
{
  "success": true,
  "product_url": "...",
  "image_url": "...",
  "local_path": "...",
  "message": "Image extracted successfully"
}
```

Notes
- Uses Playwright async API for dynamic pages.
- Configure env in `.env` or environment variables.
- Add basic rate limiting or proxying in production for robustness.

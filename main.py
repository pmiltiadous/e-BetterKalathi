from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.templating import Jinja2Templates
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from collections import defaultdict
import requests
from typing import List, Optional, Dict

app = FastAPI()

# Templates
templates = Jinja2Templates(directory="templates")

# Static files
app.mount("/static", StaticFiles(directory="static"), name="static")
app.mount("/styles", StaticFiles(directory="styles"), name="styles")
app.mount("/scripts", StaticFiles(directory="scripts"), name="scripts")

# CORS
origins = [
    "http://localhost:8000",
    "http://127.0.0.1:8000",
    "*",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Models
class CartItem(BaseModel):
    productMasterId: int
    quantity: int
    name: Optional[str] = "Unknown"


# Routes
@app.get("/", response_class=HTMLResponse)
async def render_home(request: Request):
    return templates.TemplateResponse("index.html", {"request": request, "title": "Welcome to WanderSmart"})


@app.get("/supermarkets/", response_class=HTMLResponse)
async def show_supermarkets(request: Request):
    return templates.TemplateResponse("supermarkets.html", {"request": request})


@app.post("/checkout/")
async def checkout(request: Request):
    data = await request.json()
    town: Optional[str] = data.get("town")
    cart: List[Dict] = data.get("cart", [])

    if not town:
        return {"error": "Town is required"}
    if not cart:
        return {"error": "Cart is empty"}

    supermarket_totals = defaultdict(float)
    supermarket_products_count = defaultdict(int)
    supermarket_info = {}
    supermarket_products = defaultdict(list)

    for item in cart:
        product_id = item.get("productMasterId")
        quantity = item.get("quantity", 1)
        product_name = item.get("name", "Unknown")

        if not product_id:
            continue

        api_url = (
            "https://www.e-kalathi.gov.cy/ekalathi-website-server/api/retail/fetch-retail-branch-list"
            f"?page=0&size=45&sort=ID,ASC&productId={product_id}&regionIds={town}&companyIds="
        )

        try:
            resp = requests.get(api_url, timeout=5)
            resp.raise_for_status()
        except requests.RequestException:
            continue

        branches = resp.json().get("content", [])
        for branch in branches:
            name = branch.get("name")
            price = branch.get("retailerProductPrice", 0)

            supermarket_totals[name] += price * quantity
            supermarket_products_count[name] += 1

            if name not in supermarket_info:
                supermarket_info[name] = {
                    "landPhone": branch.get("landPhone"),
                    "postalAddress": branch.get("postalAddress"),
                    "companyPhotoFile": branch.get("companyPhotoFile"),
                }

            supermarket_products[name].append({
                "name": product_name,
                "quantity": quantity,
                "price": price
            })

    final_supermarkets = []
    partial_supermarkets = []

    for name, total in supermarket_totals.items():
        info = supermarket_info.get(name, {})
        products = supermarket_products.get(name, [])
        missing_count = len(cart) - supermarket_products_count[name]

        supermarket_data = {
            "name": name,
            "total": total,
            "landPhone": info.get("landPhone"),
            "postalAddress": info.get("postalAddress"),
            "companyPhotoFile": info.get("companyPhotoFile"),
            "products": products,
            "missing_count": missing_count
        }

        if missing_count == 0:
            final_supermarkets.append(supermarket_data)
        else:
            partial_supermarkets.append(supermarket_data)

    final_supermarkets.sort(key=lambda x: x["total"])
    partial_supermarkets.sort(key=lambda x: x["total"])

    # Ensure at least 5 supermarkets
    if len(final_supermarkets) < 5:
        needed_count = 5 - len(final_supermarkets)
        all_supermarkets = final_supermarkets + partial_supermarkets[:needed_count]
    else:
        all_supermarkets = final_supermarkets

    return {"supermarkets": all_supermarkets}


@app.get("/regions/")
def get_regions():
    api_url = "https://www.e-kalathi.gov.cy/ekalathi-website-server/api/fetch-regions"

    try:
        response = requests.get(api_url, timeout=5)
        response.raise_for_status()
        data = response.json()
    except requests.RequestException:
        return {"error": "Failed to fetch regions"}

    return {"regions": data}

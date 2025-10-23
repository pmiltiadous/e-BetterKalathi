import requests
import json

# E-Kalathi API URL (fetch all products)
api_url = "https://www.e-kalathi.gov.cy/ekalathi-website-server/api/fetch-product-list?page=0&size=50000&sort=DEFAULT,ASC&categoryIds="

response = requests.get(api_url)
response.raise_for_status()
data = response.json()

all_products = []

for product in data.get("content", []):
    product_data = {
        "productMasterId": product.get("productMasterId"),
        "code": product.get("code"),
        "name": product.get("name"),
        "startPrice": product.get("startPrice"),
        "previousPrice": product.get("previousPrice"),
        "productCategoryName": product.get("productCategoryName"),
        "productCategoryNameEnglish": product.get("productCategoryNameEnglish"),
        "numberOfChains": product.get("numberOfChains"),
        "favorite": product.get("favorite"),
        "preferred": product.get("preferred"),
        "productMainPhotoFileId": product.get("productMainPhotoFileId"),
        "productMainPhotoFileThumpId": product.get("productMainPhotoFileThumpId"),
        "notifiedAbout": product.get("notifiedAbout"),
        "hasBeenPurchased": product.get("hasBeenPurchased"),
        "toSendOffers": product.get("toSendOffers"),
        "productThumbnailUrl": product.get("productThumbnailUrl")
    }

    all_products.append(product_data)

with open("e_kalathi_products.json", "w", encoding="utf-8") as f:
    json.dump(all_products, f, ensure_ascii=False, indent=2)

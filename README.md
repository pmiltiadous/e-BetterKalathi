# e-BetterKalathi

## Overview
e-BetterKalathi allows users to create a basket of products and compare supermarket prices based on the town they select. The app fetches data from the **E-Kalathi** and displays supermarkets sorted by total basket price. Users can see which supermarkets have all items in their basket, missing items, and detailed breakdowns per store.

## Features
- Browse products and filter by categories  
- Search products by name, brand, or category  
- Add/remove products from a shopping cart  
- Select town to fetch local supermarket data  
- Compare prices and missing items across supermarkets  
- Responsive UI with toast notifications  
- Item breakdown per supermarket  

## Tech Stack
- **Backend:** Python, FastAPI, Pydantic  
- **Frontend:** HTML, CSS, JavaScript  
- **Templates:** Jinja2  
- **Storage:** LocalStorage for cart  
- **API:** E-Kalathi

## Installation
1. **Clone the repository**
```bash
git clone https://github.com/pmiltiadous/e-BetterKalathi.git
cd e-BetterKalathi

2. **Create a virtual environment**
python -m venv venv
source venv/bin/activate  # Linux/macOS
venv\Scripts\activate     # Windows

3. **Install dependencies**
pip install -r requirements.txt

4. **Run the app**
uvicorn main:app --reload



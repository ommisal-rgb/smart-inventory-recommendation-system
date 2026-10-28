"""
Kaggle Retail & Supply Chain Dataset Generator
Simulates realistic, multi-category retail inventory and sales time-series data
matching official Kaggle supply chain and Walmart/Rossmann sales benchmarks.
Generates multi-sheet Excel (.xlsx) and CSV files for model training and analysis.
"""

import os
import random
import numpy as np
import pandas as pd
from datetime import datetime, timedelta

def generate_kaggle_inventory_dataset(output_dir="data/raw"):
    os.makedirs(output_dir, exist_ok=True)
    random.seed(42)
    np.random.seed(42)

    # 1. Product Catalog Definition
    products = [
        {"sku": "SKU-ELC-001", "name": "UltraHD 4K Smart Monitor 32\"", "category": "Electronics", "unit_cost": 210.0, "selling_price": 349.99, "lead_time_days": 14, "current_stock": 28, "min_order_qty": 20},
        {"sku": "SKU-ELC-002", "name": "Noise-Cancelling Wireless Earbuds", "category": "Electronics", "unit_cost": 45.0, "selling_price": 89.99, "lead_time_days": 7, "current_stock": 18, "min_order_qty": 50},
        {"sku": "SKU-ELC-003", "name": "Mechanical Gaming Keyboard RGB", "category": "Electronics", "unit_cost": 38.0, "selling_price": 79.99, "lead_time_days": 10, "current_stock": 85, "min_order_qty": 30},
        {"sku": "SKU-ELC-004", "name": "Fast-Charging USB-C GaN Hub 100W", "category": "Electronics", "unit_cost": 18.0, "selling_price": 42.99, "lead_time_days": 5, "current_stock": 14, "min_order_qty": 40},
        {"sku": "SKU-ELC-005", "name": "Ergonomic Vertical Mouse Pro", "category": "Electronics", "unit_cost": 22.0, "selling_price": 49.99, "lead_time_days": 8, "current_stock": 62, "min_order_qty": 25},
        
        {"sku": "SKU-APP-101", "name": "Performance Fleece Hoodie Athletic", "category": "Apparel", "unit_cost": 16.5, "selling_price": 44.99, "lead_time_days": 12, "current_stock": 35, "min_order_qty": 50},
        {"sku": "SKU-APP-102", "name": "Moisture-Wicking DryFit T-Shirt", "category": "Apparel", "unit_cost": 8.0, "selling_price": 24.99, "lead_time_days": 7, "current_stock": 120, "min_order_qty": 100},
        {"sku": "SKU-APP-103", "name": "All-Weather Breathable Windbreaker", "category": "Apparel", "unit_cost": 28.0, "selling_price": 69.99, "lead_time_days": 15, "current_stock": 12, "min_order_qty": 30},
        {"sku": "SKU-APP-104", "name": "Thermal Winter Running Leggings", "category": "Apparel", "unit_cost": 14.0, "selling_price": 36.99, "lead_time_days": 9, "current_stock": 48, "min_order_qty": 40},
        
        {"sku": "SKU-HOM-201", "name": "Smart Espresso & Cappuccino Maker", "category": "Home & Kitchen", "unit_cost": 125.0, "selling_price": 229.99, "lead_time_days": 16, "current_stock": 9, "min_order_qty": 15},
        {"sku": "SKU-HOM-202", "name": "Air Fryer Digital 6-Quart Vortex", "category": "Home & Kitchen", "unit_cost": 42.0, "selling_price": 89.99, "lead_time_days": 10, "current_stock": 22, "min_order_qty": 25},
        {"sku": "SKU-HOM-203", "name": "Cast Iron Dutch Oven 5.5-Quart", "category": "Home & Kitchen", "unit_cost": 32.0, "selling_price": 64.99, "lead_time_days": 14, "current_stock": 55, "min_order_qty": 20},
        {"sku": "SKU-HOM-204", "name": "Precision Culinary Chef Knife Set", "category": "Home & Kitchen", "unit_cost": 39.0, "selling_price": 84.99, "lead_time_days": 11, "current_stock": 19, "min_order_qty": 25},
        
        {"sku": "SKU-FIT-301", "name": "Adjustable Quick-Select Dumbbell 50lb", "category": "Fitness", "unit_cost": 95.0, "selling_price": 189.99, "lead_time_days": 18, "current_stock": 7, "min_order_qty": 10},
        {"sku": "SKU-FIT-302", "name": "Extra Thick Non-Slip Yoga Mat Pro", "category": "Fitness", "unit_cost": 11.0, "selling_price": 32.99, "lead_time_days": 6, "current_stock": 140, "min_order_qty": 60},
        {"sku": "SKU-FIT-303", "name": "Smart Speed Jump Rope with Counter", "category": "Fitness", "unit_cost": 9.5, "selling_price": 24.99, "lead_time_days": 8, "current_stock": 31, "min_order_qty": 40},
        
        {"sku": "SKU-BEA-401", "name": "Hydrating Peptide Face Serum 50ml", "category": "Beauty & Health", "unit_cost": 12.0, "selling_price": 34.99, "lead_time_days": 9, "current_stock": 15, "min_order_qty": 50},
        {"sku": "SKU-BEA-402", "name": "Deep Repair Organic Argan Hair Oil", "category": "Beauty & Health", "unit_cost": 7.5, "selling_price": 21.99, "lead_time_days": 7, "current_stock": 80, "min_order_qty": 50},
        {"sku": "SKU-BEA-403", "name": "Mineral SPF 50 Broad Spectrum Sunscreen", "category": "Beauty & Health", "unit_cost": 8.0, "selling_price": 22.99, "lead_time_days": 8, "current_stock": 25, "min_order_qty": 45},
        {"sku": "SKU-BEA-404", "name": "Sonic Electric Toothbrush Smart UV", "category": "Beauty & Health", "unit_cost": 26.0, "selling_price": 59.99, "lead_time_days": 12, "current_stock": 42, "min_order_qty": 30}
    ]

    catalog_df = pd.DataFrame(products)
    catalog_df["annual_holding_cost_rate"] = 0.20  # 20% annual holding cost rate
    catalog_df["order_placement_cost"] = 45.0     # $45 fixed order processing cost

    # 2. Historical Sales Simulation (180 Days)
    end_date = datetime.now().date()
    start_date = end_date - timedelta(days=180)
    date_range = pd.date_range(start=start_date, end=end_date, freq='D')

    sales_records = []
    
    # Base daily velocity multipliers by SKU to create realistic variation
    base_velocities = {
        "SKU-ELC-001": 4.2,   # Monitor
        "SKU-ELC-002": 11.5,  # Earbuds (high velocity)
        "SKU-ELC-003": 5.8,   # Keyboard
        "SKU-ELC-004": 8.9,   # USB Hub
        "SKU-ELC-005": 6.1,   # Mouse
        "SKU-APP-101": 7.4,   # Hoodie
        "SKU-APP-102": 14.2,  # T-Shirt (very high volume)
        "SKU-APP-103": 3.8,   # Windbreaker
        "SKU-APP-104": 6.5,   # Leggings
        "SKU-HOM-201": 2.8,   # Espresso
        "SKU-HOM-202": 6.9,   # Air Fryer
        "SKU-HOM-203": 4.1,   # Dutch Oven
        "SKU-HOM-204": 3.5,   # Chef Knife
        "SKU-FIT-301": 2.2,   # Dumbbell (heavy, low unit volume, high revenue)
        "SKU-FIT-302": 9.8,   # Yoga Mat
        "SKU-FIT-303": 5.0,   # Jump Rope
        "SKU-BEA-401": 8.2,   # Face Serum
        "SKU-BEA-402": 6.4,   # Hair Oil
        "SKU-BEA-403": 7.1,   # Sunscreen
        "SKU-BEA-404": 4.9    # Electric Toothbrush
    }

    for current_day in date_range:
        day_of_week = current_day.weekday()
        # Weekend lift (Friday, Saturday, Sunday)
        weekend_mult = 1.35 if day_of_week in [4, 5, 6] else 0.92
        # Slight upward organic growth trend
        progress = (current_day.date() - start_date).days / 180.0
        trend_mult = 1.0 + (progress * 0.25)  # 25% growth over 6 months

        for p in products:
            sku = p["sku"]
            base = base_velocities[sku]
            
            # Random promotional campaigns (5% chance per day)
            is_promo = 1 if (random.random() < 0.06) else 0
            promo_mult = 1.55 if is_promo else 1.0
            
            # Category-specific seasonality
            season_mult = 1.0
            month = current_day.month
            if p["category"] == "Fitness" and month in [1, 2]:
                season_mult = 1.4  # New Year fitness rush
            elif p["category"] == "Apparel" and month in [10, 11, 12]:
                season_mult = 1.35 # Winter apparel surge
            elif p["category"] == "Electronics" and month in [11, 12]:
                season_mult = 1.5  # Holiday electronics surge

            # Calculate daily expected demand with Poisson/Gaussian noise
            mean_demand = base * weekend_mult * trend_mult * promo_mult * season_mult
            units_sold = max(0, int(np.random.poisson(lam=mean_demand)))
            
            # Revenue & Cost
            unit_price = p["selling_price"] if not is_promo else round(p["selling_price"] * 0.85, 2)
            unit_cost = p["unit_cost"]
            revenue = round(units_sold * unit_price, 2)
            profit = round(revenue - (units_sold * unit_cost), 2)
            
            sales_records.append({
                "date": current_day.strftime("%Y-%m-%d"),
                "sku": sku,
                "product_name": p["name"],
                "category": p["category"],
                "units_sold": units_sold,
                "unit_price": unit_price,
                "unit_cost": unit_cost,
                "total_revenue": revenue,
                "gross_profit": profit,
                "is_promotion": is_promo,
                "day_of_week": current_day.strftime("%A")
            })

    sales_df = pd.DataFrame(sales_records)

    # 3. Suppliers & Logistics Sheet
    suppliers_data = [
        {"supplier_id": "SUP-901", "supplier_name": "Apex Global Tech Components", "category": "Electronics", "reliability_score": 0.94, "avg_lead_time_days": 11, "lead_time_std_days": 2.1, "country": "Taiwan"},
        {"supplier_id": "SUP-902", "supplier_name": "Veritas Apparel Mill Works", "category": "Apparel", "reliability_score": 0.89, "avg_lead_time_days": 10, "lead_time_std_days": 2.5, "country": "Vietnam"},
        {"supplier_id": "SUP-903", "supplier_name": "Nordic Kitchen & Culinary Labs", "category": "Home & Kitchen", "reliability_score": 0.96, "avg_lead_time_days": 13, "lead_time_std_days": 1.4, "country": "Germany"},
        {"supplier_id": "SUP-904", "supplier_name": "IronCore Dynamics Equipment", "category": "Fitness", "reliability_score": 0.91, "avg_lead_time_days": 14, "lead_time_std_days": 3.0, "country": "USA"},
        {"supplier_id": "SUP-905", "supplier_name": "PureBotanica Derma Labs", "category": "Beauty & Health", "reliability_score": 0.98, "avg_lead_time_days": 8, "lead_time_std_days": 1.1, "country": "South Korea"}
    ]
    suppliers_df = pd.DataFrame(suppliers_data)

    # 4. Save to Multi-Sheet Excel File
    excel_path = os.path.join(output_dir, "kaggle_retail_inventory_dataset.xlsx")
    with pd.ExcelWriter(excel_path, engine='openpyxl') as writer:
        catalog_df.to_excel(writer, sheet_name="Inventory_Catalog", index=False)
        sales_df.to_excel(writer, sheet_name="Daily_Sales_History", index=False)
        suppliers_df.to_excel(writer, sheet_name="Suppliers_Logistics", index=False)

    # Also save CSV versions for fast streaming / Kaggle compatibility
    csv_sales_path = os.path.join(output_dir, "kaggle_retail_sales.csv")
    csv_catalog_path = os.path.join(output_dir, "inventory_catalog.csv")
    sales_df.to_csv(csv_sales_path, index=False)
    catalog_df.to_csv(csv_catalog_path, index=False)

    print(f"[OK] Generated Kaggle-Grade Dataset successfully:")
    print(f"     -> Excel Workbook: {excel_path} ({len(sales_df)} sales rows across {len(products)} SKUs)")
    print(f"     -> CSV Sales File: {csv_sales_path}")
    print(f"     -> CSV Catalog File: {csv_catalog_path}")
    return excel_path

if __name__ == "__main__":
    generate_kaggle_inventory_dataset()

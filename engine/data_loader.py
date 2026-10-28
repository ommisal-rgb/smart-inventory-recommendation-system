"""
Data Loader & Preprocessing Pipeline
Supports reading and training on Excel spreadsheets (.xlsx) with multiple sheets,
CSV files, and scraped market signals.
"""

import os
import pandas as pd
import numpy as np
from datetime import datetime

class InventoryDataLoader:
    def __init__(self, excel_path="data/raw/kaggle_retail_inventory_dataset.xlsx"):
        self.excel_path = excel_path
        self.catalog_df = None
        self.sales_df = None
        self.suppliers_df = None

    def load_data(self, custom_path=None):
        target_path = custom_path or self.excel_path
        if not os.path.exists(target_path):
            raise FileNotFoundError(f"Dataset file not found at: {target_path}")

        print(f"[*] Loading inventory & sales data from: {target_path}")
        
        # Check file format
        if target_path.endswith(".xlsx") or target_path.endswith(".xls"):
            xls = pd.ExcelFile(target_path)
            sheet_names = xls.sheet_names
            print(f"[+] Found sheets: {sheet_names}")

            # Smart sheet matching
            catalog_sheet = next((s for s in sheet_names if "catalog" in s.lower() or "inventory" in s.lower() or "product" in s.lower()), None)
            sales_sheet = next((s for s in sheet_names if "sales" in s.lower() or "history" in s.lower() or "order" in s.lower() or "transaction" in s.lower()), None)
            suppliers_sheet = next((s for s in sheet_names if "supplier" in s.lower() or "vendor" in s.lower() or "logistic" in s.lower()), None)

            if catalog_sheet:
                self.catalog_df = pd.read_excel(xls, sheet_name=catalog_sheet)
            if sales_sheet:
                self.sales_df = pd.read_excel(xls, sheet_name=sales_sheet)
            if suppliers_sheet:
                self.suppliers_df = pd.read_excel(xls, sheet_name=suppliers_sheet)

            # Fallback if single sheet or custom structure
            if self.sales_df is None and len(sheet_names) > 0:
                self.sales_df = pd.read_excel(xls, sheet_name=0)
        
        elif target_path.endswith(".csv"):
            self.sales_df = pd.read_csv(target_path)

        # Standardize Sales DataFrame
        if self.sales_df is not None:
            self._standardize_sales_df()

        # Build or standardize Catalog DataFrame if missing
        if self.catalog_df is None and self.sales_df is not None:
            self._infer_catalog_from_sales()
        else:
            self._standardize_catalog_df()

        return self.sales_df, self.catalog_df, self.suppliers_df

    def _standardize_sales_df(self):
        # Column aliases normalization
        col_mapping = {
            "Date": "date", "DATE": "date", "Order Date": "date", "Timestamp": "date",
            "SKU": "sku", "Product ID": "sku", "Item Code": "sku", "sku_id": "sku",
            "Product Name": "product_name", "Item Name": "product_name", "product": "product_name",
            "Category": "category", "Department": "category",
            "Quantity": "units_sold", "Units": "units_sold", "Units Sold": "units_sold", "Sales": "units_sold",
            "Unit Price": "unit_price", "Price": "unit_price",
            "Unit Cost": "unit_cost", "Cost": "unit_cost",
            "Total Revenue": "total_revenue", "Revenue": "total_revenue",
            "Promotion": "is_promotion", "Is Promo": "is_promotion"
        }
        self.sales_df = self.sales_df.rename(columns={k: v for k, v in col_mapping.items() if k in self.sales_df.columns})

        # Ensure required columns
        if "date" in self.sales_df.columns:
            self.sales_df["date"] = pd.to_datetime(self.sales_df["date"])
        else:
            self.sales_df["date"] = pd.date_range(end=datetime.now(), periods=len(self.sales_df), freq='D')

        if "units_sold" not in self.sales_df.columns:
            self.sales_df["units_sold"] = 1
        self.sales_df["units_sold"] = pd.to_numeric(self.sales_df["units_sold"], errors="coerce").fillna(0).astype(int)

        if "sku" not in self.sales_df.columns:
            self.sales_df["sku"] = "SKU-GEN-001"

        if "category" not in self.sales_df.columns:
            self.sales_df["category"] = "General"

        if "unit_price" not in self.sales_df.columns:
            self.sales_df["unit_price"] = 29.99

        if "unit_cost" not in self.sales_df.columns:
            self.sales_df["unit_cost"] = self.sales_df["unit_price"] * 0.55

        if "total_revenue" not in self.sales_df.columns:
            self.sales_df["total_revenue"] = self.sales_df["units_sold"] * self.sales_df["unit_price"]

        if "is_promotion" not in self.sales_df.columns:
            self.sales_df["is_promotion"] = 0

        self.sales_df = self.sales_df.sort_values(by=["sku", "date"]).reset_index(drop=True)

    def _infer_catalog_from_sales(self):
        grouped = self.sales_df.groupby("sku").agg({
            "product_name": "first" if "product_name" in self.sales_df.columns else lambda x: x.name,
            "category": "first",
            "unit_cost": "mean",
            "selling_price": "mean" if "selling_price" in self.sales_df.columns else lambda x: self.sales_df.loc[x.index, "unit_price"].mean(),
            "units_sold": ["mean", "std"]
        })
        grouped.columns = ["product_name", "category", "unit_cost", "selling_price", "avg_daily_demand", "std_daily_demand"]
        grouped = grouped.reset_index()

        grouped["lead_time_days"] = 10
        grouped["current_stock"] = (grouped["avg_daily_demand"] * 12).astype(int) + 5
        grouped["min_order_qty"] = 25
        grouped["annual_holding_cost_rate"] = 0.20
        grouped["order_placement_cost"] = 45.0
        self.catalog_df = grouped

    def _standardize_catalog_df(self):
        col_mapping = {
            "SKU": "sku", "sku_id": "sku",
            "Product Name": "product_name", "Name": "product_name",
            "Category": "category",
            "Unit Cost": "unit_cost", "Cost": "unit_cost",
            "Selling Price": "selling_price", "Price": "selling_price",
            "Lead Time": "lead_time_days", "Lead Time Days": "lead_time_days",
            "Stock": "current_stock", "Current Stock": "current_stock", "Stock On Hand": "current_stock"
        }
        self.catalog_df = self.catalog_df.rename(columns={k: v for k, v in col_mapping.items() if k in self.catalog_df.columns})

        defaults = {
            "lead_time_days": 10,
            "current_stock": 30,
            "min_order_qty": 20,
            "annual_holding_cost_rate": 0.20,
            "order_placement_cost": 45.0
        }
        for col, default_val in defaults.items():
            if col not in self.catalog_df.columns:
                self.catalog_df[col] = default_val

    def get_sku_history(self, sku):
        return self.sales_df[self.sales_df["sku"] == sku].copy()

    def get_unique_skus(self):
        return self.catalog_df["sku"].unique().tolist()

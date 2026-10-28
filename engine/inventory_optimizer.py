"""
Inventory Optimization & Supply Chain Intelligence Engine
Veteran Operations Research System:
- Safety Stock (incorporating joint demand and lead-time stochastic variance)
- Reorder Point (ROP) dynamic thresholding
- Economic Order Quantity (EOQ) cost minimization
- ABC Pareto Inventory Value stratification
- Stockout Risk Probability and Days-of-Inventory-Remaining (DOIR) Runway calculation
"""

import math
import numpy as np
import pandas as pd
from scipy.stats import norm

class InventoryOptimizer:
    SERVICE_LEVEL_Z = {
        0.90: 1.282,
        0.95: 1.645,
        0.98: 2.054,
        0.99: 2.326
    }

    def __init__(self, service_level=0.95):
        self.service_level = service_level
        self.z_score = self.SERVICE_LEVEL_Z.get(service_level, 1.645)

    def set_service_level(self, service_level):
        self.service_level = service_level
        self.z_score = self.SERVICE_LEVEL_Z.get(service_level, 1.645)

    def optimize_inventory(self, catalog_df, sales_df, forecasts, suppliers_df=None, simulation_params=None):
        """
        Executes full supply chain optimization matrix across all SKUs.
        simulation_params: optional dict with lead_time_mult, demand_shock_pct, service_level
        """
        sim = simulation_params or {}
        lead_time_mult = float(sim.get("lead_time_mult", 1.0))
        demand_shock = float(sim.get("demand_shock_pct", 0.0))
        service_lvl = float(sim.get("service_level", self.service_level))
        z_val = self.SERVICE_LEVEL_Z.get(round(service_lvl, 2), 1.645)

        # Build supplier lookup if available
        supplier_lookup = {}
        if suppliers_df is not None:
            for _, sup in suppliers_df.iterrows():
                supplier_lookup[sup["category"]] = {
                    "lead_time_std": sup.get("lead_time_std_days", 2.0),
                    "supplier_name": sup.get("supplier_name", "Primary Distributor"),
                    "reliability": sup.get("reliability_score", 0.95)
                }

        results = []

        # 1. First pass: compute metrics for each SKU
        for _, row in catalog_df.iterrows():
            sku = row["sku"]
            name = row.get("product_name", sku)
            category = row.get("category", "General")
            unit_cost = float(row.get("unit_cost", 20.0))
            selling_price = float(row.get("selling_price", unit_cost * 1.5))
            current_stock = int(row.get("current_stock", 20))
            base_lead_time = float(row.get("lead_time_days", 10)) * lead_time_mult
            min_order_qty = int(row.get("min_order_qty", 10))
            holding_cost_rate = float(row.get("annual_holding_cost_rate", 0.20))
            order_cost = float(row.get("order_placement_cost", 45.0))

            # Fetch forecast demand
            sku_forecast = forecasts.get(sku, {})
            avg_forecast_daily = sku_forecast.get("avg_daily_forecast", 5.0)
            # Apply demand shock
            daily_demand = max(0.5, avg_forecast_daily * (1.0 + (demand_shock / 100.0)))
            annual_demand = daily_demand * 365.0

            # Demand volatility (std dev from historical sales)
            sku_sales = sales_df[sales_df["sku"] == sku]["units_sold"]
            sigma_d = float(sku_sales.std()) if len(sku_sales) > 1 else max(1.0, daily_demand * 0.35)

            # Lead time volatility
            sup_info = supplier_lookup.get(category, {"lead_time_std": 1.5, "supplier_name": "Tier-1 Global Partner", "reliability": 0.95})
            sigma_l = float(sup_info["lead_time_std"])

            # 2. Safety Stock Formula: Joint variance of Demand & Lead Time
            # SS = Z * sqrt( L * sigma_D^2 + D^2 * sigma_L^2 )
            variance_total = (base_lead_time * (sigma_d ** 2)) + ((daily_demand ** 2) * (sigma_l ** 2))
            safety_stock = int(math.ceil(z_val * math.sqrt(variance_total)))

            # 3. Reorder Point: Lead Time Demand + Safety Stock
            lead_time_demand = daily_demand * base_lead_time
            reorder_point = int(math.ceil(lead_time_demand + safety_stock))

            # 4. Economic Order Quantity (EOQ): sqrt( (2 * D * S) / H )
            holding_cost_per_unit = max(1.0, unit_cost * holding_cost_rate)
            raw_eoq = math.sqrt((2.0 * annual_demand * order_cost) / holding_cost_per_unit)
            eoq = max(min_order_qty, int(round(raw_eoq)))

            # 5. Runway (Days of Inventory Remaining)
            runway_days = round(current_stock / daily_demand, 1)

            # 6. Stockout Risk Score (0% to 100%)
            # Risk that demand over lead time exceeds current stock
            sigma_lead_time = math.sqrt(variance_total) if variance_total > 0 else 1.0
            z_current = (current_stock - lead_time_demand) / sigma_lead_time
            # Stockout risk is upper tail probability
            risk_prob = round((1.0 - norm.cdf(z_current)) * 100.0, 1)
            risk_prob = max(1.0, min(99.9, risk_prob))

            # 7. Inventory Status & Recommendation Action
            if current_stock <= safety_stock or runway_days <= base_lead_time:
                status = "CRITICAL_REORDER"
                status_color = "#ef4444" # red
                urgency_score = 95 + int(risk_prob * 0.05)
                recommended_order = max(eoq, (reorder_point - current_stock) + safety_stock)
            elif current_stock <= reorder_point:
                status = "REORDER_SOON"
                status_color = "#f59e0b" # amber
                urgency_score = 70 + int(risk_prob * 0.2)
                recommended_order = max(eoq, reorder_point - current_stock)
            elif current_stock > (reorder_point + (eoq * 1.5)):
                status = "OVERSTOCKED"
                status_color = "#8b5cf6" # purple
                urgency_score = 25
                recommended_order = 0
            else:
                status = "HEALTHY"
                status_color = "#10b981" # emerald
                urgency_score = 10
                recommended_order = 0

            # Round recommended order to packaging batch
            if recommended_order > 0:
                recommended_order = int(math.ceil(recommended_order / 5.0) * 5)

            # Financial impact
            capital_required = round(recommended_order * unit_cost, 2)
            inventory_value_on_hand = round(current_stock * unit_cost, 2)
            annual_revenue_potential = round(annual_demand * selling_price, 2)
            gross_margin_pct = round(((selling_price - unit_cost) / selling_price) * 100.0, 1)

            results.append({
                "sku": sku,
                "product_name": name,
                "category": category,
                "unit_cost": unit_cost,
                "selling_price": selling_price,
                "gross_margin_pct": gross_margin_pct,
                "current_stock": current_stock,
                "daily_demand": round(daily_demand, 2),
                "lead_time_days": round(base_lead_time, 1),
                "safety_stock": safety_stock,
                "reorder_point": reorder_point,
                "eoq": eoq,
                "runway_days": runway_days,
                "stockout_risk_pct": risk_prob,
                "urgency_score": urgency_score,
                "status": status,
                "status_color": status_color,
                "recommended_order_qty": recommended_order,
                "capital_required": capital_required,
                "inventory_value_on_hand": inventory_value_on_hand,
                "annual_revenue_potential": annual_revenue_potential,
                "supplier_name": sup_info["supplier_name"],
                "supplier_reliability": sup_info["reliability"],
                "model_r2": sku_forecast.get("metrics", {}).get("r2_score", 0.88),
                "model_rmse": sku_forecast.get("metrics", {}).get("rmse", 2.1)
            })

        # 8. ABC Pareto Classification (Sort by Annual Revenue Potential)
        df_results = pd.DataFrame(results).sort_values("annual_revenue_potential", ascending=False).reset_index(drop=True)
        total_rev = df_results["annual_revenue_potential"].sum()
        df_results["cum_revenue"] = df_results["annual_revenue_potential"].cumsum()
        df_results["cum_rev_pct"] = (df_results["cum_revenue"] / total_rev) * 100.0

        def assign_abc(pct):
            if pct <= 80.0:
                return "A" # Top 80% revenue
            elif pct <= 95.0:
                return "B" # Next 15%
            else:
                return "C" # Tail 5%

        df_results["abc_class"] = df_results["cum_rev_pct"].apply(assign_abc)

        # Sort by urgency_score descending for actionability
        df_sorted = df_results.sort_values(by=["urgency_score", "stockout_risk_pct"], ascending=False).reset_index(drop=True)
        
        # Calculate Executive Dashboard KPI aggregates
        total_inventory_val = float(round(df_sorted["inventory_value_on_hand"].sum(), 2))
        total_capital_needed = float(round(df_sorted["capital_required"].sum(), 2))
        critical_count = int((df_sorted["status"] == "CRITICAL_REORDER").sum())
        warning_count = int((df_sorted["status"] == "REORDER_SOON").sum())
        healthy_count = int((df_sorted["status"] == "HEALTHY").sum())
        overstocked_count = int((df_sorted["status"] == "OVERSTOCKED").sum())
        avg_stockout_risk = float(round(df_sorted["stockout_risk_pct"].mean(), 1))

        summary_kpi = {
            "total_inventory_value": total_inventory_val,
            "recommended_capital_deployment": total_capital_needed,
            "critical_skus_count": critical_count,
            "warning_skus_count": warning_count,
            "healthy_skus_count": healthy_count,
            "overstocked_skus_count": overstocked_count,
            "average_stockout_risk_pct": avg_stockout_risk,
            "total_skus_monitored": int(len(df_sorted)),
            "service_level_target": f"{int(service_lvl * 100)}%"
        }

        return {
            "kpi_summary": summary_kpi,
            "inventory_matrix": df_sorted.to_dict(orient="records")
        }

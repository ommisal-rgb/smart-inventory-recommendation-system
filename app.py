"""
Smart Inventory Recommendation & Prediction System - Backend Web Server
Veteran Agentic AI Architecture:
- Integrates Machine Learning Demand Forecasting (Random Forest + Ridge Lag Models)
- Operations Research Optimization (Safety Stock, ROP, EOQ, ABC Pareto Analysis)
- Live E-Commerce Web Scraping & Market Trends Integration
- Multi-sheet Excel Training & Re-training on custom datasets
- Autonomous Purchase Order Generation & Conversational AI Copilot ("Nova")
"""

import os
import json
from datetime import datetime
from flask import Flask, render_template, request, jsonify, send_file
import pandas as pd

from engine.data_loader import InventoryDataLoader
from engine.ml_forecaster import DemandForecastingEngine
from engine.inventory_optimizer import InventoryOptimizer
from engine.agentic_reasoning import AgenticInventoryReasoner
from web_scraper import MarketIntelligenceScraper

# Initialize Flask App
app = Flask(__name__, static_folder="static", template_folder="templates")
app.config["UPLOAD_FOLDER"] = "data/raw"
app.config["MAX_CONTENT_LENGTH"] = 32 * 1024 * 1024  # 32MB max upload

# Global System State
DATA_FILE = "data/raw/kaggle_retail_inventory_dataset.xlsx"
data_loader = InventoryDataLoader(DATA_FILE)
ml_forecaster = DemandForecastingEngine(forecast_horizon_days=30)
inventory_optimizer = InventoryOptimizer(service_level=0.95)
agentic_reasoner = AgenticInventoryReasoner()
scraper = MarketIntelligenceScraper()

# Cached In-Memory State
system_cache = {
    "is_initialized": False,
    "last_updated": None,
    "sales_df": None,
    "catalog_df": None,
    "suppliers_df": None,
    "forecasts": {},
    "optimization_results": {},
    "agentic_insights": [],
    "market_signals": {}
}

def bootstrap_system(excel_file_path=None):
    """
    Initializes and trains all AI forecasting models and supply chain matrices.
    """
    global system_cache
    file_to_load = excel_file_path or DATA_FILE
    
    print(f"[*] Bootstrapping Smart Inventory AI System with: {file_to_load}")
    
    # 1. Fetch Market Signals from Web Scraper
    market_signals = scraper.get_latest_signals()
    system_cache["market_signals"] = market_signals

    # 2. Load Excel / CSV Data
    sales_df, catalog_df, suppliers_df = data_loader.load_data(file_to_load)
    system_cache["sales_df"] = sales_df
    system_cache["catalog_df"] = catalog_df
    system_cache["suppliers_df"] = suppliers_df

    # 3. Train ML Ensemble Models across all SKUs
    ml_forecaster.train_all(sales_df, market_signals=market_signals)
    
    # 4. Generate 30-Day Forward Projections
    forecasts = {}
    for sku in catalog_df["sku"].unique():
        try:
            forecasts[sku] = ml_forecaster.forecast_sku(sku, days_ahead=30)
        except Exception as e:
            print(f"[!] Warning forecasting {sku}: {e}")
    system_cache["forecasts"] = forecasts

    # 5. Run Supply Chain Inventory Optimization
    opt_results = inventory_optimizer.optimize_inventory(
        catalog_df=catalog_df,
        sales_df=sales_df,
        forecasts=forecasts,
        suppliers_df=suppliers_df
    )
    system_cache["optimization_results"] = opt_results

    # 6. Generate Agentic AI Insights
    insights = agentic_reasoner.generate_agentic_insights(
        inventory_matrix=opt_results["inventory_matrix"],
        market_signals=market_signals
    )
    system_cache["agentic_insights"] = insights
    system_cache["is_initialized"] = True
    system_cache["last_updated"] = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

    print(f"[OK] System bootstrap completed at {system_cache['last_updated']}")

# --- Web Routes ---

DIST_DIR = os.path.join(os.path.dirname(__file__), "dist")

@app.route("/")
def index():
    if not system_cache["is_initialized"]:
        bootstrap_system()
    # Serve compiled React App if built, otherwise fallback to index.html
    react_index = os.path.join(DIST_DIR, "index.html")
    if os.path.exists(react_index):
        return send_file(react_index)
    return render_template("index.html")

@app.route("/assets/<path:filename>")
def serve_react_assets(filename):
    asset_path = os.path.join(DIST_DIR, "assets", filename)
    if os.path.exists(asset_path):
        return send_file(asset_path)
    return ("Asset not found", 404)

@app.route("/dashboard")
def executive_dashboard():
    if not system_cache["is_initialized"]:
        bootstrap_system()
    return render_template("index.html")

@app.route("/api/overview", methods=["GET"])
def api_overview():
    if not system_cache["is_initialized"]:
        bootstrap_system()
    
    kpi = system_cache["optimization_results"]["kpi_summary"]
    matrix = system_cache["optimization_results"]["inventory_matrix"]

    # Category breakdown for charts
    cat_summary = {}
    for item in matrix:
        cat = item["category"]
        if cat not in cat_summary:
            cat_summary[cat] = {
                "category": cat,
                "inventory_value": 0,
                "skus_count": 0,
                "critical_count": 0,
                "total_daily_demand": 0
            }
        cat_summary[cat]["inventory_value"] += item["inventory_value_on_hand"]
        cat_summary[cat]["skus_count"] += 1
        cat_summary[cat]["total_daily_demand"] += item["daily_demand"]
        if item["status"] == "CRITICAL_REORDER":
            cat_summary[cat]["critical_count"] += 1

    # Round category summary values
    for cat in cat_summary:
        cat_summary[cat]["inventory_value"] = round(cat_summary[cat]["inventory_value"], 2)
        cat_summary[cat]["total_daily_demand"] = round(cat_summary[cat]["total_daily_demand"], 1)

    # ABC Distribution
    abc_counts = {"A": 0, "B": 0, "C": 0}
    abc_val = {"A": 0.0, "B": 0.0, "C": 0.0}
    for item in matrix:
        cls = item.get("abc_class", "C")
        abc_counts[cls] = abc_counts.get(cls, 0) + 1
        abc_val[cls] = round(abc_val.get(cls, 0.0) + item["annual_revenue_potential"], 2)

    return jsonify({
        "success": True,
        "last_updated": system_cache["last_updated"],
        "kpi": kpi,
        "category_breakdown": list(cat_summary.values()),
        "abc_distribution": {"counts": abc_counts, "revenue": abc_val},
        "market_signals": system_cache["market_signals"]
    })

@app.route("/api/recommendations", methods=["GET"])
def api_recommendations():
    if not system_cache["is_initialized"]:
        bootstrap_system()

    matrix = system_cache["optimization_results"]["inventory_matrix"]
    insights = system_cache["agentic_insights"]

    # Merge narrative into matrix
    insights_dict = {i["sku"]: i for i in insights}
    enriched = []
    for item in matrix:
        sku = item["sku"]
        ins = insights_dict.get(sku, {})
        merged = {**item, **ins}
        enriched.append(merged)

    return jsonify({
        "success": True,
        "total_records": len(enriched),
        "recommendations": enriched
    })

@app.route("/api/forecast/<sku>", methods=["GET"])
def api_forecast(sku):
    if not system_cache["is_initialized"]:
        bootstrap_system()

    sales_df = system_cache["sales_df"]
    sku_sales = sales_df[sales_df["sku"] == sku].copy()
    if sku_sales.empty:
        return jsonify({"success": False, "error": f"SKU {sku} not found"}), 404

    # Historical last 60 days
    sku_sales["date_str"] = sku_sales["date"].dt.strftime("%Y-%m-%d")
    historical_slice = sku_sales.tail(60)[["date_str", "units_sold", "day_of_week", "is_promotion"]].to_dict(orient="records")

    # Day of week seasonality pattern
    dow_group = sku_sales.groupby("day_of_week")["units_sold"].mean().to_dict()
    dow_order = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
    dow_pattern = [{"day": d, "avg_sales": round(dow_group.get(d, 0.0), 2)} for d in dow_order]

    # Forecast slice
    forecast_data = system_cache["forecasts"].get(sku, {})

    # Item details
    item_info = next((i for i in system_cache["optimization_results"]["inventory_matrix"] if i["sku"] == sku), {})

    return jsonify({
        "success": True,
        "sku": sku,
        "item_info": item_info,
        "historical_sales": historical_slice,
        "day_of_week_pattern": dow_pattern,
        "forecast": forecast_data
    })

@app.route("/api/simulate", methods=["POST"])
def api_simulate():
    """
    Dynamic What-If Supply Chain Sandbox
    Re-optimizes inventory parameters on the fly based on user sliders.
    """
    if not system_cache["is_initialized"]:
        bootstrap_system()

    body = request.get_json() or {}
    lead_time_mult = float(body.get("lead_time_mult", 1.0))
    demand_shock_pct = float(body.get("demand_shock_pct", 0.0))
    service_level = float(body.get("service_level", 0.95))

    sim_results = inventory_optimizer.optimize_inventory(
        catalog_df=system_cache["catalog_df"],
        sales_df=system_cache["sales_df"],
        forecasts=system_cache["forecasts"],
        suppliers_df=system_cache["suppliers_df"],
        simulation_params={
            "lead_time_mult": lead_time_mult,
            "demand_shock_pct": demand_shock_pct,
            "service_level": service_level
        }
    )

    sim_insights = agentic_reasoner.generate_agentic_insights(
        inventory_matrix=sim_results["inventory_matrix"],
        market_signals=system_cache["market_signals"]
    )

    return jsonify({
        "success": True,
        "simulation_params": {
            "lead_time_mult": lead_time_mult,
            "demand_shock_pct": demand_shock_pct,
            "service_level": service_level
        },
        "kpi_summary": sim_results["kpi_summary"],
        "inventory_matrix": sim_results["inventory_matrix"],
        "insights": sim_insights
    })

@app.route("/api/upload", methods=["POST"])
def api_upload():
    """
    Upload custom Excel or CSV files to re-train the models on new data.
    """
    if "file" not in request.files:
        return jsonify({"success": False, "error": "No file uploaded"}), 400

    file = request.files["file"]
    if file.filename == "":
        return jsonify({"success": False, "error": "Empty filename"}), 400

    ext = os.path.splitext(file.filename)[1].lower()
    if ext not in [".xlsx", ".xls", ".csv"]:
        return jsonify({"success": False, "error": "File must be .xlsx, .xls or .csv"}), 400

    save_path = os.path.join(app.config["UPLOAD_FOLDER"], f"uploaded_{int(datetime.now().timestamp())}_{file.filename}")
    file.save(save_path)
    print(f"[+] Saved custom user spreadsheet to: {save_path}")

    try:
        bootstrap_system(excel_file_path=save_path)
        return jsonify({
            "success": True,
            "message": f"Successfully loaded and re-trained AI models on '{file.filename}'.",
            "last_updated": system_cache["last_updated"],
            "total_skus": len(system_cache["catalog_df"])
        })
    except Exception as e:
        print(f"[!] Error processing uploaded file: {e}")
        return jsonify({"success": False, "error": f"Failed to train on file: {str(e)}"}), 500

@app.route("/api/scrape", methods=["POST"])
def api_scrape():
    """
    Triggers live web scraper to fetch current market momentum and update predictions.
    """
    signals = scraper.scrape_retail_trends()
    system_cache["market_signals"] = signals

    # Re-run forward forecast and optimization with new market signals
    for sku in system_cache["catalog_df"]["sku"].unique():
        cat = system_cache["catalog_df"].loc[system_cache["catalog_df"]["sku"] == sku, "category"].values[0]
        momentum = signals.get("category_signals", {}).get(cat, {}).get("market_momentum_multiplier", 1.0)
        system_cache["forecasts"][sku] = ml_forecaster.forecast_sku(sku, days_ahead=30, market_surge=(momentum - 1.0) * 100)

    opt_results = inventory_optimizer.optimize_inventory(
        catalog_df=system_cache["catalog_df"],
        sales_df=system_cache["sales_df"],
        forecasts=system_cache["forecasts"],
        suppliers_df=system_cache["suppliers_df"]
    )
    system_cache["optimization_results"] = opt_results
    system_cache["agentic_insights"] = agentic_reasoner.generate_agentic_insights(
        inventory_matrix=opt_results["inventory_matrix"],
        market_signals=signals
    )
    system_cache["last_updated"] = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

    return jsonify({
        "success": True,
        "message": "Live web scraper completed. Signals ingested and models adjusted.",
        "market_signals": signals,
        "last_updated": system_cache["last_updated"]
    })

@app.route("/api/purchase-order/<sku>", methods=["POST"])
def api_purchase_order(sku):
    if not system_cache["is_initialized"]:
        bootstrap_system()

    po_data = agentic_reasoner.generate_purchase_order(sku, system_cache["optimization_results"]["inventory_matrix"])
    return jsonify({"success": True, "purchase_order": po_data})

@app.route("/api/chat", methods=["POST"])
def api_chat():
    body = request.get_json() or {}
    user_message = body.get("message", "")
    if not user_message:
        return jsonify({"success": False, "reply": "Please provide a query."})

    if not system_cache["is_initialized"]:
        bootstrap_system()

    reply = agentic_reasoner.answer_chat_query(
        query=user_message,
        inventory_matrix=system_cache["optimization_results"]["inventory_matrix"],
        kpi_summary=system_cache["optimization_results"]["kpi_summary"],
        market_signals=system_cache["market_signals"]
    )

    return jsonify({"success": True, "reply": reply})

@app.route("/api/export", methods=["GET"])
def api_export():
    if not system_cache["is_initialized"]:
        bootstrap_system()

    matrix = system_cache["optimization_results"]["inventory_matrix"]
    df = pd.DataFrame(matrix)
    export_path = "data/processed/inventory_recommendations_export.xlsx"
    os.makedirs(os.path.dirname(export_path), exist_ok=True)
    df.to_excel(export_path, index=False, sheet_name="Optimized_Inventory_Report")
    
    return send_file(export_path, as_attachment=True, download_name="Smart_Inventory_Recommendations.xlsx")

if __name__ == "__main__":
    bootstrap_system()
    app.run(host="0.0.0.0", port=5000, debug=False)

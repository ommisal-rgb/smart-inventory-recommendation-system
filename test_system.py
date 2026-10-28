"""
End-to-end integration test for Smart Inventory Recommendation System
"""
import sys
import io
sys.stdout.reconfigure(encoding='utf-8')
from app import app, bootstrap_system

def run_tests():
    print("[*] Running system bootstrapping test...")
    bootstrap_system()
    client = app.test_client()

    print("\n--- Test 1: GET / (Dashboard HTML) ---")
    res = client.get("/")
    assert res.status_code == 200, f"Failed: {res.status_code}"
    print(f"[PASS] Status 200 OK, HTML length: {len(res.data)} bytes")

    print("\n--- Test 2: GET /api/overview ---")
    res = client.get("/api/overview")
    assert res.status_code == 200, f"Failed: {res.status_code}"
    data = res.get_json()
    assert data["success"] is True
    print(f"[PASS] KPIs received: Total Val=${data['kpi']['total_inventory_value']:,.2f}, Critical={data['kpi']['critical_skus_count']}")

    print("\n--- Test 3: GET /api/recommendations ---")
    res = client.get("/api/recommendations")
    assert res.status_code == 200, f"Failed: {res.status_code}"
    data = res.get_json()
    assert data["success"] is True
    assert len(data["recommendations"]) > 0
    print(f"[PASS] Received {len(data['recommendations'])} recommendation records.")

    print("\n--- Test 4: GET /api/forecast/SKU-ELC-001 ---")
    res = client.get("/api/forecast/SKU-ELC-001")
    assert res.status_code == 200, f"Failed: {res.status_code}"
    data = res.get_json()
    assert data["success"] is True
    print(f"[PASS] SKU-ELC-001 Forecast: 30d Total={data['forecast']['total_forecast_units']} units, Model R²={data['forecast']['metrics']['r2_score']}")

    print("\n--- Test 5: POST /api/simulate (What-If Sandbox) ---")
    sim_payload = {"lead_time_mult": 1.5, "demand_shock_pct": 20.0, "service_level": 0.98}
    res = client.post("/api/simulate", json=sim_payload)
    assert res.status_code == 200, f"Failed: {res.status_code}"
    data = res.get_json()
    assert data["success"] is True
    print(f"[PASS] Simulation OK: Recalculated Capital Required = ${data['kpi_summary']['recommended_capital_deployment']:,.2f}")

    print("\n--- Test 6: POST /api/chat (Nova AI Copilot) ---")
    chat_payload = {"message": "Which items are in critical danger of stockout?"}
    res = client.post("/api/chat", json=chat_payload)
    assert res.status_code == 200, f"Failed: {res.status_code}"
    data = res.get_json()
    assert data["success"] is True
    print(f"[PASS] Nova AI replied:\n{data['reply'][:140]}...")

    print("\n--- Test 7: POST /api/purchase-order/SKU-ELC-001 ---")
    res = client.post("/api/purchase-order/SKU-ELC-001")
    assert res.status_code == 200, f"Failed: {res.status_code}"
    data = res.get_json()
    assert data["success"] is True
    print(f"[PASS] Generated Purchase Order: {data['purchase_order']['po_number']} for {data['purchase_order']['order_quantity']} units.")

    print("\n==============================================")
    print("🎉 ALL 7 END-TO-END INTEGRATION TESTS PASSED! 🎉")
    print("==============================================")

if __name__ == "__main__":
    run_tests()

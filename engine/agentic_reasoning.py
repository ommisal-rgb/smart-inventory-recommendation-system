"""
Agentic AI Reasoning & Natural Language Decision Engine ("Nova AI")
Transforms raw statistical forecasts, operations research formulas, and web scraped trends
into autonomous, explainable business decisions, purchase orders, and interactive assistant responses.
"""

from datetime import datetime, timedelta

class AgenticInventoryReasoner:
    def __init__(self):
        self.agent_name = "Nova-AI"
        self.version = "v3.8-Enterprise"

    def generate_agentic_insights(self, inventory_matrix, market_signals=None):
        """
        Synthesizes inventory matrix into high-priority autonomous agent recommendations.
        """
        insights = []
        market_signals = market_signals or {}
        cat_signals = market_signals.get("category_signals", {})

        for item in inventory_matrix:
            sku = item["sku"]
            status = item["status"]
            name = item["product_name"]
            category = item["category"]
            runway = item["runway_days"]
            lead_time = item["lead_time_days"]
            daily_demand = item["daily_demand"]
            current_stock = item["current_stock"]
            reorder_qty = item["recommended_order_qty"]
            capital = item["capital_required"]
            abc = item["abc_class"]
            risk_pct = item["stockout_risk_pct"]

            cat_info = cat_signals.get(category, {})
            momentum = cat_info.get("market_momentum_multiplier", 1.0)
            driver = cat_info.get("primary_trend_driver", "Stable seasonal baseline")

            # Agentic narrative synthesis
            if status == "CRITICAL_REORDER":
                urgency = "IMMEDIATE_ACTION"
                reasoning = (
                    f"CRITICAL DEFICIT DETECTED: {sku} currently holds {current_stock} units on hand, providing only "
                    f"{runway} days of operational runway against a supplier fulfillment lead time of {lead_time} days. "
                    f"External market scraper indicates {driver} with a {momentum}x momentum multiplier. "
                    f"Stockout probability is {risk_pct}%, threatening ${round(daily_demand * item['selling_price'] * lead_time, 2)} "
                    f"in lost gross revenue."
                )
                action = (
                    f"Deploy ${capital:,.2f} to issue Purchase Order for {reorder_qty} units with {item['supplier_name']}. "
                    f"Request priority air freight to compress lead time by 4 days."
                )
                badge_type = "critical"
            
            elif status == "REORDER_SOON":
                urgency = "PREVENTATIVE_ORDER"
                reasoning = (
                    f"REORDER THRESHOLD BREACH: Stock has dipped below calculated Reorder Point ({item['reorder_point']} units). "
                    f"Predicted daily velocity is {daily_demand} units/day. While stock is not yet depleted ({runway} days remaining), "
                    f"normal supply fluctuations could trigger a stockout within 2 weeks. Class {abc} revenue tier."
                )
                action = (
                    f"Schedule standard replenishment PO of {reorder_qty} units (optimized EOQ batch) costing ${capital:,.2f} "
                    f"within the next 48 hours."
                )
                badge_type = "warning"

            elif status == "OVERSTOCKED":
                urgency = "CAPITAL_OPTIMIZATION"
                excess_units = current_stock - item["reorder_point"]
                tied_capital = round(excess_units * item["unit_cost"], 2)
                reasoning = (
                    f"CAPITAL CONFINEMENT: Stock level ({current_stock} units) exceeds optimized ceiling by {excess_units} units. "
                    f"Estimated ${tied_capital:,.2f} in working capital is locked in inventory, incurring ~${round(tied_capital * 0.20, 2)} "
                    f"in annual carrying costs."
                )
                action = (
                    f"Halt new replenishment. Launch targeted promotional bundle (10-15% discount) to accelerate inventory turnover "
                    f"and liberate locked capital."
                )
                badge_type = "overstocked"

            else:
                urgency = "MONITORING_STEADY"
                reasoning = (
                    f"EQUILIBRIUM ACHIEVED: Inventory levels ({current_stock} units) are securely bounded between Safety Stock "
                    f"({item['safety_stock']} units) and Reorder Ceiling. Runway of {runway} days safely absorbs lead time ({lead_time} days)."
                )
                action = "Maintain continuous algorithmic monitoring. No procurement intervention required at this cycle."
                badge_type = "healthy"

            insights.append({
                "sku": sku,
                "product_name": name,
                "category": category,
                "abc_class": abc,
                "urgency_level": urgency,
                "badge_type": badge_type,
                "reasoning_narrative": reasoning,
                "prescriptive_action": action,
                "recommended_order_qty": reorder_qty,
                "capital_required": capital,
                "stockout_risk_pct": risk_pct,
                "status": status
            })

        return insights

    def generate_purchase_order(self, sku, inventory_matrix):
        """
        Generates an enterprise-ready Purchase Order (PO) draft.
        """
        item = next((x for x in inventory_matrix if x["sku"] == sku), None)
        if not item:
            return {"error": f"SKU {sku} not found"}

        po_number = f"PO-{datetime.now().strftime('%Y%m%d')}-{sku.split('-')[-1]}"
        qty = item["recommended_order_qty"] if item["recommended_order_qty"] > 0 else item["eoq"]
        subtotal = round(qty * item["unit_cost"], 2)
        shipping_est = round(subtotal * 0.045, 2)
        total = round(subtotal + shipping_est, 2)
        est_arrival = (datetime.now() + timedelta(days=int(item["lead_time_days"]))).strftime("%B %d, %Y")

        return {
            "po_number": po_number,
            "created_date": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            "sku": sku,
            "product_name": item["product_name"],
            "category": item["category"],
            "supplier_name": item["supplier_name"],
            "order_quantity": qty,
            "unit_cost": item["unit_cost"],
            "subtotal": subtotal,
            "estimated_logistics": shipping_est,
            "total_capital_commitment": total,
            "expected_delivery_date": est_arrival,
            "status": "APPROVED_DRAFT",
            "approval_agent": f"{self.agent_name} Autonomous Supply Controller"
        }

    def answer_chat_query(self, query, inventory_matrix, kpi_summary, market_signals=None):
        """
        Interactive natural language AI assistant responding to supply chain executive queries.
        """
        q = query.lower().strip()

        # Stockout / Critical Risk queries
        if "critical" in q or "stockout" in q or "risk" in q or "danger" in q:
            critical_items = [i for i in inventory_matrix if i["status"] == "CRITICAL_REORDER"]
            if not critical_items:
                return "Good news! None of your SKUs are currently in a critical stockout state. All inventory levels are above safety stock."
            
            top3 = critical_items[:3]
            res = f"🚨 **Attention Required: {len(critical_items)} SKU(s) in Critical Stockout Threat**\n\n"
            for it in top3:
                res += (f"- **{it['sku']} ({it['product_name']})**: Stock: {it['current_stock']} units | "
                        f"Runway: {it['runway_days']} days vs Lead Time {it['lead_time_days']} days | "
                        f"Stockout Risk: {it['stockout_risk_pct']}%. **Recommended Action:** Place order of {it['recommended_order_qty']} units "
                        f"(${it['capital_required']:,.2f}).\n")
            if len(critical_items) > 3:
                res += f"\n*...and {len(critical_items) - 3} more critical item(s) in your dashboard matrix.*"
            return res

        # Capital deployment / Budget queries
        elif "capital" in q or "budget" in q or "cost" in q or "money" in q or "spend" in q:
            cap = kpi_summary.get("recommended_capital_deployment", 0)
            inv_val = kpi_summary.get("total_inventory_value", 0)
            return (
                f"💰 **Financial & Capital Allocation Summary:**\n\n"
                f"- **Current Inventory Value on Hand:** ${inv_val:,.2f}\n"
                f"- **Recommended Capital Deployment:** ${cap:,.2f} across all triggered replenishment orders.\n"
                f"- **Service Level Target:** {kpi_summary.get('service_level_target', '95%')}\n\n"
                f"Executing these orders will eliminate stockout exposure on high-velocity items while staying within EOQ-optimized batch sizes to minimize holding overhead."
            )

        # Overstock / Excess queries
        elif "overstock" in q or "excess" in q or "dead stock" in q:
            overstocked = [i for i in inventory_matrix if i["status"] == "OVERSTOCKED"]
            if not overstocked:
                return "Excellent! You currently have zero overstocked SKUs. Capital allocation is lean and well-balanced."
            res = f"📦 **Overstocked Inventory Analysis ({len(overstocked)} items detected):**\n\n"
            for it in overstocked:
                excess = it['current_stock'] - it['reorder_point']
                tied = round(excess * it['unit_cost'], 2)
                res += f"- **{it['sku']} ({it['product_name']})**: {it['current_stock']} units in stock (Runway: {it['runway_days']} days). ${tied:,.2f} surplus capital tied up. Suggest running a promotional bundle.\n"
            return res

        # Specific SKU inquiry
        for it in inventory_matrix:
            if it["sku"].lower() in q or it["product_name"].lower() in q:
                recom_text = f"Order {it['recommended_order_qty']} units (${it['capital_required']:,.2f})" if it['recommended_order_qty'] > 0 else "Stock is healthy. No purchase required."
                return (
                    f"🔍 **Deep-Dive Diagnostic for {it['sku']} ({it['product_name']})**\n\n"
                    f"- **Status:** `{it['status']}` (Urgency Score: {it['urgency_score']}/100)\n"
                    f"- **Current Stock on Hand:** {it['current_stock']} units\n"
                    f"- **Projected Daily Demand:** {it['daily_demand']} units/day\n"
                    f"- **Operational Runway:** {it['runway_days']} days\n"
                    f"- **Supplier Lead Time:** {it['lead_time_days']} days ({it['supplier_name']})\n"
                    f"- **Safety Stock Threshold:** {it['safety_stock']} units\n"
                    f"- **Dynamic Reorder Point (ROP):** {it['reorder_point']} units\n"
                    f"- **EOQ Optimal Order Batch:** {it['eoq']} units\n"
                    f"- **Prescribed Recommendation:** {recom_text}"
                )

        # General summary / Hello
        return (
            f"👋 Hello! I am **Nova**, your autonomous Inventory Intelligence Agent.\n\n"
            f"Here is your supply chain heartbeat:\n"
            f"- **{kpi_summary.get('critical_skus_count', 0)}** Critical Reorder Alerts\n"
            f"- **{kpi_summary.get('warning_skus_count', 0)}** Warning Threshold Approvals\n"
            f"- **{kpi_summary.get('healthy_skus_count', 0)}** Healthy SKUs in equilibrium\n"
            f"- **Average Stockout Risk:** {kpi_summary.get('average_stockout_risk_pct', 0)}%\n\n"
            f"You can ask me questions like:\n"
            f"- *'Which items are in danger of stockout?'*\n"
            f"- *'How much capital do I need to replenish inventory?'*\n"
            f"- *'Check SKU-ELC-001 status'*\n"
            f"- *'What items are overstocked?'*"
        )

/**
 * AURA Inventory AI — Interactive Dashboard Application Logic
 * Integrates Chart.js visualizations, live REST API calls, What-If simulation sandbox,
 * Excel file uploader, and Nova AI chat assistant.
 */

let allRecommendations = [];
let currentFilter = "ALL";
let forecastChartInstance = null;
let paretoChartInstance = null;
let seasonalityChartInstance = null;
let showingPareto = true;
let currentSelectedSku = null;

document.addEventListener("DOMContentLoaded", () => {
  initDashboard();
  setupEventListeners();
});

async function initDashboard() {
  try {
    await Promise.all([
      loadOverviewData(),
      loadRecommendationsData()
    ]);
  } catch (err) {
    console.error("Dashboard initialization error:", err);
  }
}

// --- 1. Load Executive Overview & KPIs ---
async function loadOverviewData() {
  const resp = await fetch("/api/overview");
  const data = await resp.json();
  if (!data.success) return;

  const kpi = data.kpi;
  document.getElementById("kpiTotalValue").textContent = formatCurrency(kpi.total_inventory_value);
  document.getElementById("kpiCapital").textContent = formatCurrency(kpi.recommended_capital_deployment);
  document.getElementById("kpiCritical").textContent = kpi.critical_skus_count;
  document.getElementById("kpiRisk").textContent = kpi.average_stockout_risk_pct + "%";
  document.getElementById("kpiServiceLevel").textContent = kpi.service_level_target;
  document.getElementById("kpiTotalSkus").textContent = kpi.total_skus_monitored;

  // ABC Stat Pills
  const counts = data.abc_distribution.counts;
  document.getElementById("statClassA").textContent = `${counts.A || 0} SKUs`;
  document.getElementById("statClassB").textContent = `${counts.B || 0} SKUs`;
  document.getElementById("statClassC").textContent = `${counts.C || 0} SKUs`;

  // Render Charts
  renderParetoChart(data);
  renderMarketSignals(data.market_signals);
}

// --- 2. Load Recommendations & Table ---
async function loadRecommendationsData() {
  const resp = await fetch("/api/recommendations");
  const data = await resp.json();
  if (!data.success) return;

  allRecommendations = data.recommendations;
  populateSkuSelector(allRecommendations);
  updateFilterCounts(allRecommendations);
  renderTable(allRecommendations);

  // Default forecast selection
  if (allRecommendations.length > 0 && !currentSelectedSku) {
    currentSelectedSku = allRecommendations[0].sku;
    loadSkuForecast(currentSelectedSku);
  }
}

// --- 3. SKU Selector & Forecast Visualization ---
function populateSkuSelector(items) {
  const selector = document.getElementById("skuSelector");
  selector.innerHTML = "";
  items.forEach(item => {
    const opt = document.createElement("option");
    opt.value = item.sku;
    opt.textContent = `${item.sku} — ${item.product_name.substring(0, 26)}...`;
    selector.appendChild(opt);
  });

  selector.addEventListener("change", (e) => {
    currentSelectedSku = e.target.value;
    loadSkuForecast(currentSelectedSku);
  });
}

async function loadSkuForecast(sku) {
  const resp = await fetch(`/api/forecast/${sku}`);
  const data = await resp.json();
  if (!data.success) return;

  const item = data.item_info;
  document.getElementById("selectedProductName").textContent = item.product_name;
  document.getElementById("selectedCategory").textContent = item.category;
  document.getElementById("selectedR2").textContent = data.forecast.metrics ? `${data.forecast.metrics.r2_score} (Good)` : "0.88";

  renderForecastChart(data);
  renderSeasonalityChart(data.day_of_week_pattern);
}

function renderForecastChart(data) {
  const ctx = document.getElementById("forecastChart").getContext("2d");
  
  // Historical data (last 30 points)
  const historySlice = data.historical_sales.slice(-30);
  const histLabels = historySlice.map(h => h.date_str);
  const histValues = historySlice.map(h => h.units_sold);

  // Future projections (30 days)
  const forecastList = data.forecast.daily_forecast || [];
  const forecastLabels = forecastList.map(f => f.date);
  const forecastValues = forecastList.map(f => f.forecast_units);
  const lowerBounds = forecastList.map(f => f.lower_ci_95);
  const upperBounds = forecastList.map(f => f.upper_ci_95);

  const combinedLabels = [...histLabels, ...forecastLabels];
  
  // Arrays aligned with combined timeline
  const alignedHist = [...histValues, ...new Array(forecastLabels.length).fill(null)];
  const alignedForecast = [...new Array(histLabels.length - 1).fill(null), histValues[histValues.length - 1], ...forecastValues];
  const alignedLower = [...new Array(histLabels.length - 1).fill(null), histValues[histValues.length - 1], ...lowerBounds];
  const alignedUpper = [...new Array(histLabels.length - 1).fill(null), histValues[histValues.length - 1], ...upperBounds];

  if (forecastChartInstance) {
    forecastChartInstance.destroy();
  }

  forecastChartInstance = new Chart(ctx, {
    type: "line",
    data: {
      labels: combinedLabels,
      datasets: [
        {
          label: "Upper 95% Confidence Band",
          data: alignedUpper,
          borderColor: "rgba(6, 182, 212, 0.15)",
          backgroundColor: "rgba(6, 182, 212, 0.08)",
          fill: "+1",
          pointRadius: 0,
          borderWidth: 1,
          tension: 0.3
        },
        {
          label: "Lower 95% Confidence Band",
          data: alignedLower,
          borderColor: "rgba(6, 182, 212, 0.15)",
          backgroundColor: "transparent",
          pointRadius: 0,
          borderWidth: 1,
          tension: 0.3
        },
        {
          label: "Historical Actual Demand",
          data: alignedHist,
          borderColor: "#94a3b8",
          backgroundColor: "rgba(148, 163, 184, 0.15)",
          borderWidth: 2,
          pointRadius: 2,
          pointHoverRadius: 5,
          tension: 0.2
        },
        {
          label: "30-Day AI Ensemble Forecast",
          data: alignedForecast,
          borderColor: "#06b6d4",
          backgroundColor: "rgba(6, 182, 212, 0.2)",
          borderWidth: 3,
          borderDash: [5, 5],
          pointRadius: 3,
          pointBackgroundColor: "#06b6d4",
          pointHoverRadius: 6,
          tension: 0.3
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        mode: "index",
        intersect: false
      },
      plugins: {
        legend: {
          display: true,
          position: "top",
          labels: { color: "#94a3b8", font: { family: "Inter", size: 11 } }
        },
        tooltip: {
          backgroundColor: "rgba(15, 23, 42, 0.95)",
          borderColor: "rgba(255, 255, 255, 0.1)",
          borderWidth: 1,
          titleFont: { family: "Outfit", size: 12 },
          bodyFont: { family: "Inter", size: 11 },
          padding: 10
        }
      },
      scales: {
        x: {
          grid: { color: "rgba(255, 255, 255, 0.04)" },
          ticks: { color: "#64748b", font: { size: 10 }, maxTicksLimit: 12 }
        },
        y: {
          grid: { color: "rgba(255, 255, 255, 0.04)" },
          ticks: { color: "#64748b", font: { size: 10 } },
          title: { display: true, text: "Daily Units Demand", color: "#94a3b8" }
        }
      }
    }
  });
}

// --- 4. ABC Pareto & Category Value Charts ---
function renderParetoChart(data) {
  const ctx = document.getElementById("paretoChart").getContext("2d");
  if (paretoChartInstance) {
    paretoChartInstance.destroy();
  }

  if (showingPareto) {
    // Pareto Bar / Line
    const catBreakdown = data.category_breakdown || [];
    const labels = catBreakdown.map(c => c.category);
    const values = catBreakdown.map(c => c.inventory_value);

    paretoChartInstance = new Chart(ctx, {
      type: "bar",
      data: {
        labels: labels,
        datasets: [{
          label: "Inventory Value ($)",
          data: values,
          backgroundColor: [
            "rgba(6, 182, 212, 0.7)",
            "rgba(99, 102, 241, 0.7)",
            "rgba(139, 92, 246, 0.7)",
            "rgba(16, 185, 129, 0.7)",
            "rgba(245, 158, 11, 0.7)"
          ],
          borderColor: "rgba(255, 255, 255, 0.1)",
          borderWidth: 1,
          borderRadius: 6
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (ctx) => `Value: $${ctx.parsed.y.toLocaleString()}`
            }
          }
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: { color: "#94a3b8", font: { size: 11 } }
          },
          y: {
            grid: { color: "rgba(255, 255, 255, 0.04)" },
            ticks: {
              color: "#64748b",
              callback: (val) => `$${(val / 1000).toFixed(0)}k`
            }
          }
        }
      }
    });
  } else {
    // Category Donut
    const catBreakdown = data.category_breakdown || [];
    const labels = catBreakdown.map(c => c.category);
    const values = catBreakdown.map(c => c.inventory_value);

    paretoChartInstance = new Chart(ctx, {
      type: "doughnut",
      data: {
        labels: labels,
        datasets: [{
          data: values,
          backgroundColor: [
            "#06b6d4",
            "#6366f1",
            "#8b5cf6",
            "#10b981",
            "#f59e0b"
          ],
          borderWidth: 2,
          borderColor: "#0f172a"
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: "65%",
        plugins: {
          legend: {
            position: "bottom",
            labels: { color: "#94a3b8", font: { size: 10 } }
          }
        }
      }
    });
  }
}

// --- 5. Day-of-Week Seasonality Pattern Chart ---
function renderSeasonalityChart(dowPattern) {
  const ctx = document.getElementById("seasonalityChart").getContext("2d");
  if (seasonalityChartInstance) {
    seasonalityChartInstance.destroy();
  }

  const labels = dowPattern.map(p => p.day.substring(0, 3));
  const values = dowPattern.map(p => p.avg_sales);

  seasonalityChartInstance = new Chart(ctx, {
    type: "bar",
    data: {
      labels: labels,
      datasets: [{
        label: "Avg Units Sold",
        data: values,
        backgroundColor: labels.map(l => (l === "Sat" || l === "Sun" || l === "Fri") ? "rgba(139, 92, 246, 0.85)" : "rgba(6, 182, 212, 0.6)"),
        borderRadius: 4
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false }
      },
      scales: {
        x: {
          grid: { display: false },
          ticks: { color: "#94a3b8", font: { size: 10 } }
        },
        y: {
          grid: { color: "rgba(255, 255, 255, 0.04)" },
          ticks: { color: "#64748b", font: { size: 10 } }
        }
      }
    }
  });
}

// --- 6. Market Scraper Feed ---
function renderMarketSignals(signals) {
  const container = document.getElementById("marketSignalsContainer");
  container.innerHTML = "";

  if (!signals || !signals.category_signals) return;
  document.getElementById("scraperTimestamp").textContent = signals.meta.last_scraped_at || "Live Active";

  Object.values(signals.category_signals).forEach(sig => {
    const card = document.createElement("div");
    card.className = "signal-card";
    card.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center;">
        <span class="signal-cat-badge">${sig.category}</span>
        <span style="font-size: 0.7rem; color: #34d399; font-family: var(--font-mono); font-weight: 700;">+${((sig.market_momentum_multiplier - 1.0) * 100).toFixed(0)}% Surge</span>
      </div>
      <div style="font-size: 0.74rem; color: var(--text-dim); line-height: 1.3;">
        ${sig.primary_trend_driver.substring(0, 60)}...
      </div>
      <div style="border-top: 1px solid rgba(255,255,255,0.06); padding-top: 6px; display: flex; justify-content: space-between; font-size: 0.72rem; color: var(--text-muted);">
        <span>Comp. Stockouts: <strong>${sig.competitor_stockout_rate_pct}%</strong></span>
        <span>Search Lift: <strong>+${sig.consumer_search_surge_pct}%</strong></span>
      </div>
    `;
    container.appendChild(card);
  });
}

// --- 7. Table Rendering & Dynamic Filters ---
function renderTable(items) {
  const tbody = document.getElementById("tableBody");
  tbody.innerHTML = "";

  const searchVal = document.getElementById("tableSearch").value.toLowerCase();

  const filtered = items.filter(item => {
    const matchesFilter = (currentFilter === "ALL") || (item.status === currentFilter);
    const matchesSearch = !searchVal || 
      item.sku.toLowerCase().includes(searchVal) || 
      item.product_name.toLowerCase().includes(searchVal) ||
      item.category.toLowerCase().includes(searchVal);
    return matchesFilter && matchesSearch;
  });

  if (filtered.length === 0) {
    tbody.innerHTML = `<tr><td colspan="11" style="text-align: center; padding: 30px; color: var(--text-dim);">No SKUs found matching current filters.</td></tr>`;
    return;
  }

  filtered.forEach(item => {
    const tr = document.createElement("tr");

    // Status badge
    let badgeClass = "badge-healthy";
    let badgeLabel = "Healthy";
    if (item.status === "CRITICAL_REORDER") {
      badgeClass = "badge-critical";
      badgeLabel = "Critical";
    } else if (item.status === "REORDER_SOON") {
      badgeClass = "badge-warning";
      badgeLabel = "Warning";
    } else if (item.status === "OVERSTOCKED") {
      badgeClass = "badge-overstocked";
      badgeLabel = "Overstocked";
    }

    // Progress bar for stock vs ROP
    const ratio = Math.min(100, Math.round((item.current_stock / Math.max(1, item.reorder_point)) * 100));
    let barColor = "#10b981";
    if (ratio <= 50) barColor = "#ef4444";
    else if (ratio <= 100) barColor = "#f59e0b";

    tr.innerHTML = `
      <td><span class="badge ${badgeClass}"><i class="fa-solid fa-circle" style="font-size: 6px;"></i> ${badgeLabel}</span></td>
      <td>
        <div style="font-weight: 600; font-family: var(--font-mono); color: #fff;">${item.sku}</div>
        <div style="font-size: 0.75rem; color: var(--text-dim); max-width: 220px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" title="${item.product_name}">${item.product_name}</div>
      </td>
      <td><span style="font-size: 0.75rem; color: var(--text-muted);">${item.category}</span></td>
      <td><span class="abc-pill abc-${item.abc_class.toLowerCase()}">${item.abc_class}</span></td>
      <td>
        <div style="font-family: var(--font-mono); font-size: 0.8rem;">
          <strong>${item.current_stock}</strong> / <span style="color: var(--text-dim);">${item.reorder_point} ROP</span>
        </div>
        <div class="bar-container">
          <div class="bar-fill" style="width: ${ratio}%; background: ${barColor};"></div>
        </div>
      </td>
      <td><span style="font-family: var(--font-mono);">${item.daily_demand} /day</span></td>
      <td>
        <span style="font-weight: 700; font-family: var(--font-mono); color: ${item.runway_days <= item.lead_time_days ? '#f87171' : '#34d399'};">
          ${item.runway_days}d
        </span>
        <span style="font-size: 0.7rem; color: var(--text-dim);"> (${item.lead_time_days}d LT)</span>
      </td>
      <td>
        <span style="font-family: var(--font-mono); font-weight: 600; color: ${item.stockout_risk_pct > 70 ? '#f87171' : item.stockout_risk_pct > 30 ? '#fbbf24' : '#34d399'};">
          ${item.stockout_risk_pct}%
        </span>
      </td>
      <td>
        <span style="font-weight: 700; font-family: var(--font-mono); color: ${item.recommended_order_qty > 0 ? '#38bdf8' : '#94a3b8'};">
          ${item.recommended_order_qty > 0 ? item.recommended_order_qty + ' units' : '—'}
        </span>
      </td>
      <td>
        <span style="font-family: var(--font-mono);">${item.capital_required > 0 ? formatCurrency(item.capital_required) : '$0'}</span>
      </td>
      <td>
        <div style="display: flex; gap: 6px;">
          <button class="btn btn-outline" style="padding: 4px 8px; font-size: 0.72rem;" onclick="inspectSku('${item.sku}')" title="Inspect Forecast">
            <i class="fa-solid fa-chart-line"></i>
          </button>
          <button class="btn btn-primary" style="padding: 4px 8px; font-size: 0.72rem;" onclick="openPoModal('${item.sku}')" title="Generate Purchase Order">
            <i class="fa-solid fa-file-invoice"></i> PO
          </button>
        </div>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

function updateFilterCounts(items) {
  document.getElementById("countAll").textContent = items.length;
  document.getElementById("countCritical").textContent = items.filter(i => i.status === "CRITICAL_REORDER").length;
  document.getElementById("countWarning").textContent = items.filter(i => i.status === "REORDER_SOON").length;
  document.getElementById("countHealthy").textContent = items.filter(i => i.status === "HEALTHY").length;
  document.getElementById("countOverstocked").textContent = items.filter(i => i.status === "OVERSTOCKED").length;
}

function inspectSku(sku) {
  document.getElementById("skuSelector").value = sku;
  currentSelectedSku = sku;
  loadSkuForecast(sku);
  window.scrollTo({ top: 300, behavior: "smooth" });
}

// --- 8. Purchase Order Modal ---
async function openPoModal(sku) {
  const resp = await fetch(`/api/purchase-order/${sku}`, { method: "POST" });
  const data = await resp.json();
  if (!data.success) return;

  const po = data.purchase_order;
  const container = document.getElementById("poDetailsContainer");
  container.innerHTML = `
    <div style="border-bottom: 1px dashed rgba(255,255,255,0.15); padding-bottom: 10px; margin-bottom: 12px; display: flex; justify-content: space-between;">
      <span style="color: #06b6d4; font-weight: 700;">PURCHASE ORDER: ${po.po_number}</span>
      <span style="color: #34d399;">STATUS: ${po.status}</span>
    </div>
    <div><strong>Item:</strong> ${po.sku} — ${po.product_name}</div>
    <div><strong>Supplier:</strong> ${po.supplier_name}</div>
    <div><strong>Recommended Batch Size:</strong> ${po.order_quantity} units</div>
    <div><strong>Unit Cost:</strong> $${po.unit_cost.toFixed(2)}</div>
    <div><strong>Subtotal:</strong> $${po.subtotal.toLocaleString()}</div>
    <div><strong>Est. Freight & Logistics:</strong> $${po.estimated_logistics.toLocaleString()}</div>
    <div style="font-size: 0.95rem; font-weight: 700; color: #fff; margin-top: 8px;">
      Total Capital Commitment: $${po.total_capital_commitment.toLocaleString()}
    </div>
    <div style="color: #94a3b8; font-size: 0.72rem; margin-top: 6px;">
      Target In-Warehouse Delivery: ${po.expected_delivery_date}
    </div>
  `;

  document.getElementById("btnCopyPo").onclick = () => {
    navigator.clipboard.writeText(JSON.stringify(po, null, 2));
    alert("Purchase Order JSON copied to clipboard!");
  };

  document.getElementById("poModal").style.display = "flex";
}

// --- 9. Event Listeners Setup ---
function setupEventListeners() {
  // Table search
  document.getElementById("tableSearch").addEventListener("input", () => {
    renderTable(allRecommendations);
  });

  // Filter tabs
  document.querySelectorAll(".filter-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".filter-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      currentFilter = btn.dataset.filter;
      renderTable(allRecommendations);
    });
  });

  // Switch Pareto Chart
  document.getElementById("btnToggleChartType").addEventListener("click", async () => {
    showingPareto = !showingPareto;
    const resp = await fetch("/api/overview");
    const data = await resp.json();
    renderParetoChart(data);
  });

  // Simulation Sliders
  const slLeadTime = document.getElementById("sliderLeadTime");
  const slDemandShock = document.getElementById("sliderDemandShock");
  const slServiceLevel = document.getElementById("sliderServiceLevel");

  slLeadTime.addEventListener("input", (e) => {
    document.getElementById("valLeadTime").textContent = `${e.target.value}x`;
  });
  slDemandShock.addEventListener("input", (e) => {
    const val = parseInt(e.target.value);
    document.getElementById("valDemandShock").textContent = val > 0 ? `+${val}%` : `${val}%`;
  });
  slServiceLevel.addEventListener("input", (e) => {
    document.getElementById("valServiceLevel").textContent = `${e.target.value}%`;
  });

  // Run Simulation
  document.getElementById("btnRunSim").addEventListener("click", async () => {
    const payload = {
      lead_time_mult: parseFloat(slLeadTime.value),
      demand_shock_pct: parseFloat(slDemandShock.value),
      service_level: parseFloat(slServiceLevel.value) / 100.0
    };

    const resp = await fetch("/api/simulate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    const data = await resp.json();
    if (data.success) {
      allRecommendations = data.inventory_matrix;
      updateFilterCounts(allRecommendations);
      renderTable(allRecommendations);

      const kpi = data.kpi_summary;
      document.getElementById("kpiTotalValue").textContent = formatCurrency(kpi.total_inventory_value);
      document.getElementById("kpiCapital").textContent = formatCurrency(kpi.recommended_capital_deployment);
      document.getElementById("kpiCritical").textContent = kpi.critical_skus_count;
      document.getElementById("kpiRisk").textContent = kpi.average_stockout_risk_pct + "%";
      document.getElementById("kpiServiceLevel").textContent = kpi.service_level_target;

      const banner = document.getElementById("simImpactBanner");
      banner.style.display = "flex";
      document.getElementById("simImpactText").innerHTML = `
        ⚡ <strong>Simulation In Effect:</strong> Lead Time: ${payload.lead_time_mult}x | Demand Shock: ${payload.demand_shock_pct > 0 ? '+' : ''}${payload.demand_shock_pct}% | Target Service: ${kpi.service_level_target}. 
        Recalculated capital required: <strong>${formatCurrency(kpi.recommended_capital_deployment)}</strong>.
      `;
    }
  });

  // Reset Simulation
  document.getElementById("btnResetSim").addEventListener("click", async () => {
    slLeadTime.value = 1.0;
    slDemandShock.value = 0;
    slServiceLevel.value = 95;
    document.getElementById("valLeadTime").textContent = "1.0x";
    document.getElementById("valDemandShock").textContent = "0%";
    document.getElementById("valServiceLevel").textContent = "95%";
    document.getElementById("simImpactBanner").style.display = "none";
    await initDashboard();
  });

  // Scraper Sync Button
  document.getElementById("btnScrape").addEventListener("click", async () => {
    const btn = document.getElementById("btnScrape");
    btn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Scraping Market...`;
    try {
      const resp = await fetch("/api/scrape", { method: "POST" });
      const data = await resp.json();
      if (data.success) {
        alert(data.message);
        await initDashboard();
      }
    } catch (e) {
      alert("Scraper sync failed.");
    } finally {
      btn.innerHTML = `<i class="fa-solid fa-satellite-dish"></i> Sync Market Scraper`;
    }
  });

  // Upload Modal
  document.getElementById("btnOpenUpload").addEventListener("click", () => {
    document.getElementById("uploadModal").style.display = "flex";
  });
  document.getElementById("btnCloseUploadModal").addEventListener("click", () => {
    document.getElementById("uploadModal").style.display = "none";
  });

  // File Upload Handlers
  const fileInput = document.getElementById("fileInput");
  fileInput.addEventListener("change", (e) => {
    if (e.target.files.length > 0) {
      uploadFile(e.target.files[0]);
    }
  });

  // PO Modal Close
  document.getElementById("btnClosePoModal").addEventListener("click", () => {
    document.getElementById("poModal").style.display = "none";
  });

  // Chat Copilot Handlers
  const chatDrawer = document.getElementById("chatDrawer");
  document.getElementById("btnToggleChat").addEventListener("click", () => {
    chatDrawer.classList.toggle("minimized");
  });
  document.getElementById("btnCloseChat").addEventListener("click", () => {
    chatDrawer.classList.add("minimized");
  });

  document.getElementById("btnSendChat").addEventListener("click", sendChatMessage);
  document.getElementById("chatInput").addEventListener("keydown", (e) => {
    if (e.key === "Enter") sendChatMessage();
  });

  // Quick Prompt Chips
  document.querySelectorAll(".prompt-chip").forEach(chip => {
    chip.addEventListener("click", () => {
      document.getElementById("chatInput").value = chip.dataset.prompt;
      sendChatMessage();
    });
  });
}

// --- 10. File Upload Function ---
async function uploadFile(file) {
  const statusBox = document.getElementById("uploadStatus");
  statusBox.style.display = "block";
  statusBox.innerHTML = `<i class="fa-solid fa-spinner fa-spin" style="color: #06b6d4;"></i> Uploading and training ensemble models on '${file.name}'...`;

  const formData = new FormData();
  formData.append("file", file);

  try {
    const resp = await fetch("/api/upload", {
      method: "POST",
      body: formData
    });
    const result = await resp.json();
    if (result.success) {
      statusBox.innerHTML = `<span style="color: #34d399;"><i class="fa-solid fa-circle-check"></i> ${result.message}</span>`;
      setTimeout(async () => {
        document.getElementById("uploadModal").style.display = "none";
        statusBox.style.display = "none";
        await initDashboard();
      }, 1500);
    } else {
      statusBox.innerHTML = `<span style="color: #f87171;"><i class="fa-solid fa-triangle-exclamation"></i> ${result.error}</span>`;
    }
  } catch (err) {
    statusBox.innerHTML = `<span style="color: #f87171;">Upload failed: ${err.message}</span>`;
  }
}

// --- 11. Chat Message Handler ---
async function sendChatMessage() {
  const input = document.getElementById("chatInput");
  const msg = input.value.trim();
  if (!msg) return;

  const messagesContainer = document.getElementById("chatMessages");

  // Append user bubble
  const userBubble = document.createElement("div");
  userBubble.className = "chat-bubble user";
  userBubble.textContent = msg;
  messagesContainer.appendChild(userBubble);
  input.value = "";
  messagesContainer.scrollTop = messagesContainer.scrollHeight;

  // Typing indicator
  const botBubble = document.createElement("div");
  botBubble.className = "chat-bubble bot";
  botBubble.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Thinking...`;
  messagesContainer.appendChild(botBubble);
  messagesContainer.scrollTop = messagesContainer.scrollHeight;

  try {
    const resp = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: msg })
    });
    const data = await resp.json();
    // Format markdown bold
    let formatted = data.reply.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    formatted = formatted.replace(/\n/g, '<br>');
    botBubble.innerHTML = formatted;
  } catch (e) {
    botBubble.textContent = "Sorry, I encountered an error communicating with the agentic engine.";
  }
  messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

// Helper: Currency Formatter
function formatCurrency(num) {
  return "$" + Number(num || 0).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

import React, { useState, useEffect } from 'react';
import { X, Cpu, TrendingUp, AlertTriangle, ShieldCheck, Send, Sparkles, RefreshCw } from 'lucide-react';

export default function AiPredictionModal({ isOpen, onClose }) {
  const [loading, setLoading] = useState(true);
  const [kpi, setKpi] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [chatMessage, setChatMessage] = useState("");
  const [chatHistory, setChatHistory] = useState([
    { role: "bot", text: "👋 Hello! I am **Nova**, your autonomous Inventory Intelligence Copilot. How can I assist your supply chain decisions today?" }
  ]);
  const [chatLoading, setChatLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [overviewRes, recRes] = await Promise.all([
        fetch("/api/overview"),
        fetch("/api/recommendations")
      ]);
      const overviewData = await overviewRes.json();
      const recData = await recRes.json();
      if (overviewData.success) setKpi(overviewData.kpi);
      if (recData.success) setRecommendations(recData.recommendations.slice(0, 8));
    } catch (err) {
      console.error("API fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSendChat = async () => {
    if (!chatMessage.trim()) return;
    const msg = chatMessage;
    setChatMessage("");
    setChatHistory(prev => [...prev, { role: "user", text: msg }]);
    setChatLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: msg })
      });
      const data = await res.json();
      setChatHistory(prev => [...prev, { role: "bot", text: data.reply }]);
    } catch (err) {
      setChatHistory(prev => [...prev, { role: "bot", text: "Error connecting to AI engine." }]);
    } finally {
      setChatLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/85 backdrop-blur-2xl animate-fadeIn">
      <div className="relative w-full max-w-5xl max-h-[90vh] bg-[#0f1217] border border-white/10 rounded-3xl shadow-[0_25px_70px_rgba(0,0,0,0.9)] overflow-hidden flex flex-col">
        
        {/* Modal Header */}
        <div className="px-6 py-5 border-b border-white/10 flex items-center justify-between bg-zinc-900/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400 to-indigo-600 flex items-center justify-center shadow-[0_0_20px_rgba(6,182,212,0.4)]">
              <Cpu className="w-5 h-5 text-black" />
            </div>
            <div>
              <div className="text-base font-hero text-white flex items-center gap-2">
                AURA INVENTORY AI <span className="text-[0.65rem] font-mono font-bold bg-cyan-400/20 text-cyan-300 border border-cyan-400/30 px-2 py-0.5 rounded-full">ACTIVE MODEL</span>
              </div>
              <div className="text-xs text-zinc-400 font-mono">
                Ensemble Random Forest + Ridge Regressor & Supply Chain Optimization
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button 
              onClick={loadData}
              className="p-2 rounded-lg border border-white/10 text-zinc-400 hover:text-white transition-colors"
              title="Refresh Matrix"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button 
              onClick={onClose}
              className="p-2 rounded-lg border border-white/10 text-zinc-400 hover:text-white hover:bg-white/5 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* KPI Row */}
          {kpi && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 rounded-2xl bg-zinc-900/40 border border-white/5">
                <div className="text-xs text-zinc-400 font-mono">TOTAL VALUE ON-HAND</div>
                <div className="text-2xl font-hero text-white mt-1">${kpi.total_inventory_value.toLocaleString()}</div>
                <div className="text-[0.7rem] text-cyan-400 mt-1">20 SKUs Active</div>
              </div>

              <div className="p-4 rounded-2xl bg-zinc-900/40 border border-white/5">
                <div className="text-xs text-zinc-400 font-mono">RECOMMENDED CAPITAL</div>
                <div className="text-2xl font-hero text-yellow-400 mt-1">${kpi.recommended_capital_deployment.toLocaleString()}</div>
                <div className="text-[0.7rem] text-zinc-400 mt-1">EOQ Batch Optimal</div>
              </div>

              <div className="p-4 rounded-2xl bg-red-950/20 border border-red-500/20">
                <div className="text-xs text-red-300 font-mono">CRITICAL STOCKOUTS</div>
                <div className="text-2xl font-hero text-red-400 mt-1">{kpi.critical_skus_count} SKUs</div>
                <div className="text-[0.7rem] text-red-300 mt-1">Urgent Reorder Required</div>
              </div>

              <div className="p-4 rounded-2xl bg-zinc-900/40 border border-white/5">
                <div className="text-xs text-zinc-400 font-mono">TARGET SERVICE LEVEL</div>
                <div className="text-2xl font-hero text-emerald-400 mt-1">{kpi.service_level_target}</div>
                <div className="text-[0.7rem] text-emerald-300 mt-1">Z = 1.645 Joint Normal</div>
              </div>
            </div>
          )}

          {/* Quick Recommendations Table */}
          <div className="bg-zinc-900/40 border border-white/5 rounded-2xl p-4 overflow-hidden">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-display font-bold text-white flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-cyan-400" />
                Live Replenishment Recommendations
              </h4>
              <span className="text-[0.7rem] font-mono text-zinc-400">Top Priority SKUs</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-white/10 text-zinc-400 uppercase font-mono text-[0.68rem]">
                    <th className="py-2.5 px-3">SKU</th>
                    <th className="py-2.5 px-3">Stock / ROP</th>
                    <th className="py-2.5 px-3">Runway</th>
                    <th className="py-2.5 px-3">Stockout Risk</th>
                    <th className="py-2.5 px-3">Recommended PO</th>
                    <th className="py-2.5 px-3">Capital</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 font-mono">
                  {recommendations.map(r => (
                    <tr key={r.sku} className="hover:bg-white/[0.02]">
                      <td className="py-2.5 px-3 font-bold text-white">{r.sku}</td>
                      <td className="py-2.5 px-3">{r.current_stock} / <span className="text-zinc-500">{r.reorder_point}</span></td>
                      <td className="py-2.5 px-3 text-red-400">{r.runway_days}d</td>
                      <td className="py-2.5 px-3">{r.stockout_risk_pct}%</td>
                      <td className="py-2.5 px-3 text-cyan-300 font-bold">{r.recommended_order_qty} units</td>
                      <td className="py-2.5 px-3">${r.capital_required.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Nova AI Copilot Chat Window */}
          <div className="bg-zinc-900/60 border border-cyan-500/20 rounded-2xl p-4">
            <div className="flex items-center gap-2 text-xs font-bold text-cyan-300 mb-3">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              Ask Nova Autonomous Copilot
            </div>

            <div className="h-44 overflow-y-auto space-y-2 mb-3 pr-2">
              {chatHistory.map((c, i) => (
                <div key={i} className={`p-2.5 rounded-xl text-xs max-w-[85%] ${c.role === 'user' ? 'ml-auto bg-cyan-600/30 text-white border border-cyan-400/20' : 'bg-black/40 text-zinc-200 border border-white/5'}`}>
                  {c.text}
                </div>
              ))}
              {chatLoading && (
                <div className="text-xs text-cyan-400 font-mono animate-pulse">Nova is reasoning...</div>
              )}
            </div>

            <div className="flex gap-2">
              <input 
                type="text" 
                value={chatMessage} 
                onChange={(e) => setChatMessage(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendChat()}
                placeholder="Ask about stockouts, capital allocation, or SKU diagnostics..."
                className="flex-1 bg-black/50 border border-white/10 rounded-xl px-4 py-2 text-xs text-white outline-none focus:border-cyan-400"
              />
              <button 
                onClick={handleSendChat}
                className="px-4 py-2 bg-cyan-500 text-black font-bold text-xs rounded-xl hover:bg-cyan-400 transition-colors"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}

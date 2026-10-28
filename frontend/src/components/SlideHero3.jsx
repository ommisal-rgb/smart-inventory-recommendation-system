import React, { useState } from 'react';
import Card3D from './Card3D';
import LiquidChrome3D from './LiquidChrome3D';
import { ArrowUpRight, Sparkles, ChevronRight, Cpu } from 'lucide-react';

export default function SlideHero3({ onOpenProject, onOpenAiModal }) {
  const [activeService, setActiveService] = useState(0);

  const services = [
    {
      num: "01",
      title: "Web Design & Development",
      desc: "Full-stack avant-garde digital flagships engineered with React, WebGL, 3D physics, and fluid micro-animations."
    },
    {
      num: "02",
      title: "Advertising and Marketing Campaigns",
      desc: "Data-driven creative strategies converting brand vision into measurable commercial market momentum."
    },
    {
      num: "03",
      title: "Creative Consulting and Development",
      desc: "End-to-end digital architecture, user psychology, and bespoke creative engineering for enterprise pioneers."
    },
    {
      num: "04",
      title: "Branding and Identity Design",
      desc: "Timeless visual systems, generative typographic codes, and tactile luxury brand guidelines."
    },
    {
      num: "05",
      title: "AI Predictive Systems & Inventory Intelligence",
      desc: "Veteran ensemble machine learning demand forecasting (Random Forest + Ridge) with operations research ROP/EOQ optimization.",
      isAi: true
    }
  ];

  return (
    <div className="slide-container">
      
      {/* Background Giant Typography */}
      <div className="relative pt-4 pb-4">
        
        {/* Background Lightning Polygon */}
        <div className="lightning-star-poly hidden md:block" />

        {/* Foreground Massive Liquid Chrome Sculpture */}
        <div className="absolute right-[-20px] md:right-[3%] top-[-20px] w-[240px] sm:w-[320px] md:w-[440px] h-[240px] sm:h-[320px] md:h-[440px] z-30 pointer-events-auto">
          <LiquidChrome3D scale={1.15} rotateSpeed={0.007} />
        </div>

        <div className="relative z-10">
          <h1 className="crebiz-title font-hero text-zinc-100/95">
            CREBIZ
          </h1>
          
          <div className="flex items-center gap-3 mt-1">
            <h2 className="font-hero text-2xl sm:text-4xl text-white tracking-tight">
              UNIQUE IDEAS FOR YOUR BUSINESS.
            </h2>
            <div className="w-4 h-4 rounded-full bg-yellow-400 shadow-[0_0_15px_rgba(250,204,21,0.8)]" />
          </div>
        </div>

      </div>

      {/* Main Content: Services Showcase & Floating Chrome Elements */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 my-6 z-20 items-start">
        
        {/* Left Side: Secondary Floating Metallic Sculpture */}
        <div className="lg:col-span-4 hidden lg:flex flex-col gap-4">
          <div className="w-full h-[220px] relative rounded-2xl bg-zinc-900/40 border border-white/10 overflow-hidden flex items-center justify-center backdrop-blur-md">
            <LiquidChrome3D scale={0.7} rotateSpeed={0.015} />
            <div className="absolute bottom-3 left-4 text-[0.7rem] font-mono text-zinc-400 uppercase tracking-widest">
              Fluid Metallurgy v3.8
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-zinc-900/30 border border-white/10 text-xs text-zinc-400 leading-relaxed">
            <div className="font-bold text-white mb-1 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
              Algorithmic Craftsmanship
            </div>
            Every digital deployment balances sculptural brutalist beauty with rigorous mathematical utility and machine learning precision.
          </div>
        </div>

        {/* Right Side: Interactive Numbered Services List */}
        <div className="lg:col-span-8 flex flex-col gap-2">
          {services.map((srv, idx) => {
            const isActive = activeService === idx;
            return (
              <div
                key={srv.num}
                onMouseEnter={() => setActiveService(idx)}
                onClick={() => {
                  if (srv.isAi) onOpenAiModal();
                  else setActiveService(idx);
                }}
                className={`service-item-row group relative overflow-hidden transition-all duration-300 ${
                  isActive 
                    ? 'bg-zinc-900/80 border-yellow-400/40 shadow-[0_10px_30px_rgba(0,0,0,0.5)]' 
                    : 'bg-zinc-900/30 border-white/5 hover:border-white/20'
                }`}
              >
                {/* Active Indicator Bar */}
                {isActive && (
                  <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-yellow-400 shadow-[0_0_12px_rgba(250,204,21,0.8)]" />
                )}

                <div className="flex flex-col sm:flex-row sm:items-center justify-between w-full gap-2">
                  <div className="flex items-center">
                    <span className={`service-number ${isActive ? 'text-yellow-400 font-bold' : ''}`}>
                      {srv.num}.
                    </span>
                    <span className="service-title group-hover:text-yellow-300 transition-colors">
                      {srv.title}
                    </span>
                    {srv.isAi && (
                      <span className="ml-3 px-2 py-0.5 rounded-full text-[0.65rem] font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 flex items-center gap-1">
                        <Cpu className="w-3 h-3 text-cyan-400" /> AI Powered
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 text-zinc-400 group-hover:text-white transition-colors">
                    <span className="text-xs font-mono hidden sm:inline-block">
                      {srv.isAi ? "Launch Engine" : "Explore"}
                    </span>
                    <ArrowUpRight className={`w-4 h-4 transition-transform ${isActive ? 'translate-x-1 -translate-y-1 text-yellow-400' : ''}`} />
                  </div>
                </div>

                {/* Expanded Description on Hover */}
                {isActive && (
                  <div className="mt-3 pt-3 border-t border-white/10 text-xs text-zinc-300 max-w-2xl leading-relaxed animate-fadeIn">
                    {srv.desc}
                  </div>
                )}
              </div>
            );
          })}
        </div>

      </div>

      {/* Bottom Horizontal Creative Team Banner */}
      <div className="relative mt-2 rounded-3xl overflow-hidden bg-zinc-900/50 border border-white/10 p-6 backdrop-blur-xl z-20">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <img 
              src="https://images.unsplash.com/photo-1509631179647-0177331693ae?q=80&w=300&auto=format&fit=crop" 
              alt="Creative Team" 
              className="w-16 h-16 rounded-2xl object-cover border border-white/10"
            />
            <div>
              <div className="text-xs font-mono uppercase tracking-widest text-yellow-400">Collaborative Force</div>
              <div className="text-base font-display font-bold text-white">Award-Winning Creative Engineers & Data Scientists</div>
              <div className="text-xs text-zinc-400">Deploying world-class digital experiences across North America, Europe, & Asia.</div>
            </div>
          </div>

          <button 
            onClick={onOpenAiModal}
            className="flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-yellow-400 to-amber-500 text-black font-display font-bold text-xs uppercase tracking-wider hover:scale-105 transition-all shadow-[0_0_25px_rgba(250,204,21,0.4)] shrink-0 cursor-pointer"
          >
            <span>Open Predictive AI Matrix</span>
            <ArrowUpRight className="w-4 h-4" />
          </button>
        </div>
      </div>

    </div>
  );
}

import React, { useState } from 'react';
import { Zap, Target, ArrowUpRight, Cpu, ChevronDown, Menu, X } from 'lucide-react';

export default function Navbar({ onSelectSlide, onOpenAiModal }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full px-6 md:px-12 py-4 bg-[#0a0b0d]/85 backdrop-blur-xl border-b border-white/[0.06] transition-all">
      <div className="max-w-[1700px] mx-auto flex items-center justify-between">
        
        {/* Brand Logo */}
        <div 
          onClick={() => onSelectSlide(0)} 
          className="flex items-center gap-2 cursor-pointer group select-none"
        >
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-yellow-400 to-amber-600 flex items-center justify-center shadow-[0_0_20px_rgba(250,204,21,0.5)] transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6">
            <Zap className="w-5 h-5 text-black fill-black" />
          </div>
          <span className="font-hero text-2xl tracking-tighter text-white font-extrabold">
            Cre<span className="text-yellow-400">Biz</span>
          </span>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-8 font-display text-[0.85rem] font-semibold tracking-wide text-zinc-300">
          <button 
            onClick={() => onSelectSlide(0)} 
            className="hover:text-yellow-400 transition-colors cursor-pointer"
          >
            Home
          </button>
          
          <button 
            onClick={() => onSelectSlide(1)} 
            className="hover:text-yellow-400 transition-colors cursor-pointer"
          >
            About
          </button>

          <div className="relative group">
            <button 
              onClick={() => onSelectSlide(2)} 
              className="flex items-center gap-1 hover:text-yellow-400 transition-colors cursor-pointer"
            >
              Services <ChevronDown className="w-3.5 h-3.5 opacity-60 group-hover:rotate-180 transition-transform" />
            </button>
          </div>

          <button 
            onClick={() => onSelectSlide(0)} 
            className="hover:text-yellow-400 transition-colors cursor-pointer"
          >
            Projects
          </button>

          {/* Integrated AI Inventory Engine Feature */}
          <button 
            onClick={onOpenAiModal}
            className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-400/30 text-cyan-300 hover:bg-cyan-500/20 hover:border-cyan-400 transition-all shadow-[0_0_15px_rgba(6,182,212,0.25)] cursor-pointer"
          >
            <Cpu className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
            <span>AI Engine</span>
            <span className="text-[0.65rem] font-mono uppercase bg-cyan-400/20 px-1.5 py-0.2 rounded text-cyan-200">Live</span>
          </button>
        </nav>

        {/* Right Action Icons & Button */}
        <div className="hidden md:flex items-center gap-5">
          <div className="flex items-center gap-3 text-xs font-mono tracking-widest text-zinc-400 uppercase border-r border-white/10 pr-5">
            <span className="hover:text-white cursor-pointer transition-colors">Dribbble</span>
            <span className="hover:text-white cursor-pointer transition-colors">Behance</span>
          </div>

          <button 
            onClick={() => alert("Crosshair Target Mode: Calibrated to Precision Design & Intelligence")}
            className="w-9 h-9 rounded-full border border-white/10 flex items-center justify-center text-zinc-400 hover:text-yellow-400 hover:border-yellow-400/50 transition-all cursor-pointer"
            title="Calibrate Target"
          >
            <Target className="w-4 h-4" />
          </button>

          <a
            href="/dashboard"
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 border border-emerald-400/40 text-emerald-300 font-display font-bold text-xs tracking-wider uppercase hover:bg-emerald-400 hover:text-black hover:scale-105 transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)] cursor-pointer no-underline"
            title="Open Full Smart Inventory Recommendation Dashboard"
          >
            <span>📊 Smart Inventory Dashboard</span>
            <ArrowUpRight className="w-4 h-4" />
          </a>

          <button 
            onClick={onOpenAiModal}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-white text-black font-display font-bold text-xs tracking-wider uppercase hover:bg-yellow-400 hover:scale-105 transition-all shadow-[0_4px_20px_rgba(255,255,255,0.15)] cursor-pointer"
            title="Quick AI Prediction Copilot Modal"
          >
            <span>AI Copilot</span>
            <Zap className="w-3.5 h-3.5 fill-black" />
          </button>
        </div>

        {/* Mobile Hamburger Button */}
        <button 
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="lg:hidden w-10 h-10 rounded-lg border border-white/10 flex items-center justify-center text-white"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>

      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="lg:hidden mt-4 pt-4 border-t border-white/10 flex flex-col gap-3 font-display font-semibold text-zinc-200">
          <button onClick={() => { onSelectSlide(0); setMobileMenuOpen(false); }} className="text-left py-2 hover:text-yellow-400">Home</button>
          <button onClick={() => { onSelectSlide(1); setMobileMenuOpen(false); }} className="text-left py-2 hover:text-yellow-400">About Studio</button>
          <button onClick={() => { onSelectSlide(2); setMobileMenuOpen(false); }} className="text-left py-2 hover:text-yellow-400">Services</button>
          <button onClick={() => { onOpenAiModal(); setMobileMenuOpen(false); }} className="text-left py-2 text-cyan-400 flex items-center gap-2">
            <Cpu className="w-4 h-4" /> AURA Inventory AI Platform
          </button>
        </div>
      )}
    </header>
  );
}

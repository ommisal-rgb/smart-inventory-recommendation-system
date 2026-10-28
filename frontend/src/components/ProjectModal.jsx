import React from 'react';
import { X, ExternalLink, Sparkles, CheckCircle2 } from 'lucide-react';

export default function ProjectModal({ project, onClose, onLaunchAi }) {
  if (!project) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/85 backdrop-blur-2xl animate-fadeIn">
      <div className="relative w-full max-w-3xl bg-[#0f1217] border border-white/10 rounded-3xl shadow-[0_25px_70px_rgba(0,0,0,0.9)] overflow-hidden flex flex-col">
        
        {/* Modal Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 z-20 w-10 h-10 rounded-full bg-black/60 border border-white/20 text-white flex items-center justify-center hover:bg-yellow-400 hover:text-black transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Hero Image */}
        <div className="relative w-full h-[320px] overflow-hidden">
          <img 
            src={project.image} 
            alt={project.title} 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0f1217] via-transparent to-transparent" />
          <div className="absolute bottom-6 left-6 right-6">
            <span className="text-xs font-mono font-bold tracking-widest uppercase bg-yellow-400/20 text-yellow-300 border border-yellow-400/30 px-3 py-1 rounded-full">
              {project.category}
            </span>
            <h2 className="text-2xl sm:text-3xl font-hero text-white mt-2">
              {project.title}
            </h2>
          </div>
        </div>

        {/* Content Details */}
        <div className="p-6 sm:p-8 space-y-6">
          <p className="text-sm text-zinc-300 leading-relaxed font-body">
            {project.desc}
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-4 border-t border-white/10 text-xs font-mono">
            <div>
              <div className="text-zinc-500 uppercase">Year / Cycle</div>
              <div className="text-white font-bold mt-1">2026 / Q4</div>
            </div>
            <div>
              <div className="text-zinc-500 uppercase">Disciplines</div>
              <div className="text-white font-bold mt-1">WebGL, AI, 3D</div>
            </div>
            <div>
              <div className="text-zinc-500 uppercase">Client Status</div>
              <div className="text-emerald-400 font-bold mt-1 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Deployed
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-4 pt-4">
            <button 
              onClick={() => { onClose(); onLaunchAi(); }}
              className="flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-yellow-400 to-amber-500 text-black font-display font-bold text-xs uppercase tracking-wider hover:scale-105 transition-all shadow-[0_0_25px_rgba(250,204,21,0.3)] cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              <span>Launch Associated AI Model</span>
            </button>
            <button 
              onClick={onClose}
              className="px-6 py-3 rounded-full border border-white/20 text-white font-display font-bold text-xs uppercase tracking-wider hover:bg-white/10 transition-all cursor-pointer"
            >
              Close Showcase
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}

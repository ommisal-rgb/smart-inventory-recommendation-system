import React from 'react';
import Card3D from './Card3D';
import LiquidChrome3D from './LiquidChrome3D';
import { ArrowUpRight, CheckCircle2 } from 'lucide-react';

export default function SlideHero2({ onOpenProject, onOpenAiModal }) {
  return (
    <div className="slide-container">
      
      {/* Top Header Section */}
      <div className="relative pt-6 pb-6">
        
        {/* Background Lightning Polygon */}
        <div className="lightning-star-poly hidden md:block" />

        {/* Floating 3D Liquid Chrome Sculpture */}
        <div className="absolute right-[-10px] md:right-[4%] top-[-30px] w-[200px] sm:w-[260px] md:w-[340px] h-[200px] sm:h-[260px] md:h-[340px] z-30 pointer-events-auto">
          <LiquidChrome3D scale={0.95} rotateSpeed={0.012} />
        </div>

        {/* Floating Torus Ring */}
        <div className="absolute right-[24%] top-[10px] w-24 h-24 rounded-full border-[16px] border-emerald-950/40 pointer-events-none transform rotate-12 hidden lg:block" />

        <div className="relative z-10">
          <h1 className="crebiz-title font-hero">
            CREBIZ
          </h1>
          <h2 className="font-hero text-2xl sm:text-4xl text-zinc-300 tracking-tight mt-1">
            A BRAND DESIGN STUDIO.
          </h2>

          {/* Subtext and Founder Badge */}
          <div className="flex flex-wrap items-center gap-6 mt-6">
            <p className="font-body text-xs text-zinc-400 max-w-sm leading-relaxed">
              We craft avant-garde visual identities, WebGL digital flagships, and autonomous intelligent systems for category leaders.
            </p>
            
            <div className="flex items-center gap-3 bg-zinc-900/60 border border-white/10 px-4 py-2 rounded-2xl backdrop-blur-md">
              <img 
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=300&auto=format&fit=crop" 
                alt="Deanna Fox" 
                className="w-10 h-10 rounded-full object-cover border border-yellow-400/50"
              />
              <div>
                <div className="text-xs font-bold text-white flex items-center gap-1">
                  <span>Deanna Fox</span>
                  <CheckCircle2 className="w-3 h-3 text-yellow-400" />
                </div>
                <div className="text-[0.65rem] text-zinc-400 font-mono">Founder & CEO</div>
                <div className="font-script text-base text-yellow-300 -mt-1">Deanna Fox</div>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Center Layout: Surreal Liquid Portrait & Call to Action Banner */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center my-4 z-20">
        
        {/* Surreal Black & White Flowing Face Morph Artwork */}
        <div className="lg:col-span-5">
          <Card3D 
            className="h-[340px] md:h-[400px]"
            onClick={() => onOpenProject({
              title: "Metamorphic Fluid Portraiture",
              category: "Generative Art & Human Form",
              image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=1000&auto=format&fit=crop",
              desc: "Monochrome study exploring identity fluidity through algorithmic distortion and fluid topology."
            })}
            tagText="Portraiture / Metamorphic Form"
          >
            <div className="relative w-full h-full bg-[#121418] flex items-center justify-center overflow-hidden">
              <img 
                src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=1000&auto=format&fit=crop" 
                alt="Liquid face artwork" 
                className="w-full h-full object-cover filter grayscale contrast-125 hover:filter-none transition-all duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
              <div className="absolute bottom-5 left-5 right-5 flex justify-between items-end">
                <div>
                  <div className="text-[0.65rem] font-mono uppercase tracking-widest text-yellow-400">01 / Concept</div>
                  <div className="text-sm font-display font-bold text-white">A DESIGN CREATED WITH PASSION.</div>
                </div>
              </div>
            </div>
          </Card3D>
        </div>

        {/* Call to Action Section with Large Circular Button */}
        <div className="lg:col-span-7 flex flex-col md:flex-row items-center justify-between gap-8 bg-zinc-900/40 border border-white/10 rounded-3xl p-8 backdrop-blur-xl">
          <div className="max-w-md">
            <span className="text-[0.7rem] font-mono tracking-widest text-yellow-400 uppercase">Portfolio Direction</span>
            <h3 className="font-hero text-2xl sm:text-4xl text-white tracking-tight mt-2 leading-tight">
              OUR AGENCY IS HERE FOR YOU TO WORK
            </h3>
            <p className="text-xs text-zinc-400 mt-3 leading-relaxed">
              Transforming complex business logic and supply chain systems into sublime digital artifacts. Explore full case studies and live prediction engines.
            </p>
          </div>

          {/* Magnetic Circular "View More ↗" Button */}
          <button 
            onClick={onOpenAiModal}
            className="btn-circle-action group shrink-0"
            title="Launch Full Platform"
          >
            <span className="group-hover:text-black">View More</span>
            <ArrowUpRight className="w-5 h-5 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
          </button>
        </div>

      </div>

      {/* Bottom Secondary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 z-20">
        
        {/* Crystal Mirror Mask Portrait */}
        <Card3D 
          className="h-[200px] md:h-[230px]"
          onClick={() => onOpenProject({
            title: "Prismatic Identity",
            category: "Cybernetic Visuals",
            image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=1000&auto=format&fit=crop",
            desc: "Geometric mirror facets reflecting multifaceted consumer personas."
          })}
          tagText="Prismatic / Cybernetic"
        >
          <img 
            src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=1000&auto=format&fit=crop" 
            alt="Crystal mask portrait" 
            className="w-full h-full object-cover"
          />
        </Card3D>

        {/* Curved Architectural Paper Texture */}
        <Card3D 
          className="h-[200px] md:h-[230px]"
          onClick={() => onOpenProject({
            title: "Tangible Paper Curvatures",
            category: "Physical & Digital Hybrid",
            image: "https://images.unsplash.com/photo-1541701494587-cb58502866ab?q=80&w=1000&auto=format&fit=crop",
            desc: "High-tactile surface simulations with vibrant red gradient subsurface scattering."
          })}
          tagText="Curvatures / Tangible Red"
        >
          <img 
            src="https://images.unsplash.com/photo-1541701494587-cb58502866ab?q=80&w=1000&auto=format&fit=crop" 
            alt="Red curved paper" 
            className="w-full h-full object-cover"
          />
        </Card3D>

      </div>

    </div>
  );
}

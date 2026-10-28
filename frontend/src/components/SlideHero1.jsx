import React from 'react';
import Card3D from './Card3D';
import LiquidChrome3D from './LiquidChrome3D';
import { Sparkles, Layers, ArrowUpRight } from 'lucide-react';

export default function SlideHero1({ onOpenProject, onOpenAiModal }) {
  return (
    <div className="slide-container">
      
      {/* Hero Headline Section */}
      <div className="relative pt-6 pb-8">
        
        {/* Background Geometric Lightning Star Polygon */}
        <div className="lightning-star-poly hidden md:block" />

        {/* Floating Ambient Torus Element */}
        <div className="absolute right-[22%] top-[-10px] w-28 h-28 rounded-full border-[18px] border-cyan-950/40 shadow-[0_0_35px_rgba(6,182,212,0.15)] pointer-events-none transform -rotate-45 hidden lg:block animate-pulse" />

        {/* Floating 3D Liquid Chrome Sculpture (Hero Feature) */}
        <div className="absolute right-[-20px] md:right-[2%] top-[-40px] md:top-[-20px] w-[220px] sm:w-[280px] md:w-[380px] h-[220px] sm:h-[280px] md:h-[380px] z-30 pointer-events-auto">
          <LiquidChrome3D scale={1.05} rotateSpeed={0.009} />
        </div>

        {/* Giant Hero Wordmark */}
        <div className="relative z-10">
          <h1 className="crebiz-title font-hero">
            CREBIZ
          </h1>
          
          <div className="flex flex-wrap items-baseline gap-3 mt-1 md:mt-[-15px]">
            <h2 className="font-hero text-3xl sm:text-5xl md:text-6xl text-white tracking-tight">
              WEB DESIGN
            </h2>
            <div className="sparks-doodle">
              ✨
            </div>
          </div>

          <p className="font-mono text-xs sm:text-sm tracking-widest text-zinc-400 uppercase mt-4 max-w-xl">
            GREAT TO MEET YOU! CHECK OUT MY WORK & INTELLIGENT SYSTEMS
          </p>
        </div>

      </div>

      {/* Grid of 6 Interactive Portfolio & Creative Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6 mt-4 z-20">
        
        {/* Card 1: Fashion girl on concrete stairs */}
        <Card3D 
          className="h-[260px] md:h-[310px]"
          onClick={() => onOpenProject({
            title: "Urban Motion & Creative Layers",
            category: "Graphic Design & Fashion",
            image: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1000&auto=format&fit=crop",
            desc: "Experimental fashion editorial blending architectural geometry with streetwear layers and interactive typography."
          })}
          tagText="Layers / Graphic design. Creative"
          tagIcon={<Layers className="w-3.5 h-3.5" />}
        >
          <img 
            src="https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1000&auto=format&fit=crop" 
            alt="Fashion portrait sitting on stairs" 
            className="w-full h-full object-cover"
          />
        </Card3D>

        {/* Card 2: Liquid Chrome Metallic Blob on Pedestal */}
        <Card3D 
          className="h-[260px] md:h-[310px] bg-gradient-to-b from-zinc-800/40 to-zinc-950/80"
          onClick={() => onOpenProject({
            title: "Liquid Mercury Kinetic Study",
            category: "3D Motion & Specular Physics",
            image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1000&auto=format&fit=crop",
            desc: "Specular reflections and raytraced surface tension modeling in interactive WebGL environments."
          })}
          tagText="Liquid Chrome / 3D Specular"
          tagIcon={<Sparkles className="w-3.5 h-3.5" />}
        >
          <img 
            src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1000&auto=format&fit=crop" 
            alt="Liquid chrome sculpture" 
            className="w-full h-full object-cover"
          />
        </Card3D>

        {/* Card 3: Minimalist Workspace with Laptop */}
        <Card3D 
          className="h-[260px] md:h-[310px]"
          onClick={() => onOpenProject({
            title: "Minimal Studio Workspace & Codebase",
            category: "Workspace Architecture",
            image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?q=80&w=1000&auto=format&fit=crop",
            desc: "Executive engineering station configured for high-frequency predictive modeling and creative design."
          })}
          tagText="Workspace / Engineering Core"
          tagIcon={<ArrowUpRight className="w-3.5 h-3.5" />}
        >
          <img 
            src="https://images.unsplash.com/photo-1517336714731-489689fd1ca8?q=80&w=1000&auto=format&fit=crop" 
            alt="Desk with laptop and plant" 
            className="w-full h-full object-cover"
          />
        </Card3D>

        {/* Card 4: Editorial Fashion Duo holding frame */}
        <Card3D 
          className="h-[220px] md:h-[260px]"
          onClick={() => onOpenProject({
            title: "Avant-Garde Studio Portraiture",
            category: "Brand Campaign",
            image: "https://images.unsplash.com/photo-1509631179647-0177331693ae?q=80&w=1000&auto=format&fit=crop",
            desc: "High-contrast editorial direction exploring human form, physical frames, and digital screens."
          })}
          tagText="Editorial / Creative Duo"
        >
          <img 
            src="https://images.unsplash.com/photo-1509631179647-0177331693ae?q=80&w=1000&auto=format&fit=crop" 
            alt="Fashion duo with screen" 
            className="w-full h-full object-cover"
          />
        </Card3D>

        {/* Card 5: Cobalt Blue Silk Texture */}
        <Card3D 
          className="h-[220px] md:h-[260px]"
          onClick={() => onOpenProject({
            title: "Deep Cobalt Chromatics",
            category: "Material & Surface Dynamics",
            image: "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?q=80&w=1000&auto=format&fit=crop",
            desc: "Fluid drape and micro-wrinkle analysis translated into interactive web shaders."
          })}
          tagText="Chromatics / Cobalt Fabric"
        >
          <img 
            src="https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?q=80&w=1000&auto=format&fit=crop" 
            alt="Cobalt blue fabric" 
            className="w-full h-full object-cover"
          />
        </Card3D>

        {/* Card 6: Red Canyon Organic Waves */}
        <Card3D 
          className="h-[220px] md:h-[260px]"
          onClick={() => onOpenProject({
            title: "Sedimentary Waveform Curvature",
            category: "Organic Geometry",
            image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=1000&auto=format&fit=crop",
            desc: "Nature's parametric patterns informing continuous generative interfaces."
          })}
          tagText="Topography / Natural Curvature"
        >
          <img 
            src="https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=1000&auto=format&fit=crop" 
            alt="Red canyon curves" 
            className="w-full h-full object-cover"
          />
        </Card3D>

      </div>

    </div>
  );
}

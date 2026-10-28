import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import SlideHero1 from './components/SlideHero1';
import SlideHero2 from './components/SlideHero2';
import SlideHero3 from './components/SlideHero3';
import AiPredictionModal from './components/AiPredictionModal';
import ProjectModal from './components/ProjectModal';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function App() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [selectedProject, setSelectedProject] = useState(null);
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);

  const totalSlides = 3;

  // Slide navigation handlers
  const handlePrev = () => {
    setCurrentSlide(prev => (prev === 0 ? totalSlides - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentSlide(prev => (prev === totalSlides - 1 ? 0 : prev + 1));
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (isAiModalOpen || selectedProject) return;
      if (e.key === 'ArrowLeft') handlePrev();
      if (e.key === 'ArrowRight') handleNext();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isAiModalOpen, selectedProject]);

  return (
    <div className="relative min-h-screen bg-[#0a0b0d] text-white overflow-hidden select-none">
      
      {/* Ambient Lighting & Luxury Atmospheric Gradients */}
      <div className="ambient-glow-wrapper" />
      <div className="grain-overlay" />

      {/* Top Navigation */}
      <Navbar 
        onSelectSlide={(idx) => setCurrentSlide(idx)}
        onOpenAiModal={() => setIsAiModalOpen(true)}
      />

      {/* Carousel Main Container */}
      <main className="relative z-10 w-full min-h-[calc(100vh-80px)] flex flex-col justify-between">
        {currentSlide === 0 && (
          <SlideHero1 
            onOpenProject={(proj) => setSelectedProject(proj)} 
            onOpenAiModal={() => setIsAiModalOpen(true)}
          />
        )}

        {currentSlide === 1 && (
          <SlideHero2 
            onOpenProject={(proj) => setSelectedProject(proj)} 
            onOpenAiModal={() => setIsAiModalOpen(true)}
          />
        )}

        {currentSlide === 2 && (
          <SlideHero3 
            onOpenProject={(proj) => setSelectedProject(proj)} 
            onOpenAiModal={() => setIsAiModalOpen(true)}
          />
        )}
      </main>

      {/* Left Circular Navigation Button (<) matching reference images */}
      <button 
        onClick={handlePrev}
        className="carousel-nav-btn prev hidden sm:flex"
        title="Previous Showcase View"
        aria-label="Previous Slide"
      >
        <ChevronLeft className="w-6 h-6 stroke-[2.5]" />
      </button>

      {/* Right Circular Navigation Button (>) matching reference images */}
      <button 
        onClick={handleNext}
        className="carousel-nav-btn next hidden sm:flex"
        title="Next Showcase View"
        aria-label="Next Slide"
      >
        <ChevronRight className="w-6 h-6 stroke-[2.5]" />
      </button>

      {/* Slide Indicator Counter at Bottom-Left */}
      <div className="slide-indicator">
        <strong>0{currentSlide + 1}</strong>
        <span>/</span>
        <span>0{totalSlides}</span>
        <div className="flex gap-1.5 ml-3">
          {[0, 1, 2].map((idx) => (
            <button
              key={idx}
              onClick={() => setCurrentSlide(idx)}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                currentSlide === idx 
                  ? 'w-7 bg-yellow-400' 
                  : 'w-2 bg-white/20 hover:bg-white/40'
              }`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
      </div>

      {/* Direct Smart Inventory Dashboard Switcher */}
      <div className="fixed bottom-6 right-8 z-40 hidden md:flex items-center gap-3 bg-zinc-900/90 border border-emerald-400/40 rounded-full px-4 py-2 backdrop-blur-xl shadow-[0_10px_30px_rgba(0,0,0,0.8)]">
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
        <span className="text-xs font-mono text-zinc-300">Smart Inventory Engine:</span>
        <a 
          href="/dashboard"
          className="text-xs font-display font-bold text-emerald-300 hover:text-white flex items-center gap-1 transition-colors no-underline"
        >
          <span>Open Full Dashboard</span>
          <span>↗</span>
        </a>
      </div>

      {/* Modals */}
      <AiPredictionModal 
        isOpen={isAiModalOpen} 
        onClose={() => setIsAiModalOpen(false)} 
      />

      <ProjectModal 
        project={selectedProject} 
        onClose={() => setSelectedProject(null)} 
        onLaunchAi={() => setIsAiModalOpen(true)}
      />

    </div>
  );
}

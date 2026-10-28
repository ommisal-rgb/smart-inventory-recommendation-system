import React, { useRef, useState } from 'react';

/**
 * Card3D: Interactive perspective tilt card with dynamic specular reflection glare
 */
export default function Card3D({ 
  children, 
  className = "", 
  onClick, 
  tagText = null,
  tagIcon = null 
}) {
  const cardRef = useRef(null);
  const [style, setStyle] = useState({
    transform: "perspective(900px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)",
    glareX: 50,
    glareY: 50,
    glareOpacity: 0
  });

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = ((y - centerY) / centerY) * -9; // Max 9 deg tilt
    const rotateY = ((x - centerX) / centerX) * 9;

    const glareX = (x / rect.width) * 100;
    const glareY = (y / rect.height) * 100;

    setStyle({
      transform: `perspective(900px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) scale3d(1.03, 1.03, 1.03)`,
      glareX,
      glareY,
      glareOpacity: 0.28
    });
  };

  const handleMouseLeave = () => {
    setStyle({
      transform: "perspective(900px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)",
      glareX: 50,
      glareY: 50,
      glareOpacity: 0
    });
  };

  return (
    <div
      ref={cardRef}
      onClick={onClick}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`card-tilt group ${className}`}
      style={{
        transform: style.transform,
      }}
    >
      {/* Dynamic Specular Glare Reflection */}
      <div 
        className="pointer-events-none absolute inset-0 z-10 transition-opacity duration-300"
        style={{
          opacity: style.glareOpacity,
          background: `radial-gradient(circle at ${style.glareX}% ${style.glareY}%, rgba(255, 255, 255, 0.45) 0%, rgba(255, 255, 255, 0.08) 40%, transparent 75%)`,
        }}
      />

      {/* Main Content */}
      {children}

      {/* Optional Tag Pill */}
      {tagText && (
        <div className="card-tag-pill">
          {tagIcon && <span className="text-yellow-400">{tagIcon}</span>}
          <span>{tagText}</span>
        </div>
      )}
    </div>
  );
}

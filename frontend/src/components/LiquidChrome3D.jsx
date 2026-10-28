import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

/**
 * LiquidChrome3D: Interactive Three.js WebGL component
 * Recreates the glossy, reflective liquid chrome metallic sculpture from the reference images.
 * Smoothly morphs and responds to mouse cursor physics.
 */
export default function LiquidChrome3D({ 
  className = "", 
  scale = 1.0, 
  rotateSpeed = 0.008, 
  interactive = true 
}) {
  const mountRef = useRef(null);

  useEffect(() => {
    const currentMount = mountRef.current;
    if (!currentMount) return;

    const width = currentMount.clientWidth || 320;
    const height = currentMount.clientHeight || 320;

    // 1. Scene, Camera, Renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.z = 4.8;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.4;
    currentMount.appendChild(renderer.domElement);

    // 2. High-Gloss Metallic Material
    // Simulates an ultra-polished obsidian chrome liquid metal with sharp highlights
    const chromeMaterial = new THREE.MeshStandardMaterial({
      color: 0x111317,
      metalness: 0.98,
      roughness: 0.06,
      envMapIntensity: 2.2,
      flatShading: false,
    });

    // 3. Deformed Liquid Mesh (Torus Knot with organic proportions)
    const geometry = new THREE.TorusKnotGeometry(1.2 * scale, 0.44 * scale, 128, 32, 2, 3);
    const originalPositions = geometry.attributes.position.clone();
    const mesh = new THREE.Mesh(geometry, chromeMaterial);
    scene.add(mesh);

    // 4. Studio Lighting Rig to create specular liquid reflections
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);

    // Key Light (Crisp White specular highlight)
    const keyLight = new THREE.DirectionalLight(0xffffff, 3.5);
    keyLight.position.set(5, 8, 5);
    scene.add(keyLight);

    // Rim Light (Warm Gold subtle reflection from brand palette)
    const goldRim = new THREE.PointLight(0xfacc15, 4.0, 20);
    goldRim.position.set(-6, -4, 4);
    scene.add(goldRim);

    // Fill Light (Deep Cyan / Silver reflection)
    const fillLight = new THREE.DirectionalLight(0x06b6d4, 1.8);
    fillLight.position.set(0, -6, -4);
    scene.add(fillLight);

    // Top Specular Highlight
    const topSpot = new THREE.PointLight(0xffffff, 5.0, 15);
    topSpot.position.set(2, 6, 3);
    scene.add(topSpot);

    // 5. Mouse Interaction State
    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;

    const onPointerMove = (e) => {
      if (!interactive) return;
      const rect = currentMount.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / width) * 2 - 1;
      const y = -(((e.clientY - rect.top) / height) * 2 - 1);
      targetX = x * 0.8;
      targetY = y * 0.8;
    };

    window.addEventListener('pointermove', onPointerMove);

    // 6. Animation Loop with Liquid Surface Undulation
    let animationFrameId;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Smooth cursor parallax lag
      mouseX += (targetX - mouseX) * 0.05;
      mouseY += (targetY - mouseY) * 0.05;

      // Base rotation
      mesh.rotation.x = elapsedTime * rotateSpeed + mouseY * 0.5;
      mesh.rotation.y = elapsedTime * (rotateSpeed * 1.5) + mouseX * 0.6;
      mesh.rotation.z = Math.sin(elapsedTime * 0.5) * 0.15;

      // Organic liquid vertex wave warping
      const positionAttr = geometry.attributes.position;
      const orig = originalPositions.array;
      const pos = positionAttr.array;

      for (let i = 0; i < pos.length; i += 3) {
        const u = orig[i];
        const v = orig[i + 1];
        const w = orig[i + 2];
        const dist = Math.sqrt(u * u + v * v + w * w);
        const wave = Math.sin(dist * 3.5 - elapsedTime * 2.2) * 0.045;
        pos[i] = u + (u / dist) * wave;
        pos[i + 1] = v + (v / dist) * wave;
        pos[i + 2] = w + (w / dist) * wave;
      }
      positionAttr.needsUpdate = true;
      geometry.computeVertexNormals();

      renderer.render(scene, camera);
    };

    animate();

    // 7. Resize Observer
    const handleResize = () => {
      if (!currentMount) return;
      const newW = currentMount.clientWidth;
      const newH = currentMount.clientHeight;
      camera.aspect = newW / newH;
      camera.updateProjectionMatrix();
      renderer.setSize(newW, newH);
    };

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(currentMount);

    // Cleanup
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('pointermove', onPointerMove);
      resizeObserver.disconnect();
      if (currentMount && renderer.domElement) {
        currentMount.removeChild(renderer.domElement);
      }
      geometry.dispose();
      originalPositions.dispose();
      chromeMaterial.dispose();
      renderer.dispose();
    };
  }, [scale, rotateSpeed, interactive]);

  return (
    <div 
      ref={mountRef} 
      className={`relative pointer-events-auto select-none ${className}`}
      style={{ filter: "drop-shadow(0 15px 35px rgba(0, 0, 0, 0.85))" }}
    />
  );
}

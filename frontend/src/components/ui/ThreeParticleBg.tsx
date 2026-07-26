import { useEffect, useRef } from 'react';
import * as THREE from 'three';

export const ThreeParticleBg = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // 1. Scene & Setup
    const scene = new THREE.Scene();
    
    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;
    
    // 2. Camera Setup
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 100);
    camera.position.z = 2;

    // 3. Renderer Setup
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    containerRef.current.appendChild(renderer.domElement);

    // 4. Geometry Setup: 3500 points
    const particleCount = 3500;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount * 3; i += 3) {
      // Random coordinates in a 3D box range
      positions[i] = (Math.random() - 0.5) * 5;     // X
      positions[i + 1] = (Math.random() - 0.5) * 5; // Y
      positions[i + 2] = (Math.random() - 0.5) * 5; // Z
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    // 5. Material Setup: color #00f3ff, size 0.005
    const material = new THREE.PointsMaterial({
      color: 0x00f3ff,
      size: 0.006,
      transparent: true,
      opacity: 0.8,
      sizeAttenuation: true,
      blending: THREE.AdditiveBlending
    });

    const particles = new THREE.Points(geometry, material);
    scene.add(particles);

    // 6. Mouse Interaction Variables
    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;

    const handleMouseMove = (event: MouseEvent) => {
      // Normalize mouse coordinates (-1 to 1)
      mouseX = (event.clientX / window.innerWidth) - 0.5;
      mouseY = (event.clientY / window.innerHeight) - 0.5;
    };

    window.addEventListener('mousemove', handleMouseMove);

    // 7. Animation Loop
    let animationFrameId: number;
    const startTime = performance.now();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      const elapsedTime = (performance.now() - startTime) / 1000;

      // Smooth mouse tracking interpolation (Lerp)
      targetX += (mouseX - targetX) * 0.08;
      targetY += (mouseY - targetY) * 0.08;

      // Apply base rotation + mouse responsive offset
      particles.rotation.y = (elapsedTime * 0.03) + (targetX * 0.8);
      particles.rotation.x = (elapsedTime * 0.015) + (targetY * 0.8);

      renderer.render(scene, camera);
    };

    animate();

    // 8. Window Resize Handler
    const handleResize = () => {
      if (!containerRef.current) return;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    // 9. Cleanup
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      
      // Safe removal
      if (containerRef.current && renderer.domElement) {
        containerRef.current.removeChild(renderer.domElement);
      }
      
      // Dispose materials & geometries
      geometry.dispose();
      material.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <div 
      ref={containerRef} 
      className="absolute inset-0 pointer-events-none z-0 overflow-hidden bg-[#050505]"
      style={{ mixBlendMode: 'screen' }}
    />
  );
};

export default ThreeParticleBg;

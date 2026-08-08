import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { useTheme } from '@/context/ThemeContext';

interface ThreeParticleBgProps {
  isInteractive?: boolean;
}

export const ThreeParticleBg = ({ isInteractive = true }: ThreeParticleBgProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const isHomeRef = useRef(isInteractive);
  const { theme } = useTheme();
  const materialRef = useRef<THREE.PointsMaterial | null>(null);

  useEffect(() => {
    isHomeRef.current = isInteractive;
  }, [isInteractive]);

  useEffect(() => {
    if (!containerRef.current) return;

    // 1. Scene & Setup
    const scene = new THREE.Scene();
    
    const width = window.innerWidth;
    const height = window.innerHeight;
    
    // 2. Camera Setup
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 100);
    camera.position.z = 2;

    // 3. Renderer Setup
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    
    // Ensure the WebGL canvas stretches to occupy the full container
    renderer.domElement.style.position = 'absolute';
    renderer.domElement.style.top = '0';
    renderer.domElement.style.left = '0';
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    renderer.domElement.style.display = 'block';
    
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

    // 5. Material Setup: color changes based on theme
    const material = new THREE.PointsMaterial({
      color: theme === 'light' ? 0x1a3c8f : 0x00f3ff, // Deep Navy in light, Cyan in dark
      size: theme === 'light' ? 0.008 : 0.006,
      transparent: true,
      opacity: theme === 'light' ? 0.25 : (isInteractive ? 0.8 : 0.3),
      sizeAttenuation: true,
      blending: theme === 'light' ? THREE.NormalBlending : THREE.AdditiveBlending
    });
    
    materialRef.current = material;

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

      if (isHomeRef.current) {
        // Smooth mouse tracking interpolation (Lerp)
        targetX += (mouseX - targetX) * 0.08;
        targetY += (mouseY - targetY) * 0.08;

        // Apply base rotation + mouse responsive offset
        particles.rotation.y = (elapsedTime * 0.05) + (targetX * 1.8);
        particles.rotation.x = (elapsedTime * 0.025) + (targetY * 1.8);
        
        // Smoothly fade to bright
        material.opacity += (0.8 - material.opacity) * 0.05;
      } else {
        // Static slow drift for other pages without mouse tracking
        particles.rotation.y = elapsedTime * 0.01;
        particles.rotation.x = elapsedTime * 0.005;
        
        // Smoothly fade to light/dim
        material.opacity += (0.25 - material.opacity) * 0.05;
      }

      renderer.render(scene, camera);
    };

    animate();

    // 8. Window Resize Handler
    const handleResize = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
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

  // Update material when theme or interaction mode changes
  useEffect(() => {
    if (materialRef.current) {
      if (theme === 'light') {
        materialRef.current.color.setHex(0x1a3c8f); // Deep Navy (Dhyey's theme color)
        materialRef.current.blending = THREE.NormalBlending;
        materialRef.current.opacity = 0.25;
        materialRef.current.size = 0.008;
      } else {
        materialRef.current.color.setHex(0x00f3ff); // Cyan
        materialRef.current.blending = THREE.AdditiveBlending;
        materialRef.current.opacity = isInteractive ? 0.8 : 0.3;
        materialRef.current.size = 0.006;
      }
      materialRef.current.needsUpdate = true;
    }
  }, [theme, isInteractive]);

  return (
    <div 
      ref={containerRef} 
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden"
      style={{
        backgroundColor: theme === 'light' ? '#ffffff' : 'transparent',
        mixBlendMode: theme === 'light' ? 'normal' : 'screen',
        opacity: theme === 'light' ? 1 : 0.8
      }}
    />
  );
};

export default ThreeParticleBg;

import { useEffect, useRef } from 'react';

export default function ThreeBackground() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Create floating particles using CSS animations instead of Three.js
    // This is lighter weight and still creates a beautiful 3D effect
    const createParticle = () => {
      const particle = document.createElement('div');
      particle.className = 'absolute rounded-full opacity-70 animate-float';
      
      // Random size between 2-8px
      const size = Math.random() * 6 + 2;
      particle.style.width = `${size}px`;
      particle.style.height = `${size}px`;
      
      // Random position
      particle.style.left = `${Math.random() * 100}%`;
      particle.style.top = `${Math.random() * 100}%`;
      
      // Random color from our cyber palette
      const colors = ['#00D9FF', '#7C3AED', '#10B981', '#00FF41'];
      const color = colors[Math.floor(Math.random() * colors.length)];
      particle.style.background = color;
      particle.style.boxShadow = `0 0 ${size * 2}px ${color}`;
      
      // Random animation duration
      particle.style.animationDuration = `${Math.random() * 4 + 3}s`;
      particle.style.animationDelay = `${Math.random() * 2}s`;
      
      container.appendChild(particle);
      
      // Remove particle after animation
      setTimeout(() => {
        if (particle.parentNode) {
          particle.parentNode.removeChild(particle);
        }
      }, 7000);
    };

    // Create grid of floating cubes
    const createCube = (x: number, y: number) => {
      const cube = document.createElement('div');
      cube.className = 'absolute w-8 h-8 border border-cyber-blue/20 opacity-30 animate-pulse-slow';
      cube.style.left = `${x}%`;
      cube.style.top = `${y}%`;
      cube.style.transform = 'rotate(45deg)';
      cube.style.animationDelay = `${Math.random() * 3}s`;
      
      // Add glow effect
      cube.style.boxShadow = '0 0 20px rgba(0, 217, 255, 0.3)';
      
      container.appendChild(cube);
      
      return cube;
    };

    // Create initial particles
    for (let i = 0; i < 15; i++) {
      setTimeout(createParticle, Math.random() * 2000);
    }

    // Create grid of cubes
    const cubes: HTMLElement[] = [];
    for (let x = 10; x <= 90; x += 20) {
      for (let y = 10; y <= 90; y += 20) {
        cubes.push(createCube(x, y));
      }
    }

    // Continuously create new particles
    const particleInterval = setInterval(createParticle, 500);

    // Animate cubes on mouse move
    const handleMouseMove = (e: MouseEvent) => {
      const { clientX, clientY } = e;
      const { innerWidth, innerHeight } = window;
      
      cubes.forEach((cube, index) => {
        const rect = cube.getBoundingClientRect();
        const cubeCenterX = rect.left + rect.width / 2;
        const cubeCenterY = rect.top + rect.height / 2;
        
        const distance = Math.sqrt(
          Math.pow(clientX - cubeCenterX, 2) + Math.pow(clientY - cubeCenterY, 2)
        );
        
        if (distance < 200) {
          const scale = 1 + (200 - distance) / 200;
          const rotation = 45 + (200 - distance) / 4;
          cube.style.transform = `rotate(${rotation}deg) scale(${scale})`;
          cube.style.borderColor = '#00D9FF';
          cube.style.boxShadow = '0 0 30px rgba(0, 217, 255, 0.6)';
        } else {
          cube.style.transform = 'rotate(45deg) scale(1)';
          cube.style.borderColor = 'rgba(0, 217, 255, 0.2)';
          cube.style.boxShadow = '0 0 20px rgba(0, 217, 255, 0.3)';
        }
      });
    };

    document.addEventListener('mousemove', handleMouseMove);

    return () => {
      clearInterval(particleInterval);
      document.removeEventListener('mousemove', handleMouseMove);
      
      // Clean up elements
      cubes.forEach(cube => {
        if (cube.parentNode) {
          cube.parentNode.removeChild(cube);
        }
      });
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden"
      style={{
        background: 'radial-gradient(circle at 50% 50%, rgba(0, 217, 255, 0.03) 0%, transparent 50%)',
      }}
    />
  );
}

import React, { useEffect, useRef } from 'react';

interface AtmosphericParticlesProps {
  intensity?: number;
  windSpeed?: number;
}

interface SeedParticle {
  x: number;
  y: number;
  size: number;
  speedX: number;
  speedY: number;
  opacity: number;
  seed: number;
}

export const AtmosphericParticles: React.FC<AtmosphericParticlesProps> = ({
  intensity = 1.0,
  windSpeed = 1.0,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    // Natural mountain seed count (balanced for aesthetic subtlety & high frame rate)
    const count = Math.floor(45 * intensity);
    const particles: SeedParticle[] = [];

    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size: 1.2 + Math.random() * 2.2,
        speedX: (0.4 + Math.random() * 0.8) * windSpeed,
        speedY: -0.15 + Math.random() * 0.3,
        opacity: 0.25 + Math.random() * 0.45,
        seed: Math.random() * 100,
      });
    }

    let time = 0;

    const render = () => {
      ctx.clearRect(0, 0, width, height);
      time += 0.015;

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        // Soft gentle wind drift
        p.x += p.speedX + Math.sin(time + p.seed) * 0.35;
        p.y += p.speedY + Math.cos(time * 0.8 + p.seed) * 0.25;

        // Wrap around screen boundaries seamlessly
        if (p.x > width + 20) {
          p.x = -20;
          p.y = Math.random() * height;
        }
        if (p.y > height + 20) {
          p.y = -20;
        } else if (p.y < -20) {
          p.y = height + 20;
        }

        // Draw soft glowing mote with warm evening tint
        ctx.save();
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 238, 220, ${p.opacity})`;
        ctx.shadowColor = 'rgba(255, 215, 180, 0.4)';
        ctx.shadowBlur = 4;
        ctx.fill();

        // Subtle wispy tail for larger dandelion seeds
        if (p.size > 2.0) {
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p.x - p.speedX * 4, p.y - p.speedY * 2);
          ctx.strokeStyle = `rgba(255, 245, 235, ${p.opacity * 0.4})`;
          ctx.lineWidth = 0.6;
          ctx.stroke();
        }

        ctx.restore();
      }

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
    };
  }, [intensity, windSpeed]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none z-10 w-full h-full"
      style={{ mixBlendMode: 'screen' }}
      aria-hidden="true"
    />
  );
};

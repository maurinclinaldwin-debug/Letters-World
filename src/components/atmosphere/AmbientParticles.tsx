import React, { useEffect, useRef } from 'react';
import { CalendarThemeConfig } from '../../types.ts';

interface AmbientParticlesProps {
  theme: CalendarThemeConfig;
  progress: number;
}

interface Particle {
  x: number;
  y: number;
  z: number; // 0 (far) to 1 (near)
  radius: number;
  color: string;
  alpha: number;
  baseAlpha: number;
  vx: number;
  vy: number;
  pulseSpeed: number;
  pulsePhase: number;
  swaySpeed: number;
  swayPhase: number;
}

export const AmbientParticles: React.FC<AmbientParticlesProps> = ({ theme, progress }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animFrameRef = useRef<number | null>(null);
  const prevProgressRef = useRef(progress);
  const scrollVelocityRef = useRef(0);
  const mouseRef = useRef({ x: 0.5, y: 0.5, targetX: 0.5, targetY: 0.5 });

  // Initialize minimal, subtle particles when theme changes or on mount
  useEffect(() => {
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
    // Minimal particle counts: 12 on mobile, 20 on desktop for a clean, uncluttered aesthetic
    const count = isMobile ? 12 : 20;
    const particles: Particle[] = [];
    const colors = theme.particleColors;
    const isEmbers = theme.particleStyle === 'golden_embers';

    for (let i = 0; i < count; i++) {
      const z = Math.random();
      // Delicately sized motes (0.75px to 2.0px)
      const radius = 0.75 + z * 1.35;
      // Gentle, restrained opacity so it never obstructs typography or photos
      const baseAlpha = 0.12 + z * 0.24;

      particles.push({
        x: Math.random(),
        y: Math.random(),
        z,
        radius,
        color: colors[Math.floor(Math.random() * colors.length)],
        alpha: baseAlpha,
        baseAlpha,
        vx: (Math.random() - 0.5) * 0.00025 + (isEmbers ? 0.00008 : 0),
        vy: isEmbers
          ? -(0.00025 + Math.random() * 0.00045)
          : (Math.random() - 0.5) * 0.0003,
        pulseSpeed: 0.012 + Math.random() * 0.018,
        pulsePhase: Math.random() * Math.PI * 2,
        swaySpeed: 0.008 + Math.random() * 0.014,
        swayPhase: Math.random() * Math.PI * 2,
      });
    }

    particlesRef.current = particles;
  }, [theme.particleColors, theme.particleStyle, theme.isAugust22]);

  // Mouse parallax interaction
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current.targetX = e.clientX / window.innerWidth;
      mouseRef.current.targetY = e.clientY / window.innerHeight;
    };
    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Canvas render loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Smooth mouse follow
      mouseRef.current.x += (mouseRef.current.targetX - mouseRef.current.x) * 0.03;
      mouseRef.current.y += (mouseRef.current.targetY - mouseRef.current.y) * 0.03;

      // Scroll delta calculation & gentle dampening
      const scrollDelta = progress - prevProgressRef.current;
      prevProgressRef.current = progress;
      scrollVelocityRef.current = scrollVelocityRef.current * 0.88 + scrollDelta * 0.12;
      const scrollBoostY = -scrollVelocityRef.current * 1.5;

      const particles = particlesRef.current;
      const style = theme.particleStyle;
      const isAugust = theme.isAugust22;

      // Render minimal particles
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        p.pulsePhase += p.pulseSpeed;
        p.swayPhase += p.swaySpeed;

        const pulse = Math.sin(p.pulsePhase) * 0.25 + 0.75;
        p.alpha = p.baseAlpha * pulse;

        // Position updates with gentle breeze + scroll drift + mouse parallax
        const mouseShiftX = (mouseRef.current.x - 0.5) * 0.00015 * (p.z + 0.2);
        const mouseShiftY = (mouseRef.current.y - 0.5) * 0.00015 * (p.z + 0.2);
        const swayX = Math.cos(p.swayPhase) * 0.00012;

        p.x += p.vx + mouseShiftX + swayX;
        p.y += p.vy + mouseShiftY + scrollBoostY * (p.z + 0.25);

        // Screen wrap
        if (p.x < -0.04) p.x = 1.04;
        if (p.x > 1.04) p.x = -0.04;
        if (p.y < -0.04) p.y = 1.04;
        if (p.y > 1.04) p.y = -0.04;

        const screenX = p.x * width;
        const screenY = p.y * height;
        const currentRadius = p.radius * (0.85 + 0.3 * pulse);

        ctx.save();
        ctx.globalAlpha = Math.max(0, Math.min(1, p.alpha));

        if (style === 'fireflies' || style === 'golden_embers') {
          // Delicate soft warm halo
          const glowRadius = currentRadius * 2.5;
          const grad = ctx.createRadialGradient(
            screenX,
            screenY,
            0,
            screenX,
            screenY,
            glowRadius
          );
          grad.addColorStop(0, '#ffffff');
          grad.addColorStop(0.4, p.color);
          grad.addColorStop(1, 'rgba(0,0,0,0)');
          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.arc(screenX, screenY, glowRadius, 0, Math.PI * 2);
          ctx.fill();
        } else if (style === 'stardust' || isAugust) {
          // Minimal stardust point
          ctx.fillStyle = p.color;
          ctx.beginPath();
          ctx.arc(screenX, screenY, currentRadius, 0, Math.PI * 2);
          ctx.fill();

          // Subtle sparkle cross only on highest pulse peaks
          if (pulse > 0.92) {
            ctx.strokeStyle = p.color;
            ctx.lineWidth = 0.6;
            ctx.beginPath();
            ctx.moveTo(screenX - currentRadius * 2, screenY);
            ctx.lineTo(screenX + currentRadius * 2, screenY);
            ctx.moveTo(screenX, screenY - currentRadius * 2);
            ctx.lineTo(screenX, screenY + currentRadius * 2);
            ctx.stroke();
          }
        } else {
          // Soft circular motes
          const grad = ctx.createRadialGradient(
            screenX,
            screenY,
            0,
            screenX,
            screenY,
            currentRadius * 1.8
          );
          grad.addColorStop(0, p.color);
          grad.addColorStop(1, 'rgba(255,255,255,0)');
          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.arc(screenX, screenY, currentRadius * 1.8, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.restore();
      }

      animFrameRef.current = requestAnimationFrame(render);
    };

    animFrameRef.current = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [theme.particleStyle, theme.isAugust22, progress]);

  return (
    <canvas
      id="ambient-particles-canvas"
      ref={canvasRef}
      className="pointer-events-none absolute inset-0 z-15 w-full h-full"
      aria-hidden="true"
    />
  );
};


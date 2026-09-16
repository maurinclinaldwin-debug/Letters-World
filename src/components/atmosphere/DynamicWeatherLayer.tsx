import React, { useEffect, useRef } from 'react';
import { CalendarThemeConfig } from '../../types.ts';

interface DynamicWeatherLayerProps {
  progress: number;
  theme?: CalendarThemeConfig;
}

interface FogWisp {
  x: number;
  y: number;
  z: number; // 0 (far) to 1 (near)
  radiusX: number;
  radiusY: number;
  vx: number;
  baseAlpha: number;
  phase: number;
  phaseSpeed: number;
  altitudeBand: 'valley' | 'mid' | 'crest';
}

interface DriftingLeaf {
  x: number;
  y: number;
  z: number;
  size: number;
  type: 0 | 1 | 2; // 0: birch/ovate, 1: maple/lobed, 2: petal/willow
  color: string;
  backColor: string;
  alpha: number;
  baseAlpha: number;
  vx: number;
  vy: number;
  baseVy: number;
  rotation: number;
  rotSpeed: number;
  pitch: number; // 3D flip
  pitchSpeed: number;
  roll: number;  // 3D twist
  rollSpeed: number;
  swayPhase: number;
  swaySpeed: number;
}

export const DynamicWeatherLayer: React.FC<DynamicWeatherLayerProps> = React.memo(({ progress, theme }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const fogWispsRef = useRef<FogWisp[]>([]);
  const leavesRef = useRef<DriftingLeaf[]>([]);

  const progressRef = useRef(progress);
  progressRef.current = progress;
  const prevProgressRef = useRef(progress);
  const scrollVelocityRef = useRef(0);

  const pointerRef = useRef({ x: -1000, y: -1000, active: false });
  const themeRef = useRef(theme);
  themeRef.current = theme;

  // Initialize Fog Wisps & Leaves based on screen size and theme
  useEffect(() => {
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

    // 1. Fog Wisps Initialization (fewer on mobile for 60fps performance)
    const fogCount = isMobile ? 5 : 9;
    const wisps: FogWisp[] = [];

    for (let i = 0; i < fogCount; i++) {
      const z = 0.2 + (i / fogCount) * 0.8;
      // Distribute along valley (lower screen), mid (center), crest (top/horizon)
      let altitudeBand: 'valley' | 'mid' | 'crest' = 'valley';
      let y = 0.65 + Math.random() * 0.3;
      if (i % 3 === 1) {
        altitudeBand = 'mid';
        y = 0.35 + Math.random() * 0.35;
      } else if (i % 3 === 2) {
        altitudeBand = 'crest';
        y = 0.08 + Math.random() * 0.35;
      }

      wisps.push({
        x: Math.random() * 1.4 - 0.2,
        y,
        z,
        radiusX: (isMobile ? 180 : 320) + z * (isMobile ? 140 : 260),
        radiusY: (isMobile ? 70 : 120) + z * (isMobile ? 50 : 90),
        vx: 0.00012 + (1 - z) * 0.00018 + Math.random() * 0.00008,
        baseAlpha: 0.12 + z * 0.18,
        phase: Math.random() * Math.PI * 2,
        phaseSpeed: 0.006 + Math.random() * 0.008,
        altitudeBand,
      });
    }
    fogWispsRef.current = wisps;

    // 2. Drifting Leaves Initialization
    const leafCount = isMobile ? 10 : 22;
    const leaves: DriftingLeaf[] = [];

    // Derive seasonal and time-of-day leaf color palette
    const phase = theme?.phase || 'day';
    const season = theme?.season || 'summer';
    const isAugust22 = theme?.isAugust22;

    const getPalette = () => {
      if (isAugust22) {
        return [
          { front: '#fcd34d', back: '#f59e0b' },
          { front: '#fbbf24', back: '#d97706' },
          { front: '#fef08a', back: '#eab308' },
          { front: '#fffbeb', back: '#f59e0b' },
        ];
      }
      if (season === 'autumn' || phase === 'golden_hour') {
        return [
          { front: '#f59e0b', back: '#b45309' }, // amber
          { front: '#ea580c', back: '#9a3412' }, // russet
          { front: '#dc2626', back: '#7f1d1d' }, // crimson
          { front: '#fbbf24', back: '#c2410c' }, // gold
          { front: '#d97706', back: '#854d0e' }, // bronze
        ];
      }
      if (season === 'spring' || phase === 'dawn') {
        return [
          { front: '#fbcfe8', back: '#f472b6' }, // cherry blossom
          { front: '#fed7aa', back: '#fb923c' }, // apricot petal
          { front: '#a7f3d0', back: '#34d399' }, // fresh sprout
          { front: '#fef9c3', back: '#fde047' }, // primrose
        ];
      }
      if (season === 'winter' || phase === 'midnight') {
        return [
          { front: '#e2e8f0', back: '#94a3b8' }, // frosted silver
          { front: '#c7d2fe', back: '#818cf8' }, // starlight lavender
          { front: '#bae6fd', back: '#38bdf8' }, // glacial crystal
        ];
      }
      // Summer daylight default
      return [
        { front: '#86efac', back: '#22c55e' }, // mountain birch green
        { front: '#bef264', back: '#65a30d' }, // golden aspen
        { front: '#fde047', back: '#ca8a04' }, // wildflower petal
        { front: '#6ee7b7', back: '#059669' }, // summer pine needle/flake
      ];
    };

    const palette = getPalette();

    for (let i = 0; i < leafCount; i++) {
      const z = Math.random();
      const pair = palette[Math.floor(Math.random() * palette.length)];
      const type = (i % 3) as 0 | 1 | 2;
      const size = (isMobile ? 7 : 11) + z * (isMobile ? 6 : 10);
      const baseAlpha = 0.25 + z * 0.45;
      const baseVy = 0.00035 + z * 0.00045;

      leaves.push({
        x: Math.random(),
        y: Math.random(),
        z,
        size,
        type,
        color: pair.front,
        backColor: pair.back,
        alpha: baseAlpha,
        baseAlpha,
        vx: 0.00025 + Math.random() * 0.00035,
        vy: baseVy,
        baseVy,
        rotation: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 0.03,
        pitch: Math.random() * Math.PI * 2,
        pitchSpeed: 0.02 + Math.random() * 0.035,
        roll: Math.random() * Math.PI * 2,
        rollSpeed: 0.015 + Math.random() * 0.025,
        swayPhase: Math.random() * Math.PI * 2,
        swaySpeed: 0.012 + Math.random() * 0.018,
      });
    }
    leavesRef.current = leaves;
  }, [theme?.phase, theme?.season, theme?.isAugust22]);

  // Pointer interaction for interactive leaf aerodynamic wake
  useEffect(() => {
    const onPointerMove = (e: PointerEvent) => {
      pointerRef.current = {
        x: e.clientX,
        y: e.clientY,
        active: true,
      };
    };

    const onPointerLeave = () => {
      pointerRef.current.active = false;
    };

    window.addEventListener('pointermove', onPointerMove, { passive: true });
    window.addEventListener('pointerleave', onPointerLeave, { passive: true });

    return () => {
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerleave', onPointerLeave);
    };
  }, []);

  // Main 60FPS Canvas Animation Loop
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

    let lastTime = 0;
    const FRAME_INTERVAL = 1000 / 60; // 60 FPS cap

    // Helper to draw realistic organic leaf shapes
    const drawLeafShape = (
      c: CanvasRenderingContext2D,
      type: 0 | 1 | 2,
      size: number
    ) => {
      c.beginPath();
      if (type === 0) {
        // Ovate / Birch leaf with gentle tip & central vein
        c.moveTo(0, -size);
        c.bezierCurveTo(size * 0.8, -size * 0.6, size * 0.7, size * 0.5, 0, size);
        c.bezierCurveTo(-size * 0.7, size * 0.5, -size * 0.8, -size * 0.6, 0, -size);
        c.fill();

        // Delicate central vein
        c.beginPath();
        c.strokeStyle = 'rgba(255,255,255,0.28)';
        c.lineWidth = 0.7;
        c.moveTo(0, -size * 0.8);
        c.lineTo(0, size * 0.85);
        c.stroke();
      } else if (type === 1) {
        // Subtle lobed / Maple leaf
        c.moveTo(0, -size);
        c.lineTo(size * 0.4, -size * 0.5);
        c.lineTo(size * 0.8, -size * 0.4);
        c.lineTo(size * 0.45, 0);
        c.lineTo(size * 0.6, size * 0.6);
        c.lineTo(0, size * 0.4);
        c.lineTo(-size * 0.6, size * 0.6);
        c.lineTo(-size * 0.45, 0);
        c.lineTo(-size * 0.8, -size * 0.4);
        c.lineTo(-size * 0.4, -size * 0.5);
        c.closePath();
        c.fill();
      } else {
        // Elongated Petal / Willow leaf
        c.moveTo(0, -size * 1.2);
        c.quadraticCurveTo(size * 0.45, 0, 0, size * 1.2);
        c.quadraticCurveTo(-size * 0.45, 0, 0, -size * 1.2);
        c.fill();
      }
    };

    const render = (now: number) => {
      animFrameRef.current = requestAnimationFrame(render);

      const elapsed = now - lastTime;
      if (elapsed < FRAME_INTERVAL) return;
      lastTime = now - (elapsed % FRAME_INTERVAL);

      ctx.clearRect(0, 0, width, height);

      // Scroll progress dynamics
      const currentProg = progressRef.current;
      const scrollDelta = currentProg - prevProgressRef.current;
      prevProgressRef.current = currentProg;
      scrollVelocityRef.current = scrollVelocityRef.current * 0.86 + scrollDelta * 0.14;
      const scrollWind = scrollVelocityRef.current * 8.0;

      const currentTheme = themeRef.current;
      const phase = currentTheme?.phase || 'day';
      const isAugust = currentTheme?.isAugust22;

      // -------------------------------------------------------------
      // 1. RENDER ETHEREAL FOG WISPS (Transitioned by Progress & Time)
      // -------------------------------------------------------------
      // Determine Fog color palette based on time of day phase
      let fogR = 245, fogG = 248, fogB = 252; // Dawn cool silver
      let fogBaseAlphaMultiplier = 1.0;

      if (isAugust) {
        fogR = 253; fogG = 230; fogB = 138; // August 22 golden stardust
        fogBaseAlphaMultiplier = 1.15;
      } else if (phase === 'dawn') {
        fogR = 230; fogG = 240; fogB = 255; // Morning valley mist
        fogBaseAlphaMultiplier = 1.35;
      } else if (phase === 'golden_hour') {
        fogR = 254; fogG = 215; fogB = 170; // Sunset golden fog
        fogBaseAlphaMultiplier = 1.1;
      } else if (phase === 'dusk') {
        fogR = 216; fogG = 180; fogB = 254; // Twilight lavender mist
        fogBaseAlphaMultiplier = 1.2;
      } else if (phase === 'midnight') {
        fogR = 165; fogG = 180; fogB = 252; // Night starlight mist
        fogBaseAlphaMultiplier = 0.95;
      } else {
        // Daylight: clean, subtle white cloud haze
        fogR = 255; fogG = 252; fogB = 245;
        fogBaseAlphaMultiplier = 0.75;
      }

      // Progress-based altitude modulation:
      // When user is near the beginning (progress < 0.4), valley fog is emphasized.
      // When user reaches high ridge (progress > 0.65), crest/high altitude cloud wisps expand!
      const valleyWeight = Math.max(0.2, 1 - currentProg * 1.3);
      const crestWeight = Math.max(0.2, (currentProg - 0.3) * 1.4);

      const wisps = fogWispsRef.current;
      for (let i = 0; i < wisps.length; i++) {
        const wisp = wisps[i];
        wisp.phase += wisp.phaseSpeed;

        // Drift speed influenced by natural wind + user scroll
        wisp.x += wisp.vx + scrollWind * 0.0003 * (wisp.z + 0.5);

        // Screen wrap
        if (wisp.x > 1.35) wisp.x = -0.35;
        if (wisp.x < -0.35) wisp.x = 1.35;

        // Band weight transition based on timeline progress
        let bandWeight = 1.0;
        if (wisp.altitudeBand === 'valley') {
          bandWeight = valleyWeight;
        } else if (wisp.altitudeBand === 'crest') {
          bandWeight = crestWeight;
        }

        // Breathing volumetric pulse
        const breathe = Math.sin(wisp.phase) * 0.25 + 0.75;
        const currentAlpha = Math.max(
          0,
          Math.min(
            0.45,
            wisp.baseAlpha * breathe * fogBaseAlphaMultiplier * bandWeight
          )
        );

        if (currentAlpha <= 0.01) continue;

        const screenX = wisp.x * width;
        const waveY = Math.sin(wisp.phase * 0.7) * 18;
        const screenY = wisp.y * height + waveY;
        const rX = wisp.radiusX * (0.9 + 0.2 * breathe);
        const rY = wisp.radiusY * (0.9 + 0.2 * breathe);

        ctx.save();
        // Draw soft elliptical fog puff using scaled radial gradient
        ctx.translate(screenX, screenY);
        ctx.scale(1, rY / rX);

        const fogGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, rX);
        fogGrad.addColorStop(0, `rgba(${fogR}, ${fogG}, ${fogB}, ${currentAlpha.toFixed(3)})`);
        fogGrad.addColorStop(0.45, `rgba(${fogR}, ${fogG}, ${fogB}, ${(currentAlpha * 0.55).toFixed(3)})`);
        fogGrad.addColorStop(1, `rgba(${fogR}, ${fogG}, ${fogB}, 0)`);

        ctx.fillStyle = fogGrad;
        ctx.beginPath();
        ctx.arc(0, 0, rX, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
      }

      // -------------------------------------------------------------
      // 2. RENDER DRIFTING LEAVES (Transitioned by Progress & Wind)
      // -------------------------------------------------------------
      const leaves = leavesRef.current;
      const pointer = pointerRef.current;

      // High altitude wind boost: at summit (progress > 0.75), leaves drift faster horizontally
      const altitudeWindX = currentProg > 0.7 ? 0.00035 : 0;
      // High ridge updraft: leaves catch thermal updrafts
      const updraftFactor = currentProg > 0.75 ? -0.0002 : 0;

      for (let i = 0; i < leaves.length; i++) {
        const leaf = leaves[i];

        // Animate 3D rotations & sway
        leaf.rotation += leaf.rotSpeed;
        leaf.pitch += leaf.pitchSpeed;
        leaf.roll += leaf.rollSpeed;
        leaf.swayPhase += leaf.swaySpeed;

        // Aerodynamic flutter
        const swayX = Math.sin(leaf.swayPhase) * 0.00045 * (leaf.z + 0.5);
        const flutterLift = Math.cos(leaf.pitch) * 0.0002;

        // Dynamic motion update
        leaf.x += leaf.vx + swayX + scrollWind * 0.0008 * (leaf.z + 0.5) + altitudeWindX;
        leaf.y += leaf.vy + flutterLift + scrollWind * 0.0005 + updraftFactor;

        // Screen wrap
        if (leaf.x > 1.08) leaf.x = -0.08;
        if (leaf.x < -0.08) leaf.x = 1.08;
        if (leaf.y > 1.08) {
          leaf.y = -0.08;
          leaf.x = Math.random();
        }
        if (leaf.y < -0.08) {
          leaf.y = 1.08;
          leaf.x = Math.random();
        }

        let screenX = leaf.x * width;
        let screenY = leaf.y * height;

        // Pointer proximity wake effect: leaves swirl away from user cursor/touch
        if (pointer.active) {
          const dx = screenX - pointer.x;
          const dy = screenY - pointer.y;
          const distSq = dx * dx + dy * dy;
          const threshold = 120 * (leaf.z + 0.5);
          if (distSq < threshold * threshold && distSq > 1) {
            const dist = Math.sqrt(distSq);
            const force = (1 - dist / threshold) * 2.2;
            leaf.x += (dx / dist) * force * 0.002;
            leaf.y += (dy / dist) * force * 0.002;
            leaf.rotSpeed += (Math.random() - 0.5) * 0.05;
          }
        }

        // 3D Projection scale factors
        const scaleX = Math.cos(leaf.roll);
        const scaleY = Math.cos(leaf.pitch);
        const isBackFace = scaleX * scaleY < 0;

        // Progress density scaling:
        // Lower meadow (progress < 0.5) has rich leaf coverage.
        // High summit (progress > 0.8) has wind-whipped golden flakes.
        const leafProgressAlpha = currentProg > 0.85 ? 0.7 : 1.0;
        const drawAlpha = Math.max(0, Math.min(1, leaf.alpha * leafProgressAlpha));

        ctx.save();
        ctx.translate(screenX, screenY);
        ctx.rotate(leaf.rotation);
        ctx.scale(Math.abs(scaleX) * (leaf.z * 0.6 + 0.6), Math.abs(scaleY) * (leaf.z * 0.6 + 0.6));
        ctx.globalAlpha = drawAlpha;

        // Fill with front or back color depending on 3D tumble
        ctx.fillStyle = isBackFace ? leaf.backColor : leaf.color;

        // Render leaf silhouette
        drawLeafShape(ctx, leaf.type, leaf.size);

        // Add soft celestial glint on August 22 or Golden Hour when leaf faces sun
        if ((isAugust || phase === 'golden_hour') && Math.abs(scaleX) > 0.85 && leaf.z > 0.6) {
          ctx.beginPath();
          ctx.arc(0, 0, leaf.size * 0.4, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
          ctx.fill();
        }

        ctx.restore();
      }
    };

    animFrameRef.current = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, []);

  return (
    <canvas
      id="dynamic-weather-layer-canvas"
      ref={canvasRef}
      className="pointer-events-none absolute inset-0 z-12 w-full h-full"
      aria-hidden="true"
    />
  );
});

import { useState, useEffect, useRef } from 'react';
import { getTrailPoint, TRAIL_PATH_LENGTH, TrailPoint } from '../utils/trailPath.ts';

export interface LightPhysicsState {
  /** Smoothed physical progress strictly along the road line (0.0 to 1.0) */
  progress: number;
  /** Instantaneous physical scroll velocity */
  velocity: number;
  /** Normalized speed from 0 (stationary) to 1 (active scrolling) */
  speed: number;
  /** Dynamic light intensity factor (1.0 to 2.2) */
  intensity: number;
  /** Dynamic radial glow size in pixels (14px to 36px) */
  glowRadius: number;
  /** Length of the directional photonic comet tail trailing behind */
  tailLength: number;
  /** Opacity of the trailing photon streak */
  tailOpacity: number;
  /** Exact point on the road line with tangent angle */
  point: TrailPoint;
  /** Synchronized lit road stroke offset matching the light position precisely */
  strokeOffset: number;
}

export function useLightPhysics(targetProgress: number): LightPhysicsState {
  const targetRef = useRef(targetProgress);
  targetRef.current = targetProgress;

  const currentProgRef = useRef(targetProgress);
  const velocityRef = useRef(0);
  const frameRef = useRef<number | null>(null);
  const lastTimeRef = useRef(0);

  const initialPoint = getTrailPoint(targetProgress);
  const [lightState, setLightState] = useState<LightPhysicsState>(() => ({
    progress: targetProgress,
    velocity: 0,
    speed: 0,
    intensity: 1.0,
    glowRadius: 14,
    tailLength: 0,
    tailOpacity: 0,
    point: initialPoint,
    strokeOffset: TRAIL_PATH_LENGTH * (1 - targetProgress),
  }));

  useEffect(() => {
    let isRunning = true;
    const TARGET_FPS = 60;
    const FRAME_INTERVAL = 1000 / TARGET_FPS; // 16.66ms (caps strictly at 60 FPS)

    const tick = (now: number) => {
      if (!isRunning) return;

      const elapsed = now - lastTimeRef.current;
      if (elapsed >= FRAME_INTERVAL) {
        lastTimeRef.current = now - (elapsed % FRAME_INTERVAL);

        const target = targetRef.current;
        const current = currentProgRef.current;
        const prevVel = velocityRef.current;

        // Critically-damped spring physics (fast responsiveness with smooth inertia)
        const springTension = 0.14;
        const viscousDamping = 0.62;
        const force = (target - current) * springTension;
        const nextVel = (prevVel + force) * viscousDamping;
        const nextProg = Math.max(0, Math.min(1, current + nextVel));

        currentProgRef.current = nextProg;
        velocityRef.current = nextVel;

        const deltaToTarget = Math.abs(target - nextProg);
        const isMoving = Math.abs(nextVel) > 0.00005 || deltaToTarget > 0.0002;

        if (isMoving) {
          const speed = Math.min(1, Math.abs(nextVel) * 50);
          const intensity = 1.0 + speed * 1.2;
          const glowRadius = 14 + speed * 22;
          const tailLength = speed * 36;
          const tailOpacity = Math.min(0.8, speed * 1.2);

          // Evaluated via exact arc-length table to stay 100% locked on the line
          const point = getTrailPoint(nextProg);
          const strokeOffset = TRAIL_PATH_LENGTH * (1 - nextProg);

          setLightState({
            progress: nextProg,
            velocity: nextVel,
            speed,
            intensity,
            glowRadius,
            tailLength,
            tailOpacity,
            point,
            strokeOffset,
          });
        }
      }

      frameRef.current = requestAnimationFrame(tick);
    };

    frameRef.current = requestAnimationFrame(tick);

    return () => {
      isRunning = false;
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, []);

  return lightState;
}

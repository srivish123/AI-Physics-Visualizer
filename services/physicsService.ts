
import { SimulationParameters, SimulationResult } from '../types';

export const calculateTrajectory = (params: SimulationParameters): SimulationResult => {
  const { velocity, angle, gravity, airResistance, mass = 1, initialHeight = 0 } = params;
  const angleRad = (angle * Math.PI) / 180;
  
  let vx = velocity * Math.cos(angleRad);
  let vy = velocity * Math.sin(angleRad);
  
  const trajectory: { x: number; y: number; t: number; v: number; vx: number; vy: number }[] = [];
  
  let x = 0;
  let y = initialHeight; // Start from tower/cliff height
  let t = 0;
  const dt = 0.05; 
  const k = airResistance ? 0.08 : 0; 

  while (y >= 0 && t < 1000) {
    const v = Math.sqrt(vx * vx + vy * vy);
    trajectory.push({ x, y, t, v, vx, vy });

    const ax = -(k / mass) * vx;
    const ay = -gravity - (k / mass) * vy;

    x += vx * dt;
    y += vy * dt;
    vx += ax * dt;
    vy += ay * dt;
    t += dt;

    if (y < 0) {
      y = 0;
      trajectory.push({ x, y, t, v, vx, vy });
      break;
    }
  }
  
  const maxHeight = Math.max(...trajectory.map(p => p.y));
  const range = trajectory[trajectory.length - 1].x;
  const timeOfFlight = t;
  
  return {
    maxHeight,
    timeOfFlight,
    range,
    trajectory,
  };
};

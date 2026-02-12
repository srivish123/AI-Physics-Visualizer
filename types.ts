
export interface SimulationParameters {
  velocity: number;
  angle: number;
  gravity: number;
  mass: number;
  initialHeight?: number;
  airResistance?: boolean;
  label?: string;
}

export interface SimulationResult {
  maxHeight: number;
  timeOfFlight: number;
  range: number;
  trajectory: { x: number; y: number; t: number; v: number; vx: number; vy: number }[];
}

export interface AIResponse {
  parameters: SimulationParameters;
  derivationSummary: string;
}

export enum Tab {
  SOLVER = 'Solver',
  SIMULATION = 'Simulation',
  ANALYSIS = 'Analysis'
}

export const ENVIRONMENTS = [
  { 
    name: 'Earth', 
    g: 9.81, 
    icon: 'public', 
    color: '#2b8cee',
    bg: 'linear-gradient(to bottom, #0c141d, #1a3a5a)',
    description: 'Standard terrestrial gravity. Parabolic curves are well-defined by the constant 9.81m/s² pull.'
  },
  { 
    name: 'Moon', 
    g: 1.62, 
    icon: 'brightness_2', 
    color: '#94a3b8',
    bg: 'radial-gradient(circle at 50% 50%, #1a1a1a, #000000)',
    description: 'Low gravity (approx. 1/6th of Earth). Projectiles travel much higher and further with minimal downward acceleration.'
  },
  { 
    name: 'Mars', 
    g: 3.71, 
    icon: 'blur_on', 
    color: '#ef4444',
    bg: 'linear-gradient(to bottom, #2d1414, #000000)',
    description: 'Medium gravity (approx. 38% of Earth). A balance between extreme range and terrestrial control.'
  },
  { 
    name: 'Jupiter', 
    g: 24.79, 
    icon: 'filter_tilt_shift', 
    color: '#f59e0b',
    bg: 'linear-gradient(to bottom, #3d2b1f, #1a0f0a)',
    description: 'Extreme gravity. Projectiles are rapidly pulled to the surface, resulting in shallow, short-range arcs.'
  },
];

export const CATEGORIES = [
  {
    id: 'oblique',
    title: 'Oblique Motion',
    icon: 'trending_up',
    sample: 'Kick a ball from the ground at 22 m/s at a 45 degree angle.'
  },
  {
    id: 'horizontal',
    title: 'Horizontal Fire',
    icon: 'trending_flat',
    sample: 'A cannon fires a ball straight forward from a 30m tower at 15 m/s.'
  },
  {
    id: 'cliff',
    title: 'Cliff Gravity',
    icon: 'terrain',
    sample: 'An object rolls off a 60m cliff at a speed of 10 m/s.'
  }
];

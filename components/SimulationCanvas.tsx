
import React, { useMemo } from 'react';
import { SimulationResult, ENVIRONMENTS } from '../types';

interface Props {
  result: SimulationResult;
  comparisonResults?: { env: any, result: SimulationResult }[];
  currentTime: number;
  isPlaying: boolean;
  onTogglePlay: () => void;
  onReset: () => void;
  themeColor?: string;
  activeEnv?: any;
}

const SimulationCanvas: React.FC<Props> = ({ 
  result, 
  comparisonResults,
  currentTime, 
  isPlaying, 
  onTogglePlay, 
  onReset,
  themeColor = '#2b8cee',
  activeEnv
}) => {
  const padding = 70;
  const svgWidth = 800;
  const svgHeight = 400;
  
  const allResults = comparisonResults ? comparisonResults.map(r => r.result) : [result];
  const maxR = Math.max(...allResults.map(r => r.range), 10);
  const maxH = Math.max(...allResults.map(r => r.maxHeight), 5);

  const scaleX = (svgWidth - 2 * padding) / maxR;
  const scaleY = (svgHeight - 2 * padding) / maxH;
  const scale = Math.min(scaleX, scaleY);

  const getPoints = (traj: any[]) => {
    return traj.map(p => `${padding + p.x * scale},${svgHeight - padding - p.y * scale}`).join(' ');
  };

  const getPointAtTime = (res: SimulationResult, t: number) => {
    const idx = Math.min(
      Math.floor((t / res.timeOfFlight) * (res.trajectory.length - 1)),
      res.trajectory.length - 1
    );
    return res.trajectory[Math.max(0, idx)] || res.trajectory[0];
  };

  const initialY = result.trajectory[0].y;
  const currentP = getPointAtTime(result, currentTime);

  // Velocity Vector Scaling
  const vectorScale = 1.5;

  return (
    <section className="bg-slate-950 border border-white/10 rounded-3xl overflow-hidden relative shadow-2xl transition-all duration-700">
      <div 
        className="h-96 relative flex flex-col justify-end p-6 transition-all duration-1000"
        style={{ background: activeEnv?.bg || '#06090c' }}
      >
        <div className="absolute inset-0 grid-bg opacity-30"></div>
        
        <svg className="absolute inset-0 w-full h-full" viewBox={`0 0 ${svgWidth} ${svgHeight}`}>
          {/* Ground */}
          <line x1={0} y1={svgHeight - padding} x2={svgWidth} y2={svgHeight - padding} stroke="rgba(255,255,255,0.15)" strokeWidth="4" />

          {/* Tower/Cliff Structure */}
          {initialY > 0 && (
            <g>
              <rect 
                x={padding - 30} 
                y={svgHeight - padding - initialY * scale} 
                width={30} 
                height={initialY * scale} 
                fill="url(#towerGradient)"
                stroke="rgba(255,255,255,0.2)"
                strokeWidth="1"
              />
              <defs>
                <linearGradient id="towerGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" style={{ stopColor: '#1e293b', stopOpacity: 1 }} />
                  <stop offset="100%" style={{ stopColor: '#0f172a', stopOpacity: 1 }} />
                </linearGradient>
              </defs>
              {/* Tower Details */}
              <line x1={padding - 30} y1={svgHeight - padding - initialY * scale} x2={padding} y2={svgHeight - padding - initialY * scale} stroke={themeColor} strokeWidth="3" opacity="0.5" />
            </g>
          )}

          {/* Ghost Trail (Markers at intervals) */}
          {result.trajectory.filter((_, i) => i % 10 === 0 && result.trajectory[i].t <= currentTime).map((p, i) => (
            <circle 
              key={i} 
              cx={padding + p.x * scale} 
              cy={svgHeight - padding - p.y * scale} 
              r="2" 
              fill={themeColor} 
              opacity="0.3" 
            />
          ))}

          {comparisonResults && comparisonResults.map(({ env, result: res }) => {
            const pathTime = Math.min(currentTime, res.timeOfFlight);
            const cp = getPointAtTime(res, pathTime);
            return (
              <g key={env.name}>
                <polyline points={getPoints(res.trajectory)} fill="none" stroke={env.color} strokeWidth="1.5" strokeDasharray="4,4" className="opacity-10" />
                <polyline points={getPoints(res.trajectory.slice(0, Math.floor((pathTime / res.timeOfFlight) * res.trajectory.length)))} fill="none" stroke={env.color} strokeWidth="3" className="transition-opacity duration-300" />
                <circle cx={padding + cp.x * scale} cy={svgHeight - padding - cp.y * scale} r="5" fill={env.color} />
              </g>
            );
          })}

          {!comparisonResults && (
            <g>
              {/* Full Trajectory Path (Faint) */}
              <polyline points={getPoints(result.trajectory)} fill="none" stroke={themeColor} strokeWidth="2" className="opacity-10" />
              
              {/* Animated Trajectory Path */}
              <polyline 
                points={getPoints(result.trajectory.slice(0, Math.floor((currentTime / result.timeOfFlight) * result.trajectory.length)))} 
                fill="none" 
                stroke={themeColor} 
                strokeWidth="4" 
                strokeLinecap="round" 
              />
              
              {/* Projectile Ball & Vector HUD */}
              {currentTime > 0 && (
                <g>
                  {/* Vector: Vx (Horizontal Velocity - Constant) */}
                  <line 
                    x1={padding + currentP.x * scale} 
                    y1={svgHeight - padding - currentP.y * scale} 
                    x2={padding + currentP.x * scale + currentP.vx * vectorScale} 
                    y2={svgHeight - padding - currentP.y * scale} 
                    stroke="#10b981" 
                    strokeWidth="2" 
                    markerEnd="url(#arrowGreen)"
                  />
                  {/* Vector: Vy (Vertical Velocity - Accelerating) */}
                  <line 
                    x1={padding + currentP.x * scale} 
                    y1={svgHeight - padding - currentP.y * scale} 
                    x2={padding + currentP.x * scale} 
                    y2={svgHeight - padding - currentP.y * scale - currentP.vy * vectorScale} 
                    stroke="#ef4444" 
                    strokeWidth="2" 
                    markerEnd="url(#arrowRed)"
                  />
                  
                  {/* Markers Definition */}
                  <defs>
                    <marker id="arrowGreen" markerWidth="10" markerHeight="10" refX="5" refY="5" orient="auto">
                      <path d="M0,0 L10,5 L0,10 Z" fill="#10b981" />
                    </marker>
                    <marker id="arrowRed" markerWidth="10" markerHeight="10" refX="5" refY="5" orient="auto">
                      <path d="M0,0 L10,5 L0,10 Z" fill="#ef4444" />
                    </marker>
                  </defs>

                  {/* The Ball */}
                  <circle 
                    cx={padding + currentP.x * scale} 
                    cy={svgHeight - padding - currentP.y * scale} 
                    r="10" 
                    fill={themeColor} 
                    style={{ filter: `drop-shadow(0 0 15px ${themeColor})` }} 
                  />
                  
                  {/* Real-time Data Tag */}
                  <g transform={`translate(${padding + currentP.x * scale + 15}, ${svgHeight - padding - currentP.y * scale - 15})`}>
                    <rect width="60" height="30" rx="4" fill="rgba(0,0,0,0.6)" />
                    <text x="5" y="12" fill="#10b981" fontSize="8" fontWeight="bold">Vx: {currentP.vx.toFixed(1)}</text>
                    <text x="5" y="24" fill="#ef4444" fontSize="8" fontWeight="bold">Vy: {currentP.vy.toFixed(1)}</text>
                  </g>
                </g>
              )}
            </g>
          )}
        </svg>

        <div className="absolute top-6 right-6 flex flex-col gap-2 bg-black/60 backdrop-blur-md p-4 rounded-2xl border border-white/10 shadow-xl">
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Celestial Data</p>
          {(comparisonResults ? ENVIRONMENTS : [activeEnv]).map(env => env && (
             <div key={env.name} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full shadow-inner" style={{ backgroundColor: env.color }}></div>
                <span className="text-[11px] font-bold text-slate-100">{env.name} ({env.g}m/s²)</span>
             </div>
          ))}
        </div>

        <div className="flex justify-center items-center gap-8 bg-slate-900/90 border border-white/10 rounded-full px-8 py-3 w-fit mx-auto shadow-2xl backdrop-blur-2xl mb-6 z-10 transition-all hover:bg-slate-800">
          <button onClick={onReset} className="text-slate-500 hover:text-white transition-colors p-1">
            <span className="material-icons text-2xl">replay</span>
          </button>
          <button 
            onClick={onTogglePlay}
            className="w-14 h-14 rounded-full flex items-center justify-center text-white shadow-xl transition-all active:scale-90 hover:scale-110"
            style={{ backgroundColor: themeColor }}
          >
            <span className="material-icons text-4xl">{isPlaying ? 'pause' : 'play_arrow'}</span>
          </button>
          <div className="flex flex-col items-center">
            <span className="text-sm font-mono font-bold text-white leading-none">{currentTime.toFixed(2)}s</span>
            <span className="text-[9px] text-slate-500 uppercase tracking-tighter font-black">CHRONO</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SimulationCanvas;

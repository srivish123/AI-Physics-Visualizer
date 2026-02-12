
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { SimulationParameters, SimulationResult, Tab, ENVIRONMENTS, CATEGORIES } from './types';
import { calculateTrajectory } from './services/physicsService';
import { parsePhysicsProblem } from './services/geminiService';
import { speakExplanation } from './services/ttsService';
import SimulationCanvas from './components/SimulationCanvas';
import TelemetryCharts from './components/TelemetryCharts';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>(Tab.SOLVER);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isComparing, setIsComparing] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [params, setParams] = useState<SimulationParameters>({
    velocity: 25,
    angle: 45,
    gravity: 9.81,
    mass: 1.5,
    initialHeight: 0,
    airResistance: false
  });
  const [derivation, setDerivation] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  
  const timerRef = useRef<number | null>(null);
  const activeAudioSource = useRef<AudioBufferSourceNode | null>(null);

  const currentResult = useMemo(() => calculateTrajectory(params), [params]);
  
  const comparisonResults = useMemo(() => {
    if (!isComparing) return undefined;
    return ENVIRONMENTS.map(env => ({
      env,
      result: calculateTrajectory({ ...params, gravity: env.g })
    }));
  }, [isComparing, params]);

  const currentEnv = useMemo(() => {
    return ENVIRONMENTS.find(e => Math.abs(e.g - params.gravity) < 0.1) 
      || { name: 'Custom', g: params.gravity, icon: 'settings', color: '#a855f7', description: 'Custom force field.', bg: '#06090c' };
  }, [params.gravity]);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDarkMode);
  }, [isDarkMode]);

  useEffect(() => {
    if (isPlaying) {
      const maxFlightTime = isComparing && comparisonResults 
        ? Math.max(...comparisonResults.map(r => r.result.timeOfFlight))
        : (currentResult.timeOfFlight || 0.1);

      const startTimestamp = performance.now() - (currentTime * 1000);
      const update = () => {
        const now = performance.now();
        const nextTime = (now - startTimestamp) / 1000;
        if (nextTime >= maxFlightTime) {
          setCurrentTime(maxFlightTime);
          setIsPlaying(false);
        } else {
          setCurrentTime(nextTime);
          timerRef.current = requestAnimationFrame(update);
        }
      };
      timerRef.current = requestAnimationFrame(update);
    }
    return () => { if (timerRef.current) cancelAnimationFrame(timerRef.current); };
  }, [isPlaying, isComparing, comparisonResults, currentResult.timeOfFlight]);

  const handleExecute = async (inputPrompt?: string) => {
    const activePrompt = inputPrompt || prompt;
    if (!activePrompt.trim()) return;
    setIsAnalyzing(true);
    // Cleanup any existing audio before starting a new run
    stopCurrentNarration();
    try {
      const response = await parsePhysicsProblem(activePrompt);
      setParams({ ...response.parameters, airResistance: params.airResistance });
      setDerivation(response.derivationSummary);
      setCurrentTime(0);
      setActiveTab(Tab.SIMULATION);
      setIsPlaying(true);
    } catch (error) {
      alert("AI interpretation failed.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const stopCurrentNarration = () => {
    if (activeAudioSource.current) {
      try {
        activeAudioSource.current.stop();
        activeAudioSource.current.onended = null;
      } catch (e) { }
      activeAudioSource.current = null;
    }
    setIsSpeaking(false);
  };

  const handleToggleNarrator = async () => {
    if (isSpeaking) {
      stopCurrentNarration();
      return;
    }
    if (!derivation) return;
    setIsSpeaking(true);
    
    // Stop any existing context before starting new
    stopCurrentNarration();
    
    const source = await speakExplanation(derivation);
    if (source) {
      activeAudioSource.current = source;
      source.onended = () => setIsSpeaking(false);
    } else {
      setIsSpeaking(false);
    }
  };

  useEffect(() => {
    return () => stopCurrentNarration();
  }, [activeTab]);

  return (
    <div className={`min-h-screen transition-colors duration-500 font-display ${isDarkMode ? 'bg-[#06090c] text-slate-100' : 'bg-slate-50 text-slate-900'}`}>
      
      <header className={`sticky top-0 z-50 backdrop-blur-2xl border-b px-8 py-5 flex items-center justify-between ${isDarkMode ? 'bg-black/60 border-white/5' : 'bg-white/80 border-slate-200'}`}>
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center shadow-2xl shadow-primary/20">
            <span className="material-icons text-white text-3xl">motion_photos_on</span>
          </div>
          <div>
            <h1 className="font-black text-2xl tracking-tighter">PhyVis<span className="text-primary italic">AI</span></h1>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Universal Kinematics Lab</p>
          </div>
        </div>

        <nav className="flex items-center gap-2 bg-slate-200/50 dark:bg-white/5 p-1.5 rounded-2xl border border-black/5 dark:border-white/5">
          {Object.values(Tab).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-8 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === tab ? 'bg-primary text-white shadow-xl shadow-primary/30' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'}`}
            >
              {tab}
            </button>
          ))}
        </nav>

        <button onClick={() => setIsDarkMode(!isDarkMode)} className="w-12 h-12 rounded-2xl flex items-center justify-center border transition-all dark:border-white/10 dark:hover:bg-white/10 dark:bg-white/5 bg-white shadow-sm hover:bg-slate-50">
          <span className="material-icons">{isDarkMode ? 'light_mode' : 'dark_mode'}</span>
        </button>
      </header>

      <main className="max-w-7xl mx-auto p-10 pb-24">
        
        {activeTab === Tab.SOLVER && (
          <div className="space-y-16 animate-in zoom-in-95 duration-500">
            <div className="text-center space-y-6 max-w-3xl mx-auto">
              <h2 className="text-6xl font-black tracking-tighter leading-none">Universal Physics Solver</h2>
              <p className="text-xl text-slate-500 font-medium">Analyze complex kinematic scenarios with real-time vector visualization.</p>
            </div>

            <div className="max-w-4xl mx-auto space-y-12">
              <div className="relative group">
                <div className="absolute -inset-2 bg-gradient-to-r from-primary via-purple-500 to-pink-500 rounded-[2.5rem] blur-xl opacity-20 group-focus-within:opacity-40 transition duration-1000"></div>
                <div className={`relative rounded-[2rem] border-2 flex flex-col p-4 transition-all ${isDarkMode ? 'bg-slate-900/80 border-white/10' : 'bg-white border-slate-200 shadow-2xl'}`}>
                  <textarea 
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    className="w-full bg-transparent border-none focus:ring-0 p-6 text-2xl font-medium min-h-[180px] resize-none placeholder:text-slate-700"
                    placeholder="Describe a projectile scenario..."
                  />
                  <div className="flex justify-between items-center p-4 border-t border-white/5">
                    <span className="flex items-center gap-1 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                       <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
                       Gemini 3 Pro Engine
                    </span>
                    <button 
                      onClick={() => handleExecute()}
                      disabled={isAnalyzing}
                      className="px-12 py-4 bg-primary hover:bg-primary/90 text-white rounded-2xl font-black uppercase tracking-widest shadow-2xl shadow-primary/40 flex items-center gap-3 transition-all active:scale-95 disabled:opacity-50"
                    >
                      {isAnalyzing ? <span className="material-icons animate-spin">refresh</span> : <span className="material-icons">rocket_launch</span>}
                      {isAnalyzing ? 'Modeling...' : 'Initiate Run'}
                    </button>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {CATEGORIES.map((cat) => (
                  <button 
                    key={cat.id}
                    onClick={() => { setPrompt(cat.sample); handleExecute(cat.sample); }}
                    className={`text-left p-8 rounded-[2rem] border-2 transition-all group relative overflow-hidden flex flex-col gap-6 ${isDarkMode ? 'bg-slate-900/40 border-white/5 hover:border-primary/50' : 'bg-white border-slate-200 hover:border-primary shadow-lg'}`}
                  >
                    <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                      <span className="material-icons text-3xl">{cat.icon}</span>
                    </div>
                    <div>
                      <h3 className="text-xl font-black tracking-tight mb-2">{cat.title}</h3>
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-4">Sample Prompt</p>
                      <p className="text-sm text-slate-400 font-medium italic">"{cat.sample}"</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === Tab.SIMULATION && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 animate-in slide-in-from-right-10 duration-700">
            <div className="lg:col-span-8 space-y-8">
              <SimulationCanvas 
                result={currentResult} 
                comparisonResults={comparisonResults}
                currentTime={currentTime}
                isPlaying={isPlaying}
                onTogglePlay={() => setIsPlaying(!isPlaying)}
                onReset={() => { setIsPlaying(false); setCurrentTime(0); }}
                themeColor={currentEnv.color}
                activeEnv={currentEnv}
              />
              
              <div className={`p-8 rounded-[2rem] border grid grid-cols-2 md:grid-cols-4 gap-8 ${isDarkMode ? 'bg-slate-900/50 border-white/5' : 'bg-white border-slate-200 shadow-xl'}`}>
                {[
                  { label: 'Time', val: currentTime.toFixed(2), unit: 's', icon: 'schedule' },
                  { label: 'Height', val: (currentResult.trajectory[Math.floor(currentTime / (currentResult.timeOfFlight || 1) * (currentResult.trajectory.length - 1))]?.y || 0).toFixed(1), unit: 'm', icon: 'vertical_align_top' },
                  { label: 'Velocity', val: (currentResult.trajectory[Math.floor(currentTime / (currentResult.timeOfFlight || 1) * (currentResult.trajectory.length - 1))]?.v || 0).toFixed(1), unit: 'm/s', icon: 'speed' },
                  { label: 'Gravity', val: params.gravity.toFixed(2), unit: 'm/s²', icon: 'public' }
                ].map((stat, i) => (
                  <div key={i} className="space-y-1">
                    <div className="flex items-center gap-2 text-slate-500 mb-1">
                      <span className="material-icons text-[14px]">{stat.icon}</span>
                      <p className="text-[10px] uppercase font-black tracking-widest">{stat.label}</p>
                    </div>
                    <p className="text-3xl font-black font-mono tracking-tighter">{stat.val}<span className="text-xs font-normal ml-1 opacity-40">{stat.unit}</span></p>
                  </div>
                ))}
              </div>
            </div>

            <div className="lg:col-span-4 space-y-8">
              <div className={`p-8 rounded-[2rem] border space-y-8 ${isDarkMode ? 'bg-slate-900/50 border-white/5' : 'bg-white border-slate-200 shadow-xl'}`}>
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-black uppercase tracking-widest text-primary">Lab Settings</h3>
                  <div className="flex items-center gap-4">
                     <div className="flex flex-col items-center">
                       <span className="text-[8px] font-black uppercase text-slate-500 mb-1">Drag</span>
                       <button onClick={() => setParams(p => ({...p, airResistance: !p.airResistance}))} className={`w-8 h-4 rounded-full transition-all relative ${params.airResistance ? 'bg-blue-500' : 'bg-slate-700'}`}>
                         <div className={`absolute top-0.5 w-3 h-3 rounded-full bg-white transition-all ${params.airResistance ? 'left-4.5' : 'left-0.5'}`}></div>
                       </button>
                     </div>
                     <div className="flex flex-col items-center">
                        <span className="text-[8px] font-black uppercase text-slate-500 mb-1">Compare</span>
                        <button onClick={() => setIsComparing(!isComparing)} className={`w-8 h-4 rounded-full transition-all relative ${isComparing ? 'bg-primary' : 'bg-slate-700'}`}>
                          <div className={`absolute top-0.5 w-3 h-3 rounded-full bg-white transition-all ${isComparing ? 'left-4.5' : 'left-0.5'}`}></div>
                        </button>
                     </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {ENVIRONMENTS.map(env => (
                    <button key={env.name} onClick={() => { setParams(p => ({...p, gravity: env.g})); setIsComparing(false); }} className={`p-5 rounded-2xl border-2 flex flex-col items-center gap-2 transition-all group ${params.gravity === env.g && !isComparing ? 'border-primary bg-primary/10' : 'border-transparent bg-black/10 dark:bg-white/5 hover:bg-primary/5'}`}>
                      <span className="material-icons text-3xl group-hover:scale-110 transition-transform" style={{ color: env.color }}>{env.icon}</span>
                      <span className="text-[10px] font-black uppercase">{env.name}</span>
                    </button>
                  ))}
                </div>

                <div className="space-y-6 pt-6 border-t border-white/5">
                  <div className="space-y-3">
                    <div className="flex justify-between text-[10px] font-black uppercase text-slate-500">
                      <span>Launch Power</span>
                      <span className="text-white font-mono">{params.velocity} m/s</span>
                    </div>
                    <input type="range" min="1" max="150" value={params.velocity} onChange={(e) => setParams(p => ({...p, velocity: +e.target.value}))} className="w-full accent-primary h-1.5 rounded-full bg-slate-800" />
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between text-[10px] font-black uppercase text-slate-500">
                      <span>Launch Angle</span>
                      <span className="text-white font-mono">{params.angle}°</span>
                    </div>
                    <input type="range" min="0" max="90" step="0.5" value={params.angle} onChange={(e) => setParams(p => ({...p, angle: +e.target.value}))} className="w-full accent-primary h-1.5 rounded-full bg-slate-800" />
                  </div>
                </div>
              </div>

              <div className={`p-8 rounded-[2rem] border bg-gradient-to-br from-primary/10 to-transparent ${isDarkMode ? 'border-primary/20' : 'border-primary/10 shadow-lg'}`}>
                <h4 className="font-black text-[10px] uppercase tracking-widest text-primary mb-4">Scenario Brief</h4>
                <p className="text-xs text-slate-500 leading-relaxed font-medium italic">"{currentEnv.description}"</p>
                {params.initialHeight && params.initialHeight > 0 && <p className="text-[9px] mt-2 text-primary font-bold uppercase tracking-widest">Elevated Launch: {params.initialHeight}m Structure</p>}
              </div>
            </div>
          </div>
        )}

        {activeTab === Tab.ANALYSIS && (
          <div className="space-y-12 animate-in fade-in duration-700">
            <div className="flex justify-between items-end border-b border-white/5 pb-8">
              <div className="space-y-1">
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Technical Analysis</p>
                <h2 className="text-5xl font-black tracking-tighter">Kinematic Report</h2>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
              <div className="lg:col-span-8 space-y-12">
                <TelemetryCharts result={currentResult} />
                <div className={`p-10 rounded-[2.5rem] border ${isDarkMode ? 'bg-slate-900/40 border-white/5 shadow-2xl shadow-black/50' : 'bg-white border-slate-200 shadow-xl'}`}>
                  <div className="flex items-center gap-3 mb-10">
                    <span className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center">
                      <span className="material-icons text-purple-500 text-sm">history_edu</span>
                    </span>
                    <h3 className="font-black text-xs uppercase tracking-widest">Mathematical Derivation</h3>
                  </div>
                  <div className={`font-mono text-sm leading-relaxed p-10 rounded-3xl whitespace-pre-wrap ${isDarkMode ? 'bg-black/40 text-slate-400' : 'bg-slate-50 text-slate-700'}`}>
                    {derivation || "No simulation run available."}
                  </div>
                </div>
              </div>

              <div className="lg:col-span-4 space-y-8">
                <div className={`p-8 rounded-[2rem] border space-y-8 ${isDarkMode ? 'bg-slate-900/50 border-white/5' : 'bg-white border-slate-200'}`}>
                   <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-500">Core Metrics (Calculated)</h4>
                   <div className="space-y-6">
                      {[
                        { l: 'Max Altitude', v: currentResult.maxHeight, u: 'm', c: 'text-primary' },
                        { l: 'Impact Range', v: currentResult.range, u: 'm', c: 'text-purple-500' },
                        { l: 'Air Time', v: currentResult.timeOfFlight, u: 's', c: 'text-orange-500' }
                      ].map(m => (
                        <div key={m.l} className="flex justify-between items-center group">
                          <span className="text-xs font-bold text-slate-500">{m.l}</span>
                          <span className={`text-2xl font-black font-mono tracking-tighter transition-transform group-hover:scale-110 ${m.c}`}>{m.v.toFixed(2)}<span className="text-[10px] font-normal ml-1 opacity-50">{m.u}</span></span>
                        </div>
                      ))}
                   </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      <footer className="fixed bottom-0 left-0 right-0 bg-black/80 backdrop-blur-xl border-t border-white/5 px-8 py-3 flex justify-between items-center z-50">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${isAnalyzing ? 'bg-orange-500 animate-ping' : 'bg-green-500'}`}></span>
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Engine: {isAnalyzing ? 'Analyzing' : 'Ready'}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="material-icons text-[14px] text-slate-500">public</span>
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Celestial Context: {currentEnv.name}</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;

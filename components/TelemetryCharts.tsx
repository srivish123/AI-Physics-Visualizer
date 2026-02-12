
import React from 'react';
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { SimulationResult } from '../types';

interface Props {
  result: SimulationResult;
}

const TelemetryCharts: React.FC<Props> = ({ result }) => {
  const chartData = result.trajectory;

  return (
    <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="bg-background-light dark:bg-slate-900 border border-primary/10 rounded-xl p-4">
        <div className="flex justify-between items-center mb-4">
          <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400">Height vs Time</h4>
          <span className="material-icons text-primary text-sm">show_chart</span>
        </div>
        <div className="h-40 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorHeight" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2b8cee" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#2b8cee" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="t" hide />
              <YAxis domain={[0, 'auto']} hide />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', fontSize: '10px' }}
                itemStyle={{ color: '#2b8cee' }}
                labelFormatter={(val) => `Time: ${Number(val).toFixed(2)}s`}
              />
              <Area type="monotone" dataKey="y" stroke="#2b8cee" fillOpacity={1} fill="url(#colorHeight)" strokeWidth={2} dot={false} isAnimationActive={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-background-light dark:bg-slate-900 border border-primary/10 rounded-xl p-4">
        <div className="flex justify-between items-center mb-4">
          <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400">Velocity vs Time</h4>
          <span className="material-icons text-primary text-sm">speed</span>
        </div>
        <div className="h-40 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorVelocity" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#a855f7" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#a855f7" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="t" hide />
              <YAxis domain={[0, 'auto']} hide />
              <Tooltip 
                 contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', fontSize: '10px' }}
                 itemStyle={{ color: '#a855f7' }}
                 labelFormatter={(val) => `Time: ${Number(val).toFixed(2)}s`}
              />
              <Area type="monotone" dataKey="v" stroke="#a855f7" fillOpacity={1} fill="url(#colorVelocity)" strokeWidth={2} dot={false} isAnimationActive={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </section>
  );
};

export default TelemetryCharts;

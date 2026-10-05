import React, { useState } from 'react';
import { 
  AlertTriangle, 
  TrendingDown, 
  CheckCircle2, 
  RefreshCw, 
  X, 
  Zap, 
  CloudRain, 
  Clock, 
  ShieldAlert
} from 'lucide-react';
import { DEFAULT_BEFORE_AFTER_METRICS } from '../data/mockData';
import type { MetricComparison } from '../types';

export const Simulation: React.FC = () => {
  const [activeDisruption, setActiveDisruption] = useState<{
    id: string;
    title: string;
    alertMessage: string;
    type: string;
  }>({
    id: 'res_unavail',
    title: 'Resource Unavailable',
    alertMessage: 'Disruption: Aircraft A02 is now unavailable!',
    type: 'red',
  });

  const [metrics, setMetrics] = useState<MetricComparison[]>(DEFAULT_BEFORE_AFTER_METRICS);
  const [isReoptimizing, setIsReoptimizing] = useState(false);
  const [completedSteps, setCompletedSteps] = useState<number>(6);
  const [bannerVisible, setBannerVisible] = useState(true);

  const disruptions = [
    {
      id: 'res_unavail',
      label: 'Resource Unavailable',
      alert: 'Disruption: Aircraft A02 is now unavailable!',
      color: 'border-red-500/40 hover:bg-red-950/20 text-red-300',
      activeColor: 'bg-red-950/40 border-red-500 text-red-200 ring-1 ring-red-500/50',
      icon: ShieldAlert,
      metrics: [
        { metric: 'Missions Completed', before: 14, after: 14 },
        { metric: 'Average Delay', before: '8.1 mins', after: '13.2 mins' },
        { metric: 'Resource Utilization', before: '87%', after: '91%' },
        { metric: 'Constraint Violations', before: 0, after: 0 },
        { metric: 'Optimization Score', before: 93.8, after: 91.6 },
        { metric: 'Re-planning Time', before: '--', after: '1.8 sec' },
      ],
    },
    {
      id: 'res_reduced',
      label: 'Resource Capacity Reduced',
      alert: 'Disruption: Base-2 Fuel Depot degraded (-40% refuel speed)!',
      color: 'border-orange-500/40 hover:bg-orange-950/20 text-orange-300',
      activeColor: 'bg-orange-950/40 border-orange-500 text-orange-200 ring-1 ring-orange-500/50',
      icon: TrendingDown,
      metrics: [
        { metric: 'Missions Completed', before: 14, after: 13 },
        { metric: 'Average Delay', before: '8.1 mins', after: '18.4 mins' },
        { metric: 'Resource Utilization', before: '87%', after: '94%' },
        { metric: 'Constraint Violations', before: 0, after: 0 },
        { metric: 'Optimization Score', before: 93.8, after: 88.9 },
        { metric: 'Re-planning Time', before: '--', after: '1.4 sec' },
      ],
    },
    {
      id: 'prio_change',
      label: 'Mission Priority Changed',
      alert: 'Disruption: Mission M007 (Strike Support) elevated to Critical Priority Alpha!',
      color: 'border-blue-500/40 hover:bg-blue-950/20 text-blue-300',
      activeColor: 'bg-blue-950/40 border-blue-500 text-blue-200 ring-1 ring-blue-500/50',
      icon: Zap,
      metrics: [
        { metric: 'Missions Completed', before: 14, after: 14 },
        { metric: 'Average Delay', before: '8.1 mins', after: '9.6 mins' },
        { metric: 'Resource Utilization', before: '87%', after: '89%' },
        { metric: 'Constraint Violations', before: 0, after: 0 },
        { metric: 'Optimization Score', before: 93.8, after: 92.5 },
        { metric: 'Re-planning Time', before: '--', after: '0.9 sec' },
      ],
    },
    {
      id: 'weather_change',
      label: 'Weather Condition Changed',
      alert: 'Disruption: Convective storm front active in Zone B (Airway closed)!',
      color: 'border-purple-500/40 hover:bg-purple-950/20 text-purple-300',
      activeColor: 'bg-purple-950/40 border-purple-500 text-purple-200 ring-1 ring-purple-500/50',
      icon: CloudRain,
      metrics: [
        { metric: 'Missions Completed', before: 14, after: 14 },
        { metric: 'Average Delay', before: '8.1 mins', after: '15.0 mins' },
        { metric: 'Resource Utilization', before: '87%', after: '93%' },
        { metric: 'Constraint Violations', before: 0, after: 0 },
        { metric: 'Optimization Score', before: 93.8, after: 90.2 },
        { metric: 'Re-planning Time', before: '--', after: '2.1 sec' },
      ],
    },
    {
      id: 'res_delay',
      label: 'Resource Delayed',
      alert: 'Disruption: Aircraft A06 delayed returning from Zone A (+30 min)!',
      color: 'border-cyan-500/40 hover:bg-cyan-950/20 text-cyan-300',
      activeColor: 'bg-cyan-950/40 border-cyan-500 text-cyan-200 ring-1 ring-cyan-500/50',
      icon: Clock,
      metrics: [
        { metric: 'Missions Completed', before: 14, after: 14 },
        { metric: 'Average Delay', before: '8.1 mins', after: '11.8 mins' },
        { metric: 'Resource Utilization', before: '87%', after: '90%' },
        { metric: 'Constraint Violations', before: 0, after: 0 },
        { metric: 'Optimization Score', before: 93.8, after: 91.9 },
        { metric: 'Re-planning Time', before: '--', after: '1.2 sec' },
      ],
    },
  ];

  const actions = [
    'Detect disruption',
    'Identify affected missions',
    'Remove unavailable resource',
    'Re-run optimization',
    'Generate new schedule',
    'Update map and metrics',
  ];

  const selectDisruption = (d: (typeof disruptions)[0]) => {
    setActiveDisruption({
      id: d.id,
      title: d.label,
      alertMessage: d.alert,
      type: 'red',
    });
    setMetrics(d.metrics);
    setBannerVisible(true);
  };

  const handleReoptimizeNow = () => {
    setIsReoptimizing(true);
    setCompletedSteps(0);

    const stepInterval = setInterval(() => {
      setCompletedSteps((prev) => {
        if (prev >= 6) {
          clearInterval(stepInterval);
          setIsReoptimizing(false);
          return 6;
        }
        return prev + 1;
      });
    }, 250);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Page Header */}
      <div className="pb-2 border-b border-slate-800">
        <h2 className="text-xl font-bold text-white tracking-tight">
          Simulation & Dynamic Re-planning
        </h2>
        <p className="text-xs text-slate-400">
          Simulate real-time events and automatically re-optimize mission plans
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Simulate Disruption List */}
        <div className="lg:col-span-4 rounded-xl bg-[#090e1a] border border-slate-800 p-5 space-y-4">
          <div className="pb-2 border-b border-slate-800">
            <h3 className="text-sm font-bold text-white">Simulate Disruption</h3>
            <p className="text-[11px] text-slate-400">
              Click an inject event to trigger dynamic scenario
            </p>
          </div>

          <div className="space-y-2.5">
            {disruptions.map((d) => {
              const Icon = d.icon;
              const isActive = activeDisruption.id === d.id;
              return (
                <button
                  key={d.id}
                  onClick={() => selectDisruption(d)}
                  className={`w-full flex items-center gap-3 p-3 rounded-lg border text-xs font-semibold text-left transition ${
                    isActive ? d.activeColor : `bg-slate-900/60 ${d.color}`
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span className="flex-1">{d.label}</span>
                  {isActive && <span className="w-2 h-2 rounded-full bg-white animate-ping" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Column: Alert Banner, Comparison Table & Checklist */}
        <div className="lg:col-span-8 space-y-5">
          {/* Top Disruption Alert Banner */}
          {bannerVisible && (
            <div className="p-4 rounded-xl bg-red-950/50 border border-red-500/60 text-red-100 flex items-center justify-between shadow-lg shadow-red-950/40">
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 animate-bounce" />
                <span className="text-sm font-bold tracking-tight">
                  {activeDisruption.alertMessage}
                </span>
              </div>
              <button
                onClick={() => setBannerVisible(false)}
                className="text-red-400 hover:text-white p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Before vs After Re-optimization Table & Re-optimization Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Before vs After Table */}
            <div className="rounded-xl bg-[#090e1a] border border-slate-800 p-4">
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3">
                Before vs After Re-optimization
              </h3>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#0e1626] border-b border-slate-800 text-slate-400 text-[11px]">
                    <tr>
                      <th className="py-2.5 px-3 font-semibold">Metric</th>
                      <th className="py-2.5 px-3 font-semibold">Before</th>
                      <th className="py-2.5 px-3 font-semibold">After</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-medium">
                    {metrics.map((row) => (
                      <tr key={row.metric} className="hover:bg-slate-900/40 text-slate-300">
                        <td className="py-2.5 px-3 text-slate-400">{row.metric}</td>
                        <td className="py-2.5 px-3 font-mono text-slate-200">{row.before}</td>
                        <td className="py-2.5 px-3 font-mono font-bold text-sky-400">
                          {row.after}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Re-optimization Actions Checklist & Button */}
            <div className="rounded-xl bg-[#090e1a] border border-slate-800 p-4 flex flex-col justify-between">
              <div>
                <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3">
                  Re-optimization Actions
                </h3>

                <div className="space-y-2">
                  {actions.map((act, idx) => {
                    const isDone = completedSteps > idx;
                    return (
                      <div
                        key={act}
                        className={`flex items-center gap-2.5 text-xs transition-opacity duration-200 ${
                          isDone ? 'text-slate-200' : 'text-slate-600'
                        }`}
                      >
                        <div
                          className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 ${
                            isDone ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-600'
                          }`}
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        </div>
                        <span className="font-medium">{act}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Action Button: Re-optimize Now */}
              <div className="pt-5">
                <button
                  onClick={handleReoptimizeNow}
                  disabled={isReoptimizing}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-bold shadow-lg shadow-emerald-950/60 transition"
                >
                  <RefreshCw className={`w-4 h-4 ${isReoptimizing ? 'animate-spin' : ''}`} />
                  {isReoptimizing ? 'Dynamic Re-optimizing...' : 'Re-optimize Now'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import {
  AlertTriangle,
  TrendingDown,
  CheckCircle2,
  RefreshCw,
  X,
  CloudRain,
  Clock,
  ShieldAlert,
} from 'lucide-react';
import { DEFAULT_BEFORE_AFTER_METRICS } from '../data/mockData';
import type { MetricComparison } from '../types';
import { api } from '../services/api';
import { soundSynthesizer } from '../utils/audioAlert';

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
      color: 'bg-white/70 text-[#991B1B] border-[#F04452]/30',
      activeColor: 'bg-[#FDE8E8] border-2 border-[#F04452] text-[#991B1B] shadow-md',
      icon: ShieldAlert,
      metrics: [
        { metric: 'Missions Completed', before: 14, after: 14 },
        { metric: 'Average Delay', before: '8.1 mins', after: '13.2 mins' },
        { metric: 'Resource Utilization', before: '87%', after: '91%' },
        { metric: 'Constraint Violations', before: 0, after: 0 },
        { metric: 'Optimization Score', before: 93.8, after: 91.6 },
        { metric: 'Re-planning Time', before: '--', after: '38 ms' },
      ],
    },
    {
      id: 'res_reduced',
      label: 'Resource Capacity Reduced',
      alert: 'Disruption: Base-2 Fuel Depot degraded (-40% refuel throughput)!',
      color: 'bg-white/70 text-[#92400E] border-[#F4B740]/30',
      activeColor: 'bg-[#FEF3C7] border-2 border-[#F4B740] text-[#92400E] shadow-md',
      icon: TrendingDown,
      metrics: [
        { metric: 'Missions Completed', before: 14, after: 13 },
        { metric: 'Average Delay', before: '8.1 mins', after: '18.4 mins' },
        { metric: 'Resource Utilization', before: '87%', after: '84%' },
        { metric: 'Constraint Violations', before: 0, after: 0 },
        { metric: 'Optimization Score', before: 93.8, after: 88.2 },
        { metric: 'Re-planning Time', before: '--', after: '42 ms' },
      ],
    },
    {
      id: 'weather_hazard',
      label: 'Weather Hazard Incursion',
      alert: 'Disruption: Severe Thunderstorm cell closed Zone B airspace!',
      color: 'bg-white/70 text-[#1D4ED8] border-[#4285F4]/30',
      activeColor: 'bg-[#E1EFFE] border-2 border-[#4285F4] text-[#1D4ED8] shadow-md',
      icon: CloudRain,
      metrics: [
        { metric: 'Missions Completed', before: 14, after: 14 },
        { metric: 'Average Delay', before: '8.1 mins', after: '24.0 mins' },
        { metric: 'Resource Utilization', before: '87%', after: '89%' },
        { metric: 'Constraint Violations', before: 0, after: 0 },
        { metric: 'Optimization Score', before: 93.8, after: 89.5 },
        { metric: 'Re-planning Time', before: '--', after: '45 ms' },
      ],
    },
    {
      id: 'res_delay',
      label: 'Sortie Delay Cascade',
      alert: 'Disruption: Aircraft A06 delayed returning from Zone A (+30 min)!',
      color: 'bg-white/70 text-[#059669] border-[#25C98A]/30',
      activeColor: 'bg-[#DEF7EC] border-2 border-[#25C98A] text-[#059669] shadow-md',
      icon: Clock,
      metrics: [
        { metric: 'Missions Completed', before: 14, after: 14 },
        { metric: 'Average Delay', before: '8.1 mins', after: '11.8 mins' },
        { metric: 'Resource Utilization', before: '87%', after: '90%' },
        { metric: 'Constraint Violations', before: 0, after: 0 },
        { metric: 'Optimization Score', before: 93.8, after: 91.9 },
        { metric: 'Re-planning Time', before: '--', after: '35 ms' },
      ],
    },
  ];

  const actions = [
    'Detect telemetry disruption anomaly',
    'Identify affected sorties & airspace corridors',
    'Isolate unavailable resource from candidate pool',
    'Execute Google OR-Tools CP-SAT re-solver',
    'Generate conflict-free replacement timeline',
    'Broadcast updated schedule to tactical command',
  ];

  const selectDisruption = async (d: (typeof disruptions)[0]) => {
    setActiveDisruption({
      id: d.id,
      title: d.label,
      alertMessage: d.alert,
      type: 'red',
    });
    setMetrics(d.metrics);
    setBannerVisible(true);
    soundSynthesizer.playHighAlertSound(d.id);

    try {
      await api.createSimulationEvent({
        event_type: d.id.toUpperCase(),
        description: d.alert,
        severity: 'HIGH',
      });
    } catch (e) {
      console.warn('Simulation inject error:', e);
    }
  };

  const handleReoptimizeNow = async () => {
    setIsReoptimizing(true);
    setCompletedSteps(0);

    // Call real solver
    try {
      await api.solveOptimization({ consider_weather: true });
    } catch (err) {
      console.warn('Solver trigger in simulation:', err);
    }

    const stepInterval = setInterval(() => {
      setCompletedSteps((prev) => {
        if (prev >= 6) {
          clearInterval(stepInterval);
          setIsReoptimizing(false);
          soundSynthesizer.playNoticeChime();
          return 6;
        }
        return prev + 1;
      });
    }, 200);
  };

  return (
    <div className="p-6 space-y-6 bg-[#EAF2FC] min-h-screen text-[#14264A]">
      {/* Page Header */}
      <div className="pb-2 border-b border-[#C2D5ED]/60">
        <div className="flex items-center gap-2.5">
          <h2 className="text-2xl font-extrabold text-[#14264A] tracking-tight">
            Simulation & Dynamic Re-planning
          </h2>
          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-blue-100 text-[#4285F4] border border-blue-200">
            DYNAMIC RESILIENCE
          </span>
        </div>
        <p className="text-xs text-[#607391] font-medium">
          Simulate real-time operational disruptions and automatically re-solve constraint satisfaction models.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Simulate Disruption List */}
        <div className="lg:col-span-4 clay-card p-5 space-y-4">
          <div className="pb-2 border-b border-[#C2D5ED]/70">
            <h3 className="text-sm font-bold text-[#14264A]">Simulate Disruption Event</h3>
            <p className="text-[11px] text-[#607391]">
              Select a disruption inject to stress-test dynamic recovery
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
                  className={`w-full flex items-center gap-3 p-3.5 rounded-2xl border text-xs font-bold text-left transition cursor-pointer shadow-xs ${
                    isActive ? d.activeColor : `${d.color} hover:bg-white`
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span className="flex-1">{d.label}</span>
                  {isActive && <span className="w-2 h-2 rounded-full bg-[#F04452] animate-ping" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Column: Alert Banner, Comparison Table & Checklist */}
        <div className="lg:col-span-8 space-y-5">
          {/* Top Disruption Alert Banner */}
          {bannerVisible && (
            <div className="p-4 rounded-2xl bg-[#FDE8E8] border border-[#F04452]/40 text-[#991B1B] flex items-center justify-between shadow-xs animate-fade-in">
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-5 h-5 text-[#F04452] shrink-0 animate-pulse" />
                <span className="text-sm font-bold tracking-tight">
                  {activeDisruption.alertMessage}
                </span>
              </div>
              <button
                onClick={() => setBannerVisible(false)}
                className="text-[#F04452] hover:text-[#991B1B] p-1 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Before vs After Re-optimization Table & Actions Checklist */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Before vs After Table */}
            <div className="clay-card p-4">
              <h3 className="text-xs font-bold text-[#607391] uppercase tracking-wider mb-3">
                Before vs After Re-optimization
              </h3>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#EAF2FC] border-b border-[#C2D5ED]/70 text-[#607391] text-[10px] font-bold uppercase">
                    <tr>
                      <th className="py-2.5 px-3">Metric</th>
                      <th className="py-2.5 px-3">Before</th>
                      <th className="py-2.5 px-3 font-bold text-[#4285F4]">After (CP-SAT)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#C2D5ED]/40 font-medium text-[#14264A]">
                    {metrics.map((row) => (
                      <tr key={row.metric} className="hover:bg-white/50">
                        <td className="py-2.5 px-3 text-[#607391] font-semibold">{row.metric}</td>
                        <td className="py-2.5 px-3 font-mono text-[#14264A]">{row.before}</td>
                        <td className="py-2.5 px-3 font-mono font-bold text-[#4285F4]">
                          {row.after}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Re-optimization Actions Checklist & Button */}
            <div className="clay-card p-4 flex flex-col justify-between">
              <div>
                <h3 className="text-xs font-bold text-[#607391] uppercase tracking-wider mb-3">
                  Autonomous Re-optimization Pipeline
                </h3>

                <div className="space-y-2">
                  {actions.map((act, idx) => {
                    const isDone = completedSteps > idx;
                    return (
                      <div
                        key={act}
                        className={`flex items-center gap-2.5 text-xs transition-opacity duration-200 ${
                          isDone ? 'text-[#14264A]' : 'text-[#607391]/50'
                        }`}
                      >
                        <div
                          className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 ${
                            isDone
                              ? 'bg-[#DEF7EC] text-[#059669]'
                              : 'bg-slate-200 text-slate-400'
                          }`}
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        </div>
                        <span className="font-semibold text-[11px]">{act}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Action Button: Re-optimize Now */}
              <div className="pt-4 mt-3 border-t border-[#C2D5ED]/70">
                <button
                  onClick={handleReoptimizeNow}
                  disabled={isReoptimizing}
                  className="w-full clay-btn-primary py-3 px-4 flex items-center justify-center gap-2 cursor-pointer text-xs"
                >
                  <RefreshCw className={`w-4 h-4 ${isReoptimizing ? 'animate-spin' : ''}`} />
                  <span>
                    {isReoptimizing ? 'Dynamic Re-solving...' : 'Execute Dynamic Re-plan Now'}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

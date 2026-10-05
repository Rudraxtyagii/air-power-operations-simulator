import React, { useState } from 'react';
import { 
  Trophy, 
  Target, 
  BarChart3, 
  Clock, 
  Settings, 
  Play, 
  CheckCircle2, 
  RefreshCw,
  Sliders
} from 'lucide-react';
import { StatCard } from '../components/StatCard';
import { OptimizationModal } from '../components/OptimizationModal';
import { SCHEDULED_MISSIONS } from '../data/mockData';

export const Optimization: React.FC = () => {
  const [optModalOpen, setOptModalOpen] = useState(false);
  const [objective, setObjective] = useState('Minimize Delay (Balanced)');
  const [weatherCondition, setWeatherCondition] = useState(true);
  const [predictedAvailability, setPredictedAvailability] = useState(true);
  const [maintenanceConstraints, setMaintenanceConstraints] = useState(true);
  const [dynamicReoptimization, setDynamicReoptimization] = useState(true);

  const [score, setScore] = useState(92.7);
  const [completion, setCompletion] = useState(93);
  const [utilization, setUtilization] = useState(89);
  const [avgDelay, setAvgDelay] = useState(7.4);

  const [isSolving, setIsSolving] = useState(false);
  const [lastOptimizedTime, setLastOptimizedTime] = useState<string | null>(null);

  const handleRunOptimization = () => {
    setIsSolving(true);
    setTimeout(() => {
      setIsSolving(false);
      setScore(94.8);
      setCompletion(96);
      setUtilization(92);
      setAvgDelay(5.8);
      setLastOptimizedTime(
        new Date().toLocaleTimeString('en-US', {
          hour12: false,
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        })
      );
    }, 1000);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Mission Optimization</h2>
          <p className="text-xs text-slate-400">
            Generate optimal resource allocation considering constraints, priorities and real-time conditions
          </p>
        </div>

        <button
          onClick={() => setOptModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-md shadow-emerald-950/60 transition"
        >
          <Play className="w-3.5 h-3.5 fill-current" />
          Generate Optimal Plan
        </button>
      </div>

      {/* 4 KPI Telemetry Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Optimization Score"
          value={score.toFixed(1)}
          secondaryValue="/ 100"
          icon={Trophy}
          iconBgColor="bg-emerald-500/15"
          iconColor="text-emerald-400"
          badge="High Efficiency"
        />
        <StatCard
          title="Mission Completion"
          value={`${completion}%`}
          icon={Target}
          iconBgColor="bg-sky-500/15"
          iconColor="text-sky-400"
          badge="Conflict-Free"
        />
        <StatCard
          title="Resource Utilization"
          value={`${utilization}%`}
          icon={BarChart3}
          iconBgColor="bg-blue-500/15"
          iconColor="text-blue-400"
          badge="Balanced Load"
        />
        <StatCard
          title="Avg Mission Delay"
          value={`${avgDelay} mins`}
          icon={Clock}
          iconBgColor="bg-purple-500/15"
          iconColor="text-purple-400"
          badge="-28% Latency"
        />
      </div>

      {/* Main Grid: Parameters (Left) vs Schedule (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Optimization Parameters Card */}
        <div className="lg:col-span-5 rounded-xl bg-[#090e1a] border border-slate-800 p-5 flex flex-col justify-between">
          <div className="space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-sky-400" />
                <h3 className="text-sm font-bold text-white">Optimization Parameters</h3>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-sky-950 text-sky-300 border border-sky-800">
                OR-TOOLS CP-SAT
              </span>
            </div>

            {/* Objective Selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Objective</label>
              <select
                value={objective}
                onChange={(e) => setObjective(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-sky-500"
              >
                <option value="Minimize Delay (Balanced)">Minimize Delay (Balanced)</option>
                <option value="Maximize Asset Utilization">Maximize Asset Utilization</option>
                <option value="Prioritize High-Threat Intercepts">Prioritize High-Threat Intercepts</option>
                <option value="Minimize Fuel & Maintenance Burn">Minimize Fuel & Maintenance Burn</option>
              </select>
            </div>

            {/* Constraint Toggles */}
            <div className="space-y-3 pt-2">
              {/* Toggle 1: Weather */}
              <div
                onClick={() => setWeatherCondition(!weatherCondition)}
                className="flex items-center justify-between p-3 rounded-lg bg-slate-900/60 border border-slate-800 hover:border-slate-700 cursor-pointer transition select-none"
              >
                <div>
                  <span className="text-xs font-medium text-slate-200">
                    Consider Weather Conditions
                  </span>
                  <p className="text-[11px] text-slate-500">
                    Route aircraft around convective storm turbulence
                  </p>
                </div>
                <div
                  className={`w-10 h-5 rounded-full p-0.5 transition-colors ${
                    weatherCondition ? 'bg-sky-600' : 'bg-slate-700'
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full bg-white transition-transform ${
                      weatherCondition ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </div>
              </div>

              {/* Toggle 2: Predicted Availability */}
              <div
                onClick={() => setPredictedAvailability(!predictedAvailability)}
                className="flex items-center justify-between p-3 rounded-lg bg-slate-900/60 border border-slate-800 hover:border-slate-700 cursor-pointer transition select-none"
              >
                <div>
                  <span className="text-xs font-medium text-slate-200">
                    Use Predicted Availability
                  </span>
                  <p className="text-[11px] text-slate-500">
                    Apply scikit-learn turnaround regression predictions
                  </p>
                </div>
                <div
                  className={`w-10 h-5 rounded-full p-0.5 transition-colors ${
                    predictedAvailability ? 'bg-sky-600' : 'bg-slate-700'
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full bg-white transition-transform ${
                      predictedAvailability ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </div>
              </div>

              {/* Toggle 3: Maintenance Constraints */}
              <div
                onClick={() => setMaintenanceConstraints(!maintenanceConstraints)}
                className="flex items-center justify-between p-3 rounded-lg bg-slate-900/60 border border-slate-800 hover:border-slate-700 cursor-pointer transition select-none"
              >
                <div>
                  <span className="text-xs font-medium text-slate-200">
                    Enforce Maintenance Constraints
                  </span>
                  <p className="text-[11px] text-slate-500">
                    Respect mandatory depot inspections and ground turnaround times
                  </p>
                </div>
                <div
                  className={`w-10 h-5 rounded-full p-0.5 transition-colors ${
                    maintenanceConstraints ? 'bg-sky-600' : 'bg-slate-700'
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full bg-white transition-transform ${
                      maintenanceConstraints ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </div>
              </div>

              {/* Toggle 4: Dynamic Re-optimization */}
              <div
                onClick={() => setDynamicReoptimization(!dynamicReoptimization)}
                className="flex items-center justify-between p-3 rounded-lg bg-slate-900/60 border border-slate-800 hover:border-slate-700 cursor-pointer transition select-none"
              >
                <div>
                  <span className="text-xs font-medium text-slate-200">
                    Enable Dynamic Re-optimization
                  </span>
                  <p className="text-[11px] text-slate-500">
                    Automatically trigger re-solve upon telemetry anomalies
                  </p>
                </div>
                <div
                  className={`w-10 h-5 rounded-full p-0.5 transition-colors ${
                    dynamicReoptimization ? 'bg-sky-600' : 'bg-slate-700'
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full bg-white transition-transform ${
                      dynamicReoptimization ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Action Button & Timestamp */}
          <div className="pt-6">
            <button
              onClick={handleRunOptimization}
              disabled={isSolving}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs font-semibold shadow-md shadow-blue-900/40 transition"
            >
              {isSolving ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Solving Constraints...
                </>
              ) : (
                <>
                  <Settings className="w-4 h-4" />
                  Run Optimization
                </>
              )}
            </button>

            {lastOptimizedTime && (
              <div className="text-center text-[10px] text-emerald-400 font-mono mt-2">
                Last Re-optimized at {lastOptimizedTime} (0 conflicts)
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Optimized Mission Schedule Table */}
        <div className="lg:col-span-7 rounded-xl bg-[#090e1a] border border-slate-800 p-5 flex flex-col">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
            <h3 className="text-sm font-bold text-white">Optimized Mission Schedule</h3>
            <span className="text-[11px] text-slate-400 font-mono">
              6 Active Timeline Allocations
            </span>
          </div>

          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#0e1626] border-b border-slate-800 text-slate-400 font-semibold tracking-wider uppercase text-[11px]">
                <tr>
                  <th className="py-3 px-4">Mission ID</th>
                  <th className="py-3 px-4">Assigned Resource</th>
                  <th className="py-3 px-4">Start Time</th>
                  <th className="py-3 px-4">End Time</th>
                  <th className="py-3 px-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-medium">
                {SCHEDULED_MISSIONS.map((sched) => (
                  <tr key={sched.missionId} className="hover:bg-slate-900/50 transition text-slate-300">
                    <td className="py-3.5 px-4 font-mono font-bold text-sky-400">
                      {sched.missionId}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-white font-semibold flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                      {sched.assignedResource}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-300">{sched.startTime}</td>
                    <td className="py-3.5 px-4 font-mono text-slate-300">{sched.endTime}</td>
                    <td className="py-3.5 px-4 text-right">
                      <span className="px-2.5 py-1 rounded text-[11px] font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                        {sched.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Schedule Footer Note */}
          <div className="mt-4 p-3 rounded-lg bg-slate-900/80 border border-slate-800/80 text-[11px] text-slate-400 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              Schedule satisfies all airspace separation and refuel turnaround windows.
            </span>
            <span className="font-mono text-slate-300">Latency: 0.18s</span>
          </div>
        </div>
      </div>

      <OptimizationModal
        isOpen={optModalOpen}
        onClose={() => setOptModalOpen(false)}
        onComplete={() => {
          setScore(94.8);
          setCompletion(96);
        }}
      />
    </div>
  );
};

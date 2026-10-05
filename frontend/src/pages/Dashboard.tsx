import React, { useState } from 'react';
import { 
  Flag, 
  Plane, 
  Target, 
  BarChart3, 
  Cpu, 
  AlertTriangle, 
  Play, 
  CheckCircle2, 
  ShieldAlert
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { StatCard } from '../components/StatCard';
import { TacticalMap } from '../components/TacticalMap';
import { OptimizationModal } from '../components/OptimizationModal';
import { DisruptionModal } from '../components/DisruptionModal';
import { INITIAL_ALERTS, MISSION_STATUS_DATA } from '../data/mockData';

interface DashboardProps {
  onNavigateToTab?: (tab: any) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onNavigateToTab }) => {
  const [optModalOpen, setOptModalOpen] = useState(false);
  const [disruptModalOpen, setDisruptModalOpen] = useState(false);
  const [alerts, setAlerts] = useState(INITIAL_ALERTS);
  const [optimizationScore, setOptimizationScore] = useState(92.7);
  const [bannerAlert, setBannerAlert] = useState<string | null>(null);

  const handleOptimizationComplete = () => {
    setOptimizationScore(94.8);
    const newAlert = {
      id: `alt-${Date.now()}`,
      time: new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }),
      message: 'Global schedule re-optimized via CP-SAT',
      type: 'info' as const,
    };
    setAlerts([newAlert, ...alerts]);
  };

  const handleDisruptionTrigger = (label: string, details: string) => {
    setBannerAlert(`Disruption Injected: ${label} - ${details}`);
    const newAlert = {
      id: `alt-${Date.now()}`,
      time: new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }),
      message: `${label} - re-planning required`,
      type: 'unavailable' as const,
    };
    setAlerts([newAlert, ...alerts]);
  };

  const getAlertColor = (type: string) => {
    switch (type) {
      case 'unavailable':
        return 'text-amber-400 bg-amber-500/10 border-amber-500/30';
      case 'weather':
        return 'text-red-400 bg-red-500/10 border-red-500/30';
      case 'delay':
        return 'text-orange-400 bg-orange-500/10 border-orange-500/30';
      case 'info':
        return 'text-sky-400 bg-sky-500/10 border-sky-500/30';
      default:
        return 'text-slate-400 bg-slate-800 border-slate-700';
    }
  };

  const getAlertDot = (type: string) => {
    switch (type) {
      case 'unavailable':
        return 'bg-amber-400';
      case 'weather':
        return 'bg-red-400';
      case 'delay':
        return 'bg-orange-400';
      case 'info':
        return 'bg-sky-400';
      default:
        return 'bg-slate-400';
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Dynamic Banner Alert if injected */}
      {bannerAlert && (
        <div className="flex items-center justify-between p-3.5 rounded-xl bg-red-950/40 border border-red-500/50 text-red-200 text-xs font-medium animate-in fade-in duration-200">
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="w-4 h-4 text-red-400 animate-pulse" />
            <span>{bannerAlert}</span>
            <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-red-900/60 text-red-300">
              SOLVER ACTIVE
            </span>
          </div>
          <button
            onClick={() => setBannerAlert(null)}
            className="text-red-400 hover:text-white px-2 py-0.5 text-sm"
          >
            ✕
          </button>
        </div>
      )}

      {/* Top Controls / Direct Tactical Action Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b border-slate-800/80">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Operations Dashboard</h2>
          <p className="text-xs text-slate-400">
            Real-time situational awareness and mission-resource telemetry
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Button 10: Generate Optimal Plan */}
          <button
            onClick={() => setOptModalOpen(true)}
            className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-md shadow-emerald-950/60 transition"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            Generate Optimal Plan
          </button>

          {/* Button 11: Simulate Disruption */}
          <button
            onClick={() => setDisruptModalOpen(true)}
            className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-red-600/90 hover:bg-red-500 text-white text-xs font-semibold shadow-md shadow-red-950/60 transition"
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            Simulate Disruption
          </button>
        </div>
      </div>

      {/* 4 Main KPI Cards (Items 1-4) + Optimization & Readiness (Items 8-9) */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
        {/* Item 1: Total Missions */}
        <StatCard
          title="Total Missions"
          value="15"
          icon={Flag}
          iconBgColor="bg-sky-500/15"
          iconColor="text-sky-400"
          badge="100% Assigned"
          onClick={() => onNavigateToTab && onNavigateToTab('missions')}
        />

        {/* Item 2: Available Aircraft / Resources */}
        <StatCard
          title="Available Aircraft"
          value="24"
          secondaryValue="/ 30"
          icon={Plane}
          iconBgColor="bg-emerald-500/15"
          iconColor="text-emerald-400"
          badge="80% Ready"
          badgeColor="bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
          onClick={() => onNavigateToTab && onNavigateToTab('resources')}
        />

        {/* Item 3: Active Missions */}
        <StatCard
          title="Active Missions"
          value="8"
          icon={Target}
          iconBgColor="bg-amber-500/15"
          iconColor="text-amber-400"
          badge="In Flight"
          badgeColor="bg-amber-500/20 text-amber-400 border-amber-500/30"
          onClick={() => onNavigateToTab && onNavigateToTab('missions')}
        />

        {/* Item 4: Mission Completion */}
        <StatCard
          title="Mission Completion"
          value="93%"
          icon={BarChart3}
          iconBgColor="bg-purple-500/15"
          iconColor="text-purple-400"
          badge="+4.2% DoD"
          badgeColor="bg-purple-500/20 text-purple-400 border-purple-500/30"
          onClick={() => onNavigateToTab && onNavigateToTab('analytics')}
        />

        {/* Item 8: Resource Readiness */}
        <StatCard
          title="Resource Readiness"
          value="89%"
          icon={CheckCircle2}
          iconBgColor="bg-teal-500/15"
          iconColor="text-teal-400"
          badge="Optimal"
          badgeColor="bg-teal-500/20 text-teal-400 border-teal-500/30"
          onClick={() => onNavigateToTab && onNavigateToTab('resources')}
        />

        {/* Item 9: Optimization Score */}
        <StatCard
          title="Optimization Score"
          value={`${optimizationScore}`}
          secondaryValue="/ 100"
          icon={Cpu}
          iconBgColor="bg-indigo-500/15"
          iconColor="text-indigo-400"
          badge="CP-SAT Solver"
          badgeColor="bg-indigo-500/20 text-indigo-400 border-indigo-500/30"
          onClick={() => onNavigateToTab && onNavigateToTab('optimization')}
        />
      </div>

      {/* Main Grid: Item 5 (Tactical Map) & Right Column (Item 6: Chart, Item 7: Alerts) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Item 5: Abstract Operations Visualization (Map) */}
        <div className="lg:col-span-8 flex flex-col">
          <TacticalMap />
        </div>

        {/* Right Column: Donut Status Chart & Recent Alerts */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          {/* Item 6: Mission Status Chart */}
          <div className="rounded-xl bg-[#090e1a] border border-slate-800 p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Mission Status
              </h3>
              <span className="text-[11px] font-mono text-slate-400">Total: 15</span>
            </div>

            <div className="flex items-center justify-between gap-4">
              {/* Donut Chart with Center Text */}
              <div className="relative w-36 h-36 shrink-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={MISSION_STATUS_DATA}
                      cx="50%"
                      cy="50%"
                      innerRadius={42}
                      outerRadius={58}
                      paddingAngle={3}
                      dataKey="value"
                      stroke="#090e1a"
                      strokeWidth={2}
                    >
                      {MISSION_STATUS_DATA.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#0f172a',
                        borderColor: '#334155',
                        borderRadius: '8px',
                        fontSize: '11px',
                        color: '#f8fafc',
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                {/* Center text in donut hole */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-xl font-bold text-white font-mono leading-none">15</span>
                  <span className="text-[10px] text-slate-400 font-medium">Total</span>
                </div>
              </div>

              {/* Legend matching mockup */}
              <div className="flex-1 space-y-1.5 text-xs">
                {MISSION_STATUS_DATA.map((item) => (
                  <div key={item.name} className="flex items-center justify-between text-slate-300">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="text-slate-400">{item.name}</span>
                    </div>
                    <span className="font-mono font-semibold text-slate-200">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Item 7: Recent Alerts */}
          <div className="rounded-xl bg-[#090e1a] border border-slate-800 p-4 flex-1 flex flex-col">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
                Recent Alerts
              </h3>
              <span className="text-[10px] text-sky-400 font-mono">LIVE FEED</span>
            </div>

            <div className="space-y-2 overflow-y-auto max-h-[180px] pr-1 flex-1">
              {alerts.map((alert) => (
                <div
                  key={alert.id}
                  className={`p-2.5 rounded-lg border flex items-center justify-between text-xs transition ${getAlertColor(
                    alert.type
                  )}`}
                >
                  <div className="flex items-center gap-2.5 overflow-hidden">
                    <span className={`w-2 h-2 rounded-full shrink-0 ${getAlertDot(alert.type)}`} />
                    <span className="font-mono text-slate-400 shrink-0 text-[11px]">{alert.time}</span>
                    <span className="font-medium truncate text-slate-200 text-[11px]">
                      {alert.message}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <OptimizationModal
        isOpen={optModalOpen}
        onClose={() => setOptModalOpen(false)}
        onComplete={handleOptimizationComplete}
      />

      <DisruptionModal
        isOpen={disruptModalOpen}
        onClose={() => setDisruptModalOpen(false)}
        onTriggerDisruption={handleDisruptionTrigger}
      />
    </div>
  );
};

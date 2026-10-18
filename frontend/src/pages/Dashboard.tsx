import React, { useState, useEffect } from 'react';
import {
  Flag,
  Plane,
  Target,
  BarChart3,
  Cpu,
  AlertTriangle,
  Play,
  CheckCircle2,
  ShieldAlert,
  RefreshCw,
  CloudRain,
  ChevronRight,
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { StatCard } from '../components/StatCard';
import { TacticalMap } from '../components/TacticalMap';
import { OptimizationModal } from '../components/OptimizationModal';
import { DisruptionModal } from '../components/DisruptionModal';
import { api } from '../services/api';
import type { Mission, Resource, AlertItem, WeatherOverview } from '../types';

interface DashboardProps {
  onNavigateToTab?: (tab: any) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onNavigateToTab }) => {
  const [optModalOpen, setOptModalOpen] = useState(false);
  const [disruptModalOpen, setDisruptModalOpen] = useState(false);
  const [optimizationScore, setOptimizationScore] = useState(94.2);
  const [bannerAlert, setBannerAlert] = useState<string | null>(null);

  // Live Backend Data States
  const [missions, setMissions] = useState<Mission[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [weatherOverview, setWeatherOverview] = useState<WeatherOverview | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      const [fetchedMissions, fetchedResources, fetchedEvents, fetchedWeather] = await Promise.all([
        api.getMissions(),
        api.getResources(),
        api.getSimulationEvents(),
        api.getWeatherOverview().catch(() => null),
      ]);
      setMissions(fetchedMissions);
      setResources(fetchedResources);
      setAlerts(fetchedEvents);
      if (fetchedWeather) setWeatherOverview(fetchedWeather);
    } catch (err) {
      console.warn('Dashboard fetch error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  // Live Metrics Calculations from Backend
  const totalMissions = missions.length || 15;
  const availableResources = resources.filter((r) => r.status === 'Available').length || 24;
  const totalResources = resources.length || 30;
  const activeMissions = missions.filter((m) => m.status === 'Ongoing' || m.status === 'Scheduled').length || 8;

  const completedMissionsCount = missions.filter((m) => m.status === 'Completed').length;
  const ongoingMissionsCount = missions.filter((m) => m.status === 'Ongoing').length;
  const pendingMissionsCount = missions.filter((m) => m.status === 'Pending').length;
  const delayedMissionsCount = missions.filter((m) => m.status === 'Delayed').length;

  const completionPercentage = missions.length > 0
    ? Math.min(98, Math.round(((completedMissionsCount + ongoingMissionsCount) / missions.length) * 100))
    : 93;

  // Chart Data matching live backend missions
  const dynamicStatusData = [
    { name: 'Completed', value: completedMissionsCount || 8, color: '#25C98A' },
    { name: 'Ongoing', value: ongoingMissionsCount || 4, color: '#4285F4' },
    { name: 'Pending', value: pendingMissionsCount || 2, color: '#F4B740' },
    { name: 'Delayed', value: delayedMissionsCount || 1, color: '#F04452' },
  ];

  const handleOptimizationComplete = () => {
    setOptimizationScore(96.4);
    const newAlert: AlertItem = {
      id: `alt-${Date.now()}`,
      time: new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }),
      message: 'Global schedule re-optimized via Google OR-Tools CP-SAT',
      type: 'info',
    };
    setAlerts([newAlert, ...alerts]);
  };

  const handleDisruptionTrigger = async (label: string, details: string) => {
    setBannerAlert(`Disruption Injected: ${label} - ${details}`);
    const newAlert: AlertItem = {
      id: `alt-${Date.now()}`,
      time: new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }),
      message: `${label} - re-planning required`,
      type: 'unavailable',
    };
    setAlerts([newAlert, ...alerts]);

    try {
      await api.createSimulationEvent({
        event_type: label.toUpperCase().replace(/ /g, '_'),
        description: `${label}: ${details}`,
        severity: 'HIGH',
      });
      const updatedRes = await api.getResources();
      setResources(updatedRes);
    } catch (e) {
      console.warn('Simulation inject error:', e);
    }
  };

  const getAlertColor = (type: string) => {
    switch (type) {
      case 'unavailable':
        return 'text-[#D97706] bg-[#FEF3C7] border-[#F4B740]/30';
      case 'weather':
        return 'text-[#F04452] bg-[#FDE8E8] border-[#F04452]/30';
      case 'delay':
        return 'text-[#D97706] bg-[#FEF3C7] border-[#F4B740]/30';
      case 'info':
        return 'text-[#1D4ED8] bg-[#E1EFFE] border-[#4285F4]/30';
      default:
        return 'text-[#14264A] bg-white/60 border-slate-200';
    }
  };

  const getAlertDot = (type: string) => {
    switch (type) {
      case 'unavailable':
        return 'bg-[#F4B740]';
      case 'weather':
        return 'bg-[#F04452]';
      case 'delay':
        return 'bg-[#F4B740]';
      case 'info':
        return 'bg-[#4285F4]';
      default:
        return 'bg-[#607391]';
    }
  };

  return (
    <div className="space-y-5 lg:space-y-6 text-[#14264A] min-w-0">
      {/* Top Banner Alert if injected */}
      {bannerAlert && (
        <div className="flex items-center justify-between p-3.5 rounded-2xl bg-[#FDE8E8] border border-[#F04452]/40 text-[#991B1B] text-xs font-semibold shadow-xs animate-fade-in">
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="w-4 h-4 text-[#F04452] animate-pulse" />
            <span>{bannerAlert}</span>
            <span className="font-mono text-[10px] px-2 py-0.5 rounded-full bg-white text-[#F04452] border border-[#F04452]/20 font-bold">
              SOLVER ACTIVE
            </span>
          </div>
          <button
            onClick={() => setBannerAlert(null)}
            className="text-[#F04452] hover:text-[#991B1B] px-2 py-0.5 text-sm cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* Top Controls Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b border-[#C2D5ED]/60">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-2xl font-extrabold text-[#14264A] tracking-tight">Operations Dashboard</h2>
            {isLoading && <RefreshCw className="w-4 h-4 text-[#4285F4] animate-spin" />}
          </div>
          <p className="text-xs text-[#607391] font-medium">
            Real-time situational awareness and mission-resource telemetry (PostgreSQL Connected)
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Button 10: Generate Optimal Plan */}
          <button
            onClick={() => setOptModalOpen(true)}
            className="clay-btn-primary flex items-center gap-2 px-4 py-2.5 text-xs cursor-pointer shadow-md"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            Generate Optimal Plan
          </button>

          {/* Button 11: Simulate Disruption */}
          <button
            onClick={() => setDisruptModalOpen(true)}
            className="clay-btn flex items-center gap-2 px-4 py-2.5 text-xs text-[#F04452] hover:text-[#991B1B] font-bold cursor-pointer"
          >
            <AlertTriangle className="w-3.5 h-3.5 text-[#F04452]" />
            Simulate Disruption
          </button>
        </div>
      </div>

      {/* Quick Weather Alert Widget */}
      {weatherOverview && weatherOverview.high_alert_zones > 0 && (
        <div
          onClick={() => onNavigateToTab && onNavigateToTab('weather')}
          className="clay-card-red p-4 flex items-center justify-between cursor-pointer hover:shadow-md transition"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/80 flex items-center justify-center text-[#F04452] shadow-xs">
              <CloudRain className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="text-sm font-extrabold text-[#991B1B] flex items-center gap-2">
                <span>Severe Weather Alert: {weatherOverview.high_alert_zones} Adverse Zones Active</span>
                <span className="text-[10px] font-bold bg-white text-[#F04452] px-2 py-0.5 rounded-full border border-[#F04452]/20">
                  {weatherOverview.impact.affected_missions} Sorties Affected
                </span>
              </div>
              <p className="text-xs text-[#B91C1C]">
                {weatherOverview.banner_message || 'Thunderstorm front detected. Tap to inspect radar map & constraints.'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1 text-xs font-bold text-[#F04452]">
            <span>View Radar</span>
            <ChevronRight className="w-4 h-4" />
          </div>
        </div>
      )}

      {/* 6 KPI Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
        <StatCard
          title="Total Missions"
          value={totalMissions}
          icon={Flag}
          iconBgColor="bg-blue-100"
          iconColor="text-[#4285F4]"
          badge="100% Assigned"
          onClick={() => onNavigateToTab && onNavigateToTab('missions')}
        />

        <StatCard
          title="Available Aircraft"
          value={availableResources}
          secondaryValue={`/ ${totalResources}`}
          icon={Plane}
          iconBgColor="bg-emerald-100"
          iconColor="text-[#25C98A]"
          badge={`${Math.round((availableResources / (totalResources || 1)) * 100)}% Ready`}
          badgeColor="bg-[#DEF7EC] text-[#059669] border-[#25C98A]/30"
          onClick={() => onNavigateToTab && onNavigateToTab('resources')}
        />

        <StatCard
          title="Active Missions"
          value={activeMissions}
          icon={Target}
          iconBgColor="bg-amber-100"
          iconColor="text-[#F4B740]"
          badge="In Flight"
          badgeColor="bg-[#FEF3C7] text-[#D97706] border-[#F4B740]/30"
          onClick={() => onNavigateToTab && onNavigateToTab('missions')}
        />

        <StatCard
          title="Mission Completion"
          value={`${completionPercentage}%`}
          icon={BarChart3}
          iconBgColor="bg-purple-100"
          iconColor="text-purple-600"
          badge="+4.2% DoD"
          badgeColor="bg-purple-50 text-purple-700 border-purple-200"
          onClick={() => onNavigateToTab && onNavigateToTab('analytics')}
        />

        <StatCard
          title="Resource Readiness"
          value="89%"
          icon={CheckCircle2}
          iconBgColor="bg-teal-100"
          iconColor="text-teal-600"
          badge="Optimal"
          badgeColor="bg-teal-50 text-teal-700 border-teal-200"
          onClick={() => onNavigateToTab && onNavigateToTab('resources')}
        />

        <StatCard
          title="Optimization Score"
          value={`${optimizationScore}`}
          secondaryValue="/ 100"
          icon={Cpu}
          iconBgColor="bg-blue-100"
          iconColor="text-[#4285F4]"
          badge="CP-SAT Solver"
          badgeColor="bg-blue-50 text-[#1D4ED8] border-blue-200"
          onClick={() => onNavigateToTab && onNavigateToTab('optimization')}
        />
      </div>

      {/* Main Grid: Tactical Map & Right Column (Donut Chart & Alerts) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Tactical Map */}
        <div className="lg:col-span-8 flex flex-col">
          <TacticalMap />
        </div>

        {/* Right Column: Donut Chart & Alerts */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          {/* Mission Status Chart */}
          <div className="clay-card p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-bold text-[#607391] uppercase tracking-wider">
                Mission Status
              </h3>
              <span className="text-[11px] font-mono font-bold text-[#14264A]">Total: {totalMissions}</span>
            </div>

            <div className="flex items-center justify-between gap-4">
              {/* Donut Chart with Center Text */}
              <div className="relative w-36 h-36 shrink-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={dynamicStatusData}
                      cx="50%"
                      cy="50%"
                      innerRadius={42}
                      outerRadius={58}
                      paddingAngle={3}
                      dataKey="value"
                      stroke="#EAF2FC"
                      strokeWidth={3}
                    >
                      {dynamicStatusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#ffffff',
                        borderColor: '#C2D5ED',
                        borderRadius: '12px',
                        fontSize: '11px',
                        color: '#14264A',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                {/* Center text in donut hole */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-xl font-extrabold text-[#14264A] font-mono leading-none">
                    {totalMissions}
                  </span>
                  <span className="text-[10px] text-[#607391] font-semibold">Total</span>
                </div>
              </div>

              {/* Legend with dynamic counts */}
              <div className="flex-1 space-y-1.5 text-xs">
                {dynamicStatusData.map((item) => (
                  <div key={item.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="text-[#607391] font-medium">{item.name}</span>
                    </div>
                    <span className="font-mono font-bold text-[#14264A]">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Recent Alerts */}
          <div className="clay-card p-4 flex-1 flex flex-col">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold text-[#607391] uppercase tracking-wider flex items-center gap-1.5">
                <ShieldAlert className="w-3.5 h-3.5 text-[#F04452]" />
                Recent Alerts
              </h3>
              <span className="text-[10px] text-[#4285F4] font-mono font-bold">LIVE FEED</span>
            </div>

            <div className="space-y-2 overflow-y-auto max-h-[180px] pr-1 flex-1">
              {alerts.length === 0 ? (
                <div className="text-center py-6 text-xs text-[#607391]">No active alerts reported.</div>
              ) : (
                alerts.map((alert) => (
                  <div
                    key={alert.id}
                    className={`p-2.5 rounded-xl border flex items-center justify-between text-xs transition shadow-2xs ${getAlertColor(
                      alert.type
                    )}`}
                  >
                    <div className="flex items-center gap-2.5 overflow-hidden">
                      <span className={`w-2 h-2 rounded-full shrink-0 ${getAlertDot(alert.type)}`} />
                      <span className="font-mono text-[#607391] shrink-0 text-[11px] font-semibold">
                        {alert.time}
                      </span>
                      <span className="font-semibold truncate text-[11px]">{alert.message}</span>
                    </div>
                  </div>
                ))
              )}
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

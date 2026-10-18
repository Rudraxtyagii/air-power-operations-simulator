import React, { useState, useEffect } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  FastForward,
  Plus,
  ShieldCheck,
  AlertTriangle,
  Clock,
  Layers,
  Database,
  CheckCircle2,
  TrendingDown,
  RefreshCw,
  X,
  CloudRain,
  ShieldAlert,
  Sliders,
  Activity,
  FileText,
} from 'lucide-react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import type {
  SimulationScenario,
  SimulationResults,
  SimulationEventConfig,
  MetricComparison,
} from '../types';
import { DEFAULT_BEFORE_AFTER_METRICS } from '../data/mockData';
import { api } from '../services/api';
import { soundSynthesizer } from '../utils/audioAlert';

export const Simulation: React.FC = () => {
  // Navigation Tabs: Modular Sandbox Workspace vs Dynamic Re-planner (preserving earlier work)
  const [activeWorkspaceTab, setActiveWorkspaceTab] = useState<'sandbox' | 'replanner'>('sandbox');

  // Scenarios State
  const [scenarios, setScenarios] = useState<SimulationScenario[]>([]);
  const [selectedScenarioId, setSelectedScenarioId] = useState<number | null>(null);
  const [results, setResults] = useState<SimulationResults | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [actionInProgress, setActionInProgress] = useState<boolean>(false);
  const [errorNotice, setErrorNotice] = useState<string | null>(null);

  // New Scenario Modal
  const [showNewModal, setShowNewModal] = useState<boolean>(false);
  const [newScenarioName, setNewScenarioName] = useState('');
  const [newScenarioDesc, setNewScenarioDesc] = useState('');
  const [newDuration, setNewDuration] = useState(240);
  const [newStep, setNewStep] = useState(15);
  const [newSeed, setNewSeed] = useState(42);
  const [newEventTarget, setNewEventTarget] = useState('A02');
  const [newEventType, setNewEventType] = useState('RESOURCE_UNAVAILABLE');
  const [newEventTime, setNewEventTime] = useState(30);

  // --- Dynamic Re-planner State (Preserved from original implementation) ---
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

  // Fetch initial scenarios on mount
  useEffect(() => {
    loadScenarios();
  }, []);

  const loadScenarios = async () => {
    try {
      setLoading(true);
      const list = await api.getSimulations();
      setScenarios(list);
      if (list.length > 0) {
        const initialId = selectedScenarioId || list[0].id;
        setSelectedScenarioId(initialId);
        await loadResults(initialId);
      }
    } catch (err: any) {
      console.error('Failed to load scenarios:', err);
      setErrorNotice('Could not connect to simulation API backend.');
    } finally {
      setLoading(false);
    }
  };

  const loadResults = async (scenarioId: number) => {
    try {
      const res = await api.getSimulationResults(scenarioId);
      setResults(res);
    } catch (err) {
      console.warn(`No results yet for scenario ${scenarioId}`);
      setResults(null);
    }
  };

  const handleSelectScenario = async (id: number) => {
    setSelectedScenarioId(id);
    await loadResults(id);
  };

  // Execution Handlers
  const handleRun = async () => {
    if (!selectedScenarioId) return;
    try {
      setActionInProgress(true);
      soundSynthesizer.playNoticeChime();
      await api.runSimulation(selectedScenarioId);
      await loadScenarios();
      await loadResults(selectedScenarioId);
    } catch (err: any) {
      setErrorNotice(`Run failed: ${err.message}`);
    } finally {
      setActionInProgress(false);
    }
  };

  const handlePause = async () => {
    if (!selectedScenarioId) return;
    try {
      setActionInProgress(true);
      await api.pauseSimulation(selectedScenarioId);
      await loadScenarios();
      await loadResults(selectedScenarioId);
    } catch (err: any) {
      setErrorNotice(`Pause failed: ${err.message}`);
    } finally {
      setActionInProgress(false);
    }
  };

  const handleResume = async () => {
    if (!selectedScenarioId) return;
    try {
      setActionInProgress(true);
      await api.resumeSimulation(selectedScenarioId);
      await loadScenarios();
      await loadResults(selectedScenarioId);
    } catch (err: any) {
      setErrorNotice(`Resume failed: ${err.message}`);
    } finally {
      setActionInProgress(false);
    }
  };

  const handleReset = async () => {
    if (!selectedScenarioId) return;
    try {
      setActionInProgress(true);
      await api.resetSimulation(selectedScenarioId);
      await loadScenarios();
      await loadResults(selectedScenarioId);
    } catch (err: any) {
      setErrorNotice(`Reset failed: ${err.message}`);
    } finally {
      setActionInProgress(false);
    }
  };

  const handleCreateScenario = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newScenarioName.trim()) return;

    try {
      setActionInProgress(true);
      const events: SimulationEventConfig[] = [
        {
          virtual_time_minutes: newEventTime,
          event_type: newEventType,
          target_code: newEventTarget,
          severity: 'HIGH',
          description: `Simulated event: ${newEventType} affecting ${newEventTarget}`,
          parameters: {},
        },
      ];

      const created = await api.createSimulation( {
        name: newScenarioName,
        description: newScenarioDesc || 'Configured sandboxed simulation scenario.',
        duration_minutes: newDuration,
        time_step_minutes: newStep,
        random_seed: newSeed,
        events_config: events,
      });

      setShowNewModal(false);
      setNewScenarioName('');
      setNewScenarioDesc('');
      await loadScenarios();
      setSelectedScenarioId(created.id);
      await loadResults(created.id);
    } catch (err: any) {
      setErrorNotice(`Failed to create scenario: ${err.message}`);
    } finally {
      setActionInProgress(false);
    }
  };

  // Re-planner actions
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

  const selectedScenario = scenarios.find((s) => s.id === selectedScenarioId);
  const currentRun = selectedScenario?.latest_run;
  const runStatus = currentRun?.status || selectedScenario?.status || 'READY';

  // Format virtual time e.g. T+02:15
  const currentVtMinutes = currentRun?.current_virtual_time_minutes || 0;
  const totalVtMinutes = selectedScenario?.duration_minutes || 240;
  const progressPct = Math.min(100, Math.round((currentVtMinutes / totalVtMinutes) * 100));

  // Parse events config
  let parsedEvents: any[] = [];
  try {
    parsedEvents = selectedScenario?.events_config ? JSON.parse(selectedScenario.events_config) : [];
  } catch {
    parsedEvents = [];
  }

  return (
    <div className="space-y-5 lg:space-y-6 text-[#14264A] min-w-0">
      {/* Page Header with Workspace Tabs */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-[#C2D5ED]/60">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-2xl font-extrabold text-[#14264A] tracking-tight">
              Simulation Engine & Operations Sandbox
            </h2>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-[#059669] border border-emerald-200">
              DISCRETE STEP v1.0
            </span>
          </div>
          <p className="text-xs text-[#607391] font-medium">
            Sandboxed simulation engine with virtual clock, deterministic random seeds, and immutable snapshot isolation.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center bg-white/70 p-1 rounded-2xl border border-[#C2D5ED]/70 shadow-xs">
          <button
            onClick={() => setActiveWorkspaceTab('sandbox')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
              activeWorkspaceTab === 'sandbox'
                ? 'bg-[#4285F4] text-white shadow-xs'
                : 'text-[#607391] hover:text-[#14264A]'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Sandbox Workspace</span>
          </button>
          <button
            onClick={() => setActiveWorkspaceTab('replanner')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
              activeWorkspaceTab === 'replanner'
                ? 'bg-[#4285F4] text-white shadow-xs'
                : 'text-[#607391] hover:text-[#14264A]'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Dynamic Re-planner</span>
          </button>
        </div>
      </div>

      {errorNotice && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center justify-between">
          <span>{errorNotice}</span>
          <button onClick={() => setErrorNotice(null)} className="text-red-500 hover:text-red-800">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* VIEW 1: MODULAR SANDBOX WORKSPACE */}
      {activeWorkspaceTab === 'sandbox' && (
        <div className="space-y-6">
          {/* Top Security & Strict Data Isolation Banner */}
          <div className="p-3.5 rounded-2xl bg-gradient-to-r from-[#DEF7EC] to-[#E1EFFE] border border-[#25C98A]/40 text-[#065F46] flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
            <div className="flex items-center gap-3">
              <ShieldCheck className="w-5 h-5 text-[#059669] shrink-0" />
              <div>
                <span className="text-xs font-black tracking-wide uppercase text-[#059669]">
                  Strict Data Isolation Active
                </span>
                <p className="text-[11px] text-[#065F46] font-medium">
                  Simulation executes in-memory against frozen snapshot records. Original operational databases and telemetry logs are 100% immutable and isolated.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className="px-2.5 py-1 rounded-lg bg-white/80 text-[10px] font-mono font-bold text-[#059669] border border-[#25C98A]/30">
                SNAPSHOT ISOLATED
              </span>
            </div>
          </div>

          {/* Scenario Selector & Virtual Clock HUD */}
          <div className="clay-card p-4 sm:p-5 space-y-4">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-3 border-b border-[#C2D5ED]/60">
              {/* Scenario Picker */}
              <div className="flex items-center gap-3 flex-wrap">
                <span className="text-xs font-bold text-[#607391] uppercase tracking-wider flex items-center gap-1.5">
                  Scenario:
                  {loading && <RefreshCw className="w-3 h-3 animate-spin text-[#4285F4]" />}
                </span>
                <select
                  value={selectedScenarioId || ''}
                  onChange={(e) => handleSelectScenario(Number(e.target.value))}
                  className="clay-inset px-3 py-1.5 text-xs font-bold text-[#14264A] bg-white/80 rounded-xl cursor-pointer focus:outline-none"
                >
                  {scenarios.map((scen) => (
                    <option key={scen.id} value={scen.id}>
                      [{scen.scenario_code}] {scen.name}
                    </option>
                  ))}
                </select>

                <button
                  onClick={() => setShowNewModal(true)}
                  className="clay-btn-secondary py-1.5 px-3 flex items-center gap-1.5 text-xs cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5 text-[#4285F4]" />
                  <span>New Scenario</span>
                </button>
              </div>

              {/* Virtual Clock Display & Status */}
              <div className="flex items-center gap-4 flex-wrap">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-[#4285F4]" />
                  <span className="text-xs font-mono font-bold text-[#14264A]">
                    Virtual Clock: T+{(currentVtMinutes / 60).toFixed(0).padStart(2, '0')}:{(currentVtMinutes % 60).toString().padStart(2, '0')} / T+{(totalVtMinutes / 60).toFixed(0).padStart(2, '0')}:00
                  </span>
                </div>

                <span
                  className={`px-3 py-1 rounded-full text-[11px] font-mono font-black border uppercase ${
                    runStatus === 'RUNNING'
                      ? 'bg-blue-100 text-[#1D4ED8] border-blue-300 animate-pulse'
                      : runStatus === 'COMPLETED'
                      ? 'bg-emerald-100 text-[#059669] border-emerald-300'
                      : runStatus === 'PAUSED'
                      ? 'bg-amber-100 text-[#D97706] border-amber-300'
                      : 'bg-slate-100 text-[#4B5563] border-slate-300'
                  }`}
                >
                  STATUS: {runStatus}
                </span>
              </div>
            </div>

            {/* Virtual Timeline Progress Bar */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-[11px] font-mono text-[#607391]">
                <span>Timeline Progression: {progressPct}%</span>
                <span>Seed: #{selectedScenario?.random_seed || 42} (Deterministic)</span>
              </div>
              <div className="w-full h-2.5 bg-slate-200/80 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#4285F4] to-[#25C98A] transition-all duration-300"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
            </div>

            {/* Execution Control Buttons */}
            <div className="flex items-center justify-between gap-3 pt-2 flex-wrap">
              <div className="flex items-center gap-2">
                {/* Run Button */}
                <button
                  onClick={handleRun}
                  disabled={actionInProgress || runStatus === 'RUNNING' || runStatus === 'COMPLETED'}
                  className="clay-btn-primary py-2 px-4 flex items-center gap-2 text-xs font-bold disabled:opacity-50 cursor-pointer"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Execute Run</span>
                </button>

                {/* Pause Button */}
                <button
                  onClick={handlePause}
                  disabled={actionInProgress || runStatus !== 'RUNNING'}
                  className="clay-btn-secondary py-2 px-3 flex items-center gap-1.5 text-xs font-bold disabled:opacity-50 cursor-pointer text-amber-700"
                >
                  <Pause className="w-3.5 h-3.5 fill-current" />
                  <span>Pause</span>
                </button>

                {/* Resume Button */}
                <button
                  onClick={handleResume}
                  disabled={actionInProgress || runStatus !== 'PAUSED'}
                  className="clay-btn-secondary py-2 px-3 flex items-center gap-1.5 text-xs font-bold disabled:opacity-50 cursor-pointer text-[#4285F4]"
                >
                  <FastForward className="w-3.5 h-3.5" />
                  <span>Resume</span>
                </button>

                {/* Reset Button */}
                <button
                  onClick={handleReset}
                  disabled={actionInProgress}
                  className="clay-btn-secondary py-2 px-3 flex items-center gap-1.5 text-xs font-bold disabled:opacity-50 cursor-pointer text-slate-700"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset State</span>
                </button>
              </div>

              {/* Execution Duration Metadata */}
              {currentRun && currentRun.execution_duration_ms > 0 && (
                <div className="text-[11px] font-mono text-[#607391]">
                  Execution time: <strong className="text-[#14264A]">{currentRun.execution_duration_ms} ms</strong> | Events processed: <strong className="text-[#14264A]">{currentRun.events_processed_count}</strong>
                </div>
              )}
            </div>
          </div>

          {/* Scenario Details & Snapshot Provenance */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* Left Column: Snapshot & Config Info */}
            <div className="lg:col-span-5 clay-card p-4 space-y-3.5">
              <div className="flex items-center justify-between pb-2 border-b border-[#C2D5ED]/70">
                <div className="flex items-center gap-2">
                  <Database className="w-4 h-4 text-[#4285F4]" />
                  <h3 className="text-xs font-bold text-[#14264A] uppercase tracking-wider">
                    Snapshot Provenance
                  </h3>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-50 text-[#4285F4] border border-blue-200">
                  {selectedScenario?.snapshot?.snapshot_version || 'v1.0'}
                </span>
              </div>

              <div className="text-xs space-y-2 text-[#14264A]">
                <p className="text-[11px] text-[#607391]">
                  {selectedScenario?.description}
                </p>

                <div className="grid grid-cols-3 gap-2 pt-1 text-center font-mono">
                  <div className="clay-inset p-2">
                    <span className="block text-[10px] text-[#607391]">RESOURCES</span>
                    <strong className="text-xs text-[#14264A]">
                      {selectedScenario?.snapshot?.resources_count || 30}
                    </strong>
                  </div>
                  <div className="clay-inset p-2">
                    <span className="block text-[10px] text-[#607391]">MISSIONS</span>
                    <strong className="text-xs text-[#14264A]">
                      {selectedScenario?.snapshot?.missions_count || 15}
                    </strong>
                  </div>
                  <div className="clay-inset p-2">
                    <span className="block text-[10px] text-[#607391]">ZONES</span>
                    <strong className="text-xs text-[#14264A]">
                      {selectedScenario?.snapshot?.weather_zones_count || 9}
                    </strong>
                  </div>
                </div>

                <div className="pt-2 text-[11px] text-[#607391] space-y-1">
                  <div>
                    <span className="font-semibold text-[#14264A]">Provenance:</span>{' '}
                    {selectedScenario?.snapshot?.data_provenance}
                  </div>
                  <div>
                    <span className="font-semibold text-[#14264A]">Resolution:</span>{' '}
                    {selectedScenario?.time_step_minutes} min discrete intervals
                  </div>
                  <div>
                    <span className="font-semibold text-[#14264A]">Data Quality:</span>{' '}
                    <span className="font-bold text-[#059669]">
                      {selectedScenario?.snapshot?.data_freshness_status || 'CURRENT_VERIFIED'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Configured Test Events */}
            <div className="lg:col-span-7 clay-card p-4 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-[#C2D5ED]/70">
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-[#4285F4]" />
                  <h3 className="text-xs font-bold text-[#14264A] uppercase tracking-wider">
                    Configured Fictional Events ({parsedEvents.length})
                  </h3>
                </div>
                <span className="text-[10px] text-[#607391]">Chronological Timeline</span>
              </div>

              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {parsedEvents.length === 0 ? (
                  <p className="text-xs text-[#607391] italic py-3 text-center">
                    No discrete events configured for this scenario.
                  </p>
                ) : (
                  parsedEvents.map((ev: any, idx: number) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded-xl bg-white/70 border border-[#C2D5ED]/60 flex items-start justify-between gap-3 text-xs"
                    >
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="px-1.5 py-0.5 text-[10px] font-mono font-bold bg-[#E1EFFE] text-[#1D4ED8] rounded">
                            T+{(ev.virtual_time_minutes / 60).toFixed(0).padStart(2, '0')}:{(ev.virtual_time_minutes % 60).toString().padStart(2, '0')}
                          </span>
                          <span className="font-bold text-[#14264A]">{ev.event_type}</span>
                          <span className="px-1.5 py-0.2 rounded text-[10px] font-mono font-bold bg-slate-100 text-slate-700">
                            {ev.target_code}
                          </span>
                        </div>
                        <p className="text-[11px] text-[#607391]">{ev.description}</p>
                      </div>
                      <span
                        className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                          ev.severity === 'CRITICAL'
                            ? 'bg-red-100 text-red-700'
                            : ev.severity === 'HIGH'
                            ? 'bg-amber-100 text-amber-700'
                            : 'bg-blue-100 text-blue-700'
                        }`}
                      >
                        {ev.severity}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Metric Comparison Cards */}
          {results && results.metrics && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {/* Card 1: Fleet Availability */}
              <div className="clay-card p-4">
                <span className="text-[10px] font-bold text-[#607391] uppercase tracking-wider block mb-1">
                  Fleet Availability
                </span>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-black text-[#14264A]">
                    {results.metrics.fleet_availability_pct}%
                  </span>
                  {results.baseline_vs_scenario?.availability_change_pct !== undefined && (
                    <span
                      className={`text-xs font-bold ${
                        results.baseline_vs_scenario.availability_change_pct < 0
                          ? 'text-[#DC2626]'
                          : 'text-[#059669]'
                      }`}
                    >
                      {results.baseline_vs_scenario.availability_change_pct > 0 ? '+' : ''}
                      {results.baseline_vs_scenario.availability_change_pct}%
                    </span>
                  )}
                </div>
                <span className="text-[10px] text-[#607391]">vs 80.0% Baseline</span>
              </div>

              {/* Card 2: Average Delay */}
              <div className="clay-card p-4">
                <span className="text-[10px] font-bold text-[#607391] uppercase tracking-wider block mb-1">
                  Average Delay
                </span>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-black text-[#14264A]">
                    {results.metrics.average_delay_minutes} min
                  </span>
                  <span className="text-xs font-bold text-amber-600">
                    +{results.baseline_vs_scenario?.delay_increase_minutes || 0}m
                  </span>
                </div>
                <span className="text-[10px] text-[#607391]">vs 8.1 min Baseline</span>
              </div>

              {/* Card 3: Completed vs Delayed Sorties */}
              <div className="clay-card p-4">
                <span className="text-[10px] font-bold text-[#607391] uppercase tracking-wider block mb-1">
                  Sortie Distribution
                </span>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-black text-[#059669]">
                    {results.metrics.completed_missions} Done
                  </span>
                  <span className="text-xs font-bold text-[#DC2626]">
                    / {results.metrics.delayed_missions} Delayed
                  </span>
                </div>
                <span className="text-[10px] text-[#607391]">Out of 15 scheduled sorties</span>
              </div>

              {/* Card 4: Constraint Conflicts */}
              <div className="clay-card p-4">
                <span className="text-[10px] font-bold text-[#607391] uppercase tracking-wider block mb-1">
                  Constraint Conflicts
                </span>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-black text-[#14264A]">
                    {results.metrics.constraint_violations || 0}
                  </span>
                  <span className="text-xs font-mono font-bold text-[#059669]">
                    {results.metrics.constraint_violations === 0 ? 'Optimal' : 'Needs Re-plan'}
                  </span>
                </div>
                <span className="text-[10px] text-[#607391]">Asset matching constraints</span>
              </div>
            </div>
          )}

          {/* Time-Series Charts (Recharts) */}
          {results && results.time_series && results.time_series.length > 0 && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {/* Availability Trend Line Chart */}
              <div className="clay-card p-4 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-[#C2D5ED]/60">
                  <h3 className="text-xs font-bold text-[#14264A] uppercase tracking-wider">
                    Simulated Fleet Availability Over Time
                  </h3>
                  <span className="text-[10px] font-mono text-[#4285F4] font-bold">
                    RECHARTS TIME-SERIES
                  </span>
                </div>

                <div className="h-60 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={results.time_series} margin={{ top: 10, right: 20, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#C2D5ED" opacity={0.6} />
                      <XAxis dataKey="virtual_time_label" tick={{ fontSize: 10, fill: '#607391' }} />
                      <YAxis domain={[40, 100]} tick={{ fontSize: 10, fill: '#607391' }} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#FFFFFF',
                          borderColor: '#C2D5ED',
                          borderRadius: '12px',
                          fontSize: '11px',
                          color: '#14264A',
                        }}
                      />
                      <Legend wrapperStyle={{ fontSize: '11px' }} />
                      <Line
                        type="monotone"
                        dataKey="fleet_availability_pct"
                        name="Fleet Availability %"
                        stroke="#4285F4"
                        strokeWidth={2.5}
                        dot={{ r: 3, fill: '#4285F4' }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Sorties Status Bar Chart */}
              <div className="clay-card p-4 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-[#C2D5ED]/60">
                  <h3 className="text-xs font-bold text-[#14264A] uppercase tracking-wider">
                    Sortie Status Progression
                  </h3>
                  <span className="text-[10px] font-mono text-[#25C98A] font-bold">
                    MISSION TIMELINE
                  </span>
                </div>

                <div className="h-60 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={results.time_series} margin={{ top: 10, right: 20, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#C2D5ED" opacity={0.6} />
                      <XAxis dataKey="virtual_time_label" tick={{ fontSize: 10, fill: '#607391' }} />
                      <YAxis tick={{ fontSize: 10, fill: '#607391' }} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#FFFFFF',
                          borderColor: '#C2D5ED',
                          borderRadius: '12px',
                          fontSize: '11px',
                        }}
                      />
                      <Legend wrapperStyle={{ fontSize: '11px' }} />
                      <Bar dataKey="active_missions_count" name="Active Sorties" fill="#4285F4" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="delayed_missions_count" name="Delayed Sorties" fill="#F04452" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="completed_missions_count" name="Completed Sorties" fill="#25C98A" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}

          {/* Event History & Simulated Asset State Table */}
          {results && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
              {/* Event Execution Audit Log */}
              <div className="lg:col-span-6 clay-card p-4 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-[#C2D5ED]/60">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-[#4285F4]" />
                    <h3 className="text-xs font-bold text-[#14264A] uppercase tracking-wider">
                      Executed Discrete Event Log ({results.event_history.length})
                    </h3>
                  </div>
                  <span className="text-[10px] font-mono text-[#059669]">REPRODUCIBLE</span>
                </div>

                <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                  {results.event_history.length === 0 ? (
                    <p className="text-xs text-[#607391] py-4 text-center italic">
                      Run the simulation to process and audit scheduled events.
                    </p>
                  ) : (
                    results.event_history.map((ev) => (
                      <div
                        key={ev.id}
                        className="p-2.5 rounded-xl bg-white/60 border border-[#C2D5ED]/70 space-y-1 text-xs"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-blue-100 text-[#1D4ED8]">
                            T+{(ev.virtual_time_minutes / 60).toFixed(0).padStart(2, '0')}:{(ev.virtual_time_minutes % 60).toString().padStart(2, '0')}
                          </span>
                          <span className="font-bold text-[#14264A]">{ev.event_type}</span>
                          <span className="font-mono text-[10px] text-[#607391]">
                            Target: {ev.target_code}
                          </span>
                        </div>
                        <p className="text-[11px] text-[#607391]">{ev.description}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Simulated In-Memory Resource States */}
              <div className="lg:col-span-6 clay-card p-4 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-[#C2D5ED]/60">
                  <h3 className="text-xs font-bold text-[#14264A] uppercase tracking-wider">
                    Simulated Asset State (Sandboxed)
                  </h3>
                  <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    LIVE DB UNTOUCHED
                  </span>
                </div>

                <div className="overflow-x-auto max-h-60">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#EAF2FC] border-b border-[#C2D5ED]/70 text-[#607391] text-[10px] font-bold uppercase sticky top-0">
                      <tr>
                        <th className="py-2 px-2.5">Asset Code</th>
                        <th className="py-2 px-2.5">Simulated Status</th>
                        <th className="py-2 px-2.5">Data Isolation</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#C2D5ED]/40 text-[#14264A]">
                      {results.simulated_resources && results.simulated_resources.length > 0 ? (
                        results.simulated_resources.slice(0, 10).map((r) => (
                          <tr key={r.code} className="hover:bg-white/50">
                            <td className="py-1.5 px-2.5 font-mono font-bold">{r.code}</td>
                            <td className="py-1.5 px-2.5">
                              <span
                                className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                  r.status === 'AVAILABLE'
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : r.status === 'UNAVAILABLE'
                                    ? 'bg-red-100 text-red-800'
                                    : r.status === 'MAINTENANCE'
                                    ? 'bg-amber-100 text-amber-800'
                                    : 'bg-blue-100 text-blue-800'
                                }`}
                              >
                                {r.status}
                              </span>
                            </td>
                            <td className="py-1.5 px-2.5 text-[10px] font-mono text-[#059669]">
                              In-Memory Sandbox
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={3} className="py-3 text-center text-xs text-[#607391] italic">
                            Simulated asset table will populate after executing run.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* VIEW 2: DYNAMIC RE-PLANNER (CP-SAT Ingestion from original implementation) */}
      {activeWorkspaceTab === 'replanner' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Column: Simulate Disruption List */}
            <div className="lg:col-span-4 clay-card p-5 space-y-4">
              <div className="pb-2 border-b border-[#C2D5ED]/70">
                <h3 className="text-sm font-bold text-[#14264A]">Simulate Disruption Event</h3>
                <p className="text-[11px] text-[#607391]">
                  Select a disruption inject to stress-test dynamic recovery with Google OR-Tools
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
      )}

      {/* MODAL: CREATE NEW SCENARIO */}
      {showNewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="bg-[#EAF2FC] border border-white/80 shadow-2xl rounded-3xl p-6 w-full max-w-lg space-y-4 text-[#14264A]">
            <div className="flex items-center justify-between pb-2 border-b border-[#C2D5ED]/60">
              <h3 className="text-sm font-extrabold text-[#14264A]">
                Create New Simulation Scenario
              </h3>
              <button
                onClick={() => setShowNewModal(false)}
                className="text-[#607391] hover:text-[#14264A] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateScenario} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-[#607391] mb-1">
                  Scenario Name
                </label>
                <input
                  type="text"
                  required
                  value={newScenarioName}
                  onChange={(e) => setNewScenarioName(e.target.value)}
                  placeholder="e.g. Coastal Convective Incursion & Base Scramble"
                  className="w-full clay-inset px-3 py-2 rounded-xl text-xs bg-white/80 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#607391] mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  value={newScenarioDesc}
                  onChange={(e) => setNewScenarioDesc(e.target.value)}
                  placeholder="Describe the operational stress test scenario..."
                  className="w-full clay-inset px-3 py-2 rounded-xl text-xs bg-white/80 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-[#607391] mb-1">
                    Duration (mins)
                  </label>
                  <input
                    type="number"
                    min={15}
                    max={1440}
                    step={15}
                    value={newDuration}
                    onChange={(e) => setNewDuration(Number(e.target.value))}
                    className="w-full clay-inset px-3 py-2 rounded-xl text-xs bg-white/80 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-[#607391] mb-1">
                    Step (mins)
                  </label>
                  <input
                    type="number"
                    min={5}
                    max={60}
                    value={newStep}
                    onChange={(e) => setNewStep(Number(e.target.value))}
                    className="w-full clay-inset px-3 py-2 rounded-xl text-xs bg-white/80 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-[#607391] mb-1">
                    Random Seed
                  </label>
                  <input
                    type="number"
                    value={newSeed}
                    onChange={(e) => setNewSeed(Number(e.target.value))}
                    className="w-full clay-inset px-3 py-2 rounded-xl text-xs bg-white/80 font-mono"
                  />
                </div>
              </div>

              {/* Fictional Event Ingestion */}
              <div className="pt-2 border-t border-[#C2D5ED]/60 space-y-2">
                <span className="text-[11px] font-bold text-[#14264A] block">
                  Add Fictional Test Event Inject
                </span>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-[9px] font-bold text-[#607391]">Time (min)</label>
                    <input
                      type="number"
                      min={0}
                      value={newEventTime}
                      onChange={(e) => setNewEventTime(Number(e.target.value))}
                      className="w-full clay-inset px-2.5 py-1.5 rounded-lg text-xs bg-white/80 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] font-bold text-[#607391]">Type</label>
                    <select
                      value={newEventType}
                      onChange={(e) => setNewEventType(e.target.value)}
                      className="w-full clay-inset px-2.5 py-1.5 rounded-lg text-xs bg-white/80"
                    >
                      <option value="RESOURCE_UNAVAILABLE">Resource Unavailable</option>
                      <option value="WEATHER_HAZARD">Weather Hazard Incursion</option>
                      <option value="TRAJECTORY_DELAY">Trajectory / Sortie Delay</option>
                      <option value="MAINTENANCE_SURGE">Maintenance Surge</option>
                      <option value="CAPACITY_REDUCED">Capacity Reduced</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[9px] font-bold text-[#607391]">Target Code</label>
                    <input
                      type="text"
                      value={newEventTarget}
                      onChange={(e) => setNewEventTarget(e.target.value)}
                      placeholder="e.g. A02, ZONE_B"
                      className="w-full clay-inset px-2.5 py-1.5 rounded-lg text-xs bg-white/80 font-mono"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#C2D5ED]/60">
                <button
                  type="button"
                  onClick={() => setShowNewModal(false)}
                  className="clay-btn-secondary px-4 py-2 text-xs font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionInProgress}
                  className="clay-btn-primary px-4 py-2 text-xs font-bold cursor-pointer"
                >
                  Capture Snapshot & Create Scenario
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

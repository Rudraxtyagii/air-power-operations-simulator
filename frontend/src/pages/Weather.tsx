import React, { useState, useEffect } from 'react';
import {
  CloudLightning,
  CloudRain,
  CloudSnow,
  CloudFog,
  Wind,
  Flame,
  AlertTriangle,
  MapPin,
  RefreshCw,
  Crosshair,
  Eye,
  CheckCircle2,
  Cpu,
  Layers,
  ChevronRight,
  Sun,
  CloudSun,
} from 'lucide-react';
import { api } from '../services/api';
import type { WeatherOverview, WeatherZone, WeatherAlert } from '../types';
import { soundSynthesizer } from '../utils/audioAlert';
import { WeatherRiskMap } from '../components/WeatherRiskMap';

interface WeatherProps {
  onNavigateToOptimization?: () => void;
}

export const Weather: React.FC<WeatherProps> = ({ onNavigateToOptimization }) => {
  const [overview, setOverview] = useState<WeatherOverview | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [optimizing, setOptimizing] = useState<boolean>(false);
  const [optSuccessMsg, setOptSuccessMsg] = useState<string | null>(null);
  const [selectedZone, setSelectedZone] = useState<WeatherZone | null>(null);
  const [selectedAlert, setSelectedAlert] = useState<WeatherAlert | null>(null);
  const [showScenarioModal, setShowScenarioModal] = useState<boolean>(false);

  const fetchWeather = async () => {
    try {
      setLoading(true);
      const data = await api.getWeatherOverview();
      setOverview(data);

      // Play alert chime if high alert is active and sound is enabled
      if (data.high_alert_zones > 0) {
        soundSynthesizer.playHighAlertSound(data.banner_zone || 'ZONE_B');
      }
    } catch (err) {
      console.error('Failed to load weather overview:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWeather();
    const interval = setInterval(fetchWeather, 30000); // 30s auto-refresh
    return () => clearInterval(interval);
  }, []);

  const handleApplyScenario = async (scenarioId: string) => {
    try {
      setLoading(true);
      const updated = await api.applyWeatherScenario(scenarioId);
      setOverview(updated);
      setShowScenarioModal(false);
      if (updated.high_alert_zones > 0) {
        soundSynthesizer.playHighAlertSound(scenarioId);
      } else {
        soundSynthesizer.playNoticeChime();
      }
    } catch (err) {
      console.error('Failed to apply scenario:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleResetWeather = async () => {
    try {
      setLoading(true);
      const reset = await api.resetWeather();
      setOverview(reset);
      setShowScenarioModal(false);
      soundSynthesizer.playNoticeChime();
    } catch (err) {
      console.error('Failed to reset weather:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRunReOptimization = async () => {
    try {
      setOptimizing(true);
      setOptSuccessMsg(null);
      const res = await api.solveOptimization({
        consider_weather: true,
        apply_to_database: true,
      });
      setOptSuccessMsg(
        `OR-Tools CP-SAT re-scheduled ${res.metrics.scheduled_missions} missions in ${res.solve_time_ms}ms with score ${res.optimization_score}%! Avoided ${res.metrics.baseline_comparison.delays_avoided_min} min delays.`
      );
      soundSynthesizer.playNoticeChime();
      setTimeout(() => setOptSuccessMsg(null), 8000);
    } catch (err) {
      console.error('Re-optimization error:', err);
    } finally {
      setOptimizing(false);
    }
  };

  // Helper icons for condition cards
  const renderConditionIcon = (iconType: string) => {
    switch (iconType) {
      case 'thunderstorm':
        return <CloudLightning className="w-8 h-8 text-[#F04452]" />;
      case 'snow':
        return <CloudSnow className="w-8 h-8 text-[#4285F4]" />;
      case 'fog':
        return <CloudFog className="w-8 h-8 text-[#F4B740]" />;
      case 'wind':
        return <Wind className="w-8 h-8 text-[#607391]" />;
      case 'rain':
        return <CloudRain className="w-8 h-8 text-[#25C98A]" />;
      case 'sandstorm':
        return <Flame className="w-8 h-8 text-[#E06830]" />;
      default:
        return <CloudSun className="w-8 h-8 text-[#4285F4]" />;
    }
  };

  const renderZoneConditionIcon = (cond: string) => {
    if (cond.includes('Thunder')) return <CloudLightning className="w-4 h-4 text-[#F04452]" />;
    if (cond.includes('Rain')) return <CloudRain className="w-4 h-4 text-[#4285F4]" />;
    if (cond.includes('Fog')) return <CloudFog className="w-4 h-4 text-[#F4B740]" />;
    if (cond.includes('Sand')) return <Flame className="w-4 h-4 text-[#E06830]" />;
    if (cond.includes('Snow')) return <CloudSnow className="w-4 h-4 text-[#4285F4]" />;
    return <Sun className="w-4 h-4 text-[#F4B740]" />;
  };

  const getRiskBadgeColor = (risk: string) => {
    switch (risk.toUpperCase()) {
      case 'HIGH':
        return 'bg-[#FDE8E8] text-[#F04452] border border-[#F04452]/30';
      case 'MEDIUM':
        return 'bg-[#FEF3C7] text-[#D97706] border border-[#F4B740]/30';
      case 'LOW':
        return 'bg-[#DEF7EC] text-[#059669] border border-[#25C98A]/30';
      default:
        return 'bg-[#E1EFFE] text-[#1D4ED8] border border-[#4285F4]/30';
    }
  };

  return (
    <div className="p-6 space-y-6 bg-[#EAF2FC] min-h-screen text-[#14264A]">
      {/* Title & Real-time Indicator Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-[#14264A]">
            Weather Monitoring
          </h2>
          <p className="text-sm text-[#607391] font-medium">
            Real-time weather conditions, alerts and impact analysis for air operations.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Quick Scenario Injector */}
          <button
            onClick={() => setShowScenarioModal(true)}
            className="clay-btn px-4 py-2 text-xs font-semibold flex items-center gap-2 cursor-pointer"
          >
            <Layers className="w-3.5 h-3.5 text-[#4285F4]" />
            Simulation Scenarios
          </button>

          {/* Refresh button */}
          <button
            onClick={fetchWeather}
            disabled={loading}
            className="clay-btn p-2.5 text-[#14264A] hover:text-[#4285F4] transition cursor-pointer"
            title="Refresh Weather Data"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-[#4285F4]' : ''}`} />
          </button>
        </div>
      </div>

      {/* Re-Optimization Success Banner */}
      {optSuccessMsg && (
        <div className="p-4 rounded-2xl bg-[#DEF7EC] border border-[#25C98A]/40 text-[#03543F] text-sm flex items-center justify-between shadow-sm animate-fade-in">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-[#25C98A] shrink-0" />
            <span className="font-semibold">{optSuccessMsg}</span>
          </div>
          {onNavigateToOptimization && (
            <button
              onClick={onNavigateToOptimization}
              className="px-3 py-1 bg-[#25C98A] text-white rounded-full text-xs font-bold hover:bg-[#1EAB74] transition"
            >
              View Schedule
            </button>
          )}
        </div>
      )}

      {/* TOP ROW: 4 Summary Metric Cards + 1 Overall Weather Status Card */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* High Alert Zones */}
        <div className="clay-card-red p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#F04452] uppercase tracking-wider">
              High Alert Zones
            </span>
            <div className="w-9 h-9 rounded-full bg-white/70 flex items-center justify-center shadow-inner">
              <CloudLightning className="w-5 h-5 text-[#F04452]" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-3xl font-extrabold text-[#F04452]">
              {overview?.high_alert_zones ?? 2}
            </span>
            <span className="text-[11px] font-bold text-[#F04452] bg-white/80 px-2 py-0.5 rounded-full border border-[#F04452]/20">
              ↑ +1 vs last hour
            </span>
          </div>
        </div>

        {/* Medium Alert Zones */}
        <div className="clay-card-amber p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#D97706] uppercase tracking-wider">
              Medium Alert Zones
            </span>
            <div className="w-9 h-9 rounded-full bg-white/70 flex items-center justify-center shadow-inner">
              <CloudFog className="w-5 h-5 text-[#F4B740]" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-3xl font-extrabold text-[#D97706]">
              {overview?.medium_alert_zones ?? 3}
            </span>
            <span className="text-[11px] font-bold text-[#92400E] bg-white/80 px-2 py-0.5 rounded-full border border-[#F4B740]/20">
              — No change
            </span>
          </div>
        </div>

        {/* Low Alert Zones */}
        <div className="clay-card-green p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#059669] uppercase tracking-wider">
              Low Alert Zones
            </span>
            <div className="w-9 h-9 rounded-full bg-white/70 flex items-center justify-center shadow-inner">
              <CloudRain className="w-5 h-5 text-[#25C98A]" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-3xl font-extrabold text-[#059669]">
              {overview?.low_alert_zones ?? 4}
            </span>
            <span className="text-[11px] font-bold text-[#065F46] bg-white/80 px-2 py-0.5 rounded-full border border-[#25C98A]/20">
              ↓ -1 vs last hour
            </span>
          </div>
        </div>

        {/* Total Monitored Zones */}
        <div className="clay-card-blue p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#1D4ED8] uppercase tracking-wider">
              Total Monitored Zones
            </span>
            <div className="w-9 h-9 rounded-full bg-white/70 flex items-center justify-center shadow-inner">
              <MapPin className="w-5 h-5 text-[#4285F4]" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-3xl font-extrabold text-[#14264A]">
              {overview?.total_monitored_zones ?? 9}
            </span>
            <span className="text-[11px] font-bold text-[#1E40AF] bg-white/80 px-2 py-0.5 rounded-full border border-[#4285F4]/20">
              Zones A - I
            </span>
          </div>
        </div>

        {/* Overall Weather Status Card */}
        <div
          onClick={() => setShowScenarioModal(true)}
          className="clay-card p-4 flex flex-col justify-between cursor-pointer hover:shadow-lg transition relative overflow-hidden"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-bold text-[#14264A]">
              <CloudSun className="w-4 h-4 text-[#4285F4]" />
              <span>Overall Weather Status</span>
            </div>
            <ChevronRight className="w-4 h-4 text-[#607391]" />
          </div>
          <div className="mt-2 flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-sky-400 to-amber-300 p-0.5 flex items-center justify-center shadow-sm">
              <div className="w-full h-full bg-[#EAF2FC] rounded-2xl flex items-center justify-center">
                <CloudLightning className="w-6 h-6 text-[#F04452] animate-pulse" />
              </div>
            </div>
            <div>
              <div
                className={`text-xl font-extrabold ${
                  overview?.overall_status === 'ACTIVE'
                    ? 'text-[#F04452]'
                    : overview?.overall_status === 'OPTIMAL'
                    ? 'text-[#25C98A]'
                    : 'text-[#D97706]'
                }`}
              >
                {overview?.overall_status || 'ACTIVE'}
              </div>
              <p className="text-[11px] text-[#607391] font-medium leading-tight">
                {overview?.overall_description || 'Moderate to high risk in multiple zones'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* MIDDLE SECTION: Weather Risk Map + Current Weather Conditions */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT: Weather Risk Map (7 cols) */}
        <div className="lg:col-span-7 flex flex-col justify-start">
          <WeatherRiskMap
            overview={overview}
            onSelectZone={(zone) => setSelectedZone(zone)}
            onRunOptimization={handleRunReOptimization}
          />
        </div>

        {/* RIGHT: Current Weather Conditions (5 cols - 6 Cards Grid) */}
        <div className="lg:col-span-5 clay-card p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <CloudSun className="w-4 h-4 text-[#4285F4]" />
              <h3 className="font-bold text-base text-[#14264A]">Current Weather Conditions</h3>
            </div>
            <span className="text-[11px] font-mono text-[#607391]">
              Last Updated: 14:28 UTC
            </span>
          </div>

          {/* 6 Condition Cards Grid (3 columns x 2 rows) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {(overview?.conditions || []).map((card) => (
              <div
                key={card.id}
                className="clay-inset p-3 rounded-2xl flex flex-col justify-between space-y-2 hover:shadow-md transition bg-white/40"
              >
                <div className="flex items-start justify-between">
                  <div className="p-1 rounded-xl bg-white/80 shadow-xs">
                    {renderConditionIcon(card.icon_type)}
                  </div>
                  <span
                    className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full ${getRiskBadgeColor(
                      card.risk_level
                    )}`}
                  >
                    {card.badge}
                  </span>
                </div>
                <div>
                  <h4 className="text-xs font-bold text-[#14264A] leading-tight mb-1">
                    {card.title}
                  </h4>
                  <ul className="space-y-0.5">
                    {card.bullet_points.map((bp, i) => (
                      <li key={i} className="text-[10px] text-[#607391] flex items-center gap-1">
                        <span
                          className={`w-1 h-1 rounded-full ${
                            card.risk_level === 'HIGH'
                              ? 'bg-[#F04452]'
                              : card.risk_level === 'MEDIUM'
                              ? 'bg-[#F4B740]'
                              : 'bg-[#25C98A]'
                          }`}
                        />
                        <span className="truncate">{bp}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* BOTTOM SECTION: Recent Weather Alerts + Zone-wise Status & Mission Impact */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* BOTTOM LEFT: Recent Weather Alerts Table (6 cols) */}
        <div className="lg:col-span-6 clay-card p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-[#FDE8E8] flex items-center justify-center">
                <AlertTriangle className="w-4 h-4 text-[#F04452]" />
              </div>
              <h3 className="font-bold text-base text-[#14264A]">Recent Weather Alerts</h3>
            </div>
            <button
              onClick={() => setSelectedAlert(overview?.recent_alerts[0] || null)}
              className="text-xs font-bold text-[#4285F4] hover:underline flex items-center gap-1 cursor-pointer"
            >
              View All →
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#C2D5ED]/60 text-[#607391] font-bold">
                  <th className="pb-2.5">Time (UTC)</th>
                  <th className="pb-2.5">Zone</th>
                  <th className="pb-2.5">Condition</th>
                  <th className="pb-2.5">Severity</th>
                  <th className="pb-2.5">Impact</th>
                  <th className="pb-2.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#C2D5ED]/40 text-[#14264A]">
                {(overview?.recent_alerts || []).map((alert) => (
                  <tr key={alert.id} className="hover:bg-white/40 transition">
                    <td className="py-2.5 font-mono text-[11px] text-[#607391]">
                      {alert.timestamp_utc}
                    </td>
                    <td className="py-2.5 font-semibold text-[#14264A]">
                      {alert.zone_code.replace('_', ' ')}
                    </td>
                    <td className="py-2.5 flex items-center gap-1.5 font-medium">
                      {renderZoneConditionIcon(alert.condition)}
                      <span>{alert.condition}</span>
                    </td>
                    <td className="py-2.5">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${getRiskBadgeColor(
                          alert.severity
                        )}`}
                      >
                        {alert.severity}
                      </span>
                    </td>
                    <td className="py-2.5 text-[#607391] max-w-[150px] truncate">
                      {alert.impact}
                    </td>
                    <td className="py-2.5 text-right">
                      <button
                        onClick={() => setSelectedAlert(alert)}
                        className="clay-btn px-2.5 py-1 text-[11px] font-semibold text-[#4285F4] hover:text-blue-700 flex items-center gap-1 ml-auto cursor-pointer"
                      >
                        <Eye className="w-3 h-3" />
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* BOTTOM RIGHT: Zone-wise Weather Status + Mission Impact (6 cols) */}
        <div className="lg:col-span-6 space-y-6">
          {/* Zone-wise Weather Status Table */}
          <div className="clay-card p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#4285F4]" />
                <h3 className="font-bold text-base text-[#14264A]">Zone-wise Weather Status</h3>
              </div>
              <span className="text-xs text-[#607391] font-medium">9 Monitored Sectors</span>
            </div>

            <div className="overflow-x-auto max-h-[220px]">
              <table className="w-full text-left text-xs">
                <thead className="sticky top-0 bg-[#EAF2FC] z-10">
                  <tr className="border-b border-[#C2D5ED]/60 text-[#607391] font-bold">
                    <th className="pb-2">Zone</th>
                    <th className="pb-2">Condition</th>
                    <th className="pb-2">Risk</th>
                    <th className="pb-2">Temp</th>
                    <th className="pb-2">Wind</th>
                    <th className="pb-2">Visibility</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#C2D5ED]/40 text-[#14264A]">
                  {(overview?.zones || []).map((zone) => (
                    <tr
                      key={zone.id}
                      onClick={() => setSelectedZone(zone)}
                      className="hover:bg-white/50 cursor-pointer transition"
                    >
                      <td className="py-2 font-bold text-[#14264A]">
                        {zone.zone_code.replace('_', ' ')}
                      </td>
                      <td className="py-2 flex items-center gap-1.5 font-medium">
                        {renderZoneConditionIcon(zone.condition)}
                        <span>{zone.condition}</span>
                      </td>
                      <td className="py-2">
                        <span
                          className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${getRiskBadgeColor(
                            zone.risk_level
                          )}`}
                        >
                          {zone.risk_level}
                        </span>
                      </td>
                      <td className="py-2 font-mono">{zone.temperature_c}°C</td>
                      <td className="py-2 font-mono">{zone.wind_speed_kmh} km/h</td>
                      <td
                        className={`py-2 font-mono font-bold ${
                          zone.visibility_km < 1.0 ? 'text-[#F04452]' : 'text-[#14264A]'
                        }`}
                      >
                        {zone.visibility_km >= 10 ? '> 10 km' : `${zone.visibility_km} km`}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Weather Impact on Missions Cards & OR-Tools Action */}
          <div className="clay-card p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Crosshair className="w-4 h-4 text-[#F04452]" />
                <h3 className="font-bold text-base text-[#14264A]">Weather Impact on Missions</h3>
              </div>
              <span className="text-xs font-semibold px-2 py-1 rounded-full bg-white/70 border border-slate-200">
                Today ▾
              </span>
            </div>

            {/* 4 Impact Stat Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
              {/* Affected */}
              <div className="clay-inset p-3 bg-[#FDE8E8]/50 rounded-2xl">
                <div className="text-[11px] font-bold text-[#F04452]">Affected Missions</div>
                <div className="text-2xl font-black text-[#F04452] mt-1">
                  {overview?.impact?.affected_missions ?? 6}/
                  {overview?.impact?.total_missions ?? 15}
                </div>
                <div className="text-[10px] text-[#991B1B] font-semibold mt-0.5">
                  +2 vs yesterday
                </div>
              </div>

              {/* Delayed */}
              <div className="clay-inset p-3 bg-[#FEF3C7]/50 rounded-2xl">
                <div className="text-[11px] font-bold text-[#D97706]">Delayed Missions</div>
                <div className="text-2xl font-black text-[#D97706] mt-1">
                  {overview?.impact?.delayed_missions ?? 4}
                </div>
                <div className="text-[10px] text-[#92400E] font-semibold mt-0.5">
                  +1 vs yesterday
                </div>
              </div>

              {/* Rerouted */}
              <div className="clay-inset p-3 bg-[#DEF7EC]/50 rounded-2xl">
                <div className="text-[11px] font-bold text-[#059669]">Rerouted Missions</div>
                <div className="text-2xl font-black text-[#059669] mt-1">
                  {overview?.impact?.rerouted_missions ?? 2}
                </div>
                <div className="text-[10px] text-[#065F46] font-semibold mt-0.5">
                  — No change
                </div>
              </div>

              {/* Cancelled */}
              <div className="clay-inset p-3 bg-[#E1EFFE]/50 rounded-2xl">
                <div className="text-[11px] font-bold text-[#1D4ED8]">Cancelled Missions</div>
                <div className="text-2xl font-black text-[#1D4ED8] mt-1">
                  {overview?.impact?.cancelled_missions ?? 0}
                </div>
                <div className="text-[10px] text-[#1E40AF] font-semibold mt-0.5">
                  ↓ -1 vs yesterday
                </div>
              </div>
            </div>

            {/* Dynamic OR-Tools Re-Optimization Trigger Button */}
            <button
              onClick={handleRunReOptimization}
              disabled={optimizing}
              className="w-full clay-btn-primary py-3 px-4 flex items-center justify-center gap-2 cursor-pointer text-sm shadow-md"
            >
              <Cpu className={`w-4 h-4 ${optimizing ? 'animate-spin' : ''}`} />
              <span>
                {optimizing
                  ? 'Executing Google OR-Tools CP-SAT Solver...'
                  : 'Run Dynamic Re-Optimization with Weather Constraints'}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* MODAL 1: Scenario Injector Modal */}
      {showScenarioModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4">
          <div className="clay-card p-6 max-w-lg w-full bg-[#EAF2FC] space-y-4">
            <div className="flex items-center justify-between border-b border-[#C2D5ED] pb-3">
              <h3 className="text-lg font-bold text-[#14264A] flex items-center gap-2">
                <Layers className="w-5 h-5 text-[#4285F4]" />
                Simulated Weather Scenarios
              </h3>
              <button
                onClick={() => setShowScenarioModal(false)}
                className="clay-btn p-1.5 cursor-pointer text-[#607391] hover:text-[#14264A]"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-[#607391]">
              Select a synthetic weather scenario to test dynamic resilience and automatic OR-Tools re-scheduling.
            </p>

            <div className="space-y-2.5">
              <div
                onClick={() => handleApplyScenario('thunderstorm_active')}
                className="clay-inset p-3 cursor-pointer hover:bg-white/60 transition rounded-xl flex items-start gap-3"
              >
                <div className="p-2 rounded-xl bg-[#FDE8E8] text-[#F04452]">
                  <CloudLightning className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-sm font-bold text-[#14264A]">Severe Thunderstorm Front</div>
                  <div className="text-xs text-[#607391]">
                    High convective cell in Zone B and sandstorm in Zone F. Forces flight diversions.
                  </div>
                </div>
              </div>

              <div
                onClick={() => handleApplyScenario('winter_blizzard')}
                className="clay-inset p-3 cursor-pointer hover:bg-white/60 transition rounded-xl flex items-start gap-3"
              >
                <div className="p-2 rounded-xl bg-[#FEF3C7] text-[#D97706]">
                  <CloudSnow className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-sm font-bold text-[#14264A]">Sub-Zero Blizzard Incursion</div>
                  <div className="text-xs text-[#607391]">
                    Arctic cold front across Zones C, E, I. Airframe icing & low visibility.
                  </div>
                </div>
              </div>

              <div
                onClick={() => handleApplyScenario('clear_skies')}
                className="clay-inset p-3 cursor-pointer hover:bg-white/60 transition rounded-xl flex items-start gap-3"
              >
                <div className="p-2 rounded-xl bg-[#DEF7EC] text-[#059669]">
                  <Sun className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-sm font-bold text-[#14264A]">Nominal VFR Flying Envelope</div>
                  <div className="text-xs text-[#607391]">
                    Clear high-pressure envelope across all 9 zones. 100% operational throughput.
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-[#C2D5ED]">
              <button
                onClick={handleResetWeather}
                className="clay-btn px-4 py-2 text-xs font-semibold cursor-pointer"
              >
                Reset to Default
              </button>
              <button
                onClick={() => setShowScenarioModal(false)}
                className="clay-btn-primary px-4 py-2 text-xs cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: Zone Detail Modal */}
      {selectedZone && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4">
          <div className="clay-card p-6 max-w-md w-full bg-[#EAF2FC] space-y-4">
            <div className="flex items-center justify-between border-b border-[#C2D5ED] pb-3">
              <h3 className="text-lg font-bold text-[#14264A] flex items-center gap-2">
                <MapPin className="w-5 h-5 text-[#4285F4]" />
                {selectedZone.zone_name}
              </h3>
              <button
                onClick={() => setSelectedZone(null)}
                className="clay-btn p-1.5 cursor-pointer text-[#607391] hover:text-[#14264A]"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/60">
                <span className="font-semibold text-[#607391]">Current Condition:</span>
                <span className="font-bold flex items-center gap-1">
                  {renderZoneConditionIcon(selectedZone.condition)}
                  {selectedZone.condition}
                </span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/60">
                <span className="font-semibold text-[#607391]">Risk Level:</span>
                <span className={`px-2 py-0.5 rounded-full font-bold ${getRiskBadgeColor(selectedZone.risk_level)}`}>
                  {selectedZone.risk_level}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="p-2.5 rounded-xl bg-white/60 text-center">
                  <div className="text-[10px] text-[#607391]">Temperature</div>
                  <div className="font-bold text-sm">{selectedZone.temperature_c}°C</div>
                </div>
                <div className="p-2.5 rounded-xl bg-white/60 text-center">
                  <div className="text-[10px] text-[#607391]">Wind Speed</div>
                  <div className="font-bold text-sm">{selectedZone.wind_speed_kmh} km/h</div>
                </div>
                <div className="p-2.5 rounded-xl bg-white/60 text-center">
                  <div className="text-[10px] text-[#607391]">Visibility</div>
                  <div className="font-bold text-sm">{selectedZone.visibility_km} km</div>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-[#E1EFFE] border border-blue-200">
                <div className="text-[11px] font-bold text-[#1D4ED8] mb-1">Flight Advisory</div>
                <p className="text-[#14264A] text-xs leading-relaxed">{selectedZone.flight_advisory}</p>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedZone(null)}
                className="clay-btn-primary px-4 py-2 text-xs cursor-pointer"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: Alert Detail Modal */}
      {selectedAlert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4">
          <div className="clay-card p-6 max-w-md w-full bg-[#EAF2FC] space-y-4">
            <div className="flex items-center justify-between border-b border-[#C2D5ED] pb-3">
              <h3 className="text-lg font-bold text-[#14264A] flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-[#F04452]" />
                Alert: {selectedAlert.alert_code}
              </h3>
              <button
                onClick={() => setSelectedAlert(null)}
                className="clay-btn p-1.5 cursor-pointer text-[#607391] hover:text-[#14264A]"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-[#FDE8E8] border border-red-200">
                <div className="font-bold text-[#991B1B] text-sm">{selectedAlert.condition}</div>
                <div className="text-[#B91C1C] mt-1">{selectedAlert.impact}</div>
              </div>

              <div className="flex justify-between p-2 rounded-xl bg-white/60">
                <span className="text-[#607391]">Affected Sector:</span>
                <span className="font-bold">{selectedAlert.zone_code.replace('_', ' ')}</span>
              </div>

              <div className="flex justify-between p-2 rounded-xl bg-white/60">
                <span className="text-[#607391]">Reported Zulu Time:</span>
                <span className="font-mono font-semibold">{selectedAlert.timestamp_utc} UTC</span>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedAlert(null)}
                className="clay-btn-primary px-4 py-2 text-xs cursor-pointer"
              >
                Acknowledged
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

import React, { useState, useEffect, useMemo } from 'react';
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
  Eye,
  CheckCircle2,
  Cpu,
  Layers,
  ChevronRight,
  Sun,
  CloudSun,
  Search,
  Crosshair,
  ArrowUpRight,
} from 'lucide-react';
import { api } from '../services/api';
import type {
  WeatherOverview,
  WeatherZone,
  WeatherAlert,
  LiveIndiaWeatherResponse,
  StateWeatherItem,
} from '../types';
import { soundSynthesizer } from '../utils/audioAlert';
import { IndiaWeatherMap } from '../components/IndiaWeatherMap';

interface WeatherProps {
  onNavigateToOptimization?: () => void;
}

export const Weather: React.FC<WeatherProps> = ({ onNavigateToOptimization }) => {
  const [overview, setOverview] = useState<WeatherOverview | null>(null);
  const [liveIndia, setLiveIndia] = useState<LiveIndiaWeatherResponse | null>(null);
  const [selectedState, setSelectedState] = useState<StateWeatherItem | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [liveRefreshing, setLiveRefreshing] = useState<boolean>(false);
  const [optimizing, setOptimizing] = useState<boolean>(false);
  const [optSuccessMsg, setOptSuccessMsg] = useState<string | null>(null);
  const [selectedZone, setSelectedZone] = useState<WeatherZone | null>(null);
  const [selectedAlert, setSelectedAlert] = useState<WeatherAlert | null>(null);
  const [showScenarioModal, setShowScenarioModal] = useState<boolean>(false);
  const [weatherError, setWeatherError] = useState<string | null>(null);

  // Table filtering and search
  const [viewMode, setViewMode] = useState<'states' | 'zones'>('states');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [riskFilter, setRiskFilter] = useState<'ALL' | 'HIGH' | 'MEDIUM' | 'LOW'>('ALL');

  const fetchWeather = async (forceLive = false) => {
    try {
      setLoading(true);
      // Fetch both live India weather and scenario overview in parallel
      const [overviewRes, liveRes] = await Promise.allSettled([
        api.getWeatherOverview(),
        api.getLiveIndiaWeather(forceLive),
      ]);

      let hasSuccess = false;
      if (overviewRes.status === 'fulfilled') {
        setOverview(overviewRes.value);
        hasSuccess = true;
      }
      if (liveRes.status === 'fulfilled') {
        setLiveIndia(liveRes.value);
        hasSuccess = true;
        if (liveRes.value.summary.high_risk_count > 0) {
          soundSynthesizer.playHighAlertSound('Adverse weather detected in monitored sector');
        }
      } else if (overviewRes.status === 'fulfilled' && overviewRes.value.high_alert_zones > 0) {
        soundSynthesizer.playHighAlertSound(overviewRes.value.banner_zone || 'ZONE_B');
      }

      if (hasSuccess) {
        setWeatherError(null);
      } else {
        setWeatherError('Unable to connect to meteorological data feed. Backend or network offline.');
      }
    } catch (err: any) {
      console.error('Failed to load weather data:', err);
      setWeatherError(err?.message || 'Error loading meteorological data.');
    } finally {
      setLoading(false);
      setLiveRefreshing(false);
    }
  };

  useEffect(() => {
    fetchWeather();
    const interval = setInterval(() => fetchWeather(false), 60000); // Auto-sync every 60s
    return () => clearInterval(interval);
  }, []);

  const handleManualRefresh = async () => {
    try {
      setLiveRefreshing(true);
      const refreshed = await api.refreshLiveIndiaWeather();
      setLiveIndia(refreshed);
      soundSynthesizer.playNoticeChime();
    } catch (err) {
      console.error('Manual refresh error, falling back to standard fetch:', err);
      await fetchWeather(true);
    } finally {
      setLiveRefreshing(false);
    }
  };

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
      case 'cloud-lightning':
        return <CloudLightning className="w-8 h-8 text-[#F04452]" />;
      case 'snow':
      case 'cloud-snow':
        return <CloudSnow className="w-8 h-8 text-[#4285F4]" />;
      case 'fog':
      case 'cloud-fog':
        return <CloudFog className="w-8 h-8 text-[#F4B740]" />;
      case 'wind':
        return <Wind className="w-8 h-8 text-[#607391]" />;
      case 'rain':
      case 'cloud-rain':
        return <CloudRain className="w-8 h-8 text-[#25C98A]" />;
      case 'sandstorm':
        return <Flame className="w-8 h-8 text-[#E06830]" />;
      default:
        return <CloudSun className="w-8 h-8 text-[#4285F4]" />;
    }
  };

  const renderZoneConditionIcon = (cond: string) => {
    if (cond.includes('Thunder')) return <CloudLightning className="w-4 h-4 text-[#F04452]" />;
    if (cond.includes('Rain') || cond.includes('Showers')) return <CloudRain className="w-4 h-4 text-[#4285F4]" />;
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

  // Filtered list of 36 Indian states based on search & risk filter
  const filteredStates = useMemo(() => {
    if (!liveIndia?.states) return [];
    return liveIndia.states.filter((st) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        q === '' ||
        st.name.toLowerCase().includes(q) ||
        st.zone.toLowerCase().includes(q) ||
        st.code.toLowerCase().includes(q) ||
        st.weather_condition.toLowerCase().includes(q);

      const matchesRisk = riskFilter === 'ALL' || st.risk_level === riskFilter;
      return matchesSearch && matchesRisk;
    });
  }, [liveIndia?.states, searchQuery, riskFilter]);

  // Dynamic derivation of 6 Aviation Operational Weather Condition Cards
  const conditionCards = useMemo(() => {
    // 1. If liveIndia returns condition_cards directly from backend
    if (liveIndia?.condition_cards && liveIndia.condition_cards.length >= 6) {
      return liveIndia.condition_cards;
    }

    // 2. Derive directly from live India states telemetry (36 Indian States/UTs)
    if (liveIndia?.states && liveIndia.states.length > 0) {
      const states = liveIndia.states;
      const summary = liveIndia.summary;

      // 1. Thunderstorms & Lightning
      const convStates = states.filter(
        (s) => s.weather_code != null && [95, 96, 99].includes(s.weather_code)
      );
      const convCount = convStates.length;
      const convRisk: 'HIGH' | 'LOW' = convCount > 0 ? 'HIGH' : 'LOW';

      // 2. Strong Crosswinds & Gusts
      const maxWind = summary?.max_wind_speed_kmh ?? 0;
      const maxWindState = summary?.max_wind_state ?? 'Monitored Sectors';
      const elevatedWind = states.filter(
        (s) => (s.wind_speed_10m ?? 0) >= 30 || (s.wind_gusts_10m ?? 0) >= 45
      );
      const windRisk: 'HIGH' | 'MEDIUM' | 'LOW' =
        maxWind >= 50 ? 'HIGH' : maxWind >= 30 ? 'MEDIUM' : 'LOW';

      // 3. Monsoonal Rain & Runway Friction
      const rainCount =
        summary?.rain_states_count ??
        states.filter((s) => (s.precipitation ?? 0) > 0.1 || (s.rain ?? 0) > 0.1).length;
      const maxPrecip = Math.max(0, ...states.map((s) => s.precipitation ?? 0));
      const rainRisk: 'HIGH' | 'MEDIUM' | 'LOW' =
        maxPrecip >= 10 ? 'HIGH' : maxPrecip >= 2 || rainCount >= 5 ? 'MEDIUM' : 'LOW';

      // 4. Low Visibility & Fog
      const fogStates = states.filter(
        (s) => s.weather_code != null && [45, 48].includes(s.weather_code)
      );
      const cloudyCount =
        summary?.cloudy_states_count ?? states.filter((s) => (s.cloud_cover ?? 0) >= 75).length;
      const fogRisk: 'HIGH' | 'MEDIUM' | 'LOW' =
        fogStates.length > 0 ? 'HIGH' : cloudyCount >= 10 ? 'MEDIUM' : 'LOW';

      // 5. Sub-Zero & Airframe Icing
      const validTemps = states
        .map((s) => s.temperature_2m)
        .filter((t): t is number => t !== null && t !== undefined);
      const minTemp: number | null = validTemps.length > 0 ? Math.min(...validTemps) : null;
      const minTempState =
        minTemp !== null ? states.find((s) => s.temperature_2m === minTemp)?.name ?? '' : '';

      const snowStates = states.filter(
        (s) =>
          s.weather_code != null &&
          [56, 57, 66, 67, 71, 73, 75, 77, 85, 86].includes(s.weather_code)
      );
      const coldRisk: 'HIGH' | 'MEDIUM' | 'LOW' =
        snowStates.length > 0 ? 'HIGH' : minTemp !== null && minTemp < 5 ? 'MEDIUM' : 'LOW';

      // 6. Thermal & Density Altitude
      const maxTemp: number | null = validTemps.length > 0 ? Math.max(...validTemps) : null;
      const maxTempState =
        maxTemp !== null ? states.find((s) => s.temperature_2m === maxTemp)?.name ?? '' : '';

      const avgTemp = summary?.average_temperature_c;
      const thermalRisk: 'HIGH' | 'MEDIUM' | 'LOW' =
        maxTemp !== null && maxTemp >= 42
          ? 'HIGH'
          : maxTemp !== null && maxTemp >= 36
          ? 'MEDIUM'
          : 'LOW';

      return [
        {
          id: 'cond_1',
          title: 'Thunderstorms & Lightning',
          risk_level: convRisk,
          badge: convRisk,
          icon_type: 'thunderstorm',
          bullet_points: [
            convCount > 0
              ? `${convCount} states reporting storm cells`
              : 'Zero active storm cells nationwide',
            convCount > 0
              ? `Active: ${convStates.map((s) => s.name).slice(0, 2).join(', ')}`
              : 'Clear lightning radar envelope',
            convCount > 0
              ? 'Route diversion mandatory in cell'
              : 'Standard flight corridors open',
          ],
        },
        {
          id: 'cond_2',
          title: 'High Crosswinds & Gusts',
          risk_level: windRisk,
          badge: windRisk,
          icon_type: 'wind',
          bullet_points: [
            `Peak wind: ${maxWind.toFixed(1)} km/h (${maxWindState})`,
            elevatedWind.length > 0
              ? `${elevatedWind.length} states crosswind > 30 km/h`
              : 'Crosswinds within safe envelope',
            windRisk !== 'LOW'
              ? 'Increased runway separation'
              : 'Standard approach glide-paths',
          ],
        },
        {
          id: 'cond_3',
          title: 'Monsoonal Rain & Runway Friction',
          risk_level: rainRisk,
          badge: rainRisk,
          icon_type: 'rain',
          bullet_points: [
            `${rainCount} of 36 states reporting rain`,
            rainCount > 0
              ? `Peak precip: ${maxPrecip.toFixed(1)} mm/h`
              : 'Dry conditions prevailing',
            rainCount > 0
              ? 'Hydroplaning & wet runway alert'
              : 'Optimal surface braking action',
          ],
        },
        {
          id: 'cond_4',
          title: 'Low Visibility & Fog',
          risk_level: fogRisk,
          badge: fogRisk,
          icon_type: 'fog',
          bullet_points: [
            fogStates.length > 0
              ? `${fogStates.length} states reporting ground fog`
              : 'No dense ground fog reported',
            `${cloudyCount} states with overcast ceiling`,
            fogRisk !== 'LOW'
              ? 'Instrument approach (IFR) mandated'
              : 'Visual flight rules (VFR) nominal',
          ],
        },
        {
          id: 'cond_5',
          title: 'Sub-Zero & Airframe Icing',
          risk_level: coldRisk,
          badge: coldRisk,
          icon_type: 'snow',
          bullet_points: [
            minTemp != null
              ? `Lowest temp: ${minTemp.toFixed(1)}°C (${minTempState})`
              : 'Temperature telemetry syncing',
            snowStates.length > 0
              ? `${snowStates.length} states reporting snow`
              : 'Zero icing precipitation reported',
            coldRisk !== 'LOW'
              ? 'Anti-icing systems required'
              : 'Freezing level above corridor floor',
          ],
        },
        {
          id: 'cond_6',
          title: 'Thermal & Density Altitude',
          risk_level: thermalRisk,
          badge: thermalRisk,
          icon_type: 'sun',
          bullet_points: [
            avgTemp != null
              ? `National avg temp: ${avgTemp.toFixed(1)}°C`
              : 'National telemetry syncing',
            maxTemp != null
              ? `Max temp: ${maxTemp.toFixed(1)}°C (${maxTempState})`
              : 'Nominal thermal envelope',
            thermalRisk !== 'LOW'
              ? 'High density altitude: extended roll'
              : 'Nominal engine thrust and lift',
          ],
        },
      ];
    }

    // 3. Fallback to scenario conditions if simulated scenario active and no live telemetry
    if (overview?.conditions && overview.conditions.length > 0) {
      return overview.conditions;
    }

    return [];
  }, [liveIndia, overview]);

  // High, medium, low counts from live payload or fallback
  const highRiskCount = liveIndia ? liveIndia.summary.high_risk_count : overview?.high_alert_zones ?? 0;
  const mediumRiskCount = liveIndia ? liveIndia.summary.medium_risk_count : overview?.medium_alert_zones ?? 0;
  const lowRiskCount = liveIndia ? liveIndia.summary.low_risk_count : overview?.low_alert_zones ?? 0;
  const totalMonitored = liveIndia ? liveIndia.total_states_monitored : overview?.total_monitored_zones ?? 36;

  return (
    <div className="space-y-5 lg:space-y-6 text-[#14264A] min-w-0">
      {/* Title & Real-time Indicator Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 pb-2 border-b border-[#C2D5ED]/60">
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-[#14264A]">
              Weather Monitoring & Air Risk Assessment
            </h2>
            <span
              className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full flex items-center gap-1.5 ${
                liveIndia?.status === 'LIVE'
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                  : liveIndia?.status === 'STALE'
                  ? 'bg-amber-100 text-amber-800 border border-amber-300'
                  : 'bg-rose-100 text-rose-800 border border-rose-300'
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  liveIndia?.status === 'LIVE'
                    ? 'bg-emerald-500 animate-pulse'
                    : liveIndia?.status === 'STALE'
                    ? 'bg-amber-500'
                    : 'bg-rose-500'
                }`}
              />
              {liveIndia?.status === 'LIVE' ? 'LIVE' : liveIndia?.status === 'STALE' ? 'STALE' : 'OFFLINE'} OPEN-METEO
            </span>
          </div>
          <p className="text-xs sm:text-sm text-[#607391] font-medium mt-0.5">
            Real-time meteorological monitoring of all 36 Indian States/UTs with GoI boundary alignment.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          {/* Quick Scenario Injector */}
          <button
            onClick={() => setShowScenarioModal(true)}
            className="clay-btn px-3 sm:px-4 py-2 text-xs font-semibold flex items-center gap-2 cursor-pointer"
          >
            <Layers className="w-3.5 h-3.5 text-[#4285F4]" />
            <span>Simulation Scenarios</span>
          </button>

          {/* Refresh button */}
          <button
            onClick={handleManualRefresh}
            disabled={loading || liveRefreshing}
            className="clay-btn p-2.5 text-[#14264A] hover:text-[#4285F4] transition cursor-pointer"
            title="Refresh Live Open-Meteo Weather"
          >
            <RefreshCw
              className={`w-4 h-4 ${
                loading || liveRefreshing ? 'animate-spin text-[#4285F4]' : ''
              }`}
            />
          </button>
        </div>
      </div>

      {/* Re-Optimization Success Banner */}
      {optSuccessMsg && (
        <div className="p-3.5 sm:p-4 rounded-2xl bg-[#DEF7EC] border border-[#25C98A]/40 text-[#03543F] text-xs sm:text-sm flex items-center justify-between shadow-sm animate-fade-in gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <CheckCircle2 className="w-5 h-5 text-[#25C98A] shrink-0" />
            <span className="font-semibold truncate">{optSuccessMsg}</span>
          </div>
          {onNavigateToOptimization && (
            <button
              onClick={onNavigateToOptimization}
              className="px-3 py-1 bg-[#25C98A] text-white rounded-full text-xs font-bold hover:bg-[#1EAB74] transition shrink-0"
            >
              View Schedule
            </button>
          )}
        </div>
      )}

      {/* TOP ROW: 4 Summary Metric Cards + 1 Overall Weather Status Card */}
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-3 sm:gap-4">
        {/* High Alert States / Zones */}
        <div className="clay-card-red p-3.5 sm:p-4 flex flex-col justify-between min-w-0">
          <div className="flex items-center justify-between gap-1">
            <span className="text-[11px] font-bold text-[#F04452] uppercase tracking-wider truncate">
              High Risk Regions
            </span>
            <div className="w-8 h-8 rounded-full bg-white/70 flex items-center justify-center shadow-inner shrink-0">
              <CloudLightning className="w-4 h-4 text-[#F04452]" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline justify-between gap-1 flex-wrap">
            <span className="text-2xl sm:text-3xl font-extrabold text-[#F04452]">{highRiskCount}</span>
            <span className="text-[10px] font-bold text-[#F04452] bg-white/80 px-2 py-0.5 rounded-full border border-[#F04452]/20 truncate">
              {highRiskCount > 0 ? 'Convective / High Wind' : 'Clear Envelope'}
            </span>
          </div>
        </div>

        {/* Medium Alert States / Zones */}
        <div className="clay-card-amber p-3.5 sm:p-4 flex flex-col justify-between min-w-0">
          <div className="flex items-center justify-between gap-1">
            <span className="text-[11px] font-bold text-[#D97706] uppercase tracking-wider truncate">
              Medium Risk Regions
            </span>
            <div className="w-8 h-8 rounded-full bg-white/70 flex items-center justify-center shadow-inner shrink-0">
              <CloudFog className="w-4 h-4 text-[#F4B740]" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline justify-between gap-1 flex-wrap">
            <span className="text-2xl sm:text-3xl font-extrabold text-[#D97706]">{mediumRiskCount}</span>
            <span className="text-[10px] font-bold text-[#92400E] bg-white/80 px-2 py-0.5 rounded-full border border-[#F4B740]/20 truncate">
              Marginal IFR
            </span>
          </div>
        </div>

        {/* Low Alert States / Zones */}
        <div className="clay-card-green p-3.5 sm:p-4 flex flex-col justify-between min-w-0">
          <div className="flex items-center justify-between gap-1">
            <span className="text-[11px] font-bold text-[#059669] uppercase tracking-wider truncate">
              Low Risk Regions
            </span>
            <div className="w-8 h-8 rounded-full bg-white/70 flex items-center justify-center shadow-inner shrink-0">
              <CloudRain className="w-4 h-4 text-[#25C98A]" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline justify-between gap-1 flex-wrap">
            <span className="text-2xl sm:text-3xl font-extrabold text-[#059669]">{lowRiskCount}</span>
            <span className="text-[10px] font-bold text-[#065F46] bg-white/80 px-2 py-0.5 rounded-full border border-[#25C98A]/20 truncate">
              Nominal VFR
            </span>
          </div>
        </div>

        {/* Total Monitored States/UTs */}
        <div className="clay-card-blue p-3.5 sm:p-4 flex flex-col justify-between min-w-0">
          <div className="flex items-center justify-between gap-1">
            <span className="text-[11px] font-bold text-[#1D4ED8] uppercase tracking-wider truncate">
              Monitored States / UTs
            </span>
            <div className="w-8 h-8 rounded-full bg-white/70 flex items-center justify-center shadow-inner shrink-0">
              <MapPin className="w-4 h-4 text-[#4285F4]" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline justify-between gap-1 flex-wrap">
            <span className="text-2xl sm:text-3xl font-extrabold text-[#14264A]">{totalMonitored}</span>
            <span className="text-[10px] font-bold text-[#1E40AF] bg-white/80 px-2 py-0.5 rounded-full border border-[#4285F4]/20 truncate">
              36 States & UTs
            </span>
          </div>
        </div>

        {/* Overall Weather Status Card */}
        <div
          onClick={() => setShowScenarioModal(true)}
          className="clay-card p-3.5 sm:p-4 flex flex-col justify-between cursor-pointer hover:shadow-lg transition relative overflow-hidden min-w-0 col-span-2 sm:col-span-2 md:col-span-1 xl:col-span-1"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-bold text-[#14264A]">
              <CloudSun className="w-4 h-4 text-[#4285F4]" />
              <span>Operational Threat</span>
            </div>
            <ChevronRight className="w-4 h-4 text-[#607391]" />
          </div>
          <div className="mt-2 flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-sky-400 to-amber-300 p-0.5 flex items-center justify-center shadow-sm shrink-0">
              <div className="w-full h-full bg-[#EAF2FC] rounded-2xl flex items-center justify-center">
                {highRiskCount > 0 ? (
                  <CloudLightning className="w-5 h-5 text-[#F04452] animate-pulse" />
                ) : (
                  <Sun className="w-5 h-5 text-[#25C98A]" />
                )}
              </div>
            </div>
            <div className="min-w-0">
              <div
                className={`text-lg sm:text-xl font-extrabold truncate ${
                  (liveIndia?.summary.overall_operational_threat || overview?.overall_status) ===
                    'HIGH' || overview?.overall_status === 'ACTIVE'
                    ? 'text-[#F04452]'
                    : (liveIndia?.summary.overall_operational_threat || overview?.overall_status) ===
                      'LOW' || overview?.overall_status === 'OPTIMAL'
                    ? 'text-[#25C98A]'
                    : 'text-[#D97706]'
                }`}
              >
                {liveIndia?.summary.overall_operational_threat || overview?.overall_status || 'OPTIMAL'}
              </div>
              <p className="text-[10px] text-[#607391] font-medium leading-tight truncate">
                {liveIndia?.summary.operational_summary ||
                  overview?.overall_description ||
                  'Nominal operational envelope across India airspace'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* MIDDLE SECTION: Interactive India Weather Map + Current Meteorological Conditions */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 lg:gap-6 items-stretch">
        {/* LEFT: Real Interactive India Weather Map (7 cols on xl, stacked on narrower) */}
        <div className="xl:col-span-7 glass-map-card p-4 sm:p-5 relative flex flex-col justify-between min-w-0">
          {/* Map Header */}
          <div className="flex flex-wrap items-center justify-between gap-2 mb-3 min-h-[36px]">
            <div className="flex items-center gap-2 min-w-0">
              <h3 className="font-bold text-base text-[#14264A] tracking-tight truncate">Tactical India Weather Map</h3>
              <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-blue-500/10 text-[#2563EB] border border-blue-500/20 backdrop-blur-xs shrink-0 shadow-xs">
                OFFICIAL GoI BOUNDARIES • REAL-TIME
              </span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-xs text-[#607391] font-medium hidden sm:inline">
                Click any State/UT to inspect METAR
              </span>
            </div>
          </div>

          {/* Genuine Interactive Leaflet Map with Bundled GoI GeoJSON */}
          <IndiaWeatherMap
            states={liveIndia?.states || []}
            summary={liveIndia?.summary || null}
            status={liveIndia?.status || 'OFFLINE'}
            lastUpdated={liveIndia?.last_updated_utc || null}
            dataSource={liveIndia?.data_source || 'Open-Meteo Forecast API'}
            selectedState={selectedState}
            onSelectState={setSelectedState}
            onRefresh={handleManualRefresh}
            loading={liveRefreshing}
          />
        </div>

        {/* RIGHT: Current Weather Conditions (5 cols on xl, stacked on narrower) */}
        <div className="xl:col-span-5 clay-card p-4 sm:p-5 flex flex-col justify-between min-w-0">
          <div className="flex items-center justify-between mb-3 gap-2 min-h-[36px]">
            <div className="flex items-center gap-2 min-w-0">
              <CloudSun className="w-4 h-4 text-[#4285F4] shrink-0" />
              <h3 className="font-bold text-base text-[#14264A] truncate">Current Weather Conditions</h3>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <span
                className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                  liveIndia?.status === 'LIVE'
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                    : liveIndia?.status === 'STALE'
                    ? 'bg-amber-100 text-amber-800 border border-amber-300'
                    : 'bg-rose-100 text-rose-800 border border-rose-300'
                }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    liveIndia?.status === 'LIVE'
                      ? 'bg-emerald-500 animate-pulse'
                      : liveIndia?.status === 'STALE'
                      ? 'bg-amber-500'
                      : 'bg-rose-500'
                  }`}
                />
                {liveIndia?.status === 'LIVE' ? 'LIVE' : liveIndia?.status === 'STALE' ? 'STALE' : 'OFFLINE'}
              </span>
              <span className="hidden sm:inline text-[10px] font-mono text-[#607391]">
                {liveIndia?.last_updated_utc
                  ? `UTC ${new Date(liveIndia.last_updated_utc).toLocaleTimeString('en-US', {
                      hour12: false,
                      hour: '2-digit',
                      minute: '2-digit',
                    })}`
                  : 'Syncing...'}
              </span>
            </div>
          </div>

          {/* Card Content or States */}
          {loading && !liveIndia && conditionCards.length === 0 ? (
            /* Loading Skeleton State */
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-2 2xl:grid-cols-3 gap-3 animate-pulse py-2">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="clay-inset p-3 rounded-2xl bg-white/40 space-y-2 h-[130px] flex flex-col justify-between"
                >
                  <div className="flex justify-between items-center">
                    <div className="w-8 h-8 rounded-xl bg-slate-200/70" />
                    <div className="w-12 h-4 rounded-full bg-slate-200/70" />
                  </div>
                  <div className="w-24 h-3 rounded bg-slate-200/70" />
                  <div className="space-y-1 pt-1">
                    <div className="w-full h-2 rounded bg-slate-200/50" />
                    <div className="w-3/4 h-2 rounded bg-slate-200/50" />
                  </div>
                </div>
              ))}
            </div>
          ) : conditionCards.length === 0 ? (
            /* Empty / Offline / Error State with Retry Button */
            <div className="clay-inset p-6 rounded-2xl bg-white/50 text-center space-y-3 my-auto">
              <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto shadow-inner">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-[#14264A]">Meteorological Data Offline</h4>
                <p className="text-xs text-[#607391] max-w-sm mx-auto mt-1">
                  {weatherError || 'Unable to retrieve live Open-Meteo telemetry for Indian airspace.'}
                </p>
              </div>
              <button
                onClick={handleManualRefresh}
                disabled={liveRefreshing}
                className="clay-btn-primary px-4 py-2 text-xs font-bold inline-flex items-center gap-2 cursor-pointer shadow-sm mx-auto"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${liveRefreshing ? 'animate-spin' : ''}`} />
                <span>Retry Live Connection</span>
              </button>
            </div>
          ) : (
            /* 6 Dynamic Live Aviation Meteorological Condition Cards */
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-2 2xl:grid-cols-3 gap-3">
              {conditionCards.map((card) => (
                <div
                  key={card.id}
                  className="clay-inset p-3 rounded-2xl flex flex-col justify-between space-y-2 hover:shadow-md transition bg-white/40"
                >
                  <div className="flex items-start justify-between">
                    <div className="p-1.5 rounded-xl bg-white/80 shadow-xs">
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
                            className={`w-1 h-1 rounded-full shrink-0 ${
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
          )}
        </div>
      </div>

      {/* BOTTOM SECTION: Recent Weather Alerts + State & Sector Status Table & Mission Impact */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 lg:gap-6">
        {/* BOTTOM LEFT: Recent Weather Alerts Table (5 cols on xl, stacked on narrower) */}
        <div className="xl:col-span-5 clay-card p-4 sm:p-5 min-w-0">
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
              View Detail →
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
                  <th className="pb-2.5 text-right">Action</th>
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
                    <td className="py-2.5 text-[#607391] max-w-[120px] truncate">
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

        {/* BOTTOM RIGHT: State & Sector Status Table + Mission Impact (7 cols on xl, stacked on narrower) */}
        <div className="xl:col-span-7 space-y-5 lg:space-y-6 min-w-0">
          {/* Live State-wise Weather Status Table */}
          <div className="clay-card p-4 sm:p-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#4285F4]" />
                <h3 className="font-bold text-base text-[#14264A]">
                  {viewMode === 'states' ? 'State-wise Live Weather' : 'Sector-wise Tactical Weather'}
                </h3>
              </div>

              {/* View Switcher & Filters */}
              <div className="flex items-center gap-2">
                <div className="flex rounded-xl bg-white/70 p-0.5 border border-slate-200 text-[11px] font-bold">
                  <button
                    onClick={() => setViewMode('states')}
                    className={`px-2.5 py-1 rounded-lg transition cursor-pointer ${
                      viewMode === 'states'
                        ? 'bg-[#4285F4] text-white shadow-xs'
                        : 'text-[#607391] hover:text-[#14264A]'
                    }`}
                  >
                    36 States/UTs ({filteredStates.length})
                  </button>
                  <button
                    onClick={() => setViewMode('zones')}
                    className={`px-2.5 py-1 rounded-lg transition cursor-pointer ${
                      viewMode === 'zones'
                        ? 'bg-[#4285F4] text-white shadow-xs'
                        : 'text-[#607391] hover:text-[#14264A]'
                    }`}
                  >
                    9 Tactical Sectors
                  </button>
                </div>
              </div>
            </div>

            {/* Search and Risk Filter Bar */}
            {viewMode === 'states' && (
              <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                <div className="relative flex-1 min-w-[200px]">
                  <Search className="w-3.5 h-3.5 text-[#607391] absolute left-2.5 top-2.5" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search state, UT, code or condition..."
                    className="w-full text-xs pl-8 pr-3 py-1.5 rounded-xl bg-white/80 border border-slate-200 focus:outline-none focus:ring-1 focus:ring-[#4285F4] text-[#14264A]"
                  />
                </div>

                <div className="flex items-center gap-1.5 text-[10px] font-bold">
                  {(['ALL', 'HIGH', 'MEDIUM', 'LOW'] as const).map((r) => (
                    <button
                      key={r}
                      onClick={() => setRiskFilter(r)}
                      className={`px-2 py-1 rounded-lg transition cursor-pointer ${
                        riskFilter === r
                          ? r === 'HIGH'
                            ? 'bg-[#F04452] text-white'
                            : r === 'MEDIUM'
                            ? 'bg-[#D97706] text-white'
                            : r === 'LOW'
                            ? 'bg-[#059669] text-white'
                            : 'bg-[#14264A] text-white'
                          : 'bg-white/70 text-[#607391] hover:text-[#14264A]'
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Table Container */}
            <div className="overflow-x-auto max-h-[250px]">
              {viewMode === 'states' ? (
                <table className="w-full text-left text-xs">
                  <thead className="sticky top-0 bg-[#EAF2FC] z-10">
                    <tr className="border-b border-[#C2D5ED]/60 text-[#607391] font-bold">
                      <th className="pb-2">State / UT</th>
                      <th className="pb-2">Condition</th>
                      <th className="pb-2">Risk</th>
                      <th className="pb-2">Temp</th>
                      <th className="pb-2">Wind</th>
                      <th className="pb-2">Precip</th>
                      <th className="pb-2 text-right">Inspect</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#C2D5ED]/40 text-[#14264A]">
                    {filteredStates.map((st) => (
                      <tr
                        key={st.code}
                        onClick={() => setSelectedState(st)}
                        className={`hover:bg-white/60 cursor-pointer transition ${
                          selectedState?.code === st.code ? 'bg-blue-100/70 font-semibold' : ''
                        }`}
                      >
                        <td className="py-2">
                          <div className="font-bold text-[#14264A]">{st.name}</div>
                          <div className="text-[10px] text-[#607391] font-mono">{st.code} • {st.zone}</div>
                        </td>
                        <td className="py-2">
                          <div className="flex items-center gap-1 text-[11px] font-medium">
                            {renderZoneConditionIcon(st.weather_condition)}
                            <span className="truncate max-w-[110px]">{st.weather_condition}</span>
                          </div>
                        </td>
                        <td className="py-2">
                          <span
                            className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full ${getRiskBadgeColor(
                              st.risk_level
                            )}`}
                          >
                            {st.risk_level}
                          </span>
                        </td>
                        <td className="py-2 font-mono">
                          {st.temperature_2m != null ? `${st.temperature_2m}°C` : '—'}
                        </td>
                        <td className="py-2 font-mono">
                          {st.wind_speed_10m != null ? `${st.wind_speed_10m} km/h` : '—'}
                        </td>
                        <td className="py-2 font-mono">
                          {st.precipitation != null ? `${st.precipitation} mm` : '0 mm'}
                        </td>
                        <td className="py-2 text-right">
                          <span className="text-[10px] font-bold text-[#4285F4] inline-flex items-center gap-0.5">
                            Locate <ArrowUpRight className="w-3 h-3" />
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
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
              )}
            </div>
          </div>

          {/* Weather Impact on Missions Cards & OR-Tools Action */}
          <div className="clay-card p-4 sm:p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Crosshair className="w-4 h-4 text-[#F04452]" />
                <h3 className="font-bold text-base text-[#14264A]">Weather Impact on Missions</h3>
              </div>
              <span className="text-xs font-semibold px-2 py-1 rounded-full bg-white/70 border border-slate-200">
                Live Flight Ops
              </span>
            </div>

            {/* 4 Impact Stat Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
              <div className="clay-inset p-3 bg-[#FDE8E8]/50 rounded-2xl">
                <div className="text-[11px] font-bold text-[#F04452]">Affected Missions</div>
                <div className="text-2xl font-black text-[#F04452] mt-1">
                  {overview?.impact?.affected_missions ?? 6}/
                  {overview?.impact?.total_missions ?? 15}
                </div>
                <div className="text-[10px] text-[#991B1B] font-semibold mt-0.5">
                  Dynamic avoidance
                </div>
              </div>

              <div className="clay-inset p-3 bg-[#FEF3C7]/50 rounded-2xl">
                <div className="text-[11px] font-bold text-[#D97706]">Delayed Missions</div>
                <div className="text-2xl font-black text-[#D97706] mt-1">
                  {overview?.impact?.delayed_missions ?? 4}
                </div>
                <div className="text-[10px] text-[#92400E] font-semibold mt-0.5">
                  Slot rescheduling
                </div>
              </div>

              <div className="clay-inset p-3 bg-[#DEF7EC]/50 rounded-2xl">
                <div className="text-[11px] font-bold text-[#059669]">Rerouted Missions</div>
                <div className="text-2xl font-black text-[#059669] mt-1">
                  {overview?.impact?.rerouted_missions ?? 2}
                </div>
                <div className="text-[10px] text-[#065F46] font-semibold mt-0.5">
                  Waypoint diverted
                </div>
              </div>

              <div className="clay-inset p-3 bg-[#E1EFFE]/50 rounded-2xl">
                <div className="text-[11px] font-bold text-[#1D4ED8]">Cancelled Missions</div>
                <div className="text-2xl font-black text-[#1D4ED8] mt-1">
                  {overview?.impact?.cancelled_missions ?? 0}
                </div>
                <div className="text-[10px] text-[#1E40AF] font-semibold mt-0.5">
                  Zero aborts
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
                  : 'Run Dynamic Re-Optimization with Live Weather Constraints'}
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
                    Clear high-pressure envelope across all zones. 100% operational throughput.
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
                <span
                  className={`px-2 py-0.5 rounded-full font-bold ${getRiskBadgeColor(
                    selectedZone.risk_level
                  )}`}
                >
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
                <p className="text-[#14264A] text-xs leading-relaxed">
                  {selectedZone.flight_advisory}
                </p>
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

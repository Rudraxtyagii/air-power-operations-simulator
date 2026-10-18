import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  MapContainer,
  TileLayer,
  GeoJSON,
  Marker,
  Polyline,
  Tooltip,
  useMap,
} from 'react-leaflet';
import L from 'leaflet';
import type { GeoJsonObject } from 'geojson';
import {
  ZoomIn,
  ZoomOut,
  Crosshair,
  Maximize2,
  Minimize2,
  Layers,
  Radio,
  Wind,
  Droplets,
  Thermometer,
  CloudSun,
  RefreshCw,
} from 'lucide-react';
import type { StateWeatherItem, LiveWeatherSummary } from '../types';
import indiaGeoRaw from '../data/indiaStatesGeoJSON.json';

// Type assertion for bundled GeoJSON
const indiaGeoData = indiaGeoRaw as unknown as GeoJsonObject;

// Strategic IAF Airbases
interface IAFBase {
  id: string;
  name: string;
  code: string;
  command: string;
  lat: number;
  lon: number;
  squadrons: string;
  runway: string;
}

const IAF_AIRBASES: IAFBase[] = [
  {
    id: 'ambala',
    name: 'Ambala AFS',
    code: 'VIAM',
    command: 'Western Air Command',
    lat: 30.3702,
    lon: 76.8172,
    squadrons: 'No. 17 Sqn (Golden Arrows - Rafale)',
    runway: '12R/30L • 2,900m',
  },
  {
    id: 'srinagar',
    name: 'Srinagar AFS',
    code: 'VISR',
    command: 'Western Air Command',
    lat: 34.0087,
    lon: 74.7741,
    squadrons: 'No. 51 Sqn (Sword Arms)',
    runway: '13/31 • 3,688m',
  },
  {
    id: 'halwara',
    name: 'Halwara AFS',
    code: 'VIHX',
    command: 'Western Air Command',
    lat: 30.7505,
    lon: 75.6339,
    squadrons: 'No. 220 Sqn (Desert Tigers - Su-30MKI)',
    runway: '13/31 • 2,743m',
  },
  {
    id: 'jodhpur',
    name: 'Jodhpur AFS',
    code: 'VIJO',
    command: 'South Western Air Command',
    lat: 26.2514,
    lon: 73.0489,
    squadrons: 'No. 32 Sqn (Thunderbirds - Su-30MKI)',
    runway: '05/23 • 2,745m',
  },
  {
    id: 'pune',
    name: 'Pune AFS (Lohegaon)',
    code: 'VAPO',
    command: 'South Western Air Command',
    lat: 18.5822,
    lon: 73.9197,
    squadrons: 'No. 20 Sqn (Lightnings - Su-30MKI)',
    runway: '10/28 • 2,539m',
  },
  {
    id: 'bareilly',
    name: 'Bareilly AFS',
    code: 'VIBY',
    command: 'Central Air Command',
    lat: 28.4222,
    lon: 79.4503,
    squadrons: 'No. 8 Sqn (Pursoots - Su-30MKI)',
    runway: '11/29 • 2,743m',
  },
  {
    id: 'hasimara',
    name: 'Hasimara AFS',
    code: 'VE44',
    command: 'Eastern Air Command',
    lat: 26.7031,
    lon: 89.3694,
    squadrons: 'No. 101 Sqn (Falcons - Rafale)',
    runway: '11L/29R • 2,743m',
  },
  {
    id: 'tezpur',
    name: 'Tezpur AFS',
    code: 'VETZ',
    command: 'Eastern Air Command',
    lat: 26.7099,
    lon: 92.7967,
    squadrons: 'No. 2 Sqn (Winged Daggers - Su-30MKI)',
    runway: '04/22 • 2,746m',
  },
  {
    id: 'sulur',
    name: 'Sulur AFS',
    code: 'VOSX',
    command: 'Southern Air Command',
    lat: 11.0139,
    lon: 77.1608,
    squadrons: 'No. 45 Sqn (Flying Daggers - Tejas LCA)',
    runway: '05/23 • 2,747m',
  },
  {
    id: 'thanjavur',
    name: 'Thanjavur AFS',
    code: 'VOTJ',
    command: 'Southern Air Command',
    lat: 10.7225,
    lon: 79.1022,
    squadrons: 'No. 222 Sqn (Tigersharks - Su-30MKI BrahMos)',
    runway: '07/25 • 2,438m',
  },
  {
    id: 'portblair',
    name: 'INS Utkrosh (Port Blair)',
    code: 'VOPB',
    command: 'Andaman & Nicobar Command',
    lat: 11.6411,
    lon: 92.7297,
    squadrons: 'INAS 318 (Hawkeyes - Dornier Do-228)',
    runway: '04/22 • 3,290m',
  },
];

// Tactical Corridors connecting Airbases
const TACTICAL_CORRIDORS: { from: IAFBase; to: IAFBase; label: string }[] = [
  { from: IAF_AIRBASES[0], to: IAF_AIRBASES[1], label: 'Northern Defense Sector' }, // Ambala - Srinagar
  { from: IAF_AIRBASES[0], to: IAF_AIRBASES[5], label: 'Trans-Gangetic Vector' }, // Ambala - Bareilly
  { from: IAF_AIRBASES[5], to: IAF_AIRBASES[6], label: 'Himalayan Ridge Corridor' }, // Bareilly - Hasimara
  { from: IAF_AIRBASES[6], to: IAF_AIRBASES[7], label: 'Brahmaputra Patrol Line' }, // Hasimara - Tezpur
  { from: IAF_AIRBASES[3], to: IAF_AIRBASES[4], label: 'Western Border Transit' }, // Jodhpur - Pune
  { from: IAF_AIRBASES[4], to: IAF_AIRBASES[8], label: 'Peninsular Airway Alpha' }, // Pune - Sulur
  { from: IAF_AIRBASES[8], to: IAF_AIRBASES[9], label: 'Indian Ocean Approach' }, // Sulur - Thanjavur
];

// Airbase custom HTML SVG Marker Icon
const createAirbaseIcon = (baseName: string) =>
  L.divIcon({
    className: 'custom-airbase-icon',
    html: `
      <div class="group relative flex items-center justify-center cursor-pointer">
        <div class="w-6 h-6 rounded-full bg-[#1E40AF] border-2 border-white shadow-lg flex items-center justify-center transition-transform group-hover:scale-125">
          <svg class="w-3.5 h-3.5 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"/>
          </svg>
        </div>
        <div class="absolute -bottom-4 px-1.5 py-0.2 rounded bg-[#0F172A]/90 text-[9px] font-mono font-bold text-white whitespace-nowrap shadow-sm pointer-events-none">
          ${baseName}
        </div>
      </div>
    `,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
    popupAnchor: [0, -14],
  });

// Map Controller for imperative actions (zoom, bounds, panning)
interface MapControllerProps {
  selectedState: StateWeatherItem | null;
  resetViewTrigger: number;
  zoomAction: { action: 'in' | 'out'; trigger: number };
}

const MapController: React.FC<MapControllerProps> = ({ selectedState, resetViewTrigger, zoomAction }) => {
  const map = useMap();

  // Invalidate map size on container resize (window resize, drawer toggle, layout reflow)
  useEffect(() => {
    const container = map.getContainer();
    if (!container) return;

    // Trigger initial invalidation once container is ready
    const initTimer = setTimeout(() => {
      map.invalidateSize();
    }, 200);

    let resizeTimer: any = null;
    const observer = new ResizeObserver(() => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        map.invalidateSize();
      }, 100);
    });

    observer.observe(container);

    return () => {
      clearTimeout(initTimer);
      clearTimeout(resizeTimer);
      observer.disconnect();
    };
  }, [map]);

  // Handle Zoom In / Zoom Out
  useEffect(() => {
    if (zoomAction.trigger > 0) {
      if (zoomAction.action === 'in') {
        map.zoomIn();
      } else {
        map.zoomOut();
      }
    }
  }, [zoomAction, map]);

  // Reset to full India view
  useEffect(() => {
    if (resetViewTrigger > 0) {
      map.flyToBounds(
        [
          [6.5, 68.0],
          [37.5, 98.0],
        ],
        { padding: [20, 20], duration: 1.2 }
      );
    }
  }, [resetViewTrigger, map]);

  // Pan to selected state centroid
  useEffect(() => {
    if (selectedState && selectedState.lat && selectedState.lon) {
      map.flyTo([selectedState.lat, selectedState.lon], 6.5, {
        duration: 1.0,
      });
    }
  }, [selectedState, map]);

  return null;
};

export interface IndiaWeatherMapProps {
  states: StateWeatherItem[];
  summary: LiveWeatherSummary | null;
  status: 'LIVE' | 'STALE' | 'OFFLINE';
  lastUpdated: string | null;
  dataSource?: string;
  selectedState: StateWeatherItem | null;
  onSelectState: (state: StateWeatherItem | null) => void;
  onRefresh?: () => void;
  loading?: boolean;
}

export const IndiaWeatherMap: React.FC<IndiaWeatherMapProps> = ({
  states,
  summary,
  status,
  lastUpdated,
  dataSource = 'Open-Meteo Forecast API',
  selectedState,
  onSelectState,
  onRefresh,
  loading = false,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [resetCount, setResetCount] = useState(0);
  const [zoomAction, setZoomAction] = useState<{ action: 'in' | 'out'; trigger: number }>({
    action: 'in',
    trigger: 0,
  });

  // Layer toggles
  const [layerChoropleth, setLayerChoropleth] = useState(true);
  const [layerBoundaries, setLayerBoundaries] = useState(true);
  const [layerAirbases, setLayerAirbases] = useState(true);
  const [layerCorridors, setLayerCorridors] = useState(true);
  const [layerRadar, setLayerRadar] = useState(true);
  const [showLayerMenu, setShowLayerMenu] = useState(false);

  // Map state name to weather object
  const statesMap = useMemo(() => {
    const map = new Map<string, StateWeatherItem>();
    states.forEach((s) => map.set(s.name, s));
    return map;
  }, [states]);

  // Handle Fullscreen toggle
  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch((err) => {
        console.error('Fullscreen request failed:', err);
      });
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch((err) => {
        console.error('Exit fullscreen failed:', err);
      });
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  // Dynamic polygon styling based on live risk classification
  const getFeatureStyle = (feature: any) => {
    const stateName = feature?.properties?.name;
    const item = statesMap.get(stateName);
    const isSelected = selectedState?.name === stateName;

    const risk = item?.risk_level || 'UNKNOWN';

    let fillColor = '#64748B'; // Slate fallback
    let strokeColor = '#475569';
    let fillOpacity = 0.35;

    if (layerChoropleth) {
      if (risk === 'HIGH') {
        fillColor = '#EF4444'; // Red
        strokeColor = '#DC2626';
        fillOpacity = 0.52;
      } else if (risk === 'MEDIUM') {
        fillColor = '#F59E0B'; // Amber
        strokeColor = '#D97706';
        fillOpacity = 0.45;
      } else if (risk === 'LOW') {
        fillColor = '#10B981'; // Green
        strokeColor = '#059669';
        fillOpacity = 0.36;
      }
    } else {
      fillColor = '#94A3B8';
      fillOpacity = 0.15;
    }

    if (isSelected) {
      return {
        fillColor,
        fillOpacity: 0.75,
        color: '#1E40AF',
        weight: 3.5,
        dashArray: '',
      };
    }

    return {
      fillColor,
      fillOpacity,
      color: layerBoundaries ? strokeColor : 'transparent',
      weight: layerBoundaries ? 1.4 : 0,
      dashArray: layerBoundaries ? '3, 2' : '',
    };
  };

  // GeoJSON event handlers
  const onEachFeature = (feature: any, layer: L.Layer) => {
    const stateName = feature?.properties?.name;
    const item = statesMap.get(stateName);

    // Interactive hover & click
    layer.on({
      mouseover: (e) => {
        const target = e.target;
        if (selectedState?.name !== stateName) {
          target.setStyle({
            weight: 2.8,
            color: '#2563EB',
            fillOpacity: 0.65,
          });
        }
        if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
          target.bringToFront();
        }
      },
      mouseout: (e) => {
        const target = e.target;
        target.setStyle(getFeatureStyle(feature));
      },
      click: () => {
        if (item) {
          onSelectState(item);
        }
      },
    });

    // Tooltip popup
    const riskBadge = item
      ? `<span style="padding: 2px 6px; border-radius: 9999px; font-weight: 800; font-size: 10px; background-color: ${
          item.risk_level === 'HIGH'
            ? '#FEE2E2; color: #DC2626;'
            : item.risk_level === 'MEDIUM'
            ? '#FEF3C7; color: #D97706;'
            : '#D1FAE5; color: #059669;'
        }">${item.risk_level} RISK</span>`
      : '<span style="font-size: 10px; color: #64748B;">Offline</span>';

    const tempStr = item?.temperature_2m != null ? `${item.temperature_2m}°C` : 'N/A';
    const windStr = item?.wind_speed_10m != null ? `${item.wind_speed_10m} km/h` : 'N/A';
    const condStr = item?.weather_condition || 'Data syncing';

    layer.bindTooltip(
      `
      <div style="font-family: system-ui, sans-serif; padding: 4px; min-width: 140px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px; gap: 8px;">
          <strong style="color: #0F172A; font-size: 12px;">${stateName}</strong>
          ${riskBadge}
        </div>
        <div style="font-size: 11px; color: #334155; margin-bottom: 2px;">${condStr}</div>
        <div style="display: flex; gap: 8px; font-size: 10px; color: #64748B; font-family: monospace;">
          <span>🌡️ ${tempStr}</span>
          <span>💨 ${windStr}</span>
        </div>
      </div>
    `,
      {
        sticky: true,
        direction: 'auto',
        className: 'glass-map-tooltip',
      }
    );
  };

  return (
    <div
      ref={containerRef}
      className={`relative w-full overflow-hidden flex flex-col glass-map-container ${
        isFullscreen ? 'h-screen w-screen z-50' : 'h-[440px] sm:h-[500px] lg:h-[560px]'
      }`}
    >
      {/* MAP ENGINE (React Leaflet) */}
      <MapContainer
        center={[22.8, 82.5]}
        zoom={5}
        minZoom={4}
        maxZoom={10}
        maxBounds={[
          [4.0, 64.0],
          [39.0, 102.0],
        ]}
        scrollWheelZoom={true}
        zoomControl={false}
        attributionControl={false}
        className="w-full h-full z-0 cursor-grab active:cursor-grabbing"
      >
        <MapController
          selectedState={selectedState}
          resetViewTrigger={resetCount}
          zoomAction={zoomAction}
        />

        {/* Base Map Tiles: OpenStreetMap Standard (Clean, Topographic, ODbL Licensed, Zero API Key Watermarks) */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          subdomains="abc"
          maxZoom={19}
        />

        {/* Real Official GoI GeoJSON State Polygons */}
        <GeoJSON
          key={`geojson-${layerChoropleth}-${layerBoundaries}-${states.length}-${selectedState?.code}`}
          data={indiaGeoData}
          style={getFeatureStyle}
          onEachFeature={onEachFeature}
        />

        {/* Strategic Corridors */}
        {layerCorridors &&
          TACTICAL_CORRIDORS.map((corridor, idx) => (
            <Polyline
              key={`corridor-${idx}`}
              positions={[
                [corridor.from.lat, corridor.from.lon],
                [corridor.to.lat, corridor.to.lon],
              ]}
              pathOptions={{
                color: '#2563EB',
                weight: 2,
                dashArray: '6, 6',
                opacity: 0.7,
              }}
            >
              <Tooltip sticky direction="center">
                <span className="text-[10px] font-mono font-bold text-[#1E40AF]">
                  ✈️ {corridor.label}
                </span>
              </Tooltip>
            </Polyline>
          ))}

        {/* Major IAF Airbases Markers */}
        {layerAirbases &&
          IAF_AIRBASES.map((base) => (
            <Marker
              key={base.id}
              position={[base.lat, base.lon]}
              icon={createAirbaseIcon(base.name)}
            >
              <Tooltip direction="top" offset={[0, -12]}>
                <div className="p-1 space-y-1">
                  <div className="font-bold text-xs text-[#0F172A]">{base.name} ({base.code})</div>
                  <div className="text-[10px] text-[#3B82F6] font-semibold">{base.command}</div>
                  <div className="text-[10px] text-[#475569]">{base.squadrons}</div>
                  <div className="text-[9px] text-[#64748B] font-mono">Runway: {base.runway}</div>
                </div>
              </Tooltip>
            </Marker>
          ))}
      </MapContainer>

      {/* TACTICAL RADAR SWEEP ANIMATION */}
      {layerRadar && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-10">
          <div
            className="w-[900px] h-[900px] absolute -top-[250px] -left-[150px] rounded-full animate-radar-sweep opacity-15 pointer-events-none"
            style={{
              background:
                'conic-gradient(from 0deg, rgba(37, 99, 235, 0.45) 0deg, rgba(37, 99, 235, 0) 65deg, transparent 360deg)',
            }}
          />
        </div>
      )}

      {/* TOP-LEFT HUD: Title & Live Open-Meteo Status (Glassmorphic) */}
      <div className="absolute top-3 left-3 z-20 flex flex-col gap-1.5 pointer-events-auto">
        <div className="glass-map-pill px-3.5 py-2 rounded-2xl flex items-center gap-2.5">
          <Radio className="w-4 h-4 text-[#2563EB] animate-pulse" />
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black tracking-wide text-[#0F172A]">
                INDIA TACTICAL AIR WEATHER RADAR
              </span>
              <span
                className={`text-[9px] font-black px-2 py-0.5 rounded-full flex items-center gap-1 ${
                  status === 'LIVE'
                    ? 'bg-emerald-500/15 text-emerald-800 border border-emerald-500/30'
                    : status === 'STALE'
                    ? 'bg-amber-500/15 text-amber-800 border border-amber-500/30'
                    : 'bg-rose-500/15 text-rose-800 border border-rose-500/30'
                }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    status === 'LIVE'
                      ? 'bg-emerald-500 animate-ping'
                      : status === 'STALE'
                      ? 'bg-amber-500'
                      : 'bg-rose-500'
                  }`}
                />
                {status} OPEN-METEO
              </span>
            </div>
            <div className="text-[10px] text-[#64748B] font-mono flex items-center gap-2">
              <span>{states.length} States / UTs active</span>
              <span>•</span>
              <span>Updated: {lastUpdated ? new Date(lastUpdated).toLocaleTimeString() : 'Syncing...'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* TOP-RIGHT CONTROLS: Layer Menu & Fullscreen (Glassmorphic) */}
      <div className="absolute top-3 right-3 z-20 flex items-center gap-2 pointer-events-auto">
        {/* Refresh Button */}
        {onRefresh && (
          <button
            onClick={onRefresh}
            disabled={loading}
            className="glass-map-btn p-2 rounded-xl cursor-pointer"
            title="Refresh Live Meteorological Data"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-[#2563EB]' : ''}`} />
          </button>
        )}

        {/* Layer Controls Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowLayerMenu(!showLayerMenu)}
            className="glass-map-btn px-3 py-2 rounded-xl flex items-center gap-1.5 text-xs font-bold cursor-pointer"
            title="Toggle Tactical Map Layers"
          >
            <Layers className="w-4 h-4 text-[#2563EB]" />
            <span>Layers</span>
          </button>

          {showLayerMenu && (
            <div className="absolute right-0 mt-2 w-48 glass-map-drawer p-3 rounded-2xl space-y-2 text-xs text-[#0F172A] font-semibold z-30">
              <div className="text-[10px] uppercase font-bold text-[#64748B] tracking-wider pb-1 border-b border-white/60">
                Aviation Layers
              </div>
              <label className="flex items-center gap-2 cursor-pointer hover:text-[#2563EB]">
                <input
                  type="checkbox"
                  checked={layerChoropleth}
                  onChange={(e) => setLayerChoropleth(e.target.checked)}
                  className="rounded text-[#2563EB]"
                />
                Weather Risk Polygons
              </label>
              <label className="flex items-center gap-2 cursor-pointer hover:text-[#2563EB]">
                <input
                  type="checkbox"
                  checked={layerBoundaries}
                  onChange={(e) => setLayerBoundaries(e.target.checked)}
                  className="rounded text-[#2563EB]"
                />
                State Boundaries
              </label>
              <label className="flex items-center gap-2 cursor-pointer hover:text-[#2563EB]">
                <input
                  type="checkbox"
                  checked={layerAirbases}
                  onChange={(e) => setLayerAirbases(e.target.checked)}
                  className="rounded text-[#2563EB]"
                />
                IAF Airbases ({IAF_AIRBASES.length})
              </label>
              <label className="flex items-center gap-2 cursor-pointer hover:text-[#2563EB]">
                <input
                  type="checkbox"
                  checked={layerCorridors}
                  onChange={(e) => setLayerCorridors(e.target.checked)}
                  className="rounded text-[#2563EB]"
                />
                Air Corridors ({TACTICAL_CORRIDORS.length})
              </label>
              <label className="flex items-center gap-2 cursor-pointer hover:text-[#2563EB]">
                <input
                  type="checkbox"
                  checked={layerRadar}
                  onChange={(e) => setLayerRadar(e.target.checked)}
                  className="rounded text-[#2563EB]"
                />
                Radar Sweep Effect
              </label>
            </div>
          )}
        </div>

        {/* Fullscreen Button */}
        <button
          onClick={toggleFullscreen}
          className="glass-map-btn p-2 rounded-xl cursor-pointer"
          title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
        >
          {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
        </button>
      </div>

      {/* LEFT NAVIGATION HUD: Zoom & Reset (Glassmorphic) */}
      <div className="absolute top-20 left-3 z-20 flex flex-col gap-1.5 pointer-events-auto">
        <button
          onClick={() => setZoomAction((z) => ({ action: 'in', trigger: z.trigger + 1 }))}
          className="glass-map-btn p-2 rounded-xl cursor-pointer"
          title="Zoom In"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          onClick={() => setZoomAction((z) => ({ action: 'out', trigger: z.trigger + 1 }))}
          className="glass-map-btn p-2 rounded-xl cursor-pointer"
          title="Zoom Out"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <button
          onClick={() => setResetCount((c) => c + 1)}
          className="glass-map-btn p-2 rounded-xl cursor-pointer"
          title="Reset to Full India View"
        >
          <Crosshair className="w-4 h-4" />
        </button>
      </div>

      {/* BOTTOM HUD: Unified Risk Legend & Attribution Bar (Glassmorphic, Zero Overlap) */}
      <div className="absolute bottom-2.5 inset-x-2.5 z-20 pointer-events-none flex flex-wrap items-center justify-between gap-2">
        {/* Risk Legend */}
        <div className="glass-map-pill px-3 py-1.5 rounded-xl flex items-center gap-2.5 text-xs font-bold text-[#0F172A] pointer-events-auto">
          <span className="text-[10px] font-extrabold text-[#64748B] uppercase tracking-wider">
            Risk:
          </span>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#EF4444] shadow-xs" />
            <span className="text-[11px]">High ({summary?.high_risk_count ?? 0})</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#F59E0B] shadow-xs" />
            <span className="text-[11px]">Med ({summary?.medium_risk_count ?? 0})</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#10B981] shadow-xs" />
            <span className="text-[11px]">Low ({summary?.low_risk_count ?? 0})</span>
          </div>
        </div>

        {/* Official Boundaries & Weather Attribution */}
        <div className="glass-map-pill px-2.5 py-1 rounded-xl text-[10px] font-mono text-[#64748B] flex flex-wrap items-center gap-1.5 pointer-events-auto">
          <span className="font-semibold text-slate-700">&copy; OpenStreetMap</span>
          <span>•</span>
          <span>Boundaries: Vardhan Systems (ODbL)</span>
          <span>•</span>
          <span>Data: {dataSource}</span>
        </div>
      </div>

      {/* SELECTED STATE FLOATING INSPECTOR DRAWER (Glassmorphic) */}
      {selectedState && (
        <div className="absolute top-16 right-2 sm:right-3 z-30 w-[calc(100%-1rem)] max-w-sm sm:w-80 glass-map-drawer p-3.5 sm:p-4 rounded-3xl animate-slide-in pointer-events-auto max-h-[calc(100%-4.5rem)] overflow-y-auto">
          <div className="flex items-start justify-between pb-2 border-b border-white/60">
            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-black text-sm text-[#0F172A]">{selectedState.name}</h4>
                <span className="text-[10px] font-mono font-bold text-[#64748B]">
                  ({selectedState.code})
                </span>
              </div>
              <p className="text-[10px] font-semibold text-[#3B82F6]">{selectedState.zone}</p>
            </div>
            <button
              onClick={() => onSelectState(null)}
              className="glass-map-btn w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs cursor-pointer"
            >
              ✕
            </button>
          </div>

          {/* Meteorological Metrics Grid */}
          <div className="grid grid-cols-2 gap-2 my-3 text-xs">
            <div className="p-2 rounded-xl glass-map-subcard flex items-center gap-2">
              <Thermometer className="w-4 h-4 text-amber-500 shrink-0" />
              <div>
                <div className="text-[10px] text-[#64748B] font-medium">Temperature</div>
                <div className="font-mono font-bold text-[#0F172A]">
                  {selectedState.temperature_2m != null ? `${selectedState.temperature_2m}°C` : '—'}
                </div>
              </div>
            </div>

            <div className="p-2 rounded-xl glass-map-subcard flex items-center gap-2">
              <Wind className="w-4 h-4 text-sky-500 shrink-0" />
              <div>
                <div className="text-[10px] text-[#64748B] font-medium">Wind / Gusts</div>
                <div className="font-mono font-bold text-[#0F172A]">
                  {selectedState.wind_speed_10m != null ? `${selectedState.wind_speed_10m} km/h` : '—'}
                </div>
              </div>
            </div>

            <div className="p-2 rounded-xl glass-map-subcard flex items-center gap-2">
              <Droplets className="w-4 h-4 text-blue-500 shrink-0" />
              <div>
                <div className="text-[10px] text-[#64748B] font-medium">Precipitation</div>
                <div className="font-mono font-bold text-[#0F172A]">
                  {selectedState.precipitation != null ? `${selectedState.precipitation} mm` : '0 mm'}
                </div>
              </div>
            </div>

            <div className="p-2 rounded-xl glass-map-subcard flex items-center gap-2">
              <CloudSun className="w-4 h-4 text-emerald-500 shrink-0" />
              <div>
                <div className="text-[10px] text-[#64748B] font-medium">Humidity</div>
                <div className="font-mono font-bold text-[#0F172A]">
                  {selectedState.relative_humidity_2m != null
                    ? `${selectedState.relative_humidity_2m}%`
                    : '—'}
                </div>
              </div>
            </div>
          </div>

          {/* Condition & Risk Assessment */}
          <div
            className={`p-2.5 rounded-2xl mb-2 text-xs border backdrop-blur-xs ${
              selectedState.risk_level === 'HIGH'
                ? 'bg-rose-500/10 border-rose-500/30 text-rose-950'
                : selectedState.risk_level === 'MEDIUM'
                ? 'bg-amber-500/10 border-amber-500/30 text-amber-950'
                : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-950'
            }`}
          >
            <div className="flex items-center justify-between font-bold mb-1">
              <span>{selectedState.weather_condition}</span>
              <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/80 shadow-xs border border-white/60">
                {selectedState.risk_level} RISK
              </span>
            </div>
            <ul className="text-[10px] space-y-0.5 font-medium list-disc list-inside opacity-90">
              {selectedState.risk_reasons.map((reason, idx) => (
                <li key={idx}>{reason}</li>
              ))}
            </ul>
          </div>

          {/* Flight Advisory */}
          <div className="p-2.5 rounded-2xl bg-blue-500/10 border border-blue-500/25 text-xs backdrop-blur-xs">
            <div className="text-[10px] font-bold text-blue-900 uppercase tracking-wider mb-0.5">
              Flight Operations Advisory
            </div>
            <p className="text-[11px] text-[#1E3A8A] font-medium leading-relaxed">
              {selectedState.advisory}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

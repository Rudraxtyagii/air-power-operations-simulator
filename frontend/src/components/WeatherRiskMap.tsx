import React, { useState, useRef, useEffect } from 'react';
import {
  ZoomIn,
  ZoomOut,
  Crosshair,
  Maximize2,
  Minimize2,
  CloudLightning,
  CloudRain,
  Flame,
  Sun,
  Wind,
  Navigation,
  X,
  Cpu,
} from 'lucide-react';
import mapReferenceImg from '../assets/weather_risk_map_reference.png';
import type { WeatherOverview, WeatherZone } from '../types';
import { soundSynthesizer } from '../utils/audioAlert';

interface WeatherRiskMapProps {
  overview: WeatherOverview | null;
  onSelectZone?: (zone: WeatherZone) => void;
  onRunOptimization?: () => void;
}

interface AirbaseInfo {
  id: string;
  name: string;
  zone: string;
  x: number;
  y: number;
  runway: string;
  status: 'ACTIVE' | 'STANDBY' | 'WEATHER_HOLD';
}

const AIRBASES: AirbaseInfo[] = [
  { id: 'BASE-1', name: 'Alpha Airbase', zone: 'ZONE_A', x: 125, y: 155, runway: '09/27 • CAT-III', status: 'ACTIVE' },
  { id: 'BASE-2', name: 'Bravo Tactical Base', zone: 'ZONE_D', x: 195, y: 355, runway: '14/32 • CAT-II', status: 'ACTIVE' },
  { id: 'BASE-3', name: 'Charlie Wing Base', zone: 'ZONE_E', x: 495, y: 165, runway: '04/22 • VFR-ONLY', status: 'WEATHER_HOLD' },
  { id: 'BASE-4', name: 'Delta Staging Base', zone: 'ZONE_G', x: 575, y: 310, runway: '18/36 • CAT-I', status: 'ACTIVE' },
];

// Polygonal paths for the 7 organic zones (matching 667 x 510 viewBox)
const ZONE_POLYGONS: Record<string, string> = {
  ZONE_A: '48,197 72,115 126,61 211,70 242,100 220,150 175,190 141,182 102,207',
  ZONE_B: '137,194 251,113 340,110 426,110 460,170 467,224 400,245 340,285 282,289 210,270 172,245',
  ZONE_C: '280,288 340,285 400,245 467,224 479,270 479,320 440,350 370,360 320,340',
  ZONE_D: '48,197 102,207 141,182 172,245 210,270 271,291 297,358 240,374 228,402 181,403 145,349 59,329',
  ZONE_E: '426,110 480,95 554,145 601,197 578,242 523,222 474,238 467,224 460,170',
  ZONE_F: '282,289 340,285 370,360 440,350 477,301 521,379 517,439 488,456 439,449 343,400 282,331',
  ZONE_G: '467,224 523,222 578,242 601,197 618,258 618,349 613,383 588,406 540,420 521,379 477,301 479,270',
};

// Zone center coordinates for labels and tooltips
const ZONE_CENTERS: Record<string, { x: number; y: number; label: string; defaultRisk: 'LOW' | 'MEDIUM' | 'HIGH' }> = {
  ZONE_A: { x: 145, y: 130, label: 'ZONE A', defaultRisk: 'LOW' },
  ZONE_B: { x: 265, y: 195, label: 'ZONE B', defaultRisk: 'HIGH' },
  ZONE_C: { x: 385, y: 280, label: 'ZONE C', defaultRisk: 'MEDIUM' },
  ZONE_D: { x: 215, y: 350, label: 'ZONE D', defaultRisk: 'LOW' },
  ZONE_E: { x: 510, y: 175, label: 'ZONE E', defaultRisk: 'MEDIUM' },
  ZONE_F: { x: 425, y: 375, label: 'ZONE F', defaultRisk: 'HIGH' },
  ZONE_G: { x: 550, y: 290, label: 'ZONE G', defaultRisk: 'LOW' },
};

export const WeatherRiskMap: React.FC<WeatherRiskMapProps> = ({
  overview,
  onSelectZone,
  onRunOptimization,
}) => {
  // Zoom & Pan state
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [panOffset, setPanOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Layers
  const [layerRadar, setLayerRadar] = useState<boolean>(true);
  const [layerBoundaries, setLayerBoundaries] = useState<boolean>(true);
  const [layerMissions, setLayerMissions] = useState<boolean>(true);
  const [layerAirbases, setLayerAirbases] = useState<boolean>(false);

  // Interactivity
  const [hoveredZone, setHoveredZone] = useState<string | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number } | null>(null);
  const [modalZone, setModalZone] = useState<WeatherZone | null>(null);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  const containerRef = useRef<HTMLDivElement>(null);

  // Handle escape to close fullscreen or modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (modalZone) setModalZone(null);
        else if (isFullscreen) setIsFullscreen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [modalZone, isFullscreen]);

  // Zoom handlers
  const handleZoomIn = () => {
    setZoomLevel((z) => Math.min(2.2, +(z + 0.2).toFixed(2)));
    soundSynthesizer.playNoticeChime();
  };

  const handleZoomOut = () => {
    setZoomLevel((z) => {
      const next = Math.max(0.8, +(z - 0.2).toFixed(2));
      if (next <= 1) setPanOffset({ x: 0, y: 0 });
      return next;
    });
    soundSynthesizer.playNoticeChime();
  };

  const handleResetView = () => {
    setZoomLevel(1);
    setPanOffset({ x: 0, y: 0 });
    soundSynthesizer.playNoticeChime();
  };

  // Drag handlers for panning when zoomed
  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoomLevel > 1) {
      setIsDragging(true);
      setDragStart({ x: e.clientX - panOffset.x, y: e.clientY - panOffset.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && zoomLevel > 1) {
      setPanOffset({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    }
    // Update tooltip position relative to container
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setTooltipPos({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Zone click handler
  const handleZoneClick = (zoneCode: string) => {
    const zoneData = overview?.zones.find((z) => z.zone_code === zoneCode);
    if (zoneData) {
      setModalZone(zoneData);
      if (onSelectZone) onSelectZone(zoneData);
      soundSynthesizer.playNoticeChime();
    } else {
      // Mock fallback if overview not yet loaded
      const mockZone: WeatherZone = {
        id: 99,
        zone_code: zoneCode,
        zone_name: `${zoneCode.replace('_', ' ')} Sector`,
        condition: zoneCode === 'ZONE_B' ? 'Severe Thunderstorm' : zoneCode === 'ZONE_F' ? 'Sandstorm' : 'Clear',
        risk_level: ZONE_CENTERS[zoneCode]?.defaultRisk || 'LOW',
        temperature_c: 24,
        wind_speed_kmh: 30,
        visibility_km: 10,
        radar_status: 'ACTIVE',
        flight_advisory: 'Advisory in effect',
        updated_at: new Date().toISOString(),
      };
      setModalZone(mockZone);
      if (onSelectZone) onSelectZone(mockZone);
    }
  };

  // Get current risk level for a zone from overview
  const getZoneRisk = (zoneCode: string): 'LOW' | 'MEDIUM' | 'HIGH' => {
    const zone = overview?.zones.find((z) => z.zone_code === zoneCode);
    if (zone) return zone.risk_level === 'NONE' ? 'LOW' : zone.risk_level;
    return ZONE_CENTERS[zoneCode]?.defaultRisk || 'LOW';
  };

  const mapContent = (
    <div
      ref={containerRef}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      className={`relative w-full overflow-hidden select-none rounded-3xl border border-white/80 shadow-inner bg-[#E2EDF9] ${
        isFullscreen ? 'h-full max-h-[88vh] aspect-[667/510]' : 'aspect-[667/510] max-h-[580px]'
      }`}
      style={{ cursor: zoomLevel > 1 ? (isDragging ? 'grabbing' : 'grab') : 'default' }}
    >
      {/* ZOOMABLE VIEWPORT CANVAS */}
      <div
        className="w-full h-full relative transition-transform duration-200 ease-out origin-center"
        style={{
          transform: `scale(${zoomLevel}) translate(${panOffset.x / zoomLevel}px, ${panOffset.y / zoomLevel}px)`,
        }}
      >
        {/* BASE HIGH-RES TERRAIN & ORGANIC MAP IMAGE */}
        <img
          src={mapReferenceImg}
          alt="Weather Risk Map Terrain"
          className="w-full h-full object-cover pointer-events-none"
          draggable={false}
        />

        {/* RADAR SWEEP EFFECT (when layerRadar is active) */}
        {layerRadar && (
          <div className="absolute inset-0 pointer-events-none overflow-hidden mix-blend-screen opacity-50">
            {/* Rotating radar beam */}
            <div
              className="w-[900px] h-[900px] absolute -top-[200px] -left-[120px] rounded-full animate-radar-sweep pointer-events-none"
              style={{
                background:
                  'conic-gradient(from 0deg, rgba(66, 133, 244, 0.45) 0deg, rgba(53, 207, 145, 0.25) 40deg, rgba(66, 133, 244, 0) 70deg, transparent 360deg)',
              }}
            />
            {/* Concentric radar rings */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-40">
              <circle cx="330" cy="255" r="90" fill="none" stroke="#4285F4" strokeWidth="1" strokeDasharray="3 3" />
              <circle cx="330" cy="255" r="180" fill="none" stroke="#4285F4" strokeWidth="1" strokeDasharray="4 4" />
              <circle cx="330" cy="255" r="270" fill="none" stroke="#4285F4" strokeWidth="0.8" strokeDasharray="5 5" />
            </svg>
          </div>
        )}

        {/* SVG INTERACTIVE OVERLAY: ZONES, BOUNDARIES & AIRBASES */}
        <svg
          viewBox="0 0 667 510"
          className="absolute inset-0 w-full h-full"
          style={{ pointerEvents: 'auto' }}
        >
          <defs>
            {/* Glow Filter for Active/Hovered Zones */}
            <filter id="zoneGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="6" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
            <filter id="aircraftShadow" x="-30%" y="-30%" width="160%" height="160%">
              <feDropShadow dx="3" dy="5" stdDeviation="3" floodColor="#0A1833" floodOpacity="0.45" />
            </filter>
          </defs>

          {/* DYNAMIC SCENARIO TINTS & INTERACTIVE HIT POLYGONS */}
          {Object.entries(ZONE_POLYGONS).map(([zoneCode, points]) => {
            const isHovered = hoveredZone === zoneCode;
            const currentRisk = getZoneRisk(zoneCode);
            const defaultRisk = ZONE_CENTERS[zoneCode]?.defaultRisk || 'LOW';
            const riskChanged = currentRisk !== defaultRisk;

            // Fill color if risk was dynamically changed by a scenario
            let dynamicFill = 'rgba(0, 0, 0, 0)';
            if (riskChanged) {
              if (currentRisk === 'HIGH') dynamicFill = 'rgba(240, 68, 82, 0.40)';
              else if (currentRisk === 'MEDIUM') dynamicFill = 'rgba(255, 201, 74, 0.40)';
              else dynamicFill = 'rgba(53, 207, 145, 0.35)';
            }

            return (
              <g key={zoneCode} className="cursor-pointer">
                {/* Zone Polygon Hit Area with dynamic overlay & hover highlight */}
                <polygon
                  points={points}
                  fill={isHovered ? 'rgba(255, 255, 255, 0.18)' : dynamicFill}
                  stroke={
                    isHovered
                      ? '#FFFFFF'
                      : layerBoundaries
                      ? 'rgba(255, 255, 255, 0.85)'
                      : 'transparent'
                  }
                  strokeWidth={isHovered ? 2.5 : layerBoundaries ? 1.5 : 0}
                  strokeDasharray={isHovered ? undefined : '5,4'}
                  filter={isHovered ? 'url(#zoneGlow)' : undefined}
                  className="transition-all duration-200"
                  onMouseEnter={() => setHoveredZone(zoneCode)}
                  onMouseLeave={() => setHoveredZone(null)}
                  onClick={() => handleZoneClick(zoneCode)}
                />

                {/* If zone is dynamically set to High Risk and is pulsing */}
                {currentRisk === 'HIGH' && (
                  <circle
                    cx={ZONE_CENTERS[zoneCode].x}
                    cy={ZONE_CENTERS[zoneCode].y}
                    r="24"
                    fill="rgba(240, 68, 82, 0.25)"
                    className="animate-ping pointer-events-none"
                  />
                )}
              </g>
            );
          })}

          {/* LAYER: ACTIVE MISSIONS FLIGHT CORRIDORS & ANIMATED JETS */}
          {layerMissions && (
            <g className="pointer-events-none">
              {/* Flight Path 1: Base Alpha to Zone B Approach */}
              <path
                d="M 55,265 L 115,220 L 250,150 L 365,80 L 480,55"
                fill="none"
                stroke="rgba(255, 255, 255, 0.75)"
                strokeWidth="1.5"
                strokeDasharray="4,4"
              />
              {/* Flight Path 2: Southern Corridor (Zone D to Zone F Bypass) */}
              <path
                d="M 120,440 L 245,390 L 410,450 L 530,345 L 610,310"
                fill="none"
                stroke="rgba(255, 255, 255, 0.75)"
                strokeWidth="1.5"
                strokeDasharray="4,4"
              />
              {/* Flight Path 3: High Corridor to Zone E */}
              <path
                d="M 365,80 L 450,170 L 540,220"
                fill="none"
                stroke="rgba(255, 255, 255, 0.75)"
                strokeWidth="1.5"
                strokeDasharray="4,4"
              />

              {/* Waypoint Beacon at southern waypoint (x: 410, y: 450) */}
              <circle cx="410" cy="450" r="14" fill="#2563EB" opacity="0.9" />
              <circle cx="410" cy="450" r="22" fill="none" stroke="#60A5FA" strokeWidth="1.5" className="animate-ping" />
            </g>
          )}

          {/* LAYER: AIRBASES (when layerAirbases is checked) */}
          {layerAirbases && (
            <g className="pointer-events-auto">
              {AIRBASES.map((ab) => (
                <g
                  key={ab.id}
                  transform={`translate(${ab.x}, ${ab.y})`}
                  className="cursor-pointer hover:scale-110 transition-transform"
                  onClick={() => handleZoneClick(ab.zone)}
                >
                  <circle cx="0" cy="0" r="12" fill="#14264A" stroke="#FFFFFF" strokeWidth="2" filter="url(#aircraftShadow)" />
                  <Navigation className="w-4 h-4 text-white -translate-x-2 -translate-y-2" />
                  <rect
                    x="-45"
                    y="16"
                    width="90"
                    height="20"
                    rx="10"
                    fill="rgba(20, 38, 74, 0.88)"
                    stroke="#FFFFFF"
                    strokeWidth="1"
                  />
                  <text
                    x="0"
                    y="30"
                    textAnchor="middle"
                    fill="#FFFFFF"
                    fontSize="9"
                    fontWeight="bold"
                    fontFamily="sans-serif"
                  >
                    {ab.id} • {ab.status}
                  </text>
                </g>
              ))}
            </g>
          )}
        </svg>
      </div>

      {/* ========================================================= */}
      {/* FLOATING HUD CONTROLS (EXACTLY MATCHING IMAGE 2)          */}
      {/* ========================================================= */}

      {/* TOP-LEFT FLOATING PILL: Weather Risk Map */}
      <div className="absolute top-4 left-4 z-20 pointer-events-auto">
        <div className="clay-card !bg-white/95 !backdrop-blur-md px-4 py-2 rounded-2xl shadow-md border border-white/80 flex items-center gap-2.5">
          <span className="font-bold text-sm text-[#14264A] tracking-tight">
            Weather Risk Map
          </span>
          <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-50 text-[10px] font-bold text-emerald-600 border border-emerald-200/60">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            LIVE RADAR
          </span>
        </div>
      </div>

      {/* LEFT-SIDE VERTICAL PILL: Zoom in (+), Zoom out (−), Re-center */}
      <div className="absolute top-16 left-4 z-20 pointer-events-auto flex flex-col gap-1.5 mt-2">
        <div className="clay-card !bg-white/95 !backdrop-blur-md p-1.5 rounded-2xl shadow-md border border-white/80 flex flex-col items-center gap-1">
          <button
            onClick={handleZoomIn}
            className="w-8 h-8 rounded-xl flex items-center justify-center text-[#14264A] hover:bg-[#EAF2FC] hover:text-[#4285F4] transition active:scale-95 cursor-pointer"
            title="Zoom In (+)"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <div className="w-5 h-[1px] bg-slate-200/80" />
          <button
            onClick={handleZoomOut}
            className="w-8 h-8 rounded-xl flex items-center justify-center text-[#14264A] hover:bg-[#EAF2FC] hover:text-[#4285F4] transition active:scale-95 cursor-pointer"
            title="Zoom Out (−)"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <div className="w-5 h-[1px] bg-slate-200/80" />
          <button
            onClick={handleResetView}
            className="w-8 h-8 rounded-xl flex items-center justify-center text-[#14264A] hover:bg-[#EAF2FC] hover:text-[#4285F4] transition active:scale-95 cursor-pointer"
            title="Re-Center Map"
          >
            <Crosshair className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* TOP-RIGHT FLOATING LAYER-CONTROL PANEL + FULLSCREEN BUTTON */}
      <div className="absolute top-4 right-4 z-20 pointer-events-auto flex items-start gap-2">
        {/* Layer Checkboxes Box */}
        <div className="clay-card !bg-white/95 !backdrop-blur-md px-3.5 py-3 rounded-2xl shadow-md border border-white/80 flex flex-col gap-2 text-xs font-semibold text-[#14264A] min-w-[150px]">
          <label className="flex items-center gap-2 cursor-pointer hover:text-[#4285F4] transition">
            <input
              type="checkbox"
              checked={layerRadar}
              onChange={(e) => setLayerRadar(e.target.checked)}
              className="w-4 h-4 rounded text-[#4285F4] focus:ring-0 cursor-pointer"
            />
            <span>Weather Radar</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer hover:text-[#4285F4] transition">
            <input
              type="checkbox"
              checked={layerBoundaries}
              onChange={(e) => setLayerBoundaries(e.target.checked)}
              className="w-4 h-4 rounded text-[#4285F4] focus:ring-0 cursor-pointer"
            />
            <span>Zone Boundaries</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer hover:text-[#4285F4] transition">
            <input
              type="checkbox"
              checked={layerMissions}
              onChange={(e) => setLayerMissions(e.target.checked)}
              className="w-4 h-4 rounded text-[#4285F4] focus:ring-0 cursor-pointer"
            />
            <span>Active Missions</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer hover:text-[#4285F4] transition">
            <input
              type="checkbox"
              checked={layerAirbases}
              onChange={(e) => setLayerAirbases(e.target.checked)}
              className="w-4 h-4 rounded text-[#4285F4] focus:ring-0 cursor-pointer"
            />
            <span>Airbases</span>
          </label>
        </div>

        {/* Top-Right Fullscreen Expand Button */}
        <button
          onClick={() => setIsFullscreen(!isFullscreen)}
          className="clay-card !bg-white/95 !backdrop-blur-md p-2.5 rounded-2xl shadow-md border border-white/80 text-[#14264A] hover:text-[#4285F4] transition cursor-pointer"
          title={isFullscreen ? 'Exit Fullscreen' : 'Expand Tactical Theatre (Fullscreen)'}
        >
          {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
        </button>
      </div>

      {/* BOTTOM-LEFT FLOATING LEGEND: Weather Risk Level */}
      <div className="absolute bottom-4 left-4 z-20 pointer-events-auto">
        <div className="clay-card !bg-white/95 !backdrop-blur-md p-3.5 rounded-2xl shadow-md border border-white/80 space-y-2 text-xs text-[#14264A] font-semibold">
          <div className="font-bold text-[11px] text-[#607391] uppercase tracking-wider">
            Weather Risk Level
          </div>
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-[#F04452] shadow-sm flex items-center justify-center">
                <span className="w-1 h-1 rounded-full bg-white/70" />
              </span>
              <span>High Alert</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-[#FFC94A] shadow-sm flex items-center justify-center">
                <span className="w-1 h-1 rounded-full bg-white/70" />
              </span>
              <span>Medium Alert</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-[#35CF91] shadow-sm flex items-center justify-center">
                <span className="w-1 h-1 rounded-full bg-white/70" />
              </span>
              <span>Low Alert</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-[#6B8BA4] shadow-sm flex items-center justify-center">
                <span className="w-1 h-1 rounded-full bg-white/70" />
              </span>
              <span>No Alert</span>
            </div>
          </div>
        </div>
      </div>

      {/* BOTTOM-RIGHT FLOATING SCALE INDICATOR & EXPAND BUTTON */}
      <div className="absolute bottom-4 right-4 z-20 pointer-events-auto flex items-center gap-2">
        {/* Scale Bracket Card */}
        <div className="clay-card !bg-white/95 !backdrop-blur-md px-3.5 py-1.5 rounded-2xl shadow-md border border-white/80 flex flex-col items-center">
          <span className="text-[10px] font-mono font-bold text-[#14264A]">100 km</span>
          {/* Scale bracket representation */}
          <div className="w-16 h-1.5 border-b-2 border-l-2 border-r-2 border-[#14264A] mt-0.5" />
        </div>

        {/* Scale expand toggle */}
        <button
          onClick={() => setIsFullscreen(!isFullscreen)}
          className="clay-card !bg-white/95 !backdrop-blur-md p-2 rounded-2xl shadow-md border border-white/80 text-[#14264A] hover:text-[#4285F4] transition cursor-pointer"
          title="Toggle Fullscreen"
        >
          <Maximize2 className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* INTERACTIVE HOVER TOOLTIP */}
      {hoveredZone && tooltipPos && (
        <div
          className="absolute z-30 pointer-events-none transform -translate-x-1/2 -translate-y-full mb-3"
          style={{ left: `${tooltipPos.x}px`, top: `${tooltipPos.y}px` }}
        >
          <div className="clay-card !bg-[#14264A]/90 !text-white !backdrop-blur-md px-3 py-2 rounded-xl shadow-xl border border-white/30 text-xs">
            <div className="font-bold flex items-center gap-1.5">
              <span>{ZONE_CENTERS[hoveredZone]?.label || hoveredZone}</span>
              <span
                className={`px-1.5 py-0.5 rounded text-[9px] font-extrabold ${
                  getZoneRisk(hoveredZone) === 'HIGH'
                    ? 'bg-[#F04452] text-white'
                    : getZoneRisk(hoveredZone) === 'MEDIUM'
                    ? 'bg-[#FFC94A] text-slate-900'
                    : 'bg-[#35CF91] text-white'
                }`}
              >
                {getZoneRisk(hoveredZone)} RISK
              </span>
            </div>
            <p className="text-[10px] text-slate-300 mt-0.5">
              Click to view tactical conditions & missions
            </p>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* Standard In-Page Container */}
      <div className="w-full relative">{mapContent}</div>

      {/* FULLSCREEN THEATRE MODAL (when isFullscreen is true) */}
      {isFullscreen && (
        <div className="fixed inset-0 z-50 bg-[#0A162B]/85 backdrop-blur-xl p-6 flex flex-col justify-center items-center animate-fade-in">
          <div className="w-full max-w-6xl h-full flex flex-col">
            {/* Fullscreen Header */}
            <div className="flex items-center justify-between pb-3 text-white">
              <div className="flex items-center gap-3">
                <span className="font-extrabold text-lg tracking-wider text-white">
                  TACTICAL THEATRE MAP — AIR POWER OPS
                </span>
                <span className="px-2.5 py-1 rounded-full bg-blue-500/30 text-blue-300 text-xs font-mono font-bold border border-blue-400/40">
                  SECTOR A–G INTERACTIVE RADAR
                </span>
              </div>
              <button
                onClick={() => setIsFullscreen(false)}
                className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
                title="Close Fullscreen (Esc)"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Expanded Fullscreen Map */}
            <div className="flex-1 w-full flex items-center justify-center">
              {mapContent}
            </div>
          </div>
        </div>
      )}

      {/* TACTICAL ZONE DETAIL DRAWER / MODAL */}
      {modalZone && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="clay-card !bg-white/98 w-full max-w-lg rounded-3xl p-6 shadow-2xl border border-white/90 space-y-5 animate-scale-up">
            {/* Modal Header */}
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-extrabold text-[#14264A]">
                    {modalZone.zone_code.replace('_', ' ')}
                  </h3>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                      modalZone.risk_level === 'HIGH'
                        ? 'bg-[#FDE8E8] text-[#F04452] border border-[#F04452]/30'
                        : modalZone.risk_level === 'MEDIUM'
                        ? 'bg-[#FEF3C7] text-[#D97706] border border-[#FFC94A]/30'
                        : 'bg-[#DEF7EC] text-[#059669] border border-[#35CF91]/30'
                    }`}
                  >
                    {modalZone.risk_level} ALERT
                  </span>
                </div>
                <p className="text-xs text-[#607391] mt-0.5 font-medium">
                  {modalZone.zone_name || 'Operational Air Tactical Sector'}
                </p>
              </div>

              <button
                onClick={() => setModalZone(null)}
                className="p-1.5 rounded-xl hover:bg-slate-100 text-[#607391] hover:text-[#14264A] transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Current Weather METAR Overview */}
            <div className="clay-inset p-4 rounded-2xl space-y-3 bg-[#EAF2FC]/60">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {modalZone.condition.includes('Thunder') ? (
                    <CloudLightning className="w-6 h-6 text-[#F04452]" />
                  ) : modalZone.condition.includes('Rain') ? (
                    <CloudRain className="w-6 h-6 text-[#4285F4]" />
                  ) : modalZone.condition.includes('Sand') ? (
                    <Flame className="w-6 h-6 text-[#E06830]" />
                  ) : (
                    <Sun className="w-6 h-6 text-[#F4B740]" />
                  )}
                  <span className="font-extrabold text-base text-[#14264A]">
                    {modalZone.condition}
                  </span>
                </div>
                <span className="text-xs font-mono font-semibold text-[#607391]">
                  Updated: Live
                </span>
              </div>

              {/* Grid of Weather Metrics */}
              <div className="grid grid-cols-3 gap-3 pt-2 text-center border-t border-slate-200/60">
                <div className="p-2 rounded-xl bg-white/70 shadow-xs">
                  <span className="text-[10px] uppercase font-bold text-[#607391] block">
                    Temperature
                  </span>
                  <span className="text-sm font-extrabold text-[#14264A]">
                    {modalZone.temperature_c}°C
                  </span>
                </div>
                <div className="p-2 rounded-xl bg-white/70 shadow-xs">
                  <span className="text-[10px] uppercase font-bold text-[#607391] block">
                    Wind Speed
                  </span>
                  <span className="text-sm font-extrabold text-[#14264A] flex items-center justify-center gap-1">
                    <Wind className="w-3.5 h-3.5 text-[#4285F4]" />
                    {modalZone.wind_speed_kmh} km/h
                  </span>
                </div>
                <div className="p-2 rounded-xl bg-white/70 shadow-xs">
                  <span className="text-[10px] uppercase font-bold text-[#607391] block">
                    Visibility
                  </span>
                  <span
                    className={`text-sm font-extrabold ${
                      modalZone.visibility_km < 3 ? 'text-[#F04452]' : 'text-[#14264A]'
                    }`}
                  >
                    {modalZone.visibility_km} km
                  </span>
                </div>
              </div>
            </div>

            {/* Tactical Advisory & Impact */}
            <div className="space-y-2">
              <div className="text-xs font-bold text-[#14264A] flex items-center gap-1.5">
                <Navigation className="w-3.5 h-3.5 text-[#4285F4]" />
                <span>Operational Air Advisory</span>
              </div>
              <div className="p-3 rounded-2xl bg-white/80 border border-slate-200 text-xs text-[#14264A] font-medium leading-relaxed">
                {modalZone.flight_advisory ||
                  'Maintain standard instrument departure corridors. Continuous monitoring required.'}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between pt-2 gap-3">
              {onRunOptimization && (
                <button
                  onClick={() => {
                    setModalZone(null);
                    onRunOptimization();
                  }}
                  className="clay-btn-primary flex-1 py-2.5 px-4 text-xs font-bold flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Cpu className="w-4 h-4" />
                  Run OR-Tools Re-Optimization
                </button>
              )}

              <button
                onClick={() => setModalZone(null)}
                className="clay-btn py-2.5 px-5 text-xs font-bold text-[#14264A] cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

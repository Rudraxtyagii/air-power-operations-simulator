import React, { useState } from 'react';
import { Maximize2, Minimize2, Compass } from 'lucide-react';

interface TacticalMapProps {
  onSelectZone?: (zone: string) => void;
}

interface MapAsset {
  id: string;
  name: string;
  type: string;
  status: 'available' | 'in_mission' | 'maintenance' | 'alert';
  x: number; // percentage
  y: number; // percentage
  heading: number; // degrees
  speed: string;
  alt: string;
  mission: string;
  zone: string;
}

export const TacticalMap: React.FC<TacticalMapProps> = ({ onSelectZone }) => {
  const [selectedAsset, setSelectedAsset] = useState<MapAsset | null>(null);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [showRadarScan, setShowRadarScan] = useState<boolean>(true);

  const assets: MapAsset[] = [
    {
      id: 'A01',
      name: 'Falcon Alpha-1',
      type: 'Type-A',
      status: 'available',
      x: 24,
      y: 28,
      heading: 45,
      speed: '480 kts',
      alt: 'FL280',
      mission: 'Reconnaissance Alpha',
      zone: 'ZONE A',
    },
    {
      id: 'A06',
      name: 'Eagle Strike-6',
      type: 'Type-A',
      status: 'in_mission',
      x: 72,
      y: 72,
      heading: 135,
      speed: '510 kts',
      alt: 'FL310',
      mission: 'Strike Support',
      zone: 'ZONE D',
    },
    {
      id: 'A04',
      name: 'Vanguard Bravo-4',
      type: 'Type-B',
      status: 'in_mission',
      x: 28,
      y: 78,
      heading: 90,
      speed: '340 kts',
      alt: 'FL190',
      mission: 'Surveillance Bravo',
      zone: 'ZONE B',
    },
    {
      id: 'A07',
      name: 'Osprey Delta-7',
      type: 'Type-B',
      status: 'alert',
      x: 58,
      y: 35,
      heading: 260,
      speed: '0 kts',
      alt: 'GND',
      mission: 'Awaiting Re-plan',
      zone: 'ZONE C',
    },
  ];

  const getStatusColor = (status: MapAsset['status']) => {
    switch (status) {
      case 'available':
        return '#10b981'; // emerald
      case 'in_mission':
        return '#0284c7'; // blue
      case 'maintenance':
        return '#f59e0b'; // amber
      case 'alert':
        return '#ef4444'; // red
      default:
        return '#94a3b8';
    }
  };

  const handleZoneClick = (zone: string) => {
    if (onSelectZone) {
      onSelectZone(zone);
    }
  };

  return (
    <div
      className={`relative rounded-xl bg-[#080d19] border border-slate-800 overflow-hidden flex flex-col transition-all duration-300 ${
        isExpanded ? 'fixed inset-4 z-50 shadow-2xl' : 'h-[380px] w-full'
      }`}
    >
      {/* Map Header Bar */}
      <div className="absolute top-0 inset-x-0 h-12 bg-gradient-to-b from-[#080d19]/95 via-[#080d19]/80 to-transparent z-20 px-4 flex items-center justify-between pointer-events-none">
        <div className="flex items-center gap-2 pointer-events-auto">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span className="text-sm font-semibold tracking-wide text-slate-200">
            Live Operations Map
          </span>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800/80 text-sky-400 border border-slate-700">
            GRID-SEC-ALPHA
          </span>
        </div>

        <div className="flex items-center gap-3 pointer-events-auto">
          {/* Legend */}
          <div className="hidden sm:flex items-center gap-3 bg-slate-900/90 border border-slate-800/80 rounded-lg px-3 py-1 text-[11px] font-medium text-slate-300">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_6px_#10b981]"></span>
              Available
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-sky-500 shadow-[0_0_6px_#0284c7]"></span>
              In Mission
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-500 shadow-[0_0_6px_#f59e0b]"></span>
              Maintenance
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_6px_#ef4444]"></span>
              Alert
            </span>
          </div>

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1.5 rounded-lg bg-slate-900/90 hover:bg-slate-800 border border-slate-700 text-slate-300 transition"
            title={isExpanded ? 'Exit Fullscreen' : 'Expand Map'}
          >
            {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* SVG Canvas Tactical Visualization */}
      <div className="relative w-full h-full bg-[#050914] select-none flex-1 overflow-hidden">
        <svg
          viewBox="0 0 1000 600"
          className="w-full h-full object-cover"
          preserveAspectRatio="xMidYMid slice"
        >
          <defs>
            {/* Grid Pattern */}
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(30, 41, 59, 0.45)" strokeWidth="0.8" />
            </pattern>
            <pattern id="grid-major" width="200" height="200" patternUnits="userSpaceOnUse">
              <path d="M 200 0 L 0 0 0 200" fill="none" stroke="rgba(56, 189, 248, 0.08)" strokeWidth="1.2" />
            </pattern>

            {/* Glowing filter */}
            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>

            {/* Linear gradients for radar zones */}
            <radialGradient id="radarSweepGradient" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="rgba(56, 189, 248, 0.25)" />
              <stop offset="80%" stopColor="rgba(56, 189, 248, 0.03)" />
              <stop offset="100%" stopColor="transparent" />
            </radialGradient>
          </defs>

          {/* Grid Background */}
          <rect width="1000" height="600" fill="url(#grid)" />
          <rect width="1000" height="600" fill="url(#grid-major)" />

          {/* Terrain / Topography Vector Contours */}
          <g opacity="0.35">
            <path
              d="M 120 180 Q 220 110, 310 170 T 450 210 Q 520 280, 420 340 T 260 380 Q 140 330, 120 180 Z"
              fill="rgba(15, 23, 42, 0.8)"
              stroke="#1e293b"
              strokeWidth="1.5"
            />
            <path
              d="M 170 210 Q 240 160, 310 200 T 390 240 Q 420 290, 360 320 T 240 330 Q 180 300, 170 210 Z"
              fill="rgba(24, 34, 53, 0.6)"
              stroke="#334155"
              strokeWidth="1"
            />
            <path
              d="M 620 260 Q 750 180, 870 240 T 910 390 Q 820 480, 700 440 T 580 360 Q 590 280, 620 260 Z"
              fill="rgba(15, 23, 42, 0.8)"
              stroke="#1e293b"
              strokeWidth="1.5"
            />
            <path
              d="M 680 300 Q 770 230, 840 280 T 870 370 Q 790 420, 710 390 T 650 340 Z"
              fill="rgba(24, 34, 53, 0.6)"
              stroke="#334155"
              strokeWidth="1"
            />
          </g>

          {/* Concentric Range Rings */}
          <g stroke="rgba(56, 189, 248, 0.12)" strokeWidth="1" strokeDasharray="4 4" fill="none">
            <circle cx="500" cy="300" r="100" />
            <circle cx="500" cy="300" r="220" />
            <circle cx="500" cy="300" r="340" />
          </g>

          {/* Radar Sweep Arc */}
          {showRadarScan && (
            <g className="origin-center animate-radar-sweep" style={{ transformOrigin: '500px 300px' }}>
              <path
                d="M 500 300 L 840 300 A 340 340 0 0 0 740 60 Z"
                fill="url(#radarSweepGradient)"
              />
              <line
                x1="500"
                y1="300"
                x2="840"
                y2="300"
                stroke="#38bdf8"
                strokeWidth="1.5"
                opacity="0.7"
              />
            </g>
          )}

          {/* Airspace Zones Boundary & Labels */}
          {/* ZONE A */}
          <g className="cursor-pointer" onClick={() => handleZoneClick('Zone A')}>
            <rect
              x="80"
              y="60"
              width="360"
              height="220"
              rx="12"
              fill="rgba(14, 165, 233, 0.03)"
              stroke="rgba(14, 165, 233, 0.25)"
              strokeWidth="1"
              strokeDasharray="6 4"
            />
            <text x="100" y="90" fill="#38bdf8" fontSize="13" fontWeight="bold" letterSpacing="2">
              ZONE A
            </text>
            <circle cx="95" cy="86" r="3" fill="#38bdf8" />
          </g>

          {/* ZONE B */}
          <g className="cursor-pointer" onClick={() => handleZoneClick('Zone B')}>
            <rect
              x="100"
              y="320"
              width="380"
              height="240"
              rx="12"
              fill="rgba(14, 165, 233, 0.02)"
              stroke="rgba(14, 165, 233, 0.2)"
              strokeWidth="1"
              strokeDasharray="6 4"
            />
            <text x="120" y="350" fill="#38bdf8" fontSize="13" fontWeight="bold" letterSpacing="2">
              ZONE B
            </text>
            <circle cx="115" cy="346" r="3" fill="#38bdf8" />
          </g>

          {/* ZONE C */}
          <g className="cursor-pointer" onClick={() => handleZoneClick('Zone C')}>
            <rect
              x="540"
              y="60"
              width="400"
              height="240"
              rx="12"
              fill="rgba(14, 165, 233, 0.02)"
              stroke="rgba(14, 165, 233, 0.2)"
              strokeWidth="1"
              strokeDasharray="6 4"
            />
            <text x="560" y="90" fill="#38bdf8" fontSize="13" fontWeight="bold" letterSpacing="2">
              ZONE C
            </text>
            <circle cx="555" cy="86" r="3" fill="#38bdf8" />
          </g>

          {/* ZONE D */}
          <g className="cursor-pointer" onClick={() => handleZoneClick('Zone D')}>
            <rect
              x="520"
              y="320"
              width="420"
              height="240"
              rx="12"
              fill="rgba(14, 165, 233, 0.03)"
              stroke="rgba(14, 165, 233, 0.25)"
              strokeWidth="1"
              strokeDasharray="6 4"
            />
            <text x="540" y="350" fill="#38bdf8" fontSize="13" fontWeight="bold" letterSpacing="2">
              ZONE D
            </text>
            <circle cx="535" cy="346" r="3" fill="#38bdf8" />
          </g>

          {/* Flight Routes / Corridors */}
          <g strokeDasharray="5 5" fill="none">
            <path
              d="M 240 170 Q 380 120, 580 190 T 780 230"
              stroke="#0ea5e9"
              strokeWidth="1.5"
              opacity="0.6"
            />
            <path
              d="M 280 470 Q 480 520, 720 430"
              stroke="#10b981"
              strokeWidth="1.5"
              opacity="0.6"
            />
            <path
              d="M 280 200 L 720 430"
              stroke="#f59e0b"
              strokeWidth="1.2"
              opacity="0.4"
            />
          </g>

          {/* Waypoints */}
          <g fill="#38bdf8" opacity="0.8">
            <polygon points="380,116 384,124 376,124" />
            <polygon points="580,186 584,194 576,194" />
            <polygon points="480,516 484,524 476,524" />
            <text x="388" y="122" fill="#64748b" fontSize="9" fontFamily="monospace">
              WP-ALPHA
            </text>
            <text x="588" y="192" fill="#64748b" fontSize="9" fontFamily="monospace">
              WP-BRAVO
            </text>
            <text x="488" y="522" fill="#64748b" fontSize="9" fontFamily="monospace">
              WP-CHARLIE
            </text>
          </g>

          {/* Aircraft Nodes on SVG */}
          {assets.map((asset) => {
            const cx = (asset.x / 100) * 1000;
            const cy = (asset.y / 100) * 600;
            const color = getStatusColor(asset.status);
            const isSel = selectedAsset?.id === asset.id;

            return (
              <g
                key={asset.id}
                className="cursor-pointer transition-transform duration-200"
                onClick={() => setSelectedAsset(asset)}
              >
                <circle cx={cx} cy={cy} r={isSel ? 18 : 12} fill={color} opacity="0.2" className="animate-ping" />
                <circle
                  cx={cx}
                  cy={cy}
                  r={isSel ? 14 : 10}
                  fill="#090d16"
                  stroke={color}
                  strokeWidth="2"
                  filter="url(#glow)"
                />
                <g transform={`translate(${cx}, ${cy}) rotate(${asset.heading})`}>
                  <path
                    d="M 0 -7 L 4 5 L 0 3 L -4 5 Z"
                    fill={color}
                  />
                </g>
                <rect
                  x={cx + 12}
                  y={cy - 12}
                  width="44"
                  height="16"
                  rx="3"
                  fill="#090d16"
                  stroke={color}
                  strokeWidth="1"
                  opacity="0.95"
                />
                <text
                  x={cx + 34}
                  y={cy - 1}
                  fill="#f8fafc"
                  fontSize="10"
                  fontWeight="bold"
                  textAnchor="middle"
                  fontFamily="monospace"
                >
                  {asset.id}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Selected Asset Floating Telemetry Drawer */}
        {selectedAsset && (
          <div className="absolute bottom-3 left-3 bg-[#0d1322]/95 border border-sky-500/40 rounded-xl p-3 shadow-2xl backdrop-blur-md text-xs z-30 w-64 animate-in fade-in duration-200">
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <span
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: getStatusColor(selectedAsset.status) }}
                />
                <span className="font-bold text-slate-100 font-mono">{selectedAsset.id}</span>
                <span className="text-[10px] text-slate-400 font-medium">({selectedAsset.name})</span>
              </div>
              <button
                onClick={() => setSelectedAsset(null)}
                className="text-slate-400 hover:text-slate-200 text-xs px-1"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-y-1.5 gap-x-2 text-[11px]">
              <div>
                <span className="text-slate-400">Sector:</span>{' '}
                <span className="text-slate-200 font-semibold">{selectedAsset.zone}</span>
              </div>
              <div>
                <span className="text-slate-400">Heading:</span>{' '}
                <span className="text-slate-200 font-mono">{selectedAsset.heading}°</span>
              </div>
              <div>
                <span className="text-slate-400">Speed:</span>{' '}
                <span className="text-slate-200 font-mono">{selectedAsset.speed}</span>
              </div>
              <div>
                <span className="text-slate-400">Altitude:</span>{' '}
                <span className="text-slate-200 font-mono">{selectedAsset.alt}</span>
              </div>
            </div>

            <div className="mt-2 pt-2 border-t border-slate-800/80 text-[11px]">
              <span className="text-slate-400">Current Mission:</span>
              <p className="text-sky-300 font-medium truncate">{selectedAsset.mission}</p>
            </div>
          </div>
        )}

        {/* Radar scan toggle control */}
        <div className="absolute bottom-3 right-3 z-20 flex items-center gap-1.5 bg-slate-900/80 border border-slate-800 rounded-lg px-2.5 py-1 text-[11px] text-slate-300">
          <button
            onClick={() => setShowRadarScan(!showRadarScan)}
            className="hover:text-sky-300 flex items-center gap-1"
          >
            <Compass className="w-3.5 h-3.5 text-sky-400" />
            <span>Radar Sweep: {showRadarScan ? 'ACTIVE' : 'OFF'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

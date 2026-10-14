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
        return '#25C98A';
      case 'in_mission':
        return '#4285F4';
      case 'maintenance':
        return '#F4B740';
      case 'alert':
        return '#F04452';
      default:
        return '#607391';
    }
  };

  const handleZoneClick = (zone: string) => {
    if (onSelectZone) {
      onSelectZone(zone);
    }
  };

  return (
    <div
      className={`clay-card relative overflow-hidden flex flex-col transition-all duration-300 ${
        isExpanded ? 'fixed inset-4 z-50 shadow-2xl bg-[#EAF2FC]' : 'h-[380px] w-full'
      }`}
    >
      {/* Map Header Bar */}
      <div className="absolute top-0 inset-x-0 h-12 bg-gradient-to-b from-[#EAF2FC] via-[#EAF2FC]/80 to-transparent z-20 px-4 flex items-center justify-between pointer-events-none">
        <div className="flex items-center gap-2 pointer-events-auto">
          <div className="w-2.5 h-2.5 rounded-full bg-[#25C98A] animate-ping" />
          <span className="text-sm font-bold tracking-tight text-[#14264A]">
            Live Air Operations Tactical Grid
          </span>
          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-blue-100 text-[#4285F4] border border-blue-200">
            RADAR-SEC-ALPHA
          </span>
        </div>

        <div className="flex items-center gap-2 pointer-events-auto">
          {/* Legend */}
          <div className="hidden sm:flex items-center gap-3 bg-white/80 backdrop-blur-md border border-[#C2D5ED]/70 rounded-full px-3 py-1 text-[11px] font-bold text-[#14264A] shadow-xs">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#25C98A]"></span>
              Available
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#4285F4]"></span>
              In Mission
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#F4B740]"></span>
              Attention
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#F04452]"></span>
              Alert
            </span>
          </div>

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="clay-btn p-1.5 cursor-pointer text-[#14264A] hover:text-[#4285F4]"
            title={isExpanded ? 'Exit Fullscreen' : 'Expand Map'}
          >
            {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* SVG Canvas Tactical Visualization */}
      <div className="relative w-full h-full bg-gradient-to-br from-[#d8e7f7] via-[#cce0f5] to-[#bed7f0] select-none flex-1 overflow-hidden">
        <svg
          viewBox="0 0 1000 600"
          className="w-full h-full object-cover"
          preserveAspectRatio="xMidYMid slice"
        >
          <defs>
            {/* Grid Pattern */}
            <pattern id="clayGrid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(166, 188, 220, 0.45)" strokeWidth="0.8" />
            </pattern>
            <pattern id="clayGridMajor" width="200" height="200" patternUnits="userSpaceOnUse">
              <path d="M 200 0 L 0 0 0 200" fill="none" stroke="rgba(66, 133, 244, 0.18)" strokeWidth="1.2" />
            </pattern>

            {/* Linear gradients for radar zones */}
            <radialGradient id="clayRadarSweep" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="rgba(66, 133, 244, 0.28)" />
              <stop offset="80%" stopColor="rgba(66, 133, 244, 0.04)" />
              <stop offset="100%" stopColor="transparent" />
            </radialGradient>
          </defs>

          {/* Grid Background */}
          <rect width="1000" height="600" fill="url(#clayGrid)" />
          <rect width="1000" height="600" fill="url(#clayGridMajor)" />

          {/* Concentric Range Rings */}
          <g stroke="rgba(66, 133, 244, 0.2)" strokeWidth="1" strokeDasharray="4 4" fill="none">
            <circle cx="500" cy="300" r="100" />
            <circle cx="500" cy="300" r="220" />
            <circle cx="500" cy="300" r="340" />
          </g>

          {/* Radar Sweep Arc */}
          {showRadarScan && (
            <g className="origin-center animate-radar-sweep" style={{ transformOrigin: '500px 300px' }}>
              <path
                d="M 500 300 L 840 300 A 340 340 0 0 0 740 60 Z"
                fill="url(#clayRadarSweep)"
              />
              <line
                x1="500"
                y1="300"
                x2="840"
                y2="300"
                stroke="#4285F4"
                strokeWidth="1.5"
                opacity="0.8"
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
              rx="16"
              fill="rgba(37, 201, 138, 0.08)"
              stroke="#25C98A"
              strokeWidth="1.5"
              strokeDasharray="6 4"
            />
            <text x="100" y="90" fill="#065F46" fontSize="13" fontWeight="bold" letterSpacing="2">
              ZONE A (NORTHWEST)
            </text>
            <circle cx="95" cy="86" r="3" fill="#25C98A" />
          </g>

          {/* ZONE B */}
          <g className="cursor-pointer" onClick={() => handleZoneClick('Zone B')}>
            <rect
              x="100"
              y="320"
              width="380"
              height="240"
              rx="16"
              fill="rgba(240, 68, 82, 0.08)"
              stroke="#F04452"
              strokeWidth="1.5"
              strokeDasharray="6 4"
            />
            <text x="120" y="350" fill="#991B1B" fontSize="13" fontWeight="bold" letterSpacing="2">
              ZONE B (SOUTHWEST - WEATHER ALERT)
            </text>
            <circle cx="115" cy="346" r="3" fill="#F04452" />
          </g>

          {/* ZONE C */}
          <g className="cursor-pointer" onClick={() => handleZoneClick('Zone C')}>
            <rect
              x="540"
              y="60"
              width="400"
              height="240"
              rx="16"
              fill="rgba(244, 183, 64, 0.08)"
              stroke="#F4B740"
              strokeWidth="1.5"
              strokeDasharray="6 4"
            />
            <text x="560" y="90" fill="#92400E" fontSize="13" fontWeight="bold" letterSpacing="2">
              ZONE C (NORTHEAST)
            </text>
            <circle cx="555" cy="86" r="3" fill="#F4B740" />
          </g>

          {/* ZONE D */}
          <g className="cursor-pointer" onClick={() => handleZoneClick('Zone D')}>
            <rect
              x="520"
              y="320"
              width="420"
              height="240"
              rx="16"
              fill="rgba(66, 133, 244, 0.08)"
              stroke="#4285F4"
              strokeWidth="1.5"
              strokeDasharray="6 4"
            />
            <text x="540" y="350" fill="#1E40AF" fontSize="13" fontWeight="bold" letterSpacing="2">
              ZONE D (SOUTHEAST)
            </text>
            <circle cx="535" cy="346" r="3" fill="#4285F4" />
          </g>

          {/* Flight Routes */}
          <g strokeDasharray="5 5" fill="none">
            <path
              d="M 240 170 Q 380 120, 580 190 T 780 230"
              stroke="#4285F4"
              strokeWidth="2"
              opacity="0.7"
            />
            <path
              d="M 280 470 Q 480 520, 720 430"
              stroke="#25C98A"
              strokeWidth="2"
              opacity="0.7"
            />
            <path
              d="M 280 200 L 720 430"
              stroke="#F4B740"
              strokeWidth="1.5"
              opacity="0.5"
            />
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
                <circle cx={cx} cy={cy} r={isSel ? 20 : 14} fill={color} opacity="0.25" className="animate-ping" />
                <circle
                  cx={cx}
                  cy={cy}
                  r={isSel ? 14 : 10}
                  fill="#ffffff"
                  stroke={color}
                  strokeWidth="3"
                  className="shadow-sm"
                />
                <g transform={`translate(${cx}, ${cy}) rotate(${asset.heading})`}>
                  <path
                    d="M 0 -7 L 4 5 L 0 3 L -4 5 Z"
                    fill={color}
                  />
                </g>
                <rect
                  x={cx + 14}
                  y={cy - 12}
                  width="46"
                  height="18"
                  rx="6"
                  fill="#ffffff"
                  stroke={color}
                  strokeWidth="1.5"
                  className="shadow-xs"
                />
                <text
                  x={cx + 37}
                  y={cy + 1}
                  fill="#14264A"
                  fontSize="11"
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
          <div className="absolute bottom-3 left-3 clay-card p-4 shadow-xl backdrop-blur-md text-xs z-30 w-68 animate-in fade-in duration-200 bg-white/90">
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#C2D5ED]/70">
              <div className="flex items-center gap-2">
                <span
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: getStatusColor(selectedAsset.status) }}
                />
                <span className="font-extrabold text-[#14264A] font-mono">{selectedAsset.id}</span>
                <span className="text-[10px] text-[#607391] font-semibold">({selectedAsset.name})</span>
              </div>
              <button
                onClick={() => setSelectedAsset(null)}
                className="text-[#607391] hover:text-[#14264A] text-xs px-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-y-1.5 gap-x-2 text-[11px]">
              <div>
                <span className="text-[#607391]">Sector:</span>{' '}
                <span className="text-[#14264A] font-bold">{selectedAsset.zone}</span>
              </div>
              <div>
                <span className="text-[#607391]">Heading:</span>{' '}
                <span className="text-[#14264A] font-mono font-semibold">{selectedAsset.heading}°</span>
              </div>
              <div>
                <span className="text-[#607391]">Speed:</span>{' '}
                <span className="text-[#14264A] font-mono font-semibold">{selectedAsset.speed}</span>
              </div>
              <div>
                <span className="text-[#607391]">Altitude:</span>{' '}
                <span className="text-[#14264A] font-mono font-semibold">{selectedAsset.alt}</span>
              </div>
            </div>

            <div className="mt-2 pt-2 border-t border-[#C2D5ED]/70 text-[11px]">
              <span className="text-[#607391]">Assigned Mission:</span>
              <p className="text-[#4285F4] font-bold truncate">{selectedAsset.mission}</p>
            </div>
          </div>
        )}

        {/* Radar scan toggle control */}
        <div className="absolute bottom-3 right-3 z-20 flex items-center gap-1.5 bg-white/85 border border-[#C2D5ED]/70 rounded-full px-3 py-1 text-[11px] text-[#14264A] shadow-xs">
          <button
            onClick={() => setShowRadarScan(!showRadarScan)}
            className="hover:text-[#4285F4] flex items-center gap-1.5 font-semibold cursor-pointer"
          >
            <Compass className="w-3.5 h-3.5 text-[#4285F4]" />
            <span>Radar Sweep: {showRadarScan ? 'ACTIVE' : 'OFF'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

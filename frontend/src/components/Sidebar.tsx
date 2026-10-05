import React from 'react';
import { 
  LayoutDashboard, 
  Crosshair, 
  Plane, 
  Cpu, 
  Activity, 
  BarChart3, 
  FileText, 
  Settings,
  Radio
} from 'lucide-react';

export type NavItem = 
  | 'dashboard' 
  | 'missions' 
  | 'resources' 
  | 'optimization' 
  | 'simulation' 
  | 'analytics' 
  | 'reports' 
  | 'settings';

interface SidebarProps {
  activeTab: NavItem;
  setActiveTab: (tab: NavItem) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'missions', label: 'Missions', icon: Crosshair },
    { id: 'resources', label: 'Resources', icon: Plane },
    { id: 'optimization', label: 'Optimization', icon: Cpu },
    { id: 'simulation', label: 'Simulation', icon: Activity },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'reports', label: 'Reports', icon: FileText },
    { id: 'settings', label: 'Settings', icon: Settings },
  ] as const;

  return (
    <aside className="w-64 bg-[#090d16] border-r border-slate-800/80 flex flex-col shrink-0 select-none">
      {/* Brand & Emblem */}
      <div className="h-16 flex items-center px-5 gap-3 border-b border-slate-800/80 bg-[#070b13]">
        <div className="relative flex items-center justify-center w-10 h-10 rounded-lg bg-sky-950/60 border border-sky-500/30 text-sky-400 shadow-inner">
          <svg className="w-6 h-6 stroke-current fill-none" viewBox="0 0 24 24" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 2L2 9l10 3 10-3-10-3z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M2 14l10 3 10-3" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 18l8 3 8-3" />
          </svg>
          <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-sky-500"></span>
          </span>
        </div>
        <div>
          <div className="text-base font-bold tracking-wider text-slate-100 flex items-center gap-1.5">
            AIR OPS
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-sky-900/60 text-sky-300 border border-sky-500/30">
              v1.0
            </span>
          </div>
          <p className="text-[11px] text-slate-400 tracking-tight font-medium">Tactical Command C2</p>
        </div>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto">
        <div className="px-3 pb-2 text-[10px] font-semibold tracking-wider text-slate-500 uppercase">
          Command Modules
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as NavItem)}
              className={`w-full flex items-center gap-3.5 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 text-left ${
                isActive
                  ? 'bg-sky-600/20 text-sky-400 border border-sky-500/40 shadow-sm shadow-sky-950'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-sky-400' : 'text-slate-400'}`} />
              <span className="flex-1">{item.label}</span>
              {isActive && (
                <span className="w-1.5 h-1.5 rounded-full bg-sky-400 shadow-[0_0_8px_#38bdf8]"></span>
              )}
            </button>
          );
        })}
      </nav>

      {/* System Status Footer */}
      <div className="p-3 border-t border-slate-800/80 bg-[#070b13]/80">
        <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800">
          <div className="flex items-center justify-between text-xs font-medium text-slate-300 mb-1">
            <span className="flex items-center gap-1.5">
              <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
              Defense Grid C2
            </span>
            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-emerald-950 text-emerald-400 border border-emerald-800/60">
              SECURE
            </span>
          </div>
          <div className="text-[11px] text-slate-400 flex items-center justify-between">
            <span>Synthetic Engine:</span>
            <span className="text-slate-200 font-mono">READY</span>
          </div>
        </div>
      </div>
    </aside>
  );
};

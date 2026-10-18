import React from 'react';
import {
  LayoutDashboard,
  Crosshair,
  Plane,
  Cpu,
  Activity,
  CloudRain,
  BarChart3,
  FileText,
  Settings,
  Radio,
} from 'lucide-react';

export type NavItem =
  | 'dashboard'
  | 'missions'
  | 'resources'
  | 'optimization'
  | 'simulation'
  | 'weather'
  | 'analytics'
  | 'reports'
  | 'settings';

interface SidebarProps {
  activeTab: NavItem;
  setActiveTab: (tab: NavItem) => void;
  mobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  mobileOpen = false,
  onCloseMobile,
}) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'missions', label: 'Missions', icon: Crosshair },
    { id: 'resources', label: 'Resources', icon: Plane },
    { id: 'optimization', label: 'Optimization', icon: Cpu },
    { id: 'simulation', label: 'Simulation', icon: Activity },
    { id: 'weather', label: 'Weather', icon: CloudRain },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'reports', label: 'Reports', icon: FileText },
    { id: 'settings', label: 'Settings', icon: Settings },
  ] as const;

  const handleNavClick = (tabId: NavItem) => {
    setActiveTab(tabId);
    if (onCloseMobile) {
      onCloseMobile();
    }
  };

  return (
    <aside
      className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-[#EAF2FC] border-r border-[#C2D5ED]/70 flex flex-col shrink-0 select-none shadow-2xl transition-transform duration-300 ease-in-out
        lg:static lg:translate-x-0 lg:shadow-xs
        ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}
    >
      {/* Brand & Wing Emblem (Mockup Matching) */}
      <div className="h-16 flex items-center justify-between px-5 border-b border-[#C2D5ED]/60 bg-[#EAF2FC]">
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-2xl bg-white shadow-sm border border-white text-[#4285F4]">
            <svg className="w-6 h-6 stroke-current fill-none" viewBox="0 0 24 24" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 2L2 9l10 3 10-3-10-3z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M2 14l10 3 10-3" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 18l8 3 8-3" />
            </svg>
            <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#4285F4] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#4285F4]"></span>
            </span>
          </div>
          <div>
            <div className="text-base font-extrabold tracking-wider text-[#14264A] flex items-center gap-1.5">
              AIR OPS
              <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded-full bg-blue-100 text-[#4285F4] border border-blue-200">
                v2.0
              </span>
            </div>
            <p className="text-[11px] text-[#607391] tracking-tight font-medium">Tactical Command C2</p>
          </div>
        </div>

        {onCloseMobile && (
          <button
            onClick={onCloseMobile}
            className="lg:hidden p-1.5 rounded-xl text-[#607391] hover:text-[#14264A] hover:bg-white/60 transition cursor-pointer"
            title="Close menu"
          >
            ✕
          </button>
        )}
      </div>

      {/* Navigation Items (Clay Pill Button Matching Mockup) */}
      <nav className="flex-1 px-4 py-4 space-y-1.5 overflow-y-auto">
        <div className="px-3 pb-1.5 text-[10px] font-bold tracking-wider text-[#607391] uppercase">
          Command Modules
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id as NavItem)}
              className={`w-full flex items-center gap-3.5 px-4 py-2.5 rounded-2xl text-sm font-semibold transition-all duration-200 text-left cursor-pointer ${
                isActive
                  ? 'clay-btn-primary shadow-md'
                  : 'text-[#607391] hover:text-[#14264A] hover:bg-white/60'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-[#607391]'}`} />
              <span className="flex-1">{item.label}</span>
              {isActive && (
                <span className="w-1.5 h-1.5 rounded-full bg-white shadow-xs"></span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Grid Status Box */}
      <div className="p-4 border-t border-[#C2D5ED]/60 bg-[#EAF2FC]">
        <div className="p-3 rounded-2xl clay-inset bg-white/40">
          <div className="flex items-center justify-between text-xs font-bold text-[#14264A] mb-1">
            <span className="flex items-center gap-1.5">
              <Radio className="w-3.5 h-3.5 text-[#25C98A] animate-pulse" />
              Dynamic Grid
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#DEF7EC] text-[#059669] border border-[#25C98A]/30 font-bold">
              ONLINE
            </span>
          </div>
          <div className="text-[11px] text-[#607391] flex items-center justify-between font-medium">
            <span>CP-SAT Optimizer:</span>
            <span className="text-[#14264A] font-mono font-bold">READY</span>
          </div>
        </div>
      </div>
    </aside>
  );
};

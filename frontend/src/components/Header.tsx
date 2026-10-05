import React, { useState, useEffect } from 'react';
import { Bell, Clock, Play, AlertTriangle } from 'lucide-react';

interface HeaderProps {
  onOpenOptimization?: () => void;
  onOpenDisruption?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenOptimization, onOpenDisruption }) => {
  const [timeStr, setTimeStr] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(
        now.toLocaleTimeString('en-US', {
          hour12: false,
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="h-16 border-b border-slate-800/80 bg-[#090d16] px-6 flex items-center justify-between z-10 shrink-0">
      {/* Title & Subtitle */}
      <div>
        <h1 className="text-lg font-bold tracking-tight text-white flex items-center gap-2">
          AI-Powered Air Operations & Resource Optimisation
          <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-blue-900/50 text-blue-300 border border-blue-500/30">
            SIH26250
          </span>
        </h1>
        <p className="text-xs text-slate-400 font-normal">
          Decision Support System for Mission Planning, Resource Allocation and Dynamic Re-planning
        </p>
      </div>

      {/* Action Controls & User Identity */}
      <div className="flex items-center gap-4">
        {/* Zulu / UTC Simulation Clock */}
        <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900/90 border border-slate-800 text-slate-300 text-xs font-mono">
          <Clock className="w-3.5 h-3.5 text-sky-400" />
          <span className="text-slate-400">SIM-ZULU:</span>
          <span className="text-sky-300 font-semibold">{timeStr || '10:46:00'}Z</span>
        </div>

        {/* Tactical Shortcut Buttons */}
        {onOpenOptimization && (
          <button
            onClick={onOpenOptimization}
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/40 text-emerald-300 text-xs font-semibold transition"
          >
            <Play className="w-3 h-3 fill-current" />
            Generate Plan
          </button>
        )}

        {onOpenDisruption && (
          <button
            onClick={onOpenDisruption}
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-600/20 hover:bg-red-600/30 border border-red-500/40 text-red-300 text-xs font-semibold transition"
          >
            <AlertTriangle className="w-3 h-3" />
            Simulate Disruption
          </button>
        )}

        {/* Notifications Alert Bell */}
        <div className="relative">
          <button className="p-2 rounded-lg bg-slate-900/80 hover:bg-slate-800 border border-slate-800 text-slate-300 transition relative">
            <Bell className="w-4 h-4" />
            <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white shadow-[0_0_8px_#ef4444]">
              4
            </span>
          </button>
        </div>

        {/* Command Officer Badge */}
        <div className="flex items-center gap-2.5 pl-2 border-l border-slate-800">
          <div className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center font-bold text-xs text-white shadow-md shadow-blue-900/40 border border-blue-400/30">
            CO
          </div>
          <div className="hidden md:block text-left">
            <div className="text-xs font-semibold text-slate-200 leading-tight">Command Officer</div>
            <div className="text-[11px] text-slate-400 font-mono">Admin</div>
          </div>
        </div>
      </div>
    </header>
  );
};

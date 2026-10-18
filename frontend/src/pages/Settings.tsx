import React from 'react';
import { Sliders, Server, Volume2 } from 'lucide-react';
import { soundSynthesizer } from '../utils/audioAlert';

export const Settings: React.FC = () => {
  return (
    <div className="space-y-5 lg:space-y-6 text-[#14264A] min-w-0">
      <div className="pb-2 border-b border-[#C2D5ED]/60">
        <div className="flex items-center gap-2.5">
          <h2 className="text-2xl font-extrabold text-[#14264A] tracking-tight">System & Engine Settings</h2>
          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-blue-100 text-[#4285F4] border border-blue-200">
            CONFIGURATION
          </span>
        </div>
        <p className="text-xs text-[#607391] font-medium">
          Synthetic simulator preferences, Google OR-Tools CP-SAT solver parameters, and audio telemetry
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
        {/* Solver Configuration */}
        <div className="clay-card p-5 space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-[#C2D5ED]/70 font-bold text-sm text-[#14264A]">
            <Sliders className="w-4 h-4 text-[#4285F4]" />
            CP-SAT Solver Hyperparameters
          </div>

          <div className="space-y-3">
            <div>
              <label className="text-[#607391] font-bold block mb-1">Max Solver Time Limit (seconds)</label>
              <input
                type="number"
                defaultValue={5}
                className="w-full px-3 py-2 bg-white border border-[#C2D5ED] rounded-xl text-[#14264A] font-semibold"
              />
            </div>
            <div>
              <label className="text-[#607391] font-bold block mb-1">Number of Worker Threads</label>
              <input
                type="number"
                defaultValue={4}
                className="w-full px-3 py-2 bg-white border border-[#C2D5ED] rounded-xl text-[#14264A] font-semibold"
              />
            </div>
            <div>
              <label className="text-[#607391] font-bold block mb-1">Search Strategy</label>
              <select className="w-full px-3 py-2 bg-white border border-[#C2D5ED] rounded-xl text-[#14264A] font-semibold">
                <option>PORTFOLIO_SEARCH (Default)</option>
                <option>FIXED_SEARCH</option>
                <option>LP_SEARCH</option>
              </select>
            </div>
          </div>
        </div>

        {/* Backend & Environment */}
        <div className="clay-card p-5 space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-[#C2D5ED]/70 font-bold text-sm text-[#14264A]">
            <Server className="w-4 h-4 text-[#25C98A]" />
            Backend & Synthetic Data Safety
          </div>

          <div className="space-y-3 text-[#14264A]">
            <div className="p-3 rounded-2xl clay-inset space-y-0.5">
              <span className="text-[#607391] font-semibold text-[11px]">Target Problem Statement:</span>
              <p className="font-extrabold text-[#14264A]">SIH26250 - Air Power: Dynamic Air Operations</p>
            </div>
            <div className="p-3 rounded-2xl clay-inset space-y-0.5">
              <span className="text-[#607391] font-semibold text-[11px]">Academic Safety Isolation:</span>
              <p className="text-[#059669] font-extrabold">100% Synthetic Fictional Data (Zones A-I, Base-1-4)</p>
            </div>
            <div className="p-3 rounded-2xl clay-inset space-y-0.5">
              <span className="text-[#607391] font-semibold text-[11px]">Backend API Host:</span>
              <p className="font-mono text-[#4285F4] font-bold">http://localhost:8000/api</p>
            </div>
          </div>

          <div className="pt-2">
            <button
              onClick={() => soundSynthesizer.testSound()}
              className="clay-btn w-full py-2.5 text-xs font-bold text-[#4285F4] flex items-center justify-center gap-2 cursor-pointer"
            >
              <Volume2 className="w-4 h-4" />
              Test Audible Warning Chime (Web Audio API)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

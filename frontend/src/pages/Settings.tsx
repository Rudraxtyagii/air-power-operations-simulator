import React from 'react';
import { Sliders, Server } from 'lucide-react';

export const Settings: React.FC = () => {
  return (
    <div className="p-6 space-y-6">
      <div className="pb-2 border-b border-slate-800">
        <h2 className="text-xl font-bold text-white tracking-tight">System & Engine Settings</h2>
        <p className="text-xs text-slate-400">
          Synthetic simulator preferences, CP-SAT solver hyperparameters, and API integration
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
        {/* Solver Configuration */}
        <div className="p-5 rounded-xl bg-[#090e1a] border border-slate-800 space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-800 font-bold text-white">
            <Sliders className="w-4 h-4 text-sky-400" />
            CP-SAT Solver Hyperparameters
          </div>

          <div className="space-y-3">
            <div>
              <label className="text-slate-400 block mb-1">Max Solver Time Limit (seconds)</label>
              <input
                type="number"
                defaultValue={10}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-200"
              />
            </div>
            <div>
              <label className="text-slate-400 block mb-1">Number of Worker Threads</label>
              <input
                type="number"
                defaultValue={8}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-200"
              />
            </div>
            <div>
              <label className="text-slate-400 block mb-1">Search Strategy</label>
              <select className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-200">
                <option>PORTFOLIO_SEARCH (Default)</option>
                <option>FIXED_SEARCH</option>
                <option>LP_SEARCH</option>
              </select>
            </div>
          </div>
        </div>

        {/* Backend & Environment */}
        <div className="p-5 rounded-xl bg-[#090e1a] border border-slate-800 space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-800 font-bold text-white">
            <Server className="w-4 h-4 text-emerald-400" />
            Backend & Synthetic Data Safety
          </div>

          <div className="space-y-3 text-slate-300">
            <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800 space-y-1">
              <span className="text-slate-400">Target Problem Statement:</span>
              <p className="font-bold text-white">SIH26250 - Air Power</p>
            </div>
            <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800 space-y-1">
              <span className="text-slate-400">Data Isolation:</span>
              <p className="text-emerald-400 font-semibold">100% Synthetic & Non-Military</p>
            </div>
            <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800 space-y-1">
              <span className="text-slate-400">Backend API Endpoint:</span>
              <p className="font-mono text-sky-400">http://localhost:8000/api</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

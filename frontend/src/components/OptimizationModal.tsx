import React, { useState } from 'react';
import { Cpu, CheckCircle2, Play, RefreshCw, X } from 'lucide-react';

interface OptimizationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete?: () => void;
}

export const OptimizationModal: React.FC<OptimizationModalProps> = ({
  isOpen,
  onClose,
  onComplete,
}) => {
  const [isSolving, setIsSolving] = useState(false);
  const [solved, setSolved] = useState(false);

  if (!isOpen) return null;

  const handleRun = () => {
    setIsSolving(true);
    setSolved(false);
    setTimeout(() => {
      setIsSolving(false);
      setSolved(true);
      if (onComplete) onComplete();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#0b101d] border border-sky-500/40 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-[#080d18]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-sky-500/20 text-sky-400">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">OR-Tools CP-SAT Optimizer</h3>
              <p className="text-xs text-slate-400">Synthetic Constraint Optimization Engine</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 text-xs text-slate-300 space-y-2">
            <div className="flex justify-between">
              <span className="text-slate-400">Active Solver:</span>
              <span className="font-mono text-sky-300">Google OR-Tools CP-SAT (v9.11)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Constraint Parameters:</span>
              <span className="font-mono text-emerald-300">Fuel, Turnaround, Flight Crew, Weather</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Target Objective:</span>
              <span className="font-mono text-slate-200">Minimize Mission Latency & Conflict</span>
            </div>
          </div>

          {isSolving && (
            <div className="p-4 rounded-xl bg-sky-950/30 border border-sky-500/30 text-center space-y-3">
              <RefreshCw className="w-6 h-6 text-sky-400 animate-spin mx-auto" />
              <div className="text-xs font-semibold text-sky-300">
                Exploring integer feasible space & branching...
              </div>
              <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div className="h-full bg-sky-500 animate-pulse w-3/4 rounded-full" />
              </div>
            </div>
          )}

          {solved && (
            <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-500/30 flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              <div className="text-xs space-y-1">
                <div className="font-bold text-emerald-300">OPTIMAL SCHEDULE ACHIEVED</div>
                <div className="text-slate-300">
                  8 Missions assigned across 6 Available Assets with 0 constraint conflicts.
                </div>
                <div className="text-emerald-400/90 font-mono text-[11px] pt-1">
                  Solver Latency: 0.24s | Objective Value: 94.8%
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-800 bg-[#080d18] flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition"
          >
            Close
          </button>
          <button
            disabled={isSolving}
            onClick={handleRun}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white text-xs font-semibold shadow-md shadow-sky-900/40 transition"
          >
            {isSolving ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Solving...
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current" />
                Run Optimization
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

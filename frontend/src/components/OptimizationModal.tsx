import React, { useState } from 'react';
import { Cpu, CheckCircle2, Play, RefreshCw, X } from 'lucide-react';
import { api } from '../services/api';
import { soundSynthesizer } from '../utils/audioAlert';
import type { OptimizationResult } from '../types';

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
  const [solvedResult, setSolvedResult] = useState<OptimizationResult | null>(null);

  if (!isOpen) return null;

  const handleRun = async () => {
    setIsSolving(true);
    setSolvedResult(null);
    try {
      const res = await api.solveOptimization({
        consider_weather: true,
        apply_to_database: true,
      });
      setSolvedResult(res);
      soundSynthesizer.playNoticeChime();
      if (onComplete) onComplete();
    } catch (err) {
      console.error('Modal solver failed:', err);
    } finally {
      setIsSolving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="clay-card bg-[#EAF2FC] w-full max-w-lg shadow-2xl overflow-hidden animate-fade-in p-6 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#C2D5ED]/70">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-blue-100 text-[#4285F4] flex items-center justify-center shadow-inner">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#14264A]">Google OR-Tools CP-SAT Optimizer</h3>
              <p className="text-xs text-[#607391] font-medium">Synthetic Air Operations Constraint Solver</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="clay-btn p-1.5 text-[#607391] hover:text-[#14264A] cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="space-y-3.5 text-xs">
          <div className="clay-inset p-3.5 bg-white/50 text-[#14264A] space-y-2">
            <div className="flex justify-between">
              <span className="text-[#607391] font-semibold">Active Solver:</span>
              <span className="font-mono font-bold text-[#4285F4]">Google OR-Tools CP-SAT (v9.15)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#607391] font-semibold">Active Constraints:</span>
              <span className="font-mono font-bold text-[#059669]">No-Overlap, Time Windows, Adverse Weather Buffers</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#607391] font-semibold">Target Objective:</span>
              <span className="font-mono font-bold text-[#14264A]">Maximize High-Priority Coverage & Minimize Delay</span>
            </div>
          </div>

          {isSolving && (
            <div className="p-4 rounded-2xl bg-[#E1EFFE] border border-blue-200 text-center space-y-2">
              <RefreshCw className="w-6 h-6 text-[#4285F4] animate-spin mx-auto" />
              <div className="text-xs font-bold text-[#1D4ED8]">
                Branching integer feasible space & resolving weather buffers...
              </div>
            </div>
          )}

          {solvedResult && (
            <div className="p-4 rounded-2xl bg-[#DEF7EC] border border-[#25C98A]/30 flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-[#25C98A] shrink-0 mt-0.5" />
              <div className="text-xs space-y-1">
                <div className="font-extrabold text-[#065F46]">
                  STATUS: {solvedResult.status} (Score: {solvedResult.optimization_score}%)
                </div>
                <div className="text-[#14264A] font-medium">
                  {solvedResult.metrics.scheduled_missions} missions assigned with zero conflict overlaps.
                </div>
                <div className="text-[#059669] font-mono text-[11px] font-bold pt-1">
                  Solve Latency: {solvedResult.solve_time_ms} ms | Delays Avoided:{' '}
                  {solvedResult.metrics.baseline_comparison.delays_avoided_min} min
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#C2D5ED]/70">
          <button
            onClick={onClose}
            className="clay-btn px-4 py-2 text-xs font-semibold cursor-pointer"
          >
            Close
          </button>
          <button
            disabled={isSolving}
            onClick={handleRun}
            className="clay-btn-primary flex items-center gap-2 px-4 py-2 text-xs cursor-pointer shadow-md"
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

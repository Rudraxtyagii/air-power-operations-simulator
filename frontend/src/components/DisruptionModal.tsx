import React, { useState } from 'react';
import { AlertTriangle, Zap, CloudRain, Clock, ShieldX, X, Check } from 'lucide-react';

interface DisruptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTriggerDisruption?: (type: string, details: string) => void;
}

export const DisruptionModal: React.FC<DisruptionModalProps> = ({
  isOpen,
  onClose,
  onTriggerDisruption,
}) => {
  const [selectedType, setSelectedType] = useState<string>('asset_fail');
  const [applied, setApplied] = useState(false);

  if (!isOpen) return null;

  const disruptionOptions = [
    {
      id: 'asset_fail',
      label: 'Resource Unavailable',
      description: 'Aircraft A02 reports hydraulic telemetry failure and grounded at Base-2.',
      icon: ShieldX,
      color: 'border-red-500/50 bg-red-950/20 text-red-400',
    },
    {
      id: 'weather',
      label: 'Severe Weather Surge',
      description: 'Thunderstorm squall line shifts into Sector Bravo; visibility reduced to zero.',
      icon: CloudRain,
      color: 'border-purple-500/50 bg-purple-950/20 text-purple-400',
    },
    {
      id: 'priority_escalation',
      label: 'Mission Priority Escalated',
      description: 'Mission M007 (Strike Support) upgraded to Critical Priority Alpha override.',
      icon: Zap,
      color: 'border-amber-500/50 bg-amber-950/20 text-amber-400',
    },
    {
      id: 'turnaround_delay',
      label: 'Resource Delayed / Refuel Bottleneck',
      description: 'Fuel tanker depot outage at Base-1 induces +45 min turnaround delay.',
      icon: Clock,
      color: 'border-cyan-500/50 bg-cyan-950/20 text-cyan-400',
    },
  ];

  const handleApply = () => {
    const selected = disruptionOptions.find((o) => o.id === selectedType);
    if (selected && onTriggerDisruption) {
      onTriggerDisruption(selected.label, selected.description);
    }
    setApplied(true);
    setTimeout(() => {
      setApplied(false);
      onClose();
    }, 900);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#0b101d] border border-red-500/40 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-[#080d18]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-red-500/20 text-red-400">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Inject Operational Disruption</h3>
              <p className="text-xs text-slate-400">Dynamic Re-planning & Robustness Test</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Options List */}
        <div className="p-6 space-y-3">
          <div className="text-xs font-medium text-slate-400 mb-1">
            Select synthetic disruption inject:
          </div>

          {disruptionOptions.map((opt) => {
            const Icon = opt.icon;
            const isSelected = selectedType === opt.id;
            return (
              <div
                key={opt.id}
                onClick={() => setSelectedType(opt.id)}
                className={`p-3.5 rounded-xl border transition cursor-pointer flex items-start gap-3.5 ${
                  isSelected
                    ? `${opt.color} ring-1 ring-white/20`
                    : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 text-slate-300'
                }`}
              >
                <div className="p-2 rounded-lg bg-slate-800/80 shrink-0 mt-0.5">
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1">
                  <div className="text-sm font-semibold text-white flex items-center justify-between">
                    <span>{opt.label}</span>
                    {isSelected && <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/10 text-white">SELECTED</span>}
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">{opt.description}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-800 bg-[#080d18] flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition"
          >
            Cancel
          </button>
          <button
            onClick={handleApply}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-white text-xs font-semibold shadow-md transition ${
              applied
                ? 'bg-emerald-600'
                : 'bg-red-600 hover:bg-red-500 shadow-red-900/40'
            }`}
          >
            {applied ? (
              <>
                <Check className="w-4 h-4" />
                Inject Injected!
              </>
            ) : (
              <>
                <AlertTriangle className="w-4 h-4" />
                Trigger Disruption Now
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

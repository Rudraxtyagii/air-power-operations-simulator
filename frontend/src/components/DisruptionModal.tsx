import React, { useState } from 'react';
import { AlertTriangle, Zap, CloudRain, Clock, ShieldX, X, Check } from 'lucide-react';
import { soundSynthesizer } from '../utils/audioAlert';

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
      color: 'bg-[#FDE8E8] border-[#F04452]/40 text-[#991B1B]',
    },
    {
      id: 'weather',
      label: 'Severe Weather Surge',
      description: 'Thunderstorm convective front expands into Zone B and Zone F; runway holds ordered.',
      icon: CloudRain,
      color: 'bg-[#E1EFFE] border-[#4285F4]/40 text-[#1D4ED8]',
    },
    {
      id: 'priority_escalation',
      label: 'Mission Priority Escalated',
      description: 'Sortie M007 (Strike Support) upgraded to Critical Priority Alpha override.',
      icon: Zap,
      color: 'bg-[#FEF3C7] border-[#F4B740]/40 text-[#92400E]',
    },
    {
      id: 'turnaround_delay',
      label: 'Depot Turnaround Delay',
      description: 'Fuel hydrant outage at Base-1 induces +45 min refuel bottleneck.',
      icon: Clock,
      color: 'bg-[#DEF7EC] border-[#25C98A]/40 text-[#065F46]',
    },
  ];

  const handleApply = () => {
    const selected = disruptionOptions.find((o) => o.id === selectedType);
    if (selected && onTriggerDisruption) {
      onTriggerDisruption(selected.label, selected.description);
      soundSynthesizer.playHighAlertSound(selected.id);
    }
    setApplied(true);
    setTimeout(() => {
      setApplied(false);
      onClose();
    }, 900);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="clay-card bg-[#EAF2FC] w-full max-w-lg shadow-2xl overflow-hidden animate-fade-in p-6 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#C2D5ED]/70">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-red-100 text-[#F04452] flex items-center justify-center shadow-inner">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#14264A]">Inject Operational Disruption</h3>
              <p className="text-xs text-[#607391] font-medium">Dynamic Re-planning & Robustness Test</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="clay-btn p-1.5 text-[#607391] hover:text-[#14264A] cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Options List */}
        <div className="space-y-2.5 text-xs">
          <div className="text-xs font-bold text-[#607391]">
            Select synthetic disruption scenario:
          </div>

          {disruptionOptions.map((opt) => {
            const Icon = opt.icon;
            const isSelected = selectedType === opt.id;
            return (
              <div
                key={opt.id}
                onClick={() => setSelectedType(opt.id)}
                className={`p-3.5 rounded-2xl border transition cursor-pointer flex items-start gap-3.5 shadow-xs ${
                  isSelected
                    ? `${opt.color} ring-2 ring-[#4285F4]/40`
                    : 'bg-white/60 border-[#C2D5ED]/60 hover:bg-white text-[#14264A]'
                }`}
              >
                <div className="p-2 rounded-xl bg-white/80 shrink-0 mt-0.5 shadow-xs">
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1">
                  <div className="text-sm font-bold text-[#14264A] flex items-center justify-between">
                    <span>{opt.label}</span>
                    {isSelected && (
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white text-[#4285F4] border border-[#4285F4]/30 font-bold">
                        SELECTED
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-[#607391] mt-0.5">{opt.description}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#C2D5ED]/70">
          <button
            onClick={onClose}
            className="clay-btn px-4 py-2 text-xs font-semibold cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleApply}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-full transition cursor-pointer shadow-md text-white ${
              applied
                ? 'bg-[#25C98A]'
                : 'bg-[#F04452] hover:bg-red-600'
            }`}
          >
            {applied ? (
              <>
                <Check className="w-4 h-4" />
                Disruption Injected!
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

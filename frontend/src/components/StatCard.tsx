import React from 'react';
import type { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  secondaryValue?: string;
  icon: LucideIcon;
  iconBgColor?: string;
  iconColor?: string;
  badge?: string;
  badgeColor?: string;
  trend?: string;
  onClick?: () => void;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  secondaryValue,
  icon: Icon,
  iconBgColor = 'bg-sky-500/10',
  iconColor = 'text-sky-400',
  badge,
  badgeColor = 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  trend,
  onClick,
}) => {
  return (
    <div
      onClick={onClick}
      className={`relative overflow-hidden rounded-xl bg-[#0d131f] border border-slate-800 p-4 shadow-sm hover:border-slate-700 transition ${
        onClick ? 'cursor-pointer hover:bg-slate-900/60' : ''
      }`}
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-medium text-slate-400">{title}</span>
        <div className={`p-2.5 rounded-lg ${iconBgColor} ${iconColor}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>

      <div className="flex items-baseline gap-2">
        <span className="text-2xl font-bold tracking-tight text-white font-mono">{value}</span>
        {secondaryValue && (
          <span className="text-sm font-semibold text-slate-400 font-mono">{secondaryValue}</span>
        )}
      </div>

      {(badge || trend) && (
        <div className="mt-2.5 flex items-center justify-between text-xs">
          {badge && (
            <span className={`px-2 py-0.5 rounded text-[11px] font-medium border ${badgeColor}`}>
              {badge}
            </span>
          )}
          {trend && <span className="text-slate-400 text-[11px]">{trend}</span>}
        </div>
      )}

      {/* Subtle bottom accent line */}
      <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-slate-700/50 to-transparent" />
    </div>
  );
};

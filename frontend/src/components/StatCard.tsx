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
  iconBgColor = 'bg-white/80',
  iconColor = 'text-[#4285F4]',
  badge,
  badgeColor = 'bg-[#DEF7EC] text-[#059669] border-[#25C98A]/30',
  trend,
  onClick,
}) => {
  return (
    <div
      onClick={onClick}
      className={`clay-card p-4 relative overflow-hidden transition-all duration-200 ${
        onClick ? 'cursor-pointer hover:-translate-y-1 hover:shadow-lg' : ''
      }`}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-bold text-[#607391] uppercase tracking-wide">{title}</span>
        <div className={`w-9 h-9 rounded-2xl flex items-center justify-center shadow-inner ${iconBgColor} ${iconColor}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>

      <div className="flex items-baseline gap-2">
        <span className="text-2xl font-black tracking-tight text-[#14264A] font-mono">{value}</span>
        {secondaryValue && (
          <span className="text-sm font-bold text-[#607391] font-mono">{secondaryValue}</span>
        )}
      </div>

      {(badge || trend) && (
        <div className="mt-2.5 flex items-center justify-between text-xs">
          {badge && (
            <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border shadow-xs ${badgeColor}`}>
              {badge}
            </span>
          )}
          {trend && <span className="text-[#607391] text-[11px] font-medium">{trend}</span>}
        </div>
      )}
    </div>
  );
};

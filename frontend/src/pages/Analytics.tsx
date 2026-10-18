import React, { useState } from 'react';
import {
  Calendar,
  Download,
  Award,
} from 'lucide-react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { COMPLETION_RATE_TREND, UTILIZATION_TREND, DELAY_TREND } from '../data/mockData';

export const Analytics: React.FC = () => {
  const [timeRange, setTimeRange] = useState('Last 7 Days');

  return (
    <div className="space-y-5 lg:space-y-6 text-[#14264A] min-w-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#C2D5ED]/60">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-2xl font-extrabold text-[#14264A] tracking-tight">Performance Analytics</h2>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-blue-100 text-[#4285F4] border border-blue-200">
              SIMULATION METRICS
            </span>
          </div>
          <p className="text-xs text-[#607391] font-medium">
            Compare mathematical optimization solver metrics vs unoptimized baseline operations
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 clay-inset px-3.5 py-1.5 text-xs text-[#14264A] bg-white/60">
            <Calendar className="w-3.5 h-3.5 text-[#4285F4]" />
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="bg-transparent border-none text-[#14264A] font-bold focus:outline-none cursor-pointer text-xs"
            >
              <option value="Last 7 Days">Last 7 Days</option>
              <option value="Last 14 Days">Last 14 Days</option>
              <option value="Last 30 Days">Last 30 Days</option>
            </select>
          </div>

          <button
            onClick={() => alert('Exporting Analytics CSV Report...')}
            className="clay-btn flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-[#14264A] hover:text-[#4285F4] cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            Export Data
          </button>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart 1: Mission Completion Rate */}
        <div className="clay-card p-5 flex flex-col h-[360px]">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-bold text-[#14264A] uppercase tracking-wide">
              Mission Completion Rate
            </h3>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-[#DEF7EC] text-[#059669] border border-[#25C98A]/30">
              +18.4% GAIN
            </span>
          </div>

          <div className="flex-1 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={COMPLETION_RATE_TREND} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(166, 188, 220, 0.45)" />
                <XAxis dataKey="day" stroke="#607391" fontSize={11} />
                <YAxis stroke="#607391" fontSize={11} domain={[0, 100]} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    borderColor: '#C2D5ED',
                    borderRadius: '12px',
                    fontSize: '11px',
                    color: '#14264A',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} iconSize={8} />
                <Line
                  type="monotone"
                  dataKey="Baseline"
                  stroke="#94A3B8"
                  strokeWidth={2}
                  dot={{ r: 3, fill: '#94A3B8' }}
                />
                <Line
                  type="monotone"
                  dataKey="Optimized"
                  stroke="#25C98A"
                  strokeWidth={3}
                  dot={{ r: 4, fill: '#25C98A' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Resource Utilization */}
        <div className="clay-card p-5 flex flex-col h-[360px]">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-bold text-[#14264A] uppercase tracking-wide">
              Resource Utilization
            </h3>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-blue-100 text-[#1D4ED8] border border-blue-200">
              AVG 91%
            </span>
          </div>

          <div className="flex-1 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={UTILIZATION_TREND} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(166, 188, 220, 0.45)" />
                <XAxis dataKey="day" stroke="#607391" fontSize={11} />
                <YAxis stroke="#607391" fontSize={11} domain={[0, 100]} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    borderColor: '#C2D5ED',
                    borderRadius: '12px',
                    fontSize: '11px',
                    color: '#14264A',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} iconSize={8} />
                <Bar dataKey="Baseline" fill="#93C5FD" radius={[6, 6, 0, 0]} />
                <Bar dataKey="Optimized" fill="#4285F4" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 3: Average Delay (minutes) */}
        <div className="clay-card p-5 flex flex-col h-[360px]">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-bold text-[#14264A] uppercase tracking-wide">
              Average Delay (minutes)
            </h3>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-[#DEF7EC] text-[#059669] border border-[#25C98A]/30">
              -64% REDUCTION
            </span>
          </div>

          <div className="flex-1 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={DELAY_TREND} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(166, 188, 220, 0.45)" />
                <XAxis dataKey="day" stroke="#607391" fontSize={11} />
                <YAxis stroke="#607391" fontSize={11} domain={[0, 50]} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    borderColor: '#C2D5ED',
                    borderRadius: '12px',
                    fontSize: '11px',
                    color: '#14264A',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} iconSize={8} />
                <Bar dataKey="Baseline" fill="#FCA5A5" radius={[6, 6, 0, 0]} />
                <Bar dataKey="Optimized" fill="#25C98A" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Comparative Evaluation Insights */}
      <div className="clay-card p-5">
        <h3 className="text-xs font-bold text-[#607391] uppercase tracking-wider mb-2 flex items-center gap-2">
          <Award className="w-4 h-4 text-[#4285F4]" />
          Mathematical Optimization Efficiency Summary
        </h3>
        <p className="text-xs text-[#14264A] leading-relaxed">
          Through Google OR-Tools CP-SAT integer programming and turnaround minimization, total fleet
          airspace conflicts decreased from an average of <span className="text-[#F04452] font-bold font-mono">27.6 minutes</span> to{' '}
          <span className="text-[#059669] font-bold font-mono">11.4 minutes</span> across simulated high-tempo flight windows.
          All synthetic operations maintained 100% adherence to flight envelope safety and maintenance depot inspection turnarounds.
        </p>
      </div>
    </div>
  );
};

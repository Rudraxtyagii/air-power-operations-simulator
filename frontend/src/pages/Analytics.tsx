import React, { useState } from 'react';
import { 
  Calendar, 
  Download
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
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Performance Analytics</h2>
          <p className="text-xs text-slate-400">
            Compare optimization results and analyze mission performance
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-[#090e1a] border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-300">
            <Calendar className="w-3.5 h-3.5 text-sky-400" />
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="bg-transparent border-none text-slate-200 focus:outline-none cursor-pointer"
            >
              <option value="Last 7 Days" className="bg-slate-900">
                Last 7 Days
              </option>
              <option value="Last 14 Days" className="bg-slate-900">
                Last 14 Days
              </option>
              <option value="Last 30 Days" className="bg-slate-900">
                Last 30 Days
              </option>
            </select>
          </div>

          <button
            onClick={() => alert('Exporting Analytics PDF/CSV Report...')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition"
          >
            <Download className="w-3.5 h-3.5" />
            Export Data
          </button>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart 1: Mission Completion Rate */}
        <div className="rounded-xl bg-[#090e1a] border border-slate-800 p-4 flex flex-col h-[340px]">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-bold text-slate-200">Mission Completion Rate</h3>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-400 border border-emerald-800">
              +18.4% GAIN
            </span>
          </div>

          <div className="flex-1 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={COMPLETION_RATE_TREND} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="day" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} domain={[0, 100]} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '8px',
                    fontSize: '11px',
                    color: '#f8fafc',
                  }}
                />
                <Legend
                  wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }}
                  iconSize={8}
                />
                <Line
                  type="monotone"
                  dataKey="Baseline"
                  stroke="#38bdf8"
                  strokeWidth={2}
                  dot={{ r: 3, fill: '#38bdf8' }}
                />
                <Line
                  type="monotone"
                  dataKey="Optimized"
                  stroke="#10b981"
                  strokeWidth={2.5}
                  dot={{ r: 4, fill: '#10b981' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Resource Utilization */}
        <div className="rounded-xl bg-[#090e1a] border border-slate-800 p-4 flex flex-col h-[340px]">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-bold text-slate-200">Resource Utilization</h3>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-sky-950/80 text-sky-400 border border-sky-800">
              AVG 91%
            </span>
          </div>

          <div className="flex-1 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={UTILIZATION_TREND} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="day" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} domain={[0, 100]} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '8px',
                    fontSize: '11px',
                    color: '#f8fafc',
                  }}
                />
                <Legend
                  wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }}
                  iconSize={8}
                />
                <Bar dataKey="Baseline" fill="#0284c7" radius={[2, 2, 0, 0]} />
                <Bar dataKey="Optimized" fill="#0d9488" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 3: Average Delay (minutes) */}
        <div className="rounded-xl bg-[#090e1a] border border-slate-800 p-4 flex flex-col h-[340px]">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-bold text-slate-200">Average Delay (minutes)</h3>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-red-950/80 text-red-400 border border-red-800">
              -64% REDUCTION
            </span>
          </div>

          <div className="flex-1 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={DELAY_TREND} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="day" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} domain={[0, 50]} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '8px',
                    fontSize: '11px',
                    color: '#f8fafc',
                  }}
                />
                <Legend
                  wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }}
                  iconSize={8}
                />
                <Bar dataKey="Baseline" fill="#ef4444" radius={[2, 2, 0, 0]} />
                <Bar dataKey="Optimized" fill="#f59e0b" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Comparative Evaluation Insights */}
      <div className="p-4 rounded-xl bg-[#090e1a] border border-slate-800">
        <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
          Mathematical Optimization Efficiency Summary
        </h3>
        <p className="text-xs text-slate-400 leading-relaxed">
          Through OR-Tools integer programming and continuous turnaround minimization, total fleet
          deadhead and queue congestion decreased from an average of <span className="text-red-400 font-semibold font-mono">27.6 minutes</span> to{' '}
          <span className="text-emerald-400 font-semibold font-mono">11.4 minutes</span> across simulated high-tempo flight windows.
          All synthetic operations maintained 100% adherence to crew mandatory rest cycles and maintenance inspection safety envelopes.
        </p>
      </div>
    </div>
  );
};

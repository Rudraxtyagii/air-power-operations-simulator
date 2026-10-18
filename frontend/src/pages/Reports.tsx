import React from 'react';
import { FileText, Download } from 'lucide-react';

export const Reports: React.FC = () => {
  const reports = [
    {
      id: 'REP-001',
      title: 'Daily Sortie Optimization Audit (Google OR-Tools CP-SAT)',
      date: 'Today, 14:30 UTC',
      type: 'PDF Summary',
      size: '2.4 MB',
      status: 'Ready',
    },
    {
      id: 'REP-002',
      title: 'Weather Hazard Dynamic Resiliency Benchmark (Zones B & F)',
      date: 'Today, 12:00 UTC',
      type: 'CSV Dataset',
      size: '14.8 MB',
      status: 'Ready',
    },
    {
      id: 'REP-003',
      title: 'Fleet Depot Turnaround & Resource Allocation Proof',
      date: '12 Oct 2026',
      type: 'Executive Report',
      size: '4.1 MB',
      status: 'Ready',
    },
  ];

  return (
    <div className="space-y-5 lg:space-y-6 text-[#14264A] min-w-0">
      <div className="pb-2 border-b border-[#C2D5ED]/60">
        <div className="flex items-center gap-2.5">
          <h2 className="text-2xl font-extrabold text-[#14264A] tracking-tight">Mission & Audit Reports</h2>
          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-blue-100 text-[#4285F4] border border-blue-200">
            AUDIT TRAIL
          </span>
        </div>
        <p className="text-xs text-[#607391] font-medium">
          Generated executive logs, mathematical solver proofs, and synthetic flight data
        </p>
      </div>

      <div className="space-y-3">
        {reports.map((rep) => (
          <div
            key={rep.id}
            className="clay-card p-4.5 flex items-center justify-between text-xs hover:shadow-md transition"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-2xl bg-blue-100 text-[#4285F4] flex items-center justify-center shadow-inner">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <div className="font-extrabold text-sm text-[#14264A]">{rep.title}</div>
                <div className="text-[11px] text-[#607391] font-mono font-medium">
                  {rep.id} • {rep.type} • {rep.size} • {rep.date}
                </div>
              </div>
            </div>

            <button
              onClick={() => alert(`Downloading ${rep.title}`)}
              className="clay-btn flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-[#4285F4] hover:text-blue-700 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              Download
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

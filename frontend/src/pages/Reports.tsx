import React from 'react';
import { FileText, Download } from 'lucide-react';

export const Reports: React.FC = () => {
  const reports = [
    {
      id: 'REP-001',
      title: 'Daily Sortie Optimization Audit',
      date: 'Today, 08:00',
      type: 'PDF Summary',
      size: '2.4 MB',
      status: 'Ready',
    },
    {
      id: 'REP-002',
      title: 'Disruption Scenario Resiliency Benchmark',
      date: 'Yesterday, 18:30',
      type: 'CSV Dataset',
      size: '14.8 MB',
      status: 'Ready',
    },
    {
      id: 'REP-003',
      title: 'Fleet Maintenance Turnaround Predictions (Scikit-Learn)',
      date: '04 Oct 2026',
      type: 'Executive Report',
      size: '4.1 MB',
      status: 'Ready',
    },
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="pb-2 border-b border-slate-800">
        <h2 className="text-xl font-bold text-white tracking-tight">Mission & Audit Reports</h2>
        <p className="text-xs text-slate-400">
          Generated executive logs, mathematical solver proofs, and synthetic flight data
        </p>
      </div>

      <div className="space-y-3">
        {reports.map((rep) => (
          <div
            key={rep.id}
            className="p-4 rounded-xl bg-[#090e1a] border border-slate-800 flex items-center justify-between text-xs"
          >
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-sky-500/10 text-sky-400">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <div className="font-bold text-white">{rep.title}</div>
                <div className="text-[11px] text-slate-400 font-mono">
                  {rep.id} • {rep.type} • {rep.size} • {rep.date}
                </div>
              </div>
            </div>

            <button
              onClick={() => alert(`Downloading ${rep.title}`)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition font-medium"
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

import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Plus, 
  Eye, 
  Edit2, 
  Trash2, 
  Crosshair,
  X,
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import { api } from '../services/api';
import type { Mission, Priority, MissionStatus } from '../types';

export const Missions: React.FC = () => {
  const [missions, setMissions] = useState<Mission[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<string>('All');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingMission, setEditingMission] = useState<Mission | null>(null);
  const [viewMission, setViewMission] = useState<Mission | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Form state for adding mission
  const [newMission, setNewMission] = useState({
    name: '',
    priority: 'High' as Priority,
    location: 'Zone A',
    timeWindow: '16:00 - 18:00',
    requiredResources: '1 Type-A',
  });

  const loadMissions = async () => {
    setIsLoading(true);
    try {
      const data = await api.getMissions({
        search: searchTerm,
        priority: priorityFilter,
        status: statusFilter,
      });
      setMissions(data);
      setErrorMsg(null);
    } catch (err: any) {
      console.warn('Load missions error:', err);
      setErrorMsg('Failed to connect to backend missions ledger. Running in safe mode.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      loadMissions();
    }, 200);
    return () => clearTimeout(timer);
  }, [searchTerm, priorityFilter, statusFilter]);

  const getPriorityBadge = (priority: Priority) => {
    switch (priority) {
      case 'High':
        return 'bg-red-500/20 text-red-400 border-red-500/40';
      case 'Medium':
        return 'bg-amber-500/20 text-amber-400 border-amber-500/40';
      case 'Low':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/40';
    }
  };

  const getStatusBadge = (status: MissionStatus) => {
    switch (status) {
      case 'Scheduled':
        return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40';
      case 'Pending':
        return 'bg-amber-500/20 text-amber-400 border-amber-500/40';
      case 'Ongoing':
        return 'bg-sky-500/20 text-sky-400 border-sky-500/40';
      case 'Completed':
        return 'bg-teal-500/20 text-teal-400 border-teal-500/40';
      case 'Delayed':
        return 'bg-red-500/20 text-red-400 border-red-500/40';
    }
  };

  const handleAddMission = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const created = await api.createMission({
        name: newMission.name || 'Synthetic Sortie',
        priority: newMission.priority,
        location: newMission.location,
        timeWindow: newMission.timeWindow,
        requiredResources: newMission.requiredResources,
      });
      setMissions([created, ...missions]);
      setIsAddModalOpen(false);
      setNewMission({
        name: '',
        priority: 'High',
        location: 'Zone A',
        timeWindow: '16:00 - 18:00',
        requiredResources: '1 Type-A',
      });
    } catch (err: any) {
      alert(`Error creating mission: ${err.message}`);
    }
  };

  const handleUpdateMission = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMission) return;
    try {
      if (editingMission.dbId) {
        const statusMap: Record<string, any> = {
          Ongoing: 'ACTIVE',
          Scheduled: 'SCHEDULED',
          Completed: 'COMPLETED',
          Pending: 'PENDING',
          Delayed: 'DELAYED',
        };
        const priorityMap: Record<string, any> = {
          High: 'HIGH',
          Medium: 'MEDIUM',
          Low: 'LOW',
        };
        const updated = await api.updateMission(editingMission.dbId, {
          name: editingMission.name,
          priority: priorityMap[editingMission.priority] || 'MEDIUM',
          status: statusMap[editingMission.status] || 'PENDING',
        });
        setMissions(missions.map((m) => (m.id === editingMission.id ? updated : m)));
      } else {
        setMissions(missions.map((m) => (m.id === editingMission.id ? editingMission : m)));
      }
      setEditingMission(null);
    } catch (err: any) {
      alert(`Error updating mission: ${err.message}`);
    }
  };

  const handleDelete = async (mission: Mission) => {
    if (!confirm(`Are you sure you want to delete mission ${mission.id} (${mission.name})?`)) return;
    try {
      if (mission.dbId) {
        await api.deleteMission(mission.dbId);
      }
      setMissions(missions.filter((m) => m.id !== mission.id));
    } catch (err: any) {
      console.warn('Delete error, removing from view:', err);
      setMissions(missions.filter((m) => m.id !== mission.id));
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-xl font-bold text-white tracking-tight">Mission Management</h2>
            {isLoading && <RefreshCw className="w-4 h-4 text-sky-400 animate-spin" />}
          </div>
          <p className="text-xs text-slate-400">
            Create, view and manage missions with priority, time window and resource requirements (PostgreSQL Connected)
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md shadow-blue-900/40 transition"
        >
          <Plus className="w-4 h-4" />
          Add Mission
        </button>
      </div>

      {errorMsg && (
        <div className="p-3 rounded-lg bg-amber-950/40 border border-amber-600/40 text-amber-200 text-xs flex items-center justify-between font-mono">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-400" />
            <span>{errorMsg}</span>
          </div>
          <button onClick={() => setErrorMsg(null)} className="text-amber-400 hover:text-white">✕</button>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3 bg-[#0d131f] p-3.5 rounded-xl border border-slate-800">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search missions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-900/90 border border-slate-700/80 rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-sky-500 transition"
          />
        </div>

        {/* Priority Filter */}
        <select
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value)}
          className="px-3 py-2 bg-slate-900/90 border border-slate-700/80 rounded-lg text-xs text-slate-300 focus:outline-none focus:border-sky-500"
        >
          <option value="All">All Priorities</option>
          <option value="High">High</option>
          <option value="Medium">Medium</option>
          <option value="Low">Low</option>
        </select>

        {/* Status Filter */}
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 bg-slate-900/90 border border-slate-700/80 rounded-lg text-xs text-slate-300 focus:outline-none focus:border-sky-500"
        >
          <option value="All">All Status</option>
          <option value="Scheduled">Scheduled</option>
          <option value="Pending">Pending</option>
          <option value="Ongoing">Ongoing</option>
          <option value="Completed">Completed</option>
          <option value="Delayed">Delayed</option>
        </select>
      </div>

      {/* Missions Table */}
      <div className="rounded-xl bg-[#090e1a] border border-slate-800 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#0e1626] border-b border-slate-800 text-slate-400 font-semibold tracking-wider uppercase text-[11px]">
              <tr>
                <th className="py-3.5 px-4">ID</th>
                <th className="py-3.5 px-4">Mission Name</th>
                <th className="py-3.5 px-4">Priority</th>
                <th className="py-3.5 px-4">Location</th>
                <th className="py-3.5 px-4">Time Window</th>
                <th className="py-3.5 px-4">Required Resources</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-medium">
              {missions.length === 0 && !isLoading ? (
                <tr>
                  <td colSpan={8} className="py-10 text-center text-slate-500">
                    No missions found matching query.
                  </td>
                </tr>
              ) : (
                missions.map((mission) => (
                  <tr
                    key={mission.id}
                    className="hover:bg-slate-900/50 transition-colors text-slate-300"
                  >
                    <td className="py-3.5 px-4 font-mono text-sky-400 font-bold">{mission.id}</td>
                    <td className="py-3.5 px-4 font-semibold text-white">{mission.name}</td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`px-2.5 py-1 rounded text-[11px] font-semibold border ${getPriorityBadge(
                          mission.priority
                        )}`}
                      >
                        {mission.priority}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-300 font-medium">{mission.location}</td>
                    <td className="py-3.5 px-4 font-mono text-slate-400">{mission.timeWindow}</td>
                    <td className="py-3.5 px-4 text-slate-300">{mission.requiredResources}</td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`px-2.5 py-1 rounded text-[11px] font-semibold border ${getStatusBadge(
                          mission.status
                        )}`}
                      >
                        {mission.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2 text-slate-400">
                        <button
                          onClick={() => setViewMission(mission)}
                          className="p-1 hover:text-sky-400 transition"
                          title="View details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setEditingMission(mission)}
                          className="p-1 hover:text-amber-400 transition"
                          title="Edit mission"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(mission)}
                          className="p-1 hover:text-red-400 transition"
                          title="Delete mission"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Add Mission */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0d1322] border border-slate-700 rounded-xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white">Create Synthetic Mission (PostgreSQL)</h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleAddMission} className="space-y-4 mt-4 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Mission Callout Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Surveillance Echo"
                  value={newMission.name}
                  onChange={(e) => setNewMission({ ...newMission, name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Priority</label>
                  <select
                    value={newMission.priority}
                    onChange={(e) =>
                      setNewMission({ ...newMission, priority: e.target.value as Priority })
                    }
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-200"
                  >
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Target Sector</label>
                  <select
                    value={newMission.location}
                    onChange={(e) => setNewMission({ ...newMission, location: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-200"
                  >
                    <option value="Zone A">Zone A</option>
                    <option value="Zone B">Zone B</option>
                    <option value="Zone C">Zone C</option>
                    <option value="Zone D">Zone D</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Time Window</label>
                  <input
                    type="text"
                    value={newMission.timeWindow}
                    onChange={(e) => setNewMission({ ...newMission, timeWindow: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-200"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Resource Requirement</label>
                  <input
                    type="text"
                    value={newMission.requiredResources}
                    onChange={(e) =>
                      setNewMission({ ...newMission, requiredResources: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-200"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 rounded-lg text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 rounded-lg text-white font-semibold"
                >
                  Confirm & Schedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Edit Mission */}
      {editingMission && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0d1322] border border-slate-700 rounded-xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white">Edit Mission {editingMission.id}</h3>
              <button
                onClick={() => setEditingMission(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleUpdateMission} className="space-y-4 mt-4 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Mission Name</label>
                <input
                  type="text"
                  required
                  value={editingMission.name}
                  onChange={(e) => setEditingMission({ ...editingMission, name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Priority</label>
                  <select
                    value={editingMission.priority}
                    onChange={(e) =>
                      setEditingMission({ ...editingMission, priority: e.target.value as Priority })
                    }
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-200"
                  >
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Status</label>
                  <select
                    value={editingMission.status}
                    onChange={(e) =>
                      setEditingMission({ ...editingMission, status: e.target.value as MissionStatus })
                    }
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-200"
                  >
                    <option value="Scheduled">Scheduled</option>
                    <option value="Ongoing">Ongoing</option>
                    <option value="Pending">Pending</option>
                    <option value="Completed">Completed</option>
                    <option value="Delayed">Delayed</option>
                  </select>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingMission(null)}
                  className="px-4 py-2 bg-slate-800 rounded-lg text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-600 rounded-lg text-white font-semibold"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: View Mission Details */}
      {viewMission && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0d1322] border border-sky-500/40 rounded-xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Crosshair className="w-5 h-5 text-sky-400" />
                <h3 className="text-base font-bold text-white">Mission {viewMission.id}</h3>
              </div>
              <button
                onClick={() => setViewMission(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-3 mt-4 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-800">
                <span className="text-slate-400">Mission Name:</span>
                <span className="font-semibold text-white">{viewMission.name}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800">
                <span className="text-slate-400">Priority:</span>
                <span className="font-semibold text-white">{viewMission.priority}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800">
                <span className="text-slate-400">Airspace Sector:</span>
                <span className="font-semibold text-white">{viewMission.location}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800">
                <span className="text-slate-400">Allocated Time Window:</span>
                <span className="font-mono text-sky-400">{viewMission.timeWindow}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800">
                <span className="text-slate-400">Required Fleet Assets:</span>
                <span className="font-semibold text-white">{viewMission.requiredResources}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-400">Current Dispatch Status:</span>
                <span className="font-semibold text-emerald-400">{viewMission.status}</span>
              </div>
            </div>
            <div className="mt-5 pt-3 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => setViewMission(null)}
                className="px-4 py-2 bg-slate-800 rounded-lg text-slate-300 text-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

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
  AlertCircle,
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
        return 'bg-[#FDE8E8] text-[#F04452] border-[#F04452]/30';
      case 'Medium':
        return 'bg-[#FEF3C7] text-[#D97706] border-[#F4B740]/30';
      case 'Low':
        return 'bg-[#DEF7EC] text-[#059669] border-[#25C98A]/30';
    }
  };

  const getStatusBadge = (status: MissionStatus) => {
    switch (status) {
      case 'Scheduled':
        return 'bg-[#E1EFFE] text-[#1D4ED8] border-[#4285F4]/30';
      case 'Pending':
        return 'bg-[#FEF3C7] text-[#D97706] border-[#F4B740]/30';
      case 'Ongoing':
        return 'bg-[#DEF7EC] text-[#059669] border-[#25C98A]/30';
      case 'Completed':
        return 'bg-[#DEF7EC] text-[#059669] border-[#25C98A]/30';
      case 'Delayed':
        return 'bg-[#FDE8E8] text-[#F04452] border-[#F04452]/30';
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
    <div className="space-y-5 lg:space-y-6 text-[#14264A] min-w-0">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#C2D5ED]/60">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-2xl font-extrabold text-[#14264A] tracking-tight">Mission Management</h2>
            {isLoading && <RefreshCw className="w-4 h-4 text-[#4285F4] animate-spin" />}
          </div>
          <p className="text-xs text-[#607391] font-medium">
            Create, view and manage sorties with priorities, flight windows and resource requirements (PostgreSQL Connected)
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="clay-btn-primary flex items-center gap-2 px-4 py-2.5 text-xs cursor-pointer shadow-md"
        >
          <Plus className="w-4 h-4" />
          Add Sortie
        </button>
      </div>

      {errorMsg && (
        <div className="p-3.5 rounded-2xl bg-[#FEF3C7] border border-[#F4B740]/40 text-[#92400E] text-xs flex items-center justify-between font-mono">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-[#F4B740]" />
            <span>{errorMsg}</span>
          </div>
          <button onClick={() => setErrorMsg(null)} className="text-[#92400E] hover:text-[#78350F]">✕</button>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="clay-card p-3.5 flex flex-col md:flex-row items-stretch md:items-center gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#607391]" />
          <input
            type="text"
            placeholder="Search sorties by code, name or zone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white/80 border border-[#C2D5ED] rounded-xl text-xs text-[#14264A] placeholder-[#607391] focus:outline-none focus:border-[#4285F4] shadow-xs"
          />
        </div>

        {/* Priority Filter */}
        <select
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value)}
          className="px-3.5 py-2 bg-white/80 border border-[#C2D5ED] rounded-xl text-xs font-semibold text-[#14264A] focus:outline-none focus:border-[#4285F4] shadow-xs"
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
          className="px-3.5 py-2 bg-white/80 border border-[#C2D5ED] rounded-xl text-xs font-semibold text-[#14264A] focus:outline-none focus:border-[#4285F4] shadow-xs"
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
      <div className="clay-card overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#EAF2FC] border-b border-[#C2D5ED]/80 text-[#607391] font-bold uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-3.5 px-4">Code</th>
                <th className="py-3.5 px-4">Sortie Name</th>
                <th className="py-3.5 px-4">Priority</th>
                <th className="py-3.5 px-4">Location Sector</th>
                <th className="py-3.5 px-4">Flight Window</th>
                <th className="py-3.5 px-4">Required Assets</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#C2D5ED]/40 font-medium text-[#14264A]">
              {missions.length === 0 && !isLoading ? (
                <tr>
                  <td colSpan={8} className="py-10 text-center text-[#607391]">
                    No missions found matching query.
                  </td>
                </tr>
              ) : (
                missions.map((mission) => (
                  <tr
                    key={mission.id}
                    className="hover:bg-white/50 transition-colors"
                  >
                    <td className="py-3.5 px-4 font-mono text-[#4285F4] font-extrabold">{mission.id}</td>
                    <td className="py-3.5 px-4 font-bold">{mission.name}</td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border shadow-xs ${getPriorityBadge(
                          mission.priority
                        )}`}
                      >
                        {mission.priority}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-semibold">{mission.location}</td>
                    <td className="py-3.5 px-4 font-mono text-[#607391]">{mission.timeWindow}</td>
                    <td className="py-3.5 px-4 text-[#14264A]">{mission.requiredResources}</td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border shadow-xs ${getStatusBadge(
                          mission.status
                        )}`}
                      >
                        {mission.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5 text-[#607391]">
                        <button
                          onClick={() => setViewMission(mission)}
                          className="clay-btn p-1.5 text-[#4285F4] hover:text-blue-700 cursor-pointer"
                          title="View details"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setEditingMission(mission)}
                          className="clay-btn p-1.5 text-[#D97706] hover:text-amber-700 cursor-pointer"
                          title="Edit mission"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(mission)}
                          className="clay-btn p-1.5 text-[#F04452] hover:text-red-700 cursor-pointer"
                          title="Delete mission"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
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
        <div className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="clay-card max-w-md w-full p-6 shadow-2xl bg-[#EAF2FC] space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#C2D5ED]/70">
              <h3 className="text-base font-bold text-[#14264A] flex items-center gap-2">
                <Crosshair className="w-4 h-4 text-[#4285F4]" />
                Create Synthetic Sortie (PostgreSQL)
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="clay-btn p-1.5 text-[#607391] hover:text-[#14264A] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddMission} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-xs font-bold text-[#14264A] mb-1">Sortie Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Recon Alpha Patrol"
                  value={newMission.name}
                  onChange={(e) => setNewMission({ ...newMission, name: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-[#C2D5ED] rounded-xl text-xs text-[#14264A] focus:outline-none focus:border-[#4285F4]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#14264A] mb-1">Priority</label>
                  <select
                    value={newMission.priority}
                    onChange={(e) => setNewMission({ ...newMission, priority: e.target.value as Priority })}
                    className="w-full px-3 py-2 bg-white border border-[#C2D5ED] rounded-xl text-xs text-[#14264A]"
                  >
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#14264A] mb-1">Operational Zone</label>
                  <select
                    value={newMission.location}
                    onChange={(e) => setNewMission({ ...newMission, location: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-[#C2D5ED] rounded-xl text-xs text-[#14264A]"
                  >
                    <option value="Zone A">Zone A</option>
                    <option value="Zone B">Zone B</option>
                    <option value="Zone C">Zone C</option>
                    <option value="Zone D">Zone D</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#14264A] mb-1">Required Assets</label>
                <select
                  value={newMission.requiredResources}
                  onChange={(e) => setNewMission({ ...newMission, requiredResources: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-[#C2D5ED] rounded-xl text-xs text-[#14264A]"
                >
                  <option value="1 Type-A">1 Type-A Aircraft</option>
                  <option value="2 Type-A">2 Type-A Aircraft</option>
                  <option value="1 Type-B">1 Type-B Aircraft</option>
                  <option value="1 Type-C">1 Type-C Aircraft</option>
                </select>
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-[#C2D5ED]/70">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="clay-btn px-4 py-2 text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="clay-btn-primary px-4 py-2 text-xs cursor-pointer shadow-md"
                >
                  Create Sortie
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: View Mission */}
      {viewMission && (
        <div className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="clay-card max-w-md w-full p-6 shadow-2xl bg-[#EAF2FC] space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#C2D5ED]/70">
              <h3 className="text-base font-bold text-[#14264A] flex items-center gap-2">
                <Crosshair className="w-4 h-4 text-[#4285F4]" />
                Sortie Telemetry: {viewMission.id}
              </h3>
              <button
                onClick={() => setViewMission(null)}
                className="clay-btn p-1.5 text-[#607391] hover:text-[#14264A] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="p-3 rounded-2xl bg-white/70">
                <div className="font-bold text-[#14264A] text-sm">{viewMission.name}</div>
                <div className="text-[#607391] mt-0.5">Assigned Sector: {viewMission.location}</div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 rounded-xl bg-white/60">
                  <span className="text-[#607391] block text-[10px]">Priority</span>
                  <span className="font-bold">{viewMission.priority}</span>
                </div>
                <div className="p-2.5 rounded-xl bg-white/60">
                  <span className="text-[#607391] block text-[10px]">Status</span>
                  <span className="font-bold">{viewMission.status}</span>
                </div>
                <div className="p-2.5 rounded-xl bg-white/60">
                  <span className="text-[#607391] block text-[10px]">Time Window</span>
                  <span className="font-mono font-bold">{viewMission.timeWindow}</span>
                </div>
                <div className="p-2.5 rounded-xl bg-white/60">
                  <span className="text-[#607391] block text-[10px]">Asset Allocation</span>
                  <span className="font-bold">{viewMission.requiredResources}</span>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setViewMission(null)}
                className="clay-btn-primary px-4 py-2 text-xs cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Edit Mission */}
      {editingMission && (
        <div className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="clay-card max-w-md w-full p-6 shadow-2xl bg-[#EAF2FC] space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#C2D5ED]/70">
              <h3 className="text-base font-bold text-[#14264A]">Update Sortie {editingMission.id}</h3>
              <button
                onClick={() => setEditingMission(null)}
                className="clay-btn p-1.5 text-[#607391] hover:text-[#14264A] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleUpdateMission} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-xs font-bold text-[#14264A] mb-1">Sortie Name</label>
                <input
                  type="text"
                  value={editingMission.name}
                  onChange={(e) => setEditingMission({ ...editingMission, name: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-[#C2D5ED] rounded-xl text-xs text-[#14264A]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#14264A] mb-1">Priority</label>
                  <select
                    value={editingMission.priority}
                    onChange={(e) => setEditingMission({ ...editingMission, priority: e.target.value as Priority })}
                    className="w-full px-3 py-2 bg-white border border-[#C2D5ED] rounded-xl text-xs text-[#14264A]"
                  >
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#14264A] mb-1">Status</label>
                  <select
                    value={editingMission.status}
                    onChange={(e) => setEditingMission({ ...editingMission, status: e.target.value as MissionStatus })}
                    className="w-full px-3 py-2 bg-white border border-[#C2D5ED] rounded-xl text-xs text-[#14264A]"
                  >
                    <option value="Scheduled">Scheduled</option>
                    <option value="Pending">Pending</option>
                    <option value="Ongoing">Ongoing</option>
                    <option value="Completed">Completed</option>
                    <option value="Delayed">Delayed</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-[#C2D5ED]/70">
                <button
                  type="button"
                  onClick={() => setEditingMission(null)}
                  className="clay-btn px-4 py-2 text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="clay-btn-primary px-4 py-2 text-xs cursor-pointer shadow-md"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

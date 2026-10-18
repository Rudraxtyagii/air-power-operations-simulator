import React, { useState, useEffect } from 'react';
import {
  Search,
  Plus,
  Eye,
  Edit2,
  Trash2,
  Plane,
  MapPin,
  X,
  RefreshCw,
  AlertCircle,
} from 'lucide-react';
import { api } from '../services/api';
import type { Resource, ResourceStatus } from '../types';

export const Resources: React.FC = () => {
  const [resources, setResources] = useState<Resource[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingResource, setEditingResource] = useState<Resource | null>(null);
  const [viewResource, setViewResource] = useState<Resource | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // New resource form state
  const [newAsset, setNewAsset] = useState({
    type: 'Type-A',
    currentLocation: 'Base-1',
    fuelLevel: 100,
  });

  const loadResources = async () => {
    setIsLoading(true);
    try {
      const data = await api.getResources({
        search: searchTerm,
        type: typeFilter,
        status: statusFilter,
      });
      setResources(data);
      setErrorMsg(null);
    } catch (err: any) {
      console.warn('Load resources error:', err);
      setErrorMsg('Failed to connect to backend fleet telemetry. Running in safe mode.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      loadResources();
    }, 200);
    return () => clearTimeout(timer);
  }, [searchTerm, typeFilter, statusFilter]);

  const getStatusBadge = (status: ResourceStatus) => {
    switch (status) {
      case 'Available':
        return 'bg-[#DEF7EC] text-[#059669] border-[#25C98A]/30';
      case 'In Mission':
        return 'bg-[#E1EFFE] text-[#1D4ED8] border-[#4285F4]/30';
      case 'Maintenance':
        return 'bg-[#FEF3C7] text-[#D97706] border-[#F4B740]/30';
      case 'Unavailable':
        return 'bg-[#FDE8E8] text-[#F04452] border-[#F04452]/30';
    }
  };

  const getFuelColor = (fuel: number) => {
    if (fuel > 60) return 'bg-[#4285F4]';
    if (fuel > 30) return 'bg-[#F4B740]';
    return 'bg-[#F04452]';
  };

  const getPredictedColor = (pct: number) => {
    if (pct >= 80) return 'text-[#059669]';
    if (pct >= 50) return 'text-[#D97706]';
    return 'text-[#F04452]';
  };

  const handleAddResource = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const created = await api.createResource({
        type: newAsset.type,
        homeBase: newAsset.currentLocation,
        fuelLevel: newAsset.fuelLevel,
      });
      setResources([created, ...resources]);
      setIsAddModalOpen(false);
    } catch (err: any) {
      alert(`Error creating resource: ${err.message}`);
    }
  };

  const handleUpdateResource = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingResource) return;
    try {
      if (editingResource.dbId) {
        const statusMap: Record<string, any> = {
          Available: 'AVAILABLE',
          'In Mission': 'IN_MISSION',
          Maintenance: 'MAINTENANCE',
          Unavailable: 'UNAVAILABLE',
        };
        const updated = await api.updateResource(editingResource.dbId, {
          availability_status: statusMap[editingResource.status] || 'AVAILABLE',
          fuel_level: editingResource.fuelLevel,
          maintenance_status: editingResource.maintenance === 'Normal' ? 'NORMAL' : 'MAINTENANCE',
        });
        setResources(resources.map((r) => (r.id === editingResource.id ? updated : r)));
      } else {
        setResources(resources.map((r) => (r.id === editingResource.id ? editingResource : r)));
      }
      setEditingResource(null);
    } catch (err: any) {
      alert(`Error updating resource: ${err.message}`);
    }
  };

  const handleDelete = async (resource: Resource) => {
    if (!confirm(`Are you sure you want to decommission resource ${resource.id}?`)) return;
    try {
      if (resource.dbId) {
        await api.deleteResource(resource.dbId);
      }
      setResources(resources.filter((r) => r.id !== resource.id));
    } catch (err: any) {
      console.warn('Delete error, removing from view:', err);
      setResources(resources.filter((r) => r.id !== resource.id));
    }
  };

  return (
    <div className="space-y-5 lg:space-y-6 text-[#14264A] min-w-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#C2D5ED]/60">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-2xl font-extrabold text-[#14264A] tracking-tight">Resource Fleet Ledger</h2>
            {isLoading && <RefreshCw className="w-4 h-4 text-[#4285F4] animate-spin" />}
          </div>
          <p className="text-xs text-[#607391] font-medium">
            View aircraft availability, fuel capacity, depot maintenance status and predicted turnaround (PostgreSQL Connected)
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="clay-btn-primary flex items-center gap-2 px-4 py-2.5 text-xs cursor-pointer shadow-md"
        >
          <Plus className="w-4 h-4" />
          Add Aircraft
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
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#607391]" />
          <input
            type="text"
            placeholder="Search aircraft by code or home base..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white/80 border border-[#C2D5ED] rounded-xl text-xs text-[#14264A] placeholder-[#607391] focus:outline-none focus:border-[#4285F4] shadow-xs"
          />
        </div>

        {/* Type Filter */}
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="px-3.5 py-2 bg-white/80 border border-[#C2D5ED] rounded-xl text-xs font-semibold text-[#14264A] focus:outline-none focus:border-[#4285F4] shadow-xs"
        >
          <option value="All">All Types</option>
          <option value="Type-A">Type-A</option>
          <option value="Type-B">Type-B</option>
          <option value="Type-C">Type-C</option>
        </select>

        {/* Status Filter */}
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3.5 py-2 bg-white/80 border border-[#C2D5ED] rounded-xl text-xs font-semibold text-[#14264A] focus:outline-none focus:border-[#4285F4] shadow-xs"
        >
          <option value="All">All Statuses</option>
          <option value="Available">Available</option>
          <option value="In Mission">In Mission</option>
          <option value="Maintenance">Maintenance</option>
          <option value="Unavailable">Unavailable</option>
        </select>
      </div>

      {/* Resources Table */}
      <div className="clay-card overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#EAF2FC] border-b border-[#C2D5ED]/80 text-[#607391] font-bold uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-3.5 px-4">Tail ID</th>
                <th className="py-3.5 px-4">Aircraft Type</th>
                <th className="py-3.5 px-4">Operating Status</th>
                <th className="py-3.5 px-4">Fuel Reserve</th>
                <th className="py-3.5 px-4">Maintenance</th>
                <th className="py-3.5 px-4">Predicted Readiness</th>
                <th className="py-3.5 px-4">Home Base</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#C2D5ED]/40 font-medium text-[#14264A]">
              {resources.length === 0 && !isLoading ? (
                <tr>
                  <td colSpan={8} className="py-10 text-center text-[#607391]">
                    No resources found matching filter.
                  </td>
                </tr>
              ) : (
                resources.map((resource) => (
                  <tr
                    key={resource.id}
                    className="hover:bg-white/50 transition-colors"
                  >
                    <td className="py-3.5 px-4 font-mono text-[#4285F4] font-extrabold flex items-center gap-2">
                      <Plane className="w-3.5 h-3.5 text-[#4285F4]" />
                      {resource.id}
                    </td>
                    <td className="py-3.5 px-4 font-bold">{resource.type}</td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border shadow-xs ${getStatusBadge(
                          resource.status
                        )}`}
                      >
                        {resource.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-20 h-2 bg-slate-200 rounded-full overflow-hidden shadow-inner">
                          <div
                            className={`h-full ${getFuelColor(resource.fuelLevel)} rounded-full`}
                            style={{ width: `${resource.fuelLevel}%` }}
                          />
                        </div>
                        <span className="font-mono text-[11px] text-[#607391] font-bold">{resource.fuelLevel}%</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          resource.maintenance === 'Normal'
                            ? 'bg-[#DEF7EC] text-[#059669]'
                            : 'bg-[#FEF3C7] text-[#D97706]'
                        }`}
                      >
                        {resource.maintenance}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-extrabold">
                      <span className={getPredictedColor(resource.predictedAvailability)}>
                        {resource.predictedAvailability}%
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-[#607391] font-semibold flex items-center gap-1.5">
                      <MapPin className="w-3 h-3 text-[#4285F4]" />
                      {resource.currentLocation}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5 text-[#607391]">
                        <button
                          onClick={() => setViewResource(resource)}
                          className="clay-btn p-1.5 text-[#4285F4] hover:text-blue-700 cursor-pointer"
                          title="View telemetry"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setEditingResource(resource)}
                          className="clay-btn p-1.5 text-[#D97706] hover:text-amber-700 cursor-pointer"
                          title="Edit aircraft"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(resource)}
                          className="clay-btn p-1.5 text-[#F04452] hover:text-red-700 cursor-pointer"
                          title="Decommission"
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

      {/* Modal: Add Resource */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="clay-card max-w-md w-full p-6 shadow-2xl bg-[#EAF2FC] space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#C2D5ED]/70">
              <h3 className="text-base font-bold text-[#14264A] flex items-center gap-2">
                <Plane className="w-4 h-4 text-[#4285F4]" />
                Commission Fleet Asset (PostgreSQL)
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="clay-btn p-1.5 text-[#607391] hover:text-[#14264A] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddResource} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-xs font-bold text-[#14264A] mb-1">Aircraft Class</label>
                <select
                  value={newAsset.type}
                  onChange={(e) => setNewAsset({ ...newAsset, type: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-[#C2D5ED] rounded-xl text-xs text-[#14264A]"
                >
                  <option value="Type-A">Type-A (Air Superiority Fighter)</option>
                  <option value="Type-B">Type-B (Multi-Role Tactical Bomber)</option>
                  <option value="Type-C">Type-C (Transport & Logistics Carrier)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#14264A] mb-1">Assigned Station / Base</label>
                <select
                  value={newAsset.currentLocation}
                  onChange={(e) => setNewAsset({ ...newAsset, currentLocation: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-[#C2D5ED] rounded-xl text-xs text-[#14264A]"
                >
                  <option value="Base-1">Base-1 (Northern Sector)</option>
                  <option value="Base-2">Base-2 (Eastern Wing)</option>
                  <option value="Base-3">Base-3 (Central Command)</option>
                  <option value="Base-4">Base-4 (Southern Logistics)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#14264A] mb-1">
                  Fuel Level ({newAsset.fuelLevel}%)
                </label>
                <input
                  type="range"
                  min="20"
                  max="100"
                  value={newAsset.fuelLevel}
                  onChange={(e) => setNewAsset({ ...newAsset, fuelLevel: Number(e.target.value) })}
                  className="w-full"
                />
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
                  Commission Asset
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: View Resource */}
      {viewResource && (
        <div className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="clay-card max-w-md w-full p-6 shadow-2xl bg-[#EAF2FC] space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#C2D5ED]/70">
              <h3 className="text-base font-bold text-[#14264A] flex items-center gap-2">
                <Plane className="w-4 h-4 text-[#4285F4]" />
                Aircraft Telemetry: {viewResource.id}
              </h3>
              <button
                onClick={() => setViewResource(null)}
                className="clay-btn p-1.5 text-[#607391] hover:text-[#14264A] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="p-3 rounded-2xl bg-white/70">
                <div className="font-bold text-[#14264A] text-sm">{viewResource.id} ({viewResource.type})</div>
                <div className="text-[#607391] mt-0.5">Station: {viewResource.currentLocation}</div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 rounded-xl bg-white/60">
                  <span className="text-[#607391] block text-[10px]">Operating Status</span>
                  <span className="font-bold">{viewResource.status}</span>
                </div>
                <div className="p-2.5 rounded-xl bg-white/60">
                  <span className="text-[#607391] block text-[10px]">Fuel Reserve</span>
                  <span className="font-mono font-bold">{viewResource.fuelLevel}%</span>
                </div>
                <div className="p-2.5 rounded-xl bg-white/60">
                  <span className="text-[#607391] block text-[10px]">Depot Maintenance</span>
                  <span className="font-bold">{viewResource.maintenance}</span>
                </div>
                <div className="p-2.5 rounded-xl bg-white/60">
                  <span className="text-[#607391] block text-[10px]">Predicted Availability</span>
                  <span className="font-mono font-extrabold text-[#059669]">
                    {viewResource.predictedAvailability}%
                  </span>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setViewResource(null)}
                className="clay-btn-primary px-4 py-2 text-xs cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Edit Resource */}
      {editingResource && (
        <div className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="clay-card max-w-md w-full p-6 shadow-2xl bg-[#EAF2FC] space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#C2D5ED]/70">
              <h3 className="text-base font-bold text-[#14264A]">Update Asset {editingResource.id}</h3>
              <button
                onClick={() => setEditingResource(null)}
                className="clay-btn p-1.5 text-[#607391] hover:text-[#14264A] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleUpdateResource} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-xs font-bold text-[#14264A] mb-1">Operating Status</label>
                <select
                  value={editingResource.status}
                  onChange={(e) => setEditingResource({ ...editingResource, status: e.target.value as ResourceStatus })}
                  className="w-full px-3 py-2 bg-white border border-[#C2D5ED] rounded-xl text-xs text-[#14264A]"
                >
                  <option value="Available">Available</option>
                  <option value="In Mission">In Mission</option>
                  <option value="Maintenance">Maintenance</option>
                  <option value="Unavailable">Unavailable</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#14264A] mb-1">
                  Fuel Level ({editingResource.fuelLevel}%)
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={editingResource.fuelLevel}
                  onChange={(e) => setEditingResource({ ...editingResource, fuelLevel: Number(e.target.value) })}
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#14264A] mb-1">Maintenance Flag</label>
                <select
                  value={editingResource.maintenance}
                  onChange={(e) => setEditingResource({ ...editingResource, maintenance: e.target.value as any })}
                  className="w-full px-3 py-2 bg-white border border-[#C2D5ED] rounded-xl text-xs text-[#14264A]"
                >
                  <option value="Normal">Normal</option>
                  <option value="Maintenance">Scheduled Depot Maintenance</option>
                </select>
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-[#C2D5ED]/70">
                <button
                  type="button"
                  onClick={() => setEditingResource(null)}
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

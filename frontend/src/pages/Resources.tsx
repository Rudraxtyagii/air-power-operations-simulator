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
  AlertCircle
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
        return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40';
      case 'In Mission':
        return 'bg-sky-500/20 text-sky-400 border-sky-500/40';
      case 'Maintenance':
        return 'bg-amber-500/20 text-amber-400 border-amber-500/40';
      case 'Unavailable':
        return 'bg-red-500/20 text-red-400 border-red-500/40';
    }
  };

  const getFuelColor = (fuel: number) => {
    if (fuel > 60) return 'bg-sky-500';
    if (fuel > 30) return 'bg-amber-500';
    return 'bg-red-500';
  };

  const getPredictedColor = (pct: number) => {
    if (pct >= 80) return 'text-emerald-400';
    if (pct >= 50) return 'text-amber-400';
    return 'text-red-400';
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
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-xl font-bold text-white tracking-tight">Resource Management</h2>
            {isLoading && <RefreshCw className="w-4 h-4 text-sky-400 animate-spin" />}
          </div>
          <p className="text-xs text-slate-400">
            View aircraft, crew and resource availability, maintenance status and predicted readiness (PostgreSQL Connected)
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md shadow-blue-900/40 transition"
        >
          <Plus className="w-4 h-4" />
          Add Resource
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
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search resources..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-900/90 border border-slate-700/80 rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-sky-500 transition"
          />
        </div>

        {/* Type Filter */}
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="px-3 py-2 bg-slate-900/90 border border-slate-700/80 rounded-lg text-xs text-slate-300 focus:outline-none focus:border-sky-500"
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
          className="px-3 py-2 bg-slate-900/90 border border-slate-700/80 rounded-lg text-xs text-slate-300 focus:outline-none focus:border-sky-500"
        >
          <option value="All">All Status</option>
          <option value="Available">Available</option>
          <option value="In Mission">In Mission</option>
          <option value="Maintenance">Maintenance</option>
          <option value="Unavailable">Unavailable</option>
        </select>
      </div>

      {/* Resources Table */}
      <div className="rounded-xl bg-[#090e1a] border border-slate-800 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#0e1626] border-b border-slate-800 text-slate-400 font-semibold tracking-wider uppercase text-[11px]">
              <tr>
                <th className="py-3.5 px-4">ID</th>
                <th className="py-3.5 px-4">Type</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Fuel Level</th>
                <th className="py-3.5 px-4">Maintenance</th>
                <th className="py-3.5 px-4">Predicted Availability</th>
                <th className="py-3.5 px-4">Current Location</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-medium">
              {resources.length === 0 && !isLoading ? (
                <tr>
                  <td colSpan={8} className="py-10 text-center text-slate-500">
                    No resources found matching filter.
                  </td>
                </tr>
              ) : (
                resources.map((res) => (
                  <tr key={res.id} className="hover:bg-slate-900/50 transition text-slate-300">
                    <td className="py-3.5 px-4 font-mono text-sky-400 font-bold">{res.id}</td>
                    <td className="py-3.5 px-4 font-semibold text-white">{res.type}</td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`px-2.5 py-1 rounded text-[11px] font-semibold border ${getStatusBadge(
                          res.status
                        )}`}
                      >
                        {res.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2.5 w-32">
                        <div className="flex-1 bg-slate-800 rounded-full h-2 overflow-hidden">
                          <div
                            className={`h-full rounded-full ${getFuelColor(res.fuelLevel)}`}
                            style={{ width: `${res.fuelLevel}%` }}
                          />
                        </div>
                        <span className="font-mono text-slate-300 w-8 text-right text-[11px]">
                          {res.fuelLevel}%
                        </span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`px-2.5 py-0.5 rounded text-[11px] font-medium border ${
                          res.maintenance === 'Normal'
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                            : 'bg-red-500/10 text-red-400 border-red-500/30'
                        }`}
                      >
                        {res.maintenance}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold">
                      <span className={getPredictedColor(res.predictedAvailability)}>
                        {res.predictedAvailability}%
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-300 flex items-center gap-1.5 pt-4">
                      <MapPin className="w-3.5 h-3.5 text-slate-500" />
                      <span>{res.currentLocation}</span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2 text-slate-400">
                        <button
                          onClick={() => setViewResource(res)}
                          className="p-1 hover:text-sky-400 transition"
                          title="View telemetry"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setEditingResource(res)}
                          className="p-1 hover:text-amber-400 transition"
                          title="Edit resource"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(res)}
                          className="p-1 hover:text-red-400 transition"
                          title="Decommission resource"
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

      {/* Modal: Add Resource */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0d1322] border border-slate-700 rounded-xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white">Add Synthetic Fleet Asset (PostgreSQL)</h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleAddResource} className="space-y-4 mt-4 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Asset Model Category</label>
                <select
                  value={newAsset.type}
                  onChange={(e) => setNewAsset({ ...newAsset, type: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-200"
                >
                  <option value="Type-A">Type-A (Air Superiority / Interceptor)</option>
                  <option value="Type-B">Type-B (Multirole Strike / Recon)</option>
                  <option value="Type-C">Type-C (Tactical Transport / AEW)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Home Station / Base</label>
                <select
                  value={newAsset.currentLocation}
                  onChange={(e) => setNewAsset({ ...newAsset, currentLocation: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-200"
                >
                  <option value="Base-1">Base-1 (Northern Command)</option>
                  <option value="Base-2">Base-2 (Forward Staging)</option>
                  <option value="Base-3">Base-3 (Central Depot)</option>
                  <option value="Base-4">Base-4 (Reserve Complex)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Initial Fuel Readiness (%)</label>
                <input
                  type="number"
                  min="20"
                  max="100"
                  value={newAsset.fuelLevel}
                  onChange={(e) =>
                    setNewAsset({ ...newAsset, fuelLevel: parseInt(e.target.value) || 100 })
                  }
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-200"
                />
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
                  Commission Asset
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Edit Resource */}
      {editingResource && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0d1322] border border-slate-700 rounded-xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white">Edit Resource {editingResource.id}</h3>
              <button
                onClick={() => setEditingResource(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleUpdateResource} className="space-y-4 mt-4 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Availability Status</label>
                <select
                  value={editingResource.status}
                  onChange={(e) =>
                    setEditingResource({ ...editingResource, status: e.target.value as ResourceStatus })
                  }
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-200"
                >
                  <option value="Available">Available</option>
                  <option value="In Mission">In Mission</option>
                  <option value="Maintenance">Maintenance</option>
                  <option value="Unavailable">Unavailable</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Fuel Level (%)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={editingResource.fuelLevel}
                  onChange={(e) =>
                    setEditingResource({ ...editingResource, fuelLevel: parseInt(e.target.value) || 0 })
                  }
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-200"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Maintenance Status</label>
                <select
                  value={editingResource.maintenance}
                  onChange={(e) =>
                    setEditingResource({ ...editingResource, maintenance: e.target.value as 'Normal' | 'Maintenance' })
                  }
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-200"
                >
                  <option value="Normal">Normal</option>
                  <option value="Maintenance">Maintenance</option>
                </select>
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingResource(null)}
                  className="px-4 py-2 bg-slate-800 rounded-lg text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-600 rounded-lg text-white font-semibold"
                >
                  Save Telemetry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: View Resource Telemetry */}
      {viewResource && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0d1322] border border-sky-500/40 rounded-xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Plane className="w-5 h-5 text-sky-400" />
                <h3 className="text-base font-bold text-white">Asset Telemetry {viewResource.id}</h3>
              </div>
              <button
                onClick={() => setViewResource(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-3 mt-4 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-800">
                <span className="text-slate-400">Airframe Type:</span>
                <span className="font-semibold text-white">{viewResource.type}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800">
                <span className="text-slate-400">Current Readiness:</span>
                <span className="font-semibold text-emerald-400">{viewResource.status}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800">
                <span className="text-slate-400">Fuel Reserves:</span>
                <span className="font-mono text-white">{viewResource.fuelLevel}%</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800">
                <span className="text-slate-400">Maintenance Cycle:</span>
                <span className="font-semibold text-slate-200">{viewResource.maintenance}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800">
                <span className="text-slate-400">ML Predicted Availability:</span>
                <span className="font-mono text-sky-400 font-bold">
                  {viewResource.predictedAvailability}%
                </span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-400">Station Base:</span>
                <span className="font-semibold text-white">{viewResource.currentLocation}</span>
              </div>
            </div>
            <div className="mt-5 pt-3 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => setViewResource(null)}
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

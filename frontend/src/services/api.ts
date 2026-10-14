import { INITIAL_MISSIONS, INITIAL_RESOURCES, SCHEDULED_MISSIONS, INITIAL_ALERTS } from '../data/mockData';
import type { Mission, Resource, ScheduledMission, AlertItem, Priority, MissionStatus, ResourceStatus } from '../types';

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

export interface ApiMission {
  id: number;
  mission_code: string;
  name: string;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  zone: 'ZONE_A' | 'ZONE_B' | 'ZONE_C' | 'ZONE_D';
  duration_minutes: number;
  start_window: string;
  end_window: string;
  required_resource_type: 'TYPE_A' | 'TYPE_B' | 'TYPE_C';
  required_resource_count: number;
  status: 'PENDING' | 'SCHEDULED' | 'ACTIVE' | 'COMPLETED' | 'DELAYED';
  created_at: string;
}

export interface ApiResource {
  id: number;
  resource_code: string;
  resource_type: 'TYPE_A' | 'TYPE_B' | 'TYPE_C';
  capacity: number;
  availability_status: 'AVAILABLE' | 'IN_MISSION' | 'UNAVAILABLE' | 'MAINTENANCE';
  fuel_level: number;
  maintenance_status: 'NORMAL' | 'ATTENTION' | 'MAINTENANCE';
  operating_hours: number;
  current_zone: 'ZONE_A' | 'ZONE_B' | 'ZONE_C' | 'ZONE_D';
  home_base: 'BASE_1' | 'BASE_2' | 'BASE_3' | 'BASE_4';
  predicted_availability: number;
  created_at: string;
}

export interface ApiSchedule {
  id: number;
  mission_id: number;
  resource_id: number;
  start_time: string;
  end_time: string;
  delay_minutes: number;
  optimization_score: number;
  status: string;
  mission_code?: string;
  resource_code?: string;
  created_at: string;
}

export interface ApiSimulationEvent {
  id: number;
  event_type: string;
  affected_resource_id?: number | null;
  affected_mission_id?: number | null;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  description: string;
  affected_resource_code?: string | null;
  affected_mission_code?: string | null;
  created_at: string;
}

// Helpers for presentation transformation
export function mapApiMissionToUi(m: ApiMission): Mission {
  const priorityMap: Record<string, Priority> = {
    HIGH: 'High',
    MEDIUM: 'Medium',
    LOW: 'Low',
  };

  const statusMap: Record<string, MissionStatus> = {
    ACTIVE: 'Ongoing',
    SCHEDULED: 'Scheduled',
    COMPLETED: 'Completed',
    PENDING: 'Pending',
    DELAYED: 'Delayed',
  };

  const zoneMap: Record<string, string> = {
    ZONE_A: 'Zone A',
    ZONE_B: 'Zone B',
    ZONE_C: 'Zone C',
    ZONE_D: 'Zone D',
  };

  const typeMap: Record<string, string> = {
    TYPE_A: 'Type-A',
    TYPE_B: 'Type-B',
    TYPE_C: 'Type-C',
  };

  // Format ISO timestamp to HH:mm
  const formatTime = (iso: string) => {
    try {
      const d = new Date(iso);
      return d.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' });
    } catch {
      return '08:00';
    }
  };

  const timeWindow = `${formatTime(m.start_window)} - ${formatTime(m.end_window)}`;
  const reqRes = `${m.required_resource_count} ${typeMap[m.required_resource_type] || 'Type-A'}`;

  return {
    id: m.mission_code || `M00${m.id}`,
    name: m.name,
    priority: priorityMap[m.priority] || 'Medium',
    location: zoneMap[m.zone] || 'Zone A',
    timeWindow,
    requiredResources: reqRes,
    status: statusMap[m.status] || 'Pending',
    dbId: m.id,
  } as Mission & { dbId?: number };
}

export function mapApiResourceToUi(r: ApiResource): Resource {
  const statusMap: Record<string, ResourceStatus> = {
    AVAILABLE: 'Available',
    IN_MISSION: 'In Mission',
    MAINTENANCE: 'Maintenance',
    UNAVAILABLE: 'Unavailable',
  };

  const typeMap: Record<string, string> = {
    TYPE_A: 'Type-A',
    TYPE_B: 'Type-B',
    TYPE_C: 'Type-C',
  };

  const baseMap: Record<string, string> = {
    BASE_1: 'Base-1',
    BASE_2: 'Base-2',
    BASE_3: 'Base-3',
    BASE_4: 'Base-4',
  };

  return {
    id: r.resource_code || `A0${r.id}`,
    type: typeMap[r.resource_type] || 'Type-A',
    status: statusMap[r.availability_status] || 'Available',
    fuelLevel: r.fuel_level,
    maintenance: r.maintenance_status === 'NORMAL' ? 'Normal' : 'Maintenance',
    predictedAvailability: r.predicted_availability,
    currentLocation: baseMap[r.home_base] || 'Base-1',
    dbId: r.id,
  } as Resource & { dbId?: number };
}

export function mapApiScheduleToUi(s: ApiSchedule): ScheduledMission {
  const formatTime = (iso: string) => {
    try {
      const d = new Date(iso);
      return d.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' });
    } catch {
      return '10:00';
    }
  };

  return {
    missionId: s.mission_code || `M00${s.mission_id}`,
    assignedResource: s.resource_code || `A0${s.resource_id}`,
    startTime: formatTime(s.start_time),
    endTime: formatTime(s.end_time),
    status: (s.status === 'SCHEDULED' ? 'Scheduled' : 'Pending') as any,
  };
}

export function mapApiEventToUi(e: ApiSimulationEvent): AlertItem {
  const formatTime = (iso: string) => {
    try {
      const d = new Date(iso);
      return d.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' });
    } catch {
      return '10:00';
    }
  };

  let type: 'unavailable' | 'weather' | 'delay' | 'info' = 'info';
  const evt = e.event_type.toUpperCase();
  if (evt.includes('UNAVAILABLE')) type = 'unavailable';
  else if (evt.includes('WEATHER')) type = 'weather';
  else if (evt.includes('DELAY')) type = 'delay';

  return {
    id: `event-${e.id}`,
    time: formatTime(e.created_at),
    message: e.description,
    type,
  };
}

// API Calls with fallback handling
export const api = {
  async getHealth(): Promise<{ status: string; database: string }> {
    const res = await fetch(`${API_BASE_URL}/health`);
    if (!res.ok) throw new Error(`Health check failed: ${res.statusText}`);
    return res.json();
  },

  async getMissions(filters?: { search?: string; priority?: string; status?: string }): Promise<Mission[]> {
    try {
      const params = new URLSearchParams();
      if (filters?.search) params.append('search', filters.search);
      if (filters?.priority && filters.priority !== 'All') params.append('priority', filters.priority);
      if (filters?.status && filters.status !== 'All') params.append('status', filters.status);

      const url = `${API_BASE_URL}/missions${params.toString() ? `?${params.toString()}` : ''}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error(`Failed to fetch missions: ${res.statusText}`);
      const data: ApiMission[] = await res.json();
      return data.map(mapApiMissionToUi);
    } catch (err) {
      console.warn('[API] getMissions error, using fallback:', err);
      return INITIAL_MISSIONS;
    }
  },

  async createMission(mission: {
    name: string;
    priority: string;
    location: string;
    timeWindow: string;
    requiredResources: string;
  }): Promise<Mission> {
    const now = new Date();
    const end = new Date(now.getTime() + 2 * 60 * 60 * 1000);

    const zoneKey = mission.location.toUpperCase().replace(' ', '_');
    const priorityKey = mission.priority.toUpperCase();
    const resCode = `M${Math.floor(100 + Math.random() * 900)}`;

    const payload = {
      mission_code: resCode,
      name: mission.name,
      priority: priorityKey,
      zone: zoneKey in { ZONE_A: 1, ZONE_B: 1, ZONE_C: 1, ZONE_D: 1 } ? zoneKey : 'ZONE_A',
      duration_minutes: 120,
      start_window: now.toISOString(),
      end_window: end.toISOString(),
      required_resource_type: 'TYPE_A',
      required_resource_count: 1,
      status: 'PENDING',
    };

    const res = await fetch(`${API_BASE_URL}/missions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!res.ok) throw new Error(`Failed to create mission: ${res.statusText}`);
    const data: ApiMission = await res.json();
    return mapApiMissionToUi(data);
  },

  async updateMission(id: number, update: Partial<ApiMission>): Promise<Mission> {
    const res = await fetch(`${API_BASE_URL}/missions/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(update),
    });
    if (!res.ok) throw new Error(`Failed to update mission: ${res.statusText}`);
    const data: ApiMission = await res.json();
    return mapApiMissionToUi(data);
  },

  async deleteMission(id: number): Promise<void> {
    const res = await fetch(`${API_BASE_URL}/missions/${id}`, {
      method: 'DELETE',
    });
    if (!res.ok && res.status !== 204) throw new Error(`Failed to delete mission: ${res.statusText}`);
  },

  async getResources(filters?: { search?: string; type?: string; status?: string }): Promise<Resource[]> {
    try {
      const params = new URLSearchParams();
      if (filters?.search) params.append('search', filters.search);
      if (filters?.type && filters.type !== 'All') params.append('type', filters.type);
      if (filters?.status && filters.status !== 'All') params.append('status', filters.status);

      const url = `${API_BASE_URL}/resources${params.toString() ? `?${params.toString()}` : ''}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error(`Failed to fetch resources: ${res.statusText}`);
      const data: ApiResource[] = await res.json();
      return data.map(mapApiResourceToUi);
    } catch (err) {
      console.warn('[API] getResources error, using fallback:', err);
      return INITIAL_RESOURCES;
    }
  },

  async createResource(resource: {
    type: string;
    homeBase: string;
    fuelLevel: number;
  }): Promise<Resource> {
    const typeKey = resource.type.toUpperCase().replace('-', '_');
    const baseKey = resource.homeBase.toUpperCase().replace('-', '_');
    const resCode = `A${Math.floor(10 + Math.random() * 90)}`;

    const payload = {
      resource_code: resCode,
      resource_type: typeKey,
      capacity: 1,
      availability_status: 'AVAILABLE',
      fuel_level: resource.fuelLevel,
      maintenance_status: 'NORMAL',
      operating_hours: 0,
      current_zone: 'ZONE_A',
      home_base: baseKey,
      predicted_availability: 95,
    };

    const res = await fetch(`${API_BASE_URL}/resources`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!res.ok) throw new Error(`Failed to create resource: ${res.statusText}`);
    const data: ApiResource = await res.json();
    return mapApiResourceToUi(data);
  },

  async updateResource(id: number, update: Partial<ApiResource>): Promise<Resource> {
    const res = await fetch(`${API_BASE_URL}/resources/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(update),
    });
    if (!res.ok) throw new Error(`Failed to update resource: ${res.statusText}`);
    const data: ApiResource = await res.json();
    return mapApiResourceToUi(data);
  },

  async deleteResource(id: number): Promise<void> {
    const res = await fetch(`${API_BASE_URL}/resources/${id}`, {
      method: 'DELETE',
    });
    if (!res.ok && res.status !== 204) throw new Error(`Failed to delete resource: ${res.statusText}`);
  },

  async getSchedules(): Promise<ScheduledMission[]> {
    try {
      const res = await fetch(`${API_BASE_URL}/schedules`);
      if (!res.ok) throw new Error(`Failed to fetch schedules: ${res.statusText}`);
      const data: ApiSchedule[] = await res.json();
      return data.map(mapApiScheduleToUi);
    } catch (err) {
      console.warn('[API] getSchedules error, using fallback:', err);
      return SCHEDULED_MISSIONS;
    }
  },

  async getSimulationEvents(): Promise<AlertItem[]> {
    try {
      const res = await fetch(`${API_BASE_URL}/simulation/events`);
      if (!res.ok) throw new Error(`Failed to fetch events: ${res.statusText}`);
      const data: ApiSimulationEvent[] = await res.json();
      return data.map(mapApiEventToUi);
    } catch (err) {
      console.warn('[API] getSimulationEvents error, using fallback:', err);
      return INITIAL_ALERTS;
    }
  },

  async createSimulationEvent(event: {
    event_type: string;
    affected_resource_id?: number | null;
    severity?: string;
    description: string;
  }): Promise<AlertItem> {
    const res = await fetch(`${API_BASE_URL}/simulation/events`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event_type: event.event_type,
        affected_resource_id: event.affected_resource_id || null,
        severity: event.severity || 'HIGH',
        description: event.description,
      }),
    });
    if (!res.ok) throw new Error(`Failed to inject simulation event: ${res.statusText}`);
    const data: ApiSimulationEvent = await res.json();
    return mapApiEventToUi(data);
  },

  // Weather Monitoring API
  async getWeatherOverview(): Promise<import('../types').WeatherOverview> {
    const res = await fetch(`${API_BASE_URL}/weather/overview`);
    if (!res.ok) throw new Error(`Failed to fetch weather overview: ${res.statusText}`);
    return res.json();
  },

  async getWeatherZones(): Promise<import('../types').WeatherZone[]> {
    const res = await fetch(`${API_BASE_URL}/weather/zones`);
    if (!res.ok) throw new Error(`Failed to fetch weather zones: ${res.statusText}`);
    return res.json();
  },

  async getWeatherConditions(): Promise<import('../types').WeatherConditionCard[]> {
    const res = await fetch(`${API_BASE_URL}/weather/conditions`);
    if (!res.ok) throw new Error(`Failed to fetch conditions: ${res.statusText}`);
    return res.json();
  },

  async getWeatherAlerts(): Promise<import('../types').WeatherAlert[]> {
    const res = await fetch(`${API_BASE_URL}/weather/alerts`);
    if (!res.ok) throw new Error(`Failed to fetch weather alerts: ${res.statusText}`);
    return res.json();
  },

  async applyWeatherScenario(scenarioId: string): Promise<import('../types').WeatherOverview> {
    const res = await fetch(`${API_BASE_URL}/weather/scenarios/${scenarioId}/apply`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    if (!res.ok) throw new Error(`Failed to apply scenario: ${res.statusText}`);
    return res.json();
  },

  async resetWeather(): Promise<import('../types').WeatherOverview> {
    const res = await fetch(`${API_BASE_URL}/weather/reset`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    if (!res.ok) throw new Error(`Failed to reset weather: ${res.statusText}`);
    return res.json();
  },

  // Google OR-Tools CP-SAT Optimization API
  async solveOptimization(options?: {
    consider_weather?: boolean;
    apply_to_database?: boolean;
    max_solve_time_seconds?: number;
  }): Promise<import('../types').OptimizationResult> {
    const res = await fetch(`${API_BASE_URL}/optimization/solve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        consider_weather: options?.consider_weather ?? true,
        apply_to_database: options?.apply_to_database ?? false,
        max_solve_time_seconds: options?.max_solve_time_seconds ?? 5.0,
      }),
    });
    if (!res.ok) throw new Error(`Optimization solver failed: ${res.statusText}`);
    return res.json();
  },

  async getLatestOptimization(): Promise<import('../types').OptimizationResult> {
    const res = await fetch(`${API_BASE_URL}/optimization/latest`);
    if (!res.ok) throw new Error(`Failed to fetch latest optimization: ${res.statusText}`);
    return res.json();
  },
};

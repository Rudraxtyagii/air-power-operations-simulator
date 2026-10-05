export type Priority = 'High' | 'Medium' | 'Low';

export type MissionStatus = 'Scheduled' | 'Pending' | 'Ongoing' | 'Completed' | 'Delayed';

export type ResourceStatus = 'Available' | 'In Mission' | 'Maintenance' | 'Unavailable';

export interface Mission {
  id: string;
  name: string;
  priority: Priority;
  location: string;
  timeWindow: string;
  requiredResources: string;
  status: MissionStatus;
}

export interface Resource {
  id: string;
  type: string;
  status: ResourceStatus;
  fuelLevel: number;
  maintenance: 'Normal' | 'Maintenance';
  predictedAvailability: number;
  currentLocation: string;
}

export interface ScheduledMission {
  missionId: string;
  assignedResource: string;
  startTime: string;
  endTime: string;
  status: 'Scheduled' | 'Pending' | 'Delayed';
}

export interface AlertItem {
  id: string;
  time: string;
  message: string;
  type: 'unavailable' | 'weather' | 'delay' | 'info';
}

export interface MetricComparison {
  metric: string;
  before: string | number;
  after: string | number;
}

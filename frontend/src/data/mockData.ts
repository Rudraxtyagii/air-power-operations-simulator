import type { Mission, Resource, ScheduledMission, AlertItem, MetricComparison } from '../types';

export const INITIAL_MISSIONS: Mission[] = [
  { id: 'M001', name: 'Reconnaissance Alpha', priority: 'High', location: 'Zone A', timeWindow: '08:00 - 10:00', requiredResources: '2 Type-A', status: 'Scheduled' },
  { id: 'M002', name: 'Surveillance Bravo', priority: 'Medium', location: 'Zone B', timeWindow: '09:00 - 12:00', requiredResources: '1 Type-B', status: 'Scheduled' },
  { id: 'M003', name: 'Support Charlie', priority: 'High', location: 'Zone C', timeWindow: '10:00 - 13:00', requiredResources: '2 Type-A', status: 'Pending' },
  { id: 'M004', name: 'Patrol Delta', priority: 'Low', location: 'Zone D', timeWindow: '11:00 - 14:00', requiredResources: '1 Type-B', status: 'Scheduled' },
  { id: 'M005', name: 'Logistics Echo', priority: 'Medium', location: 'Zone A', timeWindow: '12:00 - 16:00', requiredResources: '2 Type-C', status: 'Pending' },
  { id: 'M006', name: 'Recon Foxtrot', priority: 'High', location: 'Zone B', timeWindow: '13:00 - 15:00', requiredResources: '1 Type-A', status: 'Scheduled' },
  { id: 'M007', name: 'Strike Support', priority: 'High', location: 'Zone C', timeWindow: '14:00 - 18:00', requiredResources: '2 Type-B', status: 'Pending' },
  { id: 'M008', name: 'SAR Operation', priority: 'Medium', location: 'Zone D', timeWindow: '15:00 - 19:00', requiredResources: '1 Type-A', status: 'Delayed' },
];

export const INITIAL_RESOURCES: Resource[] = [
  { id: 'A01', type: 'Type-A', status: 'Available', fuelLevel: 86, maintenance: 'Normal', predictedAvailability: 96, currentLocation: 'Base-1' },
  { id: 'A02', type: 'Type-A', status: 'Available', fuelLevel: 63, maintenance: 'Normal', predictedAvailability: 84, currentLocation: 'Base-2' },
  { id: 'A03', type: 'Type-B', status: 'Unavailable', fuelLevel: 20, maintenance: 'Maintenance', predictedAvailability: 32, currentLocation: 'Base-1' },
  { id: 'A04', type: 'Type-B', status: 'Available', fuelLevel: 91, maintenance: 'Normal', predictedAvailability: 91, currentLocation: 'Base-3' },
  { id: 'A05', type: 'Type-C', status: 'Available', fuelLevel: 74, maintenance: 'Normal', predictedAvailability: 87, currentLocation: 'Base-2' },
  { id: 'A06', type: 'Type-A', status: 'In Mission', fuelLevel: 58, maintenance: 'Normal', predictedAvailability: 79, currentLocation: 'Zone A' },
  { id: 'A07', type: 'Type-B', status: 'Available', fuelLevel: 67, maintenance: 'Normal', predictedAvailability: 88, currentLocation: 'Base-1' },
  { id: 'A08', type: 'Type-C', status: 'Maintenance', fuelLevel: 40, maintenance: 'Maintenance', predictedAvailability: 35, currentLocation: 'Base-4' },
];

export const SCHEDULED_MISSIONS: ScheduledMission[] = [
  { missionId: 'M001', assignedResource: 'A01', startTime: '08:00', endTime: '10:00', status: 'Scheduled' },
  { missionId: 'M002', assignedResource: 'A04', startTime: '09:00', endTime: '11:00', status: 'Scheduled' },
  { missionId: 'M003', assignedResource: 'A02', startTime: '10:00', endTime: '12:00', status: 'Scheduled' },
  { missionId: 'M004', assignedResource: 'A05', startTime: '11:00', endTime: '13:00', status: 'Scheduled' },
  { missionId: 'M005', assignedResource: 'A06', startTime: '12:00', endTime: '15:00', status: 'Scheduled' },
  { missionId: 'M006', assignedResource: 'A07', startTime: '13:00', endTime: '15:00', status: 'Scheduled' },
];

export const INITIAL_ALERTS: AlertItem[] = [
  { id: 'alt-1', time: '10:24', message: 'Aircraft A07 unavailable', type: 'unavailable' },
  { id: 'alt-2', time: '10:12', message: 'Weather impact in Zone B', type: 'weather' },
  { id: 'alt-3', time: '09:55', message: 'Mission M012 delayed', type: 'delay' },
  { id: 'alt-4', time: '09:32', message: 'A04 returned to base', type: 'info' },
];

export const DEFAULT_BEFORE_AFTER_METRICS: MetricComparison[] = [
  { metric: 'Missions Completed', before: 14, after: 14 },
  { metric: 'Average Delay', before: '8.1 mins', after: '13.2 mins' },
  { metric: 'Resource Utilization', before: '87%', after: '91%' },
  { metric: 'Constraint Violations', before: 0, after: 0 },
  { metric: 'Optimization Score', before: 93.8, after: 91.6 },
  { metric: 'Re-planning Time', before: '--', after: '1.8 sec' },
];

export const MISSION_STATUS_DATA = [
  { name: 'Completed', value: 8, color: '#10b981' },
  { name: 'Ongoing', value: 4, color: '#06b6d4' },
  { name: 'Pending', value: 2, color: '#f59e0b' },
  { name: 'Delayed', value: 1, color: '#ef4444' },
];

export const COMPLETION_RATE_TREND = [
  { day: 'Mon', Baseline: 64, Optimized: 82 },
  { day: 'Tue', Baseline: 68, Optimized: 85 },
  { day: 'Wed', Baseline: 62, Optimized: 81 },
  { day: 'Thu', Baseline: 71, Optimized: 88 },
  { day: 'Fri', Baseline: 69, Optimized: 90 },
  { day: 'Sat', Baseline: 74, Optimized: 93 },
  { day: 'Sun', Baseline: 70, Optimized: 95 },
];

export const UTILIZATION_TREND = [
  { day: 'Mon', Baseline: 68, Optimized: 82 },
  { day: 'Tue', Baseline: 71, Optimized: 84 },
  { day: 'Wed', Baseline: 65, Optimized: 87 },
  { day: 'Thu', Baseline: 73, Optimized: 89 },
  { day: 'Fri', Baseline: 75, Optimized: 92 },
  { day: 'Sat', Baseline: 78, Optimized: 93 },
  { day: 'Sun', Baseline: 72, Optimized: 89 },
];

export const DELAY_TREND = [
  { day: 'Mon', Baseline: 42, Optimized: 18 },
  { day: 'Tue', Baseline: 38, Optimized: 15 },
  { day: 'Wed', Baseline: 28, Optimized: 12 },
  { day: 'Thu', Baseline: 24, Optimized: 9 },
  { day: 'Fri', Baseline: 26, Optimized: 11 },
  { day: 'Sat', Baseline: 22, Optimized: 8 },
  { day: 'Sun', Baseline: 19, Optimized: 7 },
];

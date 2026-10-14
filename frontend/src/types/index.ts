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
  dbId?: number;
}

export interface Resource {
  id: string;
  type: string;
  status: ResourceStatus;
  fuelLevel: number;
  maintenance: 'Normal' | 'Maintenance' | 'Attention';
  predictedAvailability: number;
  currentLocation: string;
  dbId?: number;
}

export interface ScheduledMission {
  missionId: string;
  assignedResource: string;
  startTime: string;
  endTime: string;
  status: 'Scheduled' | 'Pending' | 'Delayed' | 'OPTIMAL_SCHEDULED';
  delayMinutes?: number;
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

// Weather Monitoring Types
export interface WeatherZone {
  id: number;
  zone_code: string;
  zone_name: string;
  condition: string;
  risk_level: 'HIGH' | 'MEDIUM' | 'LOW' | 'NONE';
  temperature_c: number;
  wind_speed_kmh: number;
  visibility_km: number;
  radar_status: string;
  flight_advisory: string;
  updated_at: string;
}

export interface WeatherAlert {
  id: number;
  alert_code: string;
  timestamp_utc: string;
  zone_code: string;
  condition: string;
  severity: 'HIGH' | 'MEDIUM' | 'LOW';
  impact: string;
  is_active: boolean;
}

export interface WeatherConditionCard {
  id: string;
  title: string;
  risk_level: 'HIGH' | 'MEDIUM' | 'LOW';
  badge: string;
  icon_type: string;
  bullet_points: string[];
}

export interface WeatherImpactSummary {
  affected_missions: number;
  total_missions: number;
  delayed_missions: number;
  rerouted_missions: number;
  cancelled_missions: number;
}

export interface WeatherOverview {
  high_alert_zones: number;
  medium_alert_zones: number;
  low_alert_zones: number;
  total_monitored_zones: number;
  overall_status: string;
  overall_description: string;
  banner_message?: string | null;
  banner_zone?: string | null;
  zones: WeatherZone[];
  conditions: WeatherConditionCard[];
  recent_alerts: WeatherAlert[];
  impact: WeatherImpactSummary;
  active_scenario: string;
}

export interface OptimizationScheduleItem {
  mission_id: number;
  mission_code: string;
  mission_name: string;
  priority: string;
  zone: string;
  weather_risk: string;
  resource_id: number;
  resource_code: string;
  resource_type: string;
  start_time: string;
  end_time: string;
  duration_minutes: number;
  delay_minutes: number;
  status: string;
}

export interface OptimizationResult {
  status: string;
  solver: string;
  optimization_score: number;
  solve_time_ms: number;
  schedules: OptimizationScheduleItem[];
  metrics: {
    total_missions: number;
    scheduled_missions: number;
    unassigned_missions: number;
    resource_utilization_pct: number;
    total_delay_minutes: number;
    weather_delays_adjusted: number;
    priorities_satisfied: Record<string, number>;
    baseline_comparison: {
      baseline_score: number;
      baseline_conflicts: number;
      baseline_delays_min: number;
      optimized_score: number;
      optimized_conflicts: number;
      delays_avoided_min: number;
      efficiency_gain_pct: number;
    };
  };
}

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

export interface StateWeatherItem {
  name: string;
  code: string;
  zone: string;
  lat: number;
  lon: number;
  temperature_2m: number | null;
  apparent_temperature: number | null;
  relative_humidity_2m: number | null;
  precipitation: number | null;
  rain: number | null;
  showers: number | null;
  snowfall: number | null;
  weather_code: number | null;
  weather_condition: string;
  icon_type: string;
  cloud_cover: number | null;
  wind_speed_10m: number | null;
  wind_direction_10m: number | null;
  wind_gusts_10m: number | null;
  risk_level: 'HIGH' | 'MEDIUM' | 'LOW' | 'UNKNOWN';
  risk_color: string;
  risk_reasons: string[];
  advisory: string;
  observation_time: string | null;
}

export interface LiveWeatherSummary {
  high_risk_count: number;
  medium_risk_count: number;
  low_risk_count: number;
  average_temperature_c: number | null;
  max_wind_speed_kmh: number | null;
  max_wind_state: string | null;
  rain_states_count: number;
  cloudy_states_count: number;
  overall_operational_threat: string;
  operational_summary: string;
}

export interface LiveIndiaWeatherResponse {
  status: 'LIVE' | 'STALE' | 'OFFLINE';
  is_stale: boolean;
  data_source: string;
  attribution: string;
  last_updated_utc: string | null;
  last_fetched_epoch: number;
  total_states_monitored: number;
  summary: LiveWeatherSummary;
  states: StateWeatherItem[];
  condition_cards?: WeatherConditionCard[];
  error_notice?: string | null;
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

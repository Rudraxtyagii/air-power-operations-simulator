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

// Modular Simulation Engine Types
export interface SimulationEventConfig {
  virtual_time_minutes: number;
  event_type: string;
  target_code: string;
  severity: string;
  description: string;
  parameters?: Record<string, any>;
}

export interface ScenarioSnapshot {
  id: number;
  scenario_id: number;
  snapshot_version: string;
  source_timestamp: string;
  data_provenance: string;
  resources_count: number;
  missions_count: number;
  weather_zones_count: number;
  data_freshness_status: string;
  created_at: string;
}

export interface SimulationStateStep {
  virtual_time_minutes: number;
  virtual_time_label: string;
  available_resources_count: number;
  in_mission_resources_count: number;
  maintenance_resources_count: number;
  unavailable_resources_count: number;
  active_missions_count: number;
  completed_missions_count: number;
  delayed_missions_count: number;
  fleet_availability_pct: number;
  average_delay_minutes: number;
  weather_risk_index: number;
}

export interface SimulationRunEvent {
  id: number;
  run_id: number;
  virtual_time_minutes: number;
  event_type: string;
  severity: string;
  target_code: string;
  description: string;
  applied_effect: string;
  created_at: string;
}

export interface SimulationRun {
  id: number;
  run_code: string;
  scenario_id: number;
  status: 'PENDING' | 'RUNNING' | 'PAUSED' | 'COMPLETED' | 'RESET' | 'FAILED';
  current_virtual_time_minutes: number;
  total_virtual_duration_minutes: number;
  time_step_minutes: number;
  execution_duration_ms: number;
  events_processed_count: number;
  validation_errors_count: number;
  metrics_summary: string;
  error_message?: string;
  started_at?: string;
  completed_at?: string;
  created_at: string;
}

export interface SimulationScenario {
  id: number;
  scenario_code: string;
  name: string;
  description: string;
  duration_minutes: number;
  time_step_minutes: number;
  random_seed: number;
  engine_version: string;
  status: string;
  events_config: string;
  created_at: string;
  updated_at: string;
  snapshot?: ScenarioSnapshot;
  latest_run?: SimulationRun;
}

export interface SimulationResults {
  scenario_id: number;
  run_id: number;
  run_code: string;
  status: string;
  execution_duration_ms: number;
  current_virtual_time_minutes: number;
  total_virtual_duration_minutes: number;
  metrics: Record<string, any>;
  baseline_vs_scenario: Record<string, any>;
  time_series: SimulationStateStep[];
  event_history: SimulationRunEvent[];
  simulated_resources: Array<{ code: string; status: string }>;
  simulated_missions: Array<{ code: string; status: string }>;
}

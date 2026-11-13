// Shapes of the JSON exchanged with the backend (must match backend/app).

export interface Site {
  id?: string | null;
  name: string;
  group?: string;
  lat: number;
  lon: number;
}

export interface HorizonPoint {
  az: number;
  el: number;
}

export interface TimelineRow {
  t: string;
  sun_az: number;
  sun_el: number;
  sun_visible: boolean;
  sun_disk_pct: number;
  earth_az: number;
  earth_el: number;
  earth_visible: boolean;
}

export interface TimeWindow {
  start: string;
  end: string;
  hours: number;
}

export interface NextChange {
  event: "set" | "rise" | "none_in_range";
  t: string | null;
}

export interface Metrics {
  total_hours: number;
  sunlight_pct: number;
  sunlight_hours: number;
  comm_pct: number;
  comm_hours: number;
  sun_and_earth_pct: number;
  sun_el_max_deg: number;
  sun_el_mean_deg: number;
  longest_darkness_hours: number;
  longest_no_comm_hours: number;
  sun_now: boolean;
  earth_now: boolean;
  next_sun_change: NextChange;
  next_earth_change: NextChange;
  sun_windows: TimeWindow[];
  comm_windows: TimeWindow[];
}

export interface SiteResult {
  id?: string | null;
  name: string;
  lat: number;
  lon: number;
  source: "dem" | "flat_horizon";
  site_height_m: number | null;
  horizon: HorizonPoint[];
  timeline: TimelineRow[];
  metrics: Metrics;
}

export interface VisibilityResponse {
  start: string;
  end: string;
  step_minutes: number;
  earth_mask_deg: number;
  sites: SiteResult[];
}

export interface VisibilityRequest {
  sites: Site[];
  start: string;
  end: string;
  step_minutes: number;
  earth_mask_deg: number;
}

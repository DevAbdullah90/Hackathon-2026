// web_frontend/lib/api.ts
// Central API service connecting Next.js web_frontend to FastAPI backend.

const LOCAL_API_BASE = "http://localhost:8000/api/v1";
const PROD_API_BASE = "https://abdullah9873-backend-rag-chatbot-v2.hf.space/api/v1";

export let API_BASE_URL = LOCAL_API_BASE;

// ─────────────────────────────────────────────────────────────────────────────
// 1. DATA MODELS & TYPES
// ─────────────────────────────────────────────────────────────────────────────

export interface Incident {
  id: string;
  location: string;
  lat: number;
  lng: number;
  severity_score: number;
  confidence: number;
  affected_radius_km: number;
  estimated_population: number;
  peak_impact_eta: string;
  status: string;
  risk_factors?: string[];
  created_at: string;
  disaster_type?: "flood" | "heatwave";
  confirmations_count?: number;
  refutations_count?: number;
}

export interface VehicleLocation {
  id: string;
  vehicle_id: string;
  vehicle_type: "rescue_boat" | "ambulance" | "utility_crew";
  incident_id: string;
  start_lat: number;
  start_lng: number;
  target_lat: number;
  target_lng: number;
  current_lat: number;
  current_lng: number;
  dispatch_time: string;
  duration_seconds: number;
  status: "en_route" | "arrived";
}

export interface Action {
  id: string;
  incident_id: string;
  type: string;
  status: string;
  predicted_side_effects?: string;
  metadata?: any;
  updated_at: string;
}

export interface ReasoningLog {
  id: string;
  incident_id: string;
  agent_name: string;
  log_text: string;
  log_level: string;
  created_at: string;
}

export interface ChainOfThought {
  id: string;
  incident_id: string;
  agent_name: string;
  cot_steps: string;
  created_at: string;
}

export interface Resource {
  id: string;
  type: string;
  total_count: number;
  available_count: number;
  assigned_to_incident?: string | null;
  location?: string | null;
  updated_at: string;
}

export interface DashboardStats {
  total_signals: number;
  active_crisis_sectors: number;
  total_agent_decisions: number;
  allocated_ambulances: number;
  allocated_rescue_crews: number;
}

export interface AgentWorkforceMember {
  agent: string;
  status: "IDLE" | "PROCESSING";
  active_incident: string | null;
}

export interface GlobalTimelineLog {
  id: string;
  incident_id: string | null;
  agent_name: string;
  log_text: string;
  log_level: string;
  created_at: string;
}

export interface Notification {
  id: string;
  incident_id: string;
  stakeholder: string;
  message: string;
  sent_at: string;
}

export interface SafeHaven {
  id: string;
  name: string;
  lat: number;
  lng: number;
  capacity: number;
  current_occupancy: number;
  created_at: string;
}

export interface SafeHavenRouteResponse {
  safe_haven: SafeHaven;
  path: { lat: number; lng: number }[];
  distance_km: number;
  avoided_flooded_zones_count: number;
}


export interface PipelineStatus {
  signal_id: string;
  incident_id: string | null;
  status: string; // 'PROCESSING' | 'CONFIRMED' | 'REJECTED'
  stage: string;
  stage_index: number;
  stage_status: string; // 'RUNNING' | 'COMPLETED' | 'FAILED' | 'SKIPPED'
  message: string;
  updated_at: string;
  agent_states?: Record<string, string>;
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. CURATED DEMO FALLBACK DATA (Demo Resilience)
// ─────────────────────────────────────────────────────────────────────────────

const nowStr = () => new Date().toISOString();

export const MOCK_INCIDENTS: Incident[] = [
  {
    id: "inc-jauhar",
    location: "Block 18 Jauhar, Gulistan-e-Jauhar, Karachi",
    lat: 24.9088,
    lng: 67.1282,
    severity_score: 8.9,
    confidence: 0.96,
    affected_radius_km: 1.8,
    estimated_population: 6400,
    peak_impact_eta: "12 min",
    status: "ACTIVE",
    risk_factors: ["heavy_rain", "drainage_blockage", "road_ponding"],
    created_at: new Date(Date.now() - 3600000).toISOString(),
    disaster_type: "flood",
  },
  {
    id: "inc-block13",
    location: "Block 13 Gulistan-e-Jauhar, Karachi",
    lat: 24.9142,
    lng: 67.1125,
    severity_score: 6.2,
    confidence: 0.89,
    affected_radius_km: 1.1,
    estimated_population: 3100,
    peak_impact_eta: "25 min",
    status: "ACTIVE",
    risk_factors: ["localized_ponding", "drainage_overflow"],
    created_at: new Date(Date.now() - 7200000).toISOString(),
    disaster_type: "flood",
  },
  {
    id: "inc-block15",
    location: "Block 15 Gulistan-e-Jauhar, Karachi",
    lat: 24.9031,
    lng: 67.1354,
    severity_score: 7.5,
    confidence: 0.92,
    affected_radius_km: 1.5,
    estimated_population: 4800,
    peak_impact_eta: "18 min",
    status: "ACTIVE",
    risk_factors: ["urban_runoff", "basement_flooding"],
    created_at: new Date(Date.now() - 10800000).toISOString(),
    disaster_type: "flood",
  },
  {
    id: "inc-saddar",
    location: "Saddar Market Area, Karachi",
    lat: 24.8607,
    lng: 67.0011,
    severity_score: 9.2,
    confidence: 0.98,
    affected_radius_km: 2.5,
    estimated_population: 18500,
    peak_impact_eta: "Immediate",
    status: "ACTIVE",
    risk_factors: ["extreme_heat", "high_wet_bulb", "power_outages", "dense_urban_heat_island"],
    created_at: new Date(Date.now() - 1800000).toISOString(),
    disaster_type: "heatwave",
  }
];

export const MOCK_RESOURCES: Resource[] = [
  { id: "r1", type: "ambulance", total_count: 10, available_count: 6, updated_at: nowStr() },
  { id: "r2", type: "rescue_team", total_count: 8, available_count: 5, updated_at: nowStr() },
  { id: "r3", type: "drainage_crew", total_count: 12, available_count: 8, updated_at: nowStr() },
  { id: "r4", type: "police_patrol", total_count: 15, available_count: 12, updated_at: nowStr() },
];

export const MOCK_ACTIONS: Record<string, Action[]> = {
  "inc-g10": [
    { id: "act-g10-1", incident_id: "inc-g10", type: "DEPLOY_DRAINAGE_CREW", status: "DISPATCHED", predicted_side_effects: "Clears drainage vents in G-10 Markaz. Expected to lower water level by 15cm/hr.", updated_at: nowStr() },
    { id: "act-g10-2", incident_id: "inc-g10", type: "DISPATCH_RESCUE", status: "IN PROGRESS", predicted_side_effects: "Ambulance units dispatched. High traffic on Jinnah Ave.", updated_at: nowStr() },
    { id: "act-g10-3", incident_id: "inc-g10", type: "ALERT_CITIZENS", status: "NOTIFIED", predicted_side_effects: "SMS alerts broadcast to all active mobile subscribers in F-9 & G-10.", updated_at: nowStr() },
  ],
  "inc-f6": [
    { id: "act-f6-1", incident_id: "inc-f6", type: "ALERT_CITIZENS", status: "NOTIFIED", predicted_side_effects: "Margalla hill run-off danger notification sent.", updated_at: nowStr() },
    { id: "act-f6-2", incident_id: "inc-f6", type: "DISPATCH_RESCUE", status: "DISPATCHED", predicted_side_effects: "Standby units deployed near Sector F-6.", updated_at: nowStr() },
  ],
  "inc-saddar": [
    { id: "act-saddar-1", incident_id: "inc-saddar", type: "ESTABLISH_COOLING_STATIONS", status: "COMPLETED", predicted_side_effects: "Erected shade canopies & hydration posts near Saddar bazaar. Lowered heat vulnerability.", updated_at: nowStr() },
    { id: "act-saddar-2", incident_id: "inc-saddar", type: "DEPLOY_WATER_TANKERS", status: "DISPATCHED", predicted_side_effects: "Water distribution tankers arriving to fill municipal heat-safety reserves.", updated_at: nowStr() },
    { id: "act-saddar-3", incident_id: "inc-saddar", type: "ALERT_CITIZENS", status: "NOTIFIED", predicted_side_effects: "Amber alert broadcast: restrict outdoor activity between 11 AM - 4 PM.", updated_at: nowStr() }
  ]
};

// ─────────────────────────────────────────────────────────────────────────────
// 3. CORE API CLIENT METHODS
// ─────────────────────────────────────────────────────────────────────────────

async function makeRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  const tryFetch = async (baseUrl: string) => {
    const url = `${baseUrl}${path}`;
    const res = await fetch(url, { ...options, headers });
    if (!res.ok) {
      throw new Error(`API HTTP Error: ${res.status} ${res.statusText}`);
    }
    return await res.json();
  };

  try {
    return await tryFetch(API_BASE_URL);
  } catch (err: any) {
    if (err.name === "TypeError" || (err.message && err.message.includes("Failed to fetch"))) {
      const fallbackUrl = API_BASE_URL === LOCAL_API_BASE ? PROD_API_BASE : LOCAL_API_BASE;
      console.warn(`[API] Connection to ${API_BASE_URL} failed. Switching to ${fallbackUrl}`);
      API_BASE_URL = fallbackUrl;
      try {
        return await tryFetch(API_BASE_URL);
      } catch (fallbackErr) {
        throw fallbackErr;
      }
    }
    throw err;
  }
}

export const api = {
  /**
   * Fetch active incidents list
   */
  async getActiveIncidents(): Promise<Incident[]> {
    try {
      const data = await makeRequest<any[]>("/incidents/active");
      if (!data || data.length === 0) return MOCK_INCIDENTS;
      return data.map((item) => ({
        id: String(item.id),
        location: item.location,
        lat: Number(item.lat),
        lng: Number(item.lng),
        severity_score: Number(item.severity_score),
        confidence: Number(item.confidence),
        affected_radius_km: Number(item.affected_radius_km || 1.0),
        estimated_population: Number(item.estimated_population || 1000),
        peak_impact_eta: item.peak_impact_eta || "N/A",
        status: item.status || "ACTIVE",
        risk_factors: item.risk_factors || [],
        created_at: item.created_at,
        disaster_type: item.disaster_type || "flood",
        confirmations_count: Number(item.confirmations_count || 0),
        refutations_count: Number(item.refutations_count || 0),
      }));
    } catch (err) {
      console.warn("🛡️ [API FALLBACK] getActiveIncidents() -> serving mock Islamabad sectors.", err);
      return MOCK_INCIDENTS;
    }
  },

  /**
   * Fetch planned actions for an incident
   */
  async getIncidentActions(incidentId: string): Promise<Action[]> {
    try {
      const data = await makeRequest<any[]>(`/incidents/${incidentId}/actions`);
      if (!data || data.length === 0) return MOCK_ACTIONS[incidentId] || [];
      return data.map((item) => ({
        id: String(item.id),
        incident_id: incidentId,
        type: item.type,
        status: item.status.toUpperCase(),
        predicted_side_effects: item.predicted_side_effects || "N/A",
        metadata: item.action_metadata || {},
        updated_at: item.updated_at,
      }));
    } catch (err) {
      console.warn(`🛡️ [API FALLBACK] getIncidentActions(${incidentId}) -> serving mock actions.`, err);
      return MOCK_ACTIONS[incidentId] || [];
    }
  },

  /**
   * Fetch a single incident by ID
   */
  async getIncidentById(incidentId: string): Promise<Incident> {
    try {
      const item = await makeRequest<any>(`/incidents/${incidentId}`);
      return {
        id: String(item.id),
        location: item.location,
        lat: Number(item.lat),
        lng: Number(item.lng),
        severity_score: Number(item.severity_score),
        confidence: Number(item.confidence),
        affected_radius_km: Number(item.affected_radius_km || 1.0),
        estimated_population: Number(item.estimated_population || 1000),
        peak_impact_eta: item.peak_impact_eta || "N/A",
        status: item.status || "ACTIVE",
        risk_factors: item.risk_factors || [],
        created_at: item.created_at,
        disaster_type: item.disaster_type || "flood",
        confirmations_count: Number(item.confirmations_count || 0),
        refutations_count: Number(item.refutations_count || 0),
      };
    } catch (err) {
      console.warn(`🛡️ [API FALLBACK] getIncidentById(${incidentId}) -> serving fallback.`, err);
      const found = MOCK_INCIDENTS.find(i => String(i.id) === String(incidentId));
      if (found) return found;
      throw err;
    }
  },

  /**
   * Fetch reasoning logs for a confirmed incident
   */
  async getIncidentLogs(incidentId: string): Promise<ReasoningLog[]> {
    try {
      const data = await makeRequest<any[]>(`/incidents/${incidentId}/logs`);
      if (!data) return [];
      return data.map((item) => ({
        id: String(item.id),
        incident_id: String(item.incident_id),
        agent_name: item.agent_name,
        log_text: item.log_text,
        log_level: item.log_level || "INFO",
        created_at: item.created_at,
      }));
    } catch (err) {
      console.warn(`🛡️ [API FALLBACK] getIncidentLogs(${incidentId}) -> serving empty logs.`, err);
      return [];
    }
  },

  /**
   * Fetch resource allocation matrices
   */
  async getResources(): Promise<Resource[]> {
    try {
      const data = await makeRequest<any[]>("/resources");
      if (!data || data.length === 0) return MOCK_RESOURCES;
      return data.map((item) => ({
        id: String(item.id),
        type: item.type,
        total_count: Number(item.total_count),
        available_count: Number(item.available_count),
        assigned_to_incident: item.assigned_to_incident,
        location: item.location,
        updated_at: item.updated_at,
      }));
    } catch (err) {
      console.warn("🛡️ [API FALLBACK] getResources() -> serving fallback emergency catalog.", err);
      return MOCK_RESOURCES;
    }
  },

  /**
   * Fetch core tactical dashboard stats counters
   */
  async getDashboardStats(): Promise<DashboardStats> {
    try {
      return await makeRequest<DashboardStats>("/dashboard/stats");
    } catch (err) {
      console.warn("🛡️ [API FALLBACK] getDashboardStats() -> serving fallback counters.", err);
      return {
        total_signals: 12,
        active_crisis_sectors: MOCK_INCIDENTS.length,
        total_agent_decisions: 36,
        allocated_ambulances: 4,
        allocated_rescue_crews: 3,
      };
    }
  },

  /**
   * Fetch active multi-agent status grid
   */
  async getAgentWorkforce(): Promise<AgentWorkforceMember[]> {
    try {
      return await makeRequest<AgentWorkforceMember[]>("/dashboard/agent-workforce");
    } catch (err) {
      console.warn("🛡️ [API FALLBACK] getAgentWorkforce() -> serving fallback agent workforce.", err);
      return [
        { agent: "Signal Agent", status: "IDLE", active_incident: null },
        { agent: "Detection Agent", status: "IDLE", active_incident: null },
        { agent: "Severity Agent", status: "IDLE", active_incident: null },
        { agent: "Verification Agent", status: "IDLE", active_incident: null },
        { agent: "Logging Agent", status: "IDLE", active_incident: null },
        { agent: "Resource Allocation Agent", status: "IDLE", active_incident: null },
        { agent: "Planning Agent", status: "IDLE", active_incident: null },
        { agent: "Notification Agent", status: "IDLE", active_incident: null },
      ];
    }
  },

  /**
   * Fetch global COT logstream
   */
  async getGlobalTimeline(): Promise<GlobalTimelineLog[]> {
    try {
      return await makeRequest<GlobalTimelineLog[]>("/dashboard/global-timeline");
    } catch (err) {
      console.warn("🛡️ [API FALLBACK] getGlobalTimeline() -> serving fallback timeline.", err);
      return [
        { id: "1", incident_id: "inc-g10", agent_name: "signal_agent", log_text: "Parsed raw mobile GPS signals from G-10 Markaz.", log_level: "INFO", created_at: nowStr() },
        { id: "2", incident_id: "inc-g10", agent_name: "detection_agent", log_text: "Flood crisis cluster identified at [33.6844, 73.0479]. Spatial confidence: 96%.", log_level: "WARNING", created_at: nowStr() },
        { id: "3", incident_id: "inc-f6", agent_name: "resource_allocation_agent", log_text: "Mobilized ambulance unit (id: r1) to F-6 sector incident.", log_level: "INFO", created_at: nowStr() },
      ];
    }
  },

  /**
   * Poll multi-agent pipeline progress tracking status
   */
  async getPipelineStatus(signalId: string): Promise<PipelineStatus> {
    try {
      const data = await makeRequest<any>(`/signals/${signalId}/status`);
      return {
        signal_id: String(data.signal_id),
        incident_id: data.incident_id ? String(data.incident_id) : null,
        status: data.status,
        stage: data.stage,
        stage_index: Number(data.stage_index),
        stage_status: data.stage_status,
        message: data.message,
        updated_at: data.updated_at,
        agent_states: data.agent_states || undefined,
      };
    } catch (err) {
      console.warn(`🛡️ [API FALLBACK] getPipelineStatus(${signalId}) -> serving mock status updates.`, err);
      return {
        signal_id: signalId,
        incident_id: "inc-jauhar",
        status: "CONFIRMED",
        stage: "logging_agent",
        stage_index: 8,
        stage_status: "COMPLETED",
        message: "Tactical plan complete. Public and local teams notified!",
        updated_at: nowStr(),
        agent_states: {
          signal_agent: "COMPLETED",
          detection_agent: "COMPLETED",
          verification_agent: "SKIPPED",
          severity_agent: "COMPLETED",
          resource_allocation_agent: "COMPLETED",
          planning_agent: "COMPLETED",
          notification_agent: "COMPLETED",
          logging_agent: "COMPLETED"
        }
      };
    }
  },

  /**
   * Trigger a random simulated mock telemetry signal in Islamabad
   */
  async triggerMockSignal(): Promise<{ signal_id: string; status?: string } | null> {
    try {
      const response = await makeRequest<any>("/signals/mock", {
        method: "POST",
      });
      if (response && response.status === "DUPLICATE") {
        return { signal_id: response.signal_id, status: "DUPLICATE" };
      }
      return { signal_id: String(response.id), status: "NEW" };
    } catch (err) {
      console.warn("🛡️ [API FALLBACK] triggerMockSignal() failed to hit backend.", err);
      return null;
    }
  },

  /**
   * Manually inject a custom flood signal to bypass duplicate checks.
   */
  async injectCustomSignal(payload: {
    city: string;
    source: string;
    type: string;
    comment: string;
    lat: number;
    lng: number;
  }): Promise<{ signal_id: string; status?: string } | null> {
    try {
      const response = await makeRequest<any>("/signals/inject", {
        method: "POST",
        body: JSON.stringify(payload)
      });
      if (response && response.status === "DUPLICATE") {
        return { signal_id: response.signal_id, status: "DUPLICATE" };
      }
      return { signal_id: String(response.id), status: "NEW" };
    } catch (err) {
      console.warn("🛡️ [API FALLBACK] injectCustomSignal() failed to hit backend.", err);
      return null;
    }
  },

  /**
   * Retrieve all stakeholder notifications generated for a specific incident.
   */
  async getIncidentNotifications(incidentId: string): Promise<Notification[]> {
    const MOCK_NOTIFICATIONS: Record<string, Notification[]> = {
      "inc-jauhar": [
        { id: "notif-1", incident_id: "inc-jauhar", stakeholder: "public", message: "URGENT FLOOD ALERT: Severe inundation reported in Gulistan-e-Jauhar Block 18. Avoid ground levels and relocate parked vehicles to high ground.", sent_at: nowStr() },
        { id: "notif-2", incident_id: "inc-jauhar", stakeholder: "police", message: "CRITICAL INCIDENT DISPATCH: Sector Command Karachi. Initiate road closures at Jauhar Chowrangi towards Block 18. Divert traffic to alternate arterial routes.", sent_at: nowStr() },
        { id: "notif-3", incident_id: "inc-jauhar", stakeholder: "utility", message: "INFRASTRUCTURE WARNING: Block 18 grid station area inundated. Shut down local transformers immediately to prevent electrical hazard.", sent_at: nowStr() },
        { id: "notif-4", incident_id: "inc-jauhar", stakeholder: "hospital", message: "MEDICAL STANDBY: Dow University Hospital & local trauma center. Prepare for possible waterborne incident inflow. Emergency backup power check required.", sent_at: nowStr() }
      ]
    };

    try {
      const data = await makeRequest<any[]>(`/incidents/${incidentId}/notifications`);
      if (!data || data.length === 0) return MOCK_NOTIFICATIONS[incidentId] || MOCK_NOTIFICATIONS["inc-jauhar"] || [];
      return data.map((item) => ({
        id: String(item.id),
        incident_id: String(item.incident_id),
        stakeholder: item.stakeholder,
        message: item.message,
        sent_at: item.sent_at
      }));
    } catch (err) {
      console.warn(`🛡️ [API FALLBACK] getIncidentNotifications(${incidentId}) -> serving fallback.`, err);
      return MOCK_NOTIFICATIONS[incidentId] || MOCK_NOTIFICATIONS["inc-jauhar"] || [];
    }
  },

  /**
   * Submit a citizen confirmation or refutation for an incident.
   */
  async verifyIncident(incidentId: string, vote: "confirm" | "refute"): Promise<Incident> {
    try {
      return await makeRequest<Incident>(`/incidents/${incidentId}/verify`, {
        method: "POST",
        body: JSON.stringify({ vote }),
      });
    } catch (err) {
      console.warn(`🛡️ [API FALLBACK] verifyIncident(${incidentId}, ${vote}) failed.`, err);
      throw err;
    }
  },

  /**
   * Trigger simulation execution for an incident
   */
  async triggerSimulation(incidentId: string): Promise<boolean> {
    try {
      await makeRequest<any>(`/simulation/trigger/${incidentId}`, {
        method: "POST"
      });
      return true;
    } catch (err) {
      console.warn(`🛡️ [API] triggerSimulation(${incidentId}) failed:`, err);
      return false;
    }
  },

  /**
   * Retrieve real-time vehicle locations (fleet telemetry).
   */
  async getFleetLocations(): Promise<VehicleLocation[]> {
    try {
      return await makeRequest<VehicleLocation[]>("/resources/fleet");
    } catch (err) {
      console.warn("🛡️ [API FALLBACK] getFleetLocations failed.", err);
      return [];
    }
  },

  /**
   * Fetch all municipal Safe Haven shelters.
   */
  async getSafeHavens(): Promise<SafeHaven[]> {
    try {
      return await makeRequest<SafeHaven[]>("/safe-havens");
    } catch (err) {
      console.warn("🛡️ [API FALLBACK] getSafeHavens failed. Serving mock shelters.", err);
      return [
        {
          id: "sh-g10",
          name: "G-10 Community Center",
          lat: 33.6650,
          lng: 73.0320,
          capacity: 500,
          current_occupancy: 420,
          created_at: nowStr()
        },
        {
          id: "sh-f8",
          name: "F-8 Markaz Shelter",
          lat: 33.7120,
          lng: 73.0420,
          capacity: 600,
          current_occupancy: 240,
          created_at: nowStr()
        },
        {
          id: "sh-cantt",
          name: "Karachi Cantonment Station",
          lat: 24.8465,
          lng: 67.0325,
          capacity: 1000,
          current_occupancy: 650,
          created_at: nowStr()
        },
        {
          id: "sh-gulshan",
          name: "Gulshan-e-Iqbal Town Office",
          lat: 24.9180,
          lng: 67.0970,
          capacity: 400,
          current_occupancy: 310,
          created_at: nowStr()
        }
      ];
    }
  },

  /**
   * Fetch route to the closest shelter.
   */
  async getEvacuationRoute(lat: number, lng: number): Promise<SafeHavenRouteResponse> {
    try {
      return await makeRequest<SafeHavenRouteResponse>(`/safe-havens/route?lat=${lat}&lng=${lng}`);
    } catch (err) {
      console.warn("🛡️ [API FALLBACK] getEvacuationRoute failed. Serving mock path.", err);
      const mockHavens = [
        { id: "sh-g10", name: "G-10 Community Center", lat: 33.6650, lng: 73.0320, capacity: 500, current_occupancy: 420, created_at: nowStr() },
        { id: "sh-f8", name: "F-8 Markaz Shelter", lat: 33.7120, lng: 73.0420, capacity: 600, current_occupancy: 240, created_at: nowStr() },
        { id: "sh-cantt", name: "Karachi Cantonment Station", lat: 24.8465, lng: 67.0325, capacity: 1000, current_occupancy: 650, created_at: nowStr() },
        { id: "sh-gulshan", name: "Gulshan-e-Iqbal Town Office", lat: 24.9180, lng: 67.0970, capacity: 400, current_occupancy: 310, created_at: nowStr() }
      ];
      const closest = mockHavens.reduce((prev, curr) => {
        const prevDist = Math.hypot(prev.lat - lat, prev.lng - lng);
        const currDist = Math.hypot(curr.lat - lat, curr.lng - lng);
        return currDist < prevDist ? prev : prev;
      });
      const path: { lat: number; lng: number }[] = [];
      const N = 15;
      for (let i = 0; i <= N; i++) {
        const t = i / N;
        path.push({
          lat: lat + t * (closest.lat - lat),
          lng: lng + t * (closest.lng - lng)
        });
      }
      return {
        safe_haven: closest,
        path,
        distance_km: Math.hypot(closest.lat - lat, closest.lng - lng) * 111.0,
        avoided_flooded_zones_count: 0
      };
    }
  },

  /**
   * Get simulation actions state for an incident
   */
  async getSimulationState(incidentId: string): Promise<Action[]> {
    try {
      const data = await makeRequest<any[]>(`/simulation/state/${incidentId}`);
      if (!data) return [];
      return data.map((item) => ({
        id: String(item.id),
        incident_id: incidentId,
        type: item.type,
        status: item.status.toUpperCase(),
        predicted_side_effects: item.predicted_side_effects || "N/A",
        metadata: item.action_metadata || {},
        updated_at: item.updated_at,
      }));
    } catch (err) {
      console.warn(`🛡️ [API] getSimulationState(${incidentId}) failed:`, err);
      return [];
    }
  }
};

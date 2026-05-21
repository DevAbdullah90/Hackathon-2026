import { CONFIG } from "../constants/config";

let activeApiBaseUrl = CONFIG.API_BASE_URL;
const PROD_API_BASE = "https://hackathon-2026-production-ff6c.up.railway.app";

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
  risk_factors?: any;
  created_at: string;
  disaster_type?: string;
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

export interface PipelineStatus {
  signal_id: string;
  incident_id: string | null;
  status: string; // 'PROCESSING' | 'CONFIRMED' | 'REJECTED'
  stage: string;
  stage_index: number;
  stage_status: string; // 'RUNNING' | 'COMPLETED' | 'FAILED'
  message: string;
  updated_at: string;
}



// ─────────────────────────────────────────────────────────────────────────────
// 2. ERROR STRUCTURES & HANDLERS
// ─────────────────────────────────────────────────────────────────────────────

export class ApiError extends Error {
  status: number;
  statusText: string;
  body: any;

  constructor(status: number, statusText: string, body: any) {
    super(`[API HTTP ${status}] ${statusText}`);
    this.name = "ApiError";
    this.status = status;
    this.statusText = statusText;
    this.body = body;
  }
}

export class NetworkError extends Error {
  constructor(message: string) {
    super(`[API NETWORK FAILURE] ${message}`);
    this.name = "NetworkError";
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. CURATED DEMO FALLBACK DATA (Demo Resilience)
// ─────────────────────────────────────────────────────────────────────────────

const now = () => new Date().toISOString();

const MOCK_INCIDENTS: Incident[] = [
  {
    id: "inc-g10",
    location: "G-10, Islamabad",
    lat: 33.6675,
    lng: 73.0303,
    severity_score: 8.9,
    confidence: 0.96,
    affected_radius_km: 1.8,
    estimated_population: 6400,
    peak_impact_eta: "12 min",
    status: "ACTIVE",
    risk_factors: ["heavy_rain", "drainage_blockage", "road_ponding"],
    created_at: "2026-05-17T09:20:00.000Z",
    disaster_type: "flood",
  },
  {
    id: "inc-g13",
    location: "G-13, Islamabad",
    lat: 33.6872,
    lng: 73.0156,
    severity_score: 6.2,
    confidence: 0.89,
    affected_radius_km: 1.1,
    estimated_population: 3100,
    peak_impact_eta: "25 min",
    status: "ACTIVE",
    risk_factors: ["moderate_flooding", "traffic_delay"],
    created_at: "2026-05-17T09:28:00.000Z",
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
    risk_factors: ["extreme_heat", "high_wet_bulb", "power_outages"],
    created_at: "2026-05-18T10:00:00.000Z",
    disaster_type: "heatwave",
  }
];

const MOCK_REASONING_LOGS: Record<string, ReasoningLog[]> = {
  "inc-g10": [
    {
      id: "log-1",
      incident_id: "inc-g10",
      agent_name: "detection_agent",
      log_text: "Received user GPS signal and confirmed water accumulation near G-10 service road.",
      log_level: "INFO",
      created_at: now(),
    },
    {
      id: "log-2",
      incident_id: "inc-g10",
      agent_name: "notification_agent",
      log_text: "Prepared stakeholder alerts for public, hospital, utility, traffic, 1122, and command center.",
      log_level: "INFO",
      created_at: now(),
    },
    {
      id: "log-3",
      incident_id: "inc-g10",
      agent_name: "simulation_engine",
      log_text: "Rescue dispatch and drainage response marked active in the execution timeline.",
      log_level: "INFO",
      created_at: now(),
    },
  ],
  "inc-g13": [
    {
      id: "log-1b",
      incident_id: "inc-g13",
      agent_name: "detection_agent",
      log_text: "Secondary rainfall pattern detected. Traffic matrix indicates congestion near G-13.",
      log_level: "INFO",
      created_at: now(),
    },
    {
      id: "log-2b",
      incident_id: "inc-g13",
      agent_name: "notification_agent",
      log_text: "Utility and traffic authority notifications queued with reduced severity priority.",
      log_level: "INFO",
      created_at: now(),
    },
  ],
  "inc-saddar": [
    {
      id: "log-saddar-1",
      incident_id: "inc-saddar",
      agent_name: "detection_agent",
      log_text: "Satellite thermal data confirms wet-bulb index critical zone. Local sub-stations shut down due to transformer overheating.",
      log_level: "WARNING",
      created_at: now(),
    },
    {
      id: "log-saddar-2",
      incident_id: "inc-saddar",
      agent_name: "notification_agent",
      log_text: "Amber emergency grid warnings broadcast. Heat relief services staging hydration points.",
      log_level: "INFO",
      created_at: now(),
    },
  ]
};

const MOCK_COT_LOGS: Record<string, ChainOfThought[]> = {
  "inc-g10": [
    {
      id: "cot-1",
      incident_id: "inc-g10",
      agent_name: "signal_agent",
      cot_steps: "1. Scan incoming user GPS coords: lat=33.6675, lng=73.0303.\n2. Match with historical flooding points in sector G-10.\n3. Trigger high confidence (96%) alert.",
      created_at: now(),
    },
    {
      id: "cot-2",
      incident_id: "inc-g10",
      agent_name: "severity_agent",
      cot_steps: "1. Pull affected radius: 1.8km.\n2. Calculate population density mapping -> estimated 6,400 people.\n3. Check critical assets in radius -> 1 Hospital (nearby), 2 schools.\n4. Synthesize final severity score: 8.9 (Critical Crisis Level).",
      created_at: now(),
    },
  ],
  "inc-g13": [
    {
      id: "cot-1b",
      incident_id: "inc-g13",
      agent_name: "signal_agent",
      cot_steps: "1. Scan incoming user GPS coords: lat=33.6872, lng=73.0156.\n2. Minor ponding reported near G-13 market area.\n3. Trigger medium confidence (89%) alert.",
      created_at: now(),
    },
    {
      id: "cot-2b",
      incident_id: "inc-g13",
      agent_name: "severity_agent",
      cot_steps: "1. Pull affected radius: 1.1km.\n2. Calculate population density mapping -> estimated 3,100 people.\n3. Check critical assets in radius -> 1 local clinic, 1 highway link.\n4. Synthesize final severity score: 6.2 (Moderate Level).",
      created_at: now(),
    },
  ],
  "inc-saddar": [
    {
      id: "cot-saddar-1",
      incident_id: "inc-saddar",
      agent_name: "signal_agent",
      cot_steps: "1. Scan region coordinates for thermal extremes.\n2. Correlate weather telemetry showing temperatures exceeding 46°C with wet-bulb sensor readings.\n3. Identify power grid overload signals.",
      created_at: now(),
    },
    {
      id: "cot-saddar-2",
      incident_id: "inc-saddar",
      agent_name: "severity_agent",
      cot_steps: "1. Parse high-density urban sector size and active heat dome size.\n2. Estimate affected population: 18,500 people.\n3. Detect active electricity grid failure.\n4. Calculate severity score: 9.2 (Extreme Threat Severity).",
      created_at: now(),
    },
  ]
};

const MOCK_ACTIONS: Record<string, Action[]> = {
  "inc-g10": [
    {
      id: "action-1",
      incident_id: "inc-g10",
      type: "DISPATCH_RESCUE",
      status: "COMPLETED",
      predicted_side_effects: "Reduced congestion on main access road.",
      updated_at: now(),
    },
    {
      id: "action-2",
      incident_id: "inc-g10",
      type: "DEPLOY_DRAINAGE_CREW",
      status: "COMPLETED",
      predicted_side_effects: "Water level stabilizes within 20 minutes.",
      updated_at: now(),
    },
    {
      id: "action-3",
      incident_id: "inc-g10",
      type: "NOTIFY_TRAFFIC_AUTHORITY",
      status: "COMPLETED",
      predicted_side_effects: "Alternate routes opened around affected sector.",
      updated_at: now(),
    },
  ],
  "inc-g13": [
    {
      id: "action-4",
      incident_id: "inc-g13",
      type: "MONITOR_RAINFALL",
      status: "COMPLETED",
      predicted_side_effects: "Early warning issued to nearby residents.",
      updated_at: now(),
    },
    {
      id: "action-5",
      incident_id: "inc-g13",
      type: "PREPARE_RESPONSE_TEAM",
      status: "COMPLETED",
      predicted_side_effects: "Standby resources assigned for rapid escalation.",
      updated_at: now(),
    },
  ],
  "inc-saddar": [
    {
      id: "action-saddar-1",
      incident_id: "inc-saddar",
      type: "ESTABLISH_COOLING_STATIONS",
      status: "COMPLETED",
      predicted_side_effects: "Shade shelters & fans active. Hydration kits distributed.",
      updated_at: now(),
    },
    {
      id: "action-saddar-2",
      incident_id: "inc-saddar",
      type: "DEPLOY_WATER_TANKERS",
      status: "COMPLETED",
      predicted_side_effects: "Replenished local backup storage reserves.",
      updated_at: now(),
    },
    {
      id: "action-saddar-3",
      incident_id: "inc-saddar",
      type: "ALERT_CITIZENS",
      status: "COMPLETED",
      predicted_side_effects: "Extreme heat advisory sent.",
      updated_at: now(),
    },
  ]
};

const MOCK_RESOURCES: Resource[] = [
  { id: "res-1", type: "ambulance", total_count: 12, available_count: 8, location: "Sector G-9 Depot", updated_at: now() },
  { id: "res-2", type: "rescue_team", total_count: 8, available_count: 5, location: "Saddar Headquarters", updated_at: now() },
  { id: "res-3", type: "drainage_crew", total_count: 15, available_count: 11, location: "CDA Staging Area 2", updated_at: now() },
  { id: "res-4", type: "police_unit", total_count: 20, available_count: 14, location: "Islamabad Traffic Base", updated_at: now() },
];


// ─────────────────────────────────────────────────────────────────────────────
// 4. PREMIUM REQUEST ORCHESTRATION ENGINE (Vibe Coder Grade)
// ─────────────────────────────────────────────────────────────────────────────

const DEFAULT_TIMEOUT = 10000; // 10 seconds timeout protection
const MAX_RETRIES = 3;
const RETRY_DELAY_BASE = 500; // milliseconds

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * High-End Central Request Orchestrator
 * Supports Abort Timeouts, Silent Retries with Exponential Backoff, 
 * Structured Logging, and Auto-Fallback to mock data on server death.
 */
async function makeRequest<T>(
  path: string,
  options: RequestInit = {},
  retriesLeft = MAX_RETRIES,
  delay = RETRY_DELAY_BASE,
  requestBaseUrl = activeApiBaseUrl
): Promise<T> {
  const url = `${requestBaseUrl}${path}`;

  const requestOptions: RequestInit = {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...(options.headers || {}),
    },
  };

  const startTime = Date.now();

  try {
    console.log(`📡 [API CALL] ${requestOptions.method || "GET"} ${path} (Attempt: ${MAX_RETRIES - retriesLeft + 1}/${MAX_RETRIES})`);

    // Pure JS timeout race that works flawlessly on all mobile devices and Expo Go
    const fetchPromise = fetch(url, requestOptions);
    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error("Timeout")), DEFAULT_TIMEOUT)
    );

    const response = await Promise.race([fetchPromise, timeoutPromise]);

    const duration = Date.now() - startTime;
    console.log(`✨ [API RESPONSE] ${requestOptions.method || "GET"} ${path} -> HTTP ${response.status} (${duration}ms)`);

    if (!response.ok) {
      let body: any = null;
      try {
        body = await response.json();
      } catch {
        body = await response.text();
      }
      throw new ApiError(response.status, response.statusText, body);
    }

    // Success response parsing
    return (await response.json()) as T;
  } catch (error: any) {
    const isTimeout = error.message === "Timeout";
    const isNetworkError =
      error instanceof TypeError ||
      error.message?.includes("Network request failed") ||
      error.message?.includes("Aborted") ||
      error.name === "AbortError";

    console.warn(`⚠️ [API FAILURE] ${requestOptions.method || "GET"} ${path}: ${error.message}`);

    // If it's a transient failure (network/timeout/Wi-Fi dropped packet), attempt retry
    if ((isTimeout || isNetworkError) && retriesLeft > 0) {
      if (retriesLeft === MAX_RETRIES) {
        // Swap to production fallback on first failure, only if it hasn't changed
        if (activeApiBaseUrl === requestBaseUrl) {
          const fallback = activeApiBaseUrl === CONFIG.API_BASE_URL ? PROD_API_BASE : CONFIG.API_BASE_URL;
          console.log(`🔄 [API FALLBACK] Switching API base to ${fallback}`);
          activeApiBaseUrl = fallback;
        }
      }
      console.log(`🔄 [API RETRY] Retrying in ${delay}ms... (${retriesLeft} retries remaining)`);
      await sleep(delay);
      return makeRequest<T>(path, options, retriesLeft - 1, delay * 2, activeApiBaseUrl);
    }

    // Rethrow standard HTTP ApiErrors (like 404, 400) to let caller handle them
    if (error instanceof ApiError) {
      throw error;
    }

    // Wrap remaining generic exceptions
    throw new NetworkError(error.message || "Unknown communication failure");
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. UNIFIED HIGH-END API LAYER (With Fallback Resilience)
// ─────────────────────────────────────────────────────────────────────────────

export const api = {
  /**
   * Get active WebSocket connection URL dynamically based on activeApiBaseUrl
   */
  getActiveWsUrl(path: string): string {
    const wsBase = activeApiBaseUrl.replace(/^http/, "ws");
    return `${wsBase}${path}`;
  },

  /**
   * Fetch all active flood incidents.
   * If remote backend is unreachable, gracefully falls back to mock Islamabad list.
   */
  async getActiveIncidents(): Promise<Incident[]> {
    try {
      const data = await makeRequest<any[]>("/api/v1/incidents/active");
      // Map database types to frontend keys
      return data.map((item) => ({
        id: String(item.id),
        location: item.location,
        lat: item.lat,
        lng: item.lng,
        severity_score: item.severity_score || 0,
        confidence: item.confidence || 1.0,
        affected_radius_km: item.affected_radius_km || 0.5,
        estimated_population: item.estimated_population || 0,
        peak_impact_eta: item.peak_impact_eta || "NOW",
        status: item.status.toUpperCase(),
        risk_factors: item.risk_factors,
        created_at: item.created_at,
        disaster_type: item.disaster_type || "flood",
      }));
    } catch (err) {
      console.log("🛡️ [API FALLBACK] getActiveIncidents() -> Serving cached mock Islamabad cluster.");
      return MOCK_INCIDENTS;
    }
  },

  /**
   * Fetch single incident details.
   */
  async getIncident(id: string): Promise<Incident | null> {
    try {
      const item = await makeRequest<any>(`/api/v1/incidents/${id}`);
      return {
        id: String(item.id),
        location: item.location,
        lat: item.lat,
        lng: item.lng,
        severity_score: item.severity_score || 0,
        confidence: item.confidence || 1.0,
        affected_radius_km: item.affected_radius_km || 0.5,
        estimated_population: item.estimated_population || 0,
        peak_impact_eta: item.peak_impact_eta || "NOW",
        status: item.status.toUpperCase(),
        risk_factors: item.risk_factors,
        created_at: item.created_at,
        disaster_type: item.disaster_type || "flood",
      };
    } catch (err) {
      console.log(`🛡️ [API FALLBACK] getIncident(${id}) -> Serving from cache.`);
      return MOCK_INCIDENTS.find((inc) => inc.id === id) || MOCK_INCIDENTS[0];
    }
  },

  async reportFlood(lat: number, lng: number, source: string = "user_gps", type: string = "flood"): Promise<{ signal_id: string; status?: string } | null> {
    try {
      const response = await makeRequest<any>("/api/v1/signals/", {
        method: "POST",
        body: JSON.stringify({
          source: source,
          lat: lat,
          lng: lng,
          type: type,
          raw_payload: {
            lat: lat,
            lng: lng,
            type: type,
            source: source,
          },
        }),
      });
      if (response && response.status === "DUPLICATE") {
        return { signal_id: response.signal_id, status: "DUPLICATE" };
      }
      return { signal_id: String(response.id), status: "NEW" };
    } catch (err) {
      console.log(`🛡️ [API FALLBACK] reportFlood() -> Simulated successfully offline with source: ${source} and type: ${type}.`);
      return { signal_id: "sig-" + Math.random().toString(36).substr(2, 9), status: "MOCK" };
    }
  },

  /**
   * Start actions lifecycle simulation loop.
   */
  async triggerSimulation(id: string): Promise<boolean> {
    try {
      const response = await makeRequest<any>(`/api/v1/simulation/trigger/${id}`, {
        method: "POST",
      });
      return response && response.status === "success";
    } catch (err) {
      console.log(`🛡️ [API FALLBACK] triggerSimulation(${id}) -> Offline execution simulation.`);
      return true;
    }
  },

  /**
   * Fetch current simulation state / actions for an incident.
   */
  async getSimulationState(id: string): Promise<Action[]> {
    try {
      const data = await makeRequest<any[]>(`/api/v1/simulation/state/${id}`);
      if (data && data.length > 0) {
        return data.map((item) => ({
          id: String(item.id),
          incident_id: id,
          type: item.type,
          status: item.status.toUpperCase(),
          predicted_side_effects: item.predicted_side_effects,
          metadata: item.metadata,
          updated_at: item.updated_at,
        }));
      }
      console.log(`🛡️ [API FALLBACK] 0 actions returned from DB for incident ${id} -> Serving fallback execution list.`);
      return MOCK_ACTIONS[id] || this.getMockSimulationState(id);
    } catch (err) {
      console.log(`🛡️ [API FALLBACK] getSimulationState(${id}) failed -> Serving offline execution list.`);
      return MOCK_ACTIONS[id] || this.getMockSimulationState(id);
    }
  },

  updateMockActions(incidentId: string, actions: Action[]) {
    MOCK_ACTIONS[incidentId] = actions;
  },

  /**
   * Get basic fallback timeline states.
   */
  getMockSimulationState(incidentId: string): Action[] {
    const timestamp = now();
    return [
      { id: "a1", incident_id: incidentId, type: "DISPATCH_RESCUE", status: "PENDING", predicted_side_effects: "Mobilises local relief teams.", updated_at: timestamp },
      { id: "a2", incident_id: incidentId, type: "DEPLOY_DRAINAGE_CREW", status: "PENDING", predicted_side_effects: "Starts structural dewatering.", updated_at: timestamp },
      { id: "a3", incident_id: incidentId, type: "ALERT_CITIZENS", status: "PENDING", predicted_side_effects: "Disseminates emergency guidance.", updated_at: timestamp },
    ];
  },


  /**
   * Fetch reasoning traces for an incident.
   * Leverages the newly deployed DB endpoint before subscribing to websocket.
   */
  async getReasoningLogs(incidentId: string): Promise<ReasoningLog[]> {
    try {
      const data = await makeRequest<any[]>(`/api/v1/incidents/${incidentId}/logs`);
      return data.map((item) => ({
        id: String(item.id),
        incident_id: String(item.incident_id),
        agent_name: item.agent_name,
        log_text: item.log_text,
        log_level: item.log_level || "INFO",
        created_at: item.created_at,
      }));
    } catch (err) {
      console.log(`🛡️ [API FALLBACK] getReasoningLogs(${incidentId}) -> Serving mock narrative logs.`);
      return MOCK_REASONING_LOGS[incidentId] || [];
    }
  },

  /**
   * Fetch detailed step-by-step Chain of Thought (CoT) logs for an incident.
   */
  async getChainOfThought(incidentId: string): Promise<ChainOfThought[]> {
    try {
      const data = await makeRequest<any[]>(`/api/v1/incidents/${incidentId}/cot`);
      return data.map((item) => ({
        id: String(item.id),
        incident_id: String(item.incident_id),
        agent_name: item.agent_name,
        cot_steps: item.cot_steps,
        created_at: item.created_at,
      }));
    } catch (err) {
      console.log(`🛡️ [API FALLBACK] getChainOfThought(${incidentId}) -> Serving mock CoT traces.`);
      return MOCK_COT_LOGS[incidentId] || [];
    }
  },

  /**
   * Fetch all actions associated with an incident using the newly implemented REST endpoint.
   */
  async getIncidentActions(incidentId: string): Promise<Action[]> {
    try {
      const data = await makeRequest<any[]>(`/api/v1/incidents/${incidentId}/actions`);
      return data.map((item) => ({
        id: String(item.id),
        incident_id: incidentId,
        type: item.type,
        status: item.status.toUpperCase(),
        predicted_side_effects: item.predicted_side_effects,
        metadata: item.action_metadata,
        updated_at: item.updated_at,
      }));
    } catch (err) {
      console.log(`🛡️ [API FALLBACK] getIncidentActions(${incidentId}) failed -> Falling back to simulationTimeline cache.`);
      return this.getSimulationState(incidentId);
    }
  },

  /**
   * Fetch all emergency resources and current allocations.
   */
  async getResources(): Promise<Resource[]> {
    try {
      const data = await makeRequest<any[]>("/api/v1/resources");
      return data.map((item) => ({
        id: String(item.id),
        type: item.type,
        total_count: item.total_count,
        available_count: item.available_count,
        assigned_to_incident: item.assigned_to_incident,
        location: item.location,
        updated_at: item.updated_at,
      }));
    } catch (err) {
      console.log("🛡️ [API FALLBACK] getResources() failed -> serving mock resources.");
      return MOCK_RESOURCES;
    }
  },

  /**
   * Poll multi-agent pipeline progress tracking status.
   */
  async getPipelineStatus(signalId: string): Promise<PipelineStatus> {
    try {
      const data = await makeRequest<any>(`/api/v1/signals/${signalId}/status`);
      return {
        signal_id: String(data.signal_id),
        incident_id: data.incident_id ? String(data.incident_id) : null,
        status: data.status,
        stage: data.stage,
        stage_index: data.stage_index,
        stage_status: data.stage_status,
        message: data.message,
        updated_at: data.updated_at,
      };
    } catch (err) {
      console.log(`🛡️ [API FALLBACK] getPipelineStatus(${signalId}) failed -> serving local simulated progress.`);
      // Mock step-by-step telemetry progress offline
      return {
        signal_id: signalId,
        incident_id: "inc-g10",
        status: "CONFIRMED",
        stage: "notification_agent",
        stage_index: 6,
        stage_status: "COMPLETED",
        message: "Tactical plan complete. Public and local teams notified! (Mocked Confirmed)",
        updated_at: now()
      };
    }
  },

  /**
   * Fetch Web Dashboard stats
   */
  async getDashboardStats(): Promise<DashboardStats> {
    try {
      return await makeRequest<DashboardStats>("/api/v1/dashboard/stats");
    } catch (err) {
      console.log("🛡️ [API FALLBACK] getDashboardStats() -> serving fallback counters.");
      return {
        total_signals: 14,
        active_crisis_sectors: MOCK_INCIDENTS.length,
        total_agent_decisions: 48,
        allocated_ambulances: 4,
        allocated_rescue_crews: 3,
      };
    }
  },

  /**
   * Fetch live agent workforce state
   */
  async getAgentWorkforce(): Promise<AgentWorkforceMember[]> {
    try {
      return await makeRequest<AgentWorkforceMember[]>("/api/v1/dashboard/agent-workforce");
    } catch (err) {
      console.log("🛡️ [API FALLBACK] getAgentWorkforce() -> serving mock agent workforce.");
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
   * Fetch global timeline activity
   */
  async getGlobalTimeline(): Promise<GlobalTimelineLog[]> {
    try {
      return await makeRequest<GlobalTimelineLog[]>("/api/v1/dashboard/global-timeline");
    } catch (err) {
      console.log("🛡️ [API FALLBACK] getGlobalTimeline() -> serving mock global activity.");
      return [
        { id: "1", incident_id: "inc-g10", agent_name: "signal_agent", log_text: "System initialized signal trace verification", log_level: "INFO", created_at: now() },
        { id: "2", incident_id: "inc-g10", agent_name: "severity_agent", log_text: "Assessed G-10 Markaz rainfall severity to 8.9", log_level: "WARNING", created_at: now() },
        { id: "3", incident_id: "inc-g13", agent_name: "resource_allocation_agent", log_text: "Standby rescue assets allocated for sector G-13", log_level: "INFO", created_at: now() },
      ];
    }
  },

  /**
   * Trigger a random simulated mock telemetry signal in Islamabad
   */
  async triggerMockSignal(): Promise<{ signal_id: string; status?: string } | null> {
    try {
      const response = await makeRequest<any>("/api/v1/signals/mock", {
        method: "POST",
      });
      if (response && response.status === "DUPLICATE") {
        return { signal_id: response.signal_id, status: "DUPLICATE" };
      }
      return { signal_id: String(response.id), status: "NEW" };
    } catch (err) {
      console.log("🛡️ [API FALLBACK] triggerMockSignal() -> generated simulated signal locally offline.");
      return { signal_id: "sig-" + Math.random().toString(36).substr(2, 9), status: "MOCK" };
    }
  },

  /**
   * Submit citizen vote (confirm/refute) on an incident.
   */
  async verifyIncident(incidentId: string, vote: "confirm" | "refute"): Promise<Incident> {
    try {
      return await makeRequest<Incident>(`/api/v1/incidents/${incidentId}/verify`, {
        method: "POST",
        body: JSON.stringify({ vote }),
      });
    } catch (err) {
      console.log(`🛡️ [API FALLBACK] verifyIncident(${incidentId}, ${vote}) failed.`, err);
      throw err;
    }
  },

  /**
   * Retrieve real-time vehicle locations (fleet telemetry).
   */
  async getFleetLocations(): Promise<VehicleLocation[]> {
    try {
      return await makeRequest<VehicleLocation[]>("/api/v1/resources/fleet");
    } catch (err) {
      console.log("🛡️ [API FALLBACK] getFleetLocations() failed.", err);
      return [];
    }
  },

  /**
   * Retrieve all municipal shelters.
   */
  async getSafeHavens(): Promise<SafeHaven[]> {
    try {
      return await makeRequest<SafeHaven[]>("/api/v1/safe-havens");
    } catch (err) {
      console.log("🛡️ [API FALLBACK] getSafeHavens() failed -> serving mock shelters.");
      return [
        { id: "sh-g10", name: "G-10 Community Center", lat: 33.6650, lng: 73.0320, capacity: 500, current_occupancy: 420, created_at: now() },
        { id: "sh-f8", name: "F-8 Markaz Shelter", lat: 33.7120, lng: 73.0420, capacity: 600, current_occupancy: 240, created_at: now() },
        { id: "sh-cantt", name: "Karachi Cantonment Station", lat: 24.8465, lng: 67.0325, capacity: 1000, current_occupancy: 650, created_at: now() },
        { id: "sh-gulshan", name: "Gulshan-e-Iqbal Town Office", lat: 24.9180, lng: 67.0970, capacity: 400, current_occupancy: 310, created_at: now() }
      ];
    }
  },

  /**
   * Get dynamic evacuation route to the closest shelter.
   */
  async getEvacuationRoute(lat: number, lng: number): Promise<SafeHavenRouteResponse> {
    try {
      return await makeRequest<SafeHavenRouteResponse>(`/api/v1/safe-havens/route?lat=${lat}&lng=${lng}`);
    } catch (err) {
      console.log("🛡️ [API FALLBACK] getEvacuationRoute() failed -> generating mock path.");
      const mockHavens = [
        { id: "sh-g10", name: "G-10 Community Center", lat: 33.6650, lng: 73.0320, capacity: 500, current_occupancy: 420, created_at: now() },
        { id: "sh-f8", name: "F-8 Markaz Shelter", lat: 33.7120, lng: 73.0420, capacity: 600, current_occupancy: 240, created_at: now() },
        { id: "sh-cantt", name: "Karachi Cantonment Station", lat: 24.8465, lng: 67.0325, capacity: 1000, current_occupancy: 650, created_at: now() },
        { id: "sh-gulshan", name: "Gulshan-e-Iqbal Town Office", lat: 24.9180, lng: 67.0970, capacity: 400, current_occupancy: 310, created_at: now() }
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
  }
};

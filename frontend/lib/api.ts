import { CONFIG } from "../constants/config";

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
  },
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
};

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
  delay = RETRY_DELAY_BASE
): Promise<T> {
  const url = `${CONFIG.API_BASE_URL}${path}`;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT);

  const requestOptions: RequestInit = {
    ...options,
    signal: controller.signal,
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...(options.headers || {}),
    },
  };

  const startTime = Date.now();

  try {
    console.log(`📡 [API CALL] ${requestOptions.method || "GET"} ${path} (Attempt: ${MAX_RETRIES - retriesLeft + 1}/${MAX_RETRIES})`);

    const response = await fetch(url, requestOptions);
    clearTimeout(timeoutId);

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
    clearTimeout(timeoutId);

    const isTimeout = error.name === "AbortError";
    const isNetworkError = error instanceof TypeError || error.message?.includes("Network request failed");

    console.warn(`⚠️ [API FAILURE] ${requestOptions.method || "GET"} ${path}: ${error.message}`);

    // If it's a transient failure (network/timeout), attempt exponential backoff retry
    if ((isTimeout || isNetworkError) && retriesLeft > 0) {
      console.log(`🔄 [API RETRY] Retrying in ${delay}ms... (${retriesLeft} retries remaining)`);
      await sleep(delay);
      return makeRequest<T>(path, options, retriesLeft - 1, delay * 2);
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
      };
    } catch (err) {
      console.log(`🛡️ [API FALLBACK] getIncident(${id}) -> Serving from cache.`);
      return MOCK_INCIDENTS.find((inc) => inc.id === id) || MOCK_INCIDENTS[0];
    }
  },

  /**
   * Transmit user GPS flood signal into the live multi-agent pipeline.
   */
  async reportFlood(lat: number, lng: number): Promise<boolean> {
    try {
      const response = await makeRequest<any>("/api/v1/signals/", {
        method: "POST",
        body: JSON.stringify({
          source: "user_gps",
          lat: lat,
          lng: lng,
          type: "flood",
          raw_payload: {
            lat: lat,
            lng: lng,
            type: "flood",
            source: "user_gps",
          },
        }),
      });
      return response && response.status !== "DUPLICATE";
    } catch (err) {
      console.log("🛡️ [API FALLBACK] reportFlood() -> Simulated successfully offline.");
      return true;
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
      return data.map((item) => ({
        id: String(item.id),
        incident_id: id,
        type: item.type,
        status: item.status.toUpperCase(),
        predicted_side_effects: item.predicted_side_effects,
        metadata: item.metadata,
        updated_at: item.updated_at,
      }));
    } catch (err) {
      console.log(`🛡️ [API FALLBACK] getSimulationState(${id}) -> Serving offline execution list.`);
      return MOCK_ACTIONS[id] || this.getMockSimulationState(id);
    }
  },

  /**
   * Get basic fallback timeline states.
   */
  getMockSimulationState(incidentId: string): Action[] {
    const timestamp = now();
    return [
      { id: "a1", incident_id: incidentId, type: "Rescue Dispatch", status: "COMPLETED", updated_at: timestamp },
      { id: "a2", incident_id: incidentId, type: "Drainage Activation", status: "COMPLETED", updated_at: timestamp },
      { id: "a3", incident_id: incidentId, type: "Utility Shutdown", status: "COMPLETED", updated_at: timestamp },
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
};

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
  created_at: string;
}

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
      created_at: now(),
    },
    {
      id: "log-2",
      incident_id: "inc-g10",
      agent_name: "notification_agent",
      log_text: "Prepared stakeholder alerts for public, hospital, utility, traffic, 1122, and command center.",
      created_at: now(),
    },
    {
      id: "log-3",
      incident_id: "inc-g10",
      agent_name: "simulation_engine",
      log_text: "Rescue dispatch and drainage response marked active in the execution timeline.",
      created_at: now(),
    },
  ],
  "inc-g13": [
    {
      id: "log-1b",
      incident_id: "inc-g13",
      agent_name: "detection_agent",
      log_text: "Secondary rainfall pattern detected. Traffic matrix indicates congestion near G-13.",
      created_at: now(),
    },
    {
      id: "log-2b",
      incident_id: "inc-g13",
      agent_name: "notification_agent",
      log_text: "Utility and traffic authority notifications queued with reduced severity priority.",
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

export const api = {
  // --- Incidents ---
  async getActiveIncidents(): Promise<Incident[]> {
    return MOCK_INCIDENTS;
  },

  async getIncident(id: string): Promise<Incident | null> {
    return MOCK_INCIDENTS.find((incident) => incident.id === id) ?? MOCK_INCIDENTS[0] ?? null;
  },

  // --- Signals ---
  async reportFlood(lat: number, lng: number): Promise<boolean> {
    console.log("Mock flood report received:", { lat, lng, source: "user_gps", type: "flood" });
    return true;
  },

  // --- Simulation ---
  async triggerSimulation(id: string): Promise<boolean> {
    console.log("Mock simulation trigger:", id);
    return true;
  },

  async getSimulationState(id: string): Promise<Action[]> {
    return MOCK_ACTIONS[id] ?? this.getMockSimulationState(id);
  },

  // Helper for demo when backend is incomplete
  getMockSimulationState(incidentId: string): Action[] {
    const timestamp = now();
    return [
      { id: "a1", incident_id: incidentId, type: "Rescue Dispatch", status: "COMPLETED", updated_at: timestamp },
      { id: "a2", incident_id: incidentId, type: "Drainage Activation", status: "COMPLETED", updated_at: timestamp },
      { id: "a3", incident_id: incidentId, type: "Utility Shutdown", status: "COMPLETED", updated_at: timestamp },
    ];
  },

  async getReasoningLogs(incidentId: string): Promise<ReasoningLog[]> {
    return MOCK_REASONING_LOGS[incidentId] ?? [];
  },
};

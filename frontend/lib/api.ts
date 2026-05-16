// ============================================
// lib/api.ts
// MOCK DATA LAYER — swap with real API later
// Owner: Ayesha (Frontend Lead)
// ============================================

const BASE_URL = "http://localhost:8000";
const WS_URL   = "ws://localhost:8000";
// TODO: Update these when Abdullah shares backend URL

export type Incident = {
  id: string;
  location: string;
  severity: number;
  confidence: number;
  status: "monitoring" | "confirmed" | "resolved";
  lat: number;
  lng: number;
  affected: number;
  eta: string;
  risk_factors: string[];
};

export type AgentLog = {
  id: string;
  agent: string;
  time: string;
  phase: "OBSERVE" | "REASON" | "DECIDE" | "ACT" | "EVALUATE";
  message: string;
};

export type SimAction = {
  id: string;
  type: string;
  status: "PENDING" | "ACTIVE" | "COMPLETED" | "FAILED";
  time: string;
};

export type Signal = {
  lat: number;
  lng: number;
  type: string;
  source: string;
};

const MOCK_INCIDENTS: Incident[] = [
  { 
    id:"INC-001", 
    location:"Gulshan-e-Iqbal, Karachi",
    severity:9.0, 
    confidence:92, 
    status:"confirmed",
    lat:24.9215, 
    lng:67.0944,
    affected:4500, 
    eta:"45 mins",
    risk_factors:["Hospital 200m","Rain 2hrs"] 
  },
  { 
    id:"INC-002", 
    location:"North Nazimabad, Karachi",
    severity:6.0, 
    confidence:75, 
    status:"monitoring",
    lat:24.9400, 
    lng:67.0600,
    affected:2100, 
    eta:"1.5 hrs",
    risk_factors:["School nearby","Traffic slow"] 
  }
];

const MOCK_LOGS: AgentLog[] = [
  { id:"1", agent:"Triage Agent", time:"10:32:01", phase:"OBSERVE", message:"Signal received from Karachi GPS" },
  { id:"2", agent:"Signal Agent", time:"10:32:03", phase:"REASON", message:"GPS normalized. Credibility: 0.92" },
  { id:"3", agent:"Detection Agent", time:"10:32:08", phase:"DECIDE", message:"3 signals clustered. CONFIRMED!" },
  { id:"4", agent:"Severity Agent", time:"10:32:12", phase:"ACT", message:"Hospital 200m. Score: 9.0/10" },
  { id:"5", agent:"Planning Agent", time:"10:32:15", phase:"EVALUATE", message:"3 actions queued." }
];

const MOCK_ACTIONS: SimAction[] = [
  { id:"A1", type:"ALERT_CITIZENS", status:"COMPLETED", time:"T+0s" },
  { id:"A2", type:"REROUTE_TRAFFIC", status:"ACTIVE", time:"T+30s" },
  { id:"A3", type:"DISPATCH_DRAINAGE", status:"PENDING", time:"T+60s" }
];

export async function getIncidentsActive(): Promise<Incident[]> {
  // TODO: const r = await fetch(`${BASE_URL}/api/v1/incidents/active`);
  return MOCK_INCIDENTS;
}

export async function getIncidentById(id: string): Promise<Incident | null> {
  // TODO: const r = await fetch(`${BASE_URL}/api/v1/incidents/${id}`);
  return MOCK_INCIDENTS.find(i => i.id === id) ?? null;
}

export async function getSimulationState(incidentId: string): Promise<SimAction[]> {
  // TODO: const r = await fetch(`${BASE_URL}/api/v1/simulation/state/${incidentId}`);
  return MOCK_ACTIONS;
}

export async function postSignal(lat: number, lng: number) {
  // TODO: await fetch(`${BASE_URL}/api/v1/signals`, {
  //   method:"POST",
  //   body: JSON.stringify({ lat, lng, type:"flood", source:"user_gps" })
  // });
  console.log("[MOCK] Signal posted:", { lat, lng });
  return { success: true };
}

export function setupWebSocket(
  incidentId: string,
  onMessage: (log: AgentLog) => void
) {
  // TODO: Real WebSocket:
  // const ws = new WebSocket(`${WS_URL}/api/v1/ws/${incidentId}`);
  // ws.onmessage = (e) => onMessage(JSON.parse(e.data));
  // return ws;

  // Mock: simulate streaming logs one by one
  let index = 0;
  const interval = setInterval(() => {
    if (index < MOCK_LOGS.length) {
      onMessage(MOCK_LOGS[index]);
      index++;
    } else {
      clearInterval(interval);
    }
  }, 1500);
  return { close: () => clearInterval(interval) };
}

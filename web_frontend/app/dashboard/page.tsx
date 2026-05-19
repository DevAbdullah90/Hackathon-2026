"use client";

import dynamic from "next/dynamic";
import { useState, useEffect, useRef } from "react";

import TopBar from "@/components/dashboard/TopBar";
import MetricsGrid from "@/components/dashboard/MetricsGrid";
import EventsPanel from "@/components/dashboard/EventsPanel";
import CTECCPanel from "@/components/dashboard/CTECCPanel";
import { Incident } from "@/lib/api";
import { X, Navigation } from "lucide-react";

interface MapPanelProps {
  selectedIncident: Incident | null;
  onSelectIncident: (incident: Incident) => void;
}

interface AlertData {
  id: string;
  location: string;
  severity_score: number;
  confidence: number;
  affected_radius_km: number;
  estimated_population: number;
  created_at: string;
}

const MapPanel = dynamic<MapPanelProps>(
  () => import("@/components/dashboard/MapPanel"),
  {
    ssr: false,
    loading: () => (
      <div
        className="border-r border-gray-200 bg-gray-100 
                   animate-pulse flex items-center justify-center 
                   text-gray-400 text-sm flex-shrink-0"
        style={{ width: "420px" }}
      >
        Loading Map...
      </div>
    ),
  }
);

// Synthesize retro-cyber sonar radar beep using HTML5 Web Audio API
const playTacticalSonarChime = () => {
  if (typeof window === "undefined") return;
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();

    // 1. High frequency radar ping
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sine";
    // Sleek frequency sweep from 1500Hz down to 800Hz (retro cyber radar)
    osc.frequency.setValueAtTime(1500, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.6);

    gain.gain.setValueAtTime(0.35, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.8);

    osc.connect(gain);
    gain.connect(ctx.destination);

    // Start immediately
    osc.start();
    osc.stop(ctx.currentTime + 0.85);

    // 2. Subtle low sub-pulse echo for deep tactile feel
    const subOsc = ctx.createOscillator();
    const subGain = ctx.createGain();

    subOsc.type = "triangle";
    subOsc.frequency.setValueAtTime(90, ctx.currentTime);
    subOsc.frequency.exponentialRampToValueAtTime(45, ctx.currentTime + 0.5);

    subGain.gain.setValueAtTime(0.2, ctx.currentTime);
    subGain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.65);

    subOsc.connect(subGain);
    subGain.connect(ctx.destination);

    subOsc.start();
    subOsc.stop(ctx.currentTime + 0.7);
  } catch (err) {
    console.warn("Failed to play dynamic synthesized chime:", err);
  }
};

const playFocusSonarSound = () => {
  if (typeof window === "undefined") return;
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(600, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(1400, ctx.currentTime + 0.2);

    gain.gain.setValueAtTime(0.2, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.25);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.3);
  } catch (err) {}
};

export default function DashboardPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activePage, setActivePage] = useState("Dashboard");
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [viewIncidentReportId, setViewIncidentReportId] = useState<string | null>(null);
  
  // Real-Time Sonar Alerts State
  const [activeAlert, setActiveAlert] = useState<AlertData | null>(null);
  const seenIncidentIdsRef = useRef<Set<string>>(new Set());

  // Load initial incidents so we don't alert on historic items
  useEffect(() => {
    const initSeen = async () => {
      try {
        const { api } = await import("@/lib/api");
        const active = await api.getActiveIncidents();
        active.forEach(i => seenIncidentIdsRef.current.add(String(i.id)));
      } catch (err) {
        console.error("Failed to load initial active incidents for notifications:", err);
      }
    };
    initSeen();
  }, []);

  // Connect to global WebSocket stream to trigger floating radar toast alerts and coordinate app updates
  useEffect(() => {
    let socket: WebSocket | null = null;
    let reconnectTimeout: any = null;
    let isMounted = true;

    const connect = async () => {
      try {
        const { API_BASE_URL } = await import("@/lib/api");
        const wsUrl = `${API_BASE_URL.replace("http", "ws").replace("https", "wss")}/ws/global/stream`;
        console.log(`🔌 [Dashboard] Connecting to global WebSocket stream: ${wsUrl}`);
        
        if (!isMounted) return;
        socket = new WebSocket(wsUrl);

        socket.onopen = () => {
          console.log(`📡 [Dashboard] Connected to global WebSocket stream`);
        };

        socket.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            console.log(`📡 [Dashboard] Received global websocket event:`, data.event);
            
            if (data.event === "new_incident") {
              const newIncident = data.incident;
              if (newIncident && !seenIncidentIdsRef.current.has(String(newIncident.id))) {
                playTacticalSonarChime();
                setActiveAlert({
                  id: String(newIncident.id),
                  location: newIncident.location,
                  severity_score: newIncident.severity_score,
                  confidence: newIncident.confidence,
                  affected_radius_km: newIncident.affected_radius_km,
                  estimated_population: newIncident.estimated_population,
                  created_at: newIncident.created_at
                });
                seenIncidentIdsRef.current.add(String(newIncident.id));
              }
              // Dispatch standard window event to trigger component refreshes across the app
              window.dispatchEvent(new CustomEvent("refresh_incidents", { detail: { incidentId: newIncident.id } }));
            } else if (data.event === "simulation_progress") {
              // Dispatch standard window event for simulation updates
              window.dispatchEvent(new CustomEvent("refresh_simulation", { detail: data }));
            }
          } catch (err) {
            console.warn("Failed to parse global websocket message", err);
          }
        };

        socket.onclose = () => {
          console.log("🔌 [Dashboard] Global WebSocket disconnected, reconnecting in 5s...");
          reconnectTimeout = setTimeout(() => {
            connect();
          }, 5000);
        };

        socket.onerror = (error) => {
          console.warn("⚠️ [Dashboard] Global WebSocket error:", error);
        };

      } catch (err) {
        console.error("Failed to connect global websocket", err);
      }
    };

    connect();

    return () => {
      isMounted = false;
      if (socket) {
        socket.close();
      }
      if (reconnectTimeout) {
        clearTimeout(reconnectTimeout);
      }
    };
  }, []);

  const handlePipelineComplete = async (incidentId: string) => {
    try {
      const { api } = await import("@/lib/api");
      const incidents = await api.getActiveIncidents();
      const found = incidents.find(i => String(i.id) === String(incidentId));
      if (found) {
        setSelectedIncident(found);
      }
    } catch (err) {
      console.error("Failed to automatically select completed incident:", err);
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden relative">

      {/* Premium In-App Sonar Warning Toast HUD Banner */}
      {activeAlert && (
        <div className="fixed top-4 right-4 z-[9999] max-w-sm w-full animate-slide-in">
          <div className="relative overflow-hidden rounded-xl border border-red-500/30 bg-gray-950/95 p-4 text-white shadow-2xl backdrop-blur-md">
            
            {/* Pulsing hazard border accent */}
            <div className="absolute inset-0 border border-red-500/50 rounded-xl animate-pulse pointer-events-none" />
            
            {/* Top alert info */}
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
                </div>
                <span className="text-[10px] font-mono tracking-wider font-extrabold text-red-500 animate-pulse">
                  🚨 CRITICAL HAZARD TRIGGERED
                </span>
              </div>
              <button 
                onClick={() => setActiveAlert(null)}
                className="text-gray-400 hover:text-white transition-colors p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Location & Title */}
            <div className="space-y-1 mb-3">
              <h4 className="text-xs font-bold text-gray-100 line-clamp-2">
                {activeAlert.location}
              </h4>
              <p className="text-[9px] font-mono text-gray-400">
                Karachi command anomalies detected. Multi-Agent routing triggered.
              </p>
            </div>

            {/* Stat parameters */}
            <div className="grid grid-cols-2 gap-2 bg-white/5 rounded-lg p-2 mb-3 border border-white/5">
              <div>
                <span className="text-[7px] font-mono text-gray-400 block uppercase">SEVERITY LEVEL</span>
                <span className="text-xs font-extrabold text-red-400">{activeAlert.severity_score.toFixed(1)} / 10</span>
              </div>
              <div>
                <span className="text-[7px] font-mono text-gray-400 block uppercase">EST. POPULATION</span>
                <span className="text-xs font-extrabold text-amber-400">{activeAlert.estimated_population.toLocaleString()} Residents</span>
              </div>
            </div>

            {/* Engage locate button */}
            <div className="flex gap-2">
              <button
                onClick={async () => {
                  try {
                    const { api } = await import("@/lib/api");
                    const active = await api.getActiveIncidents();
                    const found = active.find(i => String(i.id) === activeAlert.id);
                    if (found) {
                      setSelectedIncident(found);
                      playFocusSonarSound();
                    }
                  } catch (err) {
                    console.error(err);
                  }
                  setActiveAlert(null);
                }}
                className="flex-1 bg-red-600 hover:bg-red-500 text-white text-[10px] font-mono py-1.5 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-all shadow-md active:scale-95 font-bold uppercase tracking-wider"
              >
                <Navigation className="w-3.5 h-3.5" />
                LOCATE ON MAP & DEPLOY
              </button>
            </div>
          </div>
        </div>
      )}



      {/* Main content */}
      <div className="flex flex-col flex-1 overflow-hidden min-w-0">

        {/* TopBar */}
        <TopBar 
          onPipelineComplete={handlePipelineComplete}
          viewIncidentReportId={viewIncidentReportId}
          onCloseIncidentReport={() => setViewIncidentReportId(null)}
        />

        {/* Body */}
        <div className="flex flex-1 overflow-hidden">

          {/* Map Panel - hidden on mobile/tablet */}
          <div className="hidden xl:block flex-shrink-0">
            <MapPanel 
              selectedIncident={selectedIncident} 
              onSelectIncident={setSelectedIncident} 
            />
          </div>

          {/* Right scrollable content */}
          <div className="flex-1 overflow-y-auto bg-slate-50/50 bg-grid-pattern p-4 md:p-6 space-y-6 min-w-0">
            <div className="fade-in" style={{ animationDelay: "0ms" }}>
              <MetricsGrid selectedIncident={selectedIncident} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 pb-4 fade-in" style={{ animationDelay: "200ms" }}>
              <EventsPanel 
                selectedIncident={selectedIncident} 
                onSelectIncident={setSelectedIncident} 
                onViewReport={setViewIncidentReportId}
              />
              <CTECCPanel />
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

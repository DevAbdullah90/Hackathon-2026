"use client";

import React, { useEffect, useState } from "react";
import { AlertTriangle, Shield, Settings, Bookmark, CheckCircle2, Navigation, MessageSquare, Heart, Radio, Activity, Sun, Thermometer, FileText } from "lucide-react";
import { api, Incident, Action, ReasoningLog, Notification } from "@/lib/api";

const AGENT_META: Record<string, { label: string, color: string, bg: string, border: string }> = {
  signal_agent: { label: "Signal Parser", color: "text-blue-700", bg: "bg-blue-50", border: "border-blue-200" },
  detection_agent: { label: "Crisis Clusterer", color: "text-purple-700", bg: "bg-purple-50", border: "border-purple-200" },
  verification_agent: { label: "Social Verifier", color: "text-amber-700", bg: "bg-amber-50", border: "border-amber-200" },
  severity_agent: { label: "Severity Indexer", color: "text-red-700", bg: "bg-red-50", border: "border-red-200" },
  resource_allocation_agent: { label: "Resource Specialist", color: "text-cyan-700", bg: "bg-cyan-50", border: "border-cyan-200" },
  planning_agent: { label: "Planner Coordinator", color: "text-emerald-700", bg: "bg-emerald-50", border: "border-emerald-200" },
  notification_agent: { label: "Broadcast Specialist", color: "text-pink-700", bg: "bg-pink-50", border: "border-pink-200" },
};

interface EventsPanelProps {
  selectedIncident: Incident | null;
  onSelectIncident: (incident: Incident | null) => void;
  onViewReport?: (incidentId: string) => void;
}

export default function EventsPanel({ selectedIncident, onSelectIncident, onViewReport }: EventsPanelProps) {
  const isHeatwave = selectedIncident?.disaster_type === "heatwave";
  
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [actions, setActions] = useState<Action[]>([]);
  const [reasoningLogs, setReasoningLogs] = useState<ReasoningLog[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [activeTab, setActiveTab] = useState<"actions" | "logs" | "notifications">("actions");
  const [subTab, setSubTab] = useState<"public" | "police" | "utility" | "hospital">("public");
  
  const [loadingIncidents, setLoadingIncidents] = useState(true);
  const [loadingActions, setLoadingActions] = useState(false);
  const [loadingLogs, setLoadingLogs] = useState(false);
  const [loadingNotifications, setLoadingNotifications] = useState(false);

  // Simulation metrics state
  const [isSimulating, setIsSimulating] = useState(false);
  const [congestionHistory, setCongestionHistory] = useState<number[]>([90]);
  const [safetyCoverage, setSafetyCoverage] = useState<number>(0);

  const fetchIncidents = async () => {
    try {
      const data = await api.getActiveIncidents();
      setIncidents(data);
      if (data.length > 0) {
        if (!selectedIncident) {
          onSelectIncident(data[0]);
        } else {
          const stillExists = data.find(i => i.id === selectedIncident.id);
          if (!stillExists) {
            onSelectIncident(data[0]);
          }
        }
      } else {
        onSelectIncident(null);
      }
    } catch (err) {
      console.error("Failed to load incidents in EventsPanel:", err);
    } finally {
      setLoadingIncidents(false);
    }
  };

  const fetchActions = async (id: string) => {
    setLoadingActions(true);
    try {
      const data = await api.getIncidentActions(id);
      setActions(data);
    } catch (err) {
      console.error(`Failed to load actions for incident ${id}:`, err);
    } finally {
      setLoadingActions(false);
    }
  };

  const fetchLogs = async (id: string) => {
    setLoadingLogs(true);
    try {
      const data = await api.getIncidentLogs(id);
      setReasoningLogs(data);
    } catch (err) {
      console.error(`Failed to load reasoning logs for incident ${id}:`, err);
    } finally {
      setLoadingLogs(false);
    }
  };

  const fetchNotifications = async (id: string) => {
    setLoadingNotifications(true);
    try {
      const data = await api.getIncidentNotifications(id);
      setNotifications(data);
    } catch (err) {
      console.error(`Failed to load notifications for incident ${id}:`, err);
    } finally {
      setLoadingNotifications(false);
    }
  };

  useEffect(() => {
    fetchIncidents();
    const interval = setInterval(fetchIncidents, 3000);
    return () => clearInterval(interval);
  }, [selectedIncident?.id]);

  useEffect(() => {
    if (selectedIncident) {
      fetchActions(selectedIncident.id);
      fetchLogs(selectedIncident.id);
      fetchNotifications(selectedIncident.id);
    } else {
      setActions([]);
      setReasoningLogs([]);
      setNotifications([]);
    }
  }, [selectedIncident?.id]);

  // Synchronize simulation metrics with actions state or incoming WebSocket events
  useEffect(() => {
    if (selectedIncident) {
      const hasActions = actions.length > 0;
      const allCompleted = hasActions && actions.every(a => a.status === "COMPLETED");
      const anyActive = hasActions && actions.some(a => ["SENT", "ACTIVE", "ON_SITE", "DISPATCHED", "IN PROGRESS", "IN_PROGRESS"].includes(a.status));
      
      if (allCompleted) {
        setCongestionHistory([90, 75, 50, 35, 20]);
        setSafetyCoverage(100);
        setIsSimulating(false);
      } else if (anyActive) {
        let cong = 90;
        let safety = 0;
        const statuses = actions.map(a => a.status.toUpperCase());
        
        if (statuses.includes("ON_SITE") || statuses.includes("ON-SITE") || statuses.includes("ON SITE")) {
          cong = 35;
          safety = 85;
        } else if (statuses.includes("ACTIVE") || statuses.includes("IN PROGRESS") || statuses.includes("IN_PROGRESS")) {
          cong = 50;
          safety = 60;
        } else if (statuses.includes("SENT") || statuses.includes("DISPATCHED")) {
          cong = 75;
          safety = 25;
        }
        
        const hist = [90];
        if (cong <= 75) hist.push(75);
        if (cong <= 50) hist.push(50);
        if (cong <= 35) hist.push(35);
        
        setCongestionHistory(hist);
        setSafetyCoverage(safety);
        setIsSimulating(true);
      } else {
        setCongestionHistory([90]);
        setSafetyCoverage(0);
        setIsSimulating(false);
      }
    }
  }, [selectedIncident?.id, actions]);

  // Listen to global socket event from page.tsx
  useEffect(() => {
    const handleSimulationProgress = (e: Event) => {
      const customEvent = e as CustomEvent;
      const data = customEvent.detail;
      
      if (data && selectedIncident && data.incident_id === selectedIncident.id) {
        // Refetch actions list to sync UI status badge
        fetchActions(selectedIncident.id);
        
        if (data.metrics) {
          const cong = data.metrics.congestion_index;
          const safety = data.metrics.cooling_coverage || data.metrics.safety_rate || data.metrics.evacuation_rate;
          
          if (cong !== undefined) {
            setCongestionHistory((prev) => {
              if (prev.includes(cong)) return prev;
              return [...prev, cong];
            });
          }
          if (safety !== undefined) {
            setSafetyCoverage(safety);
          }
        }
        
        if (data.status === "COMPLETED") {
          setIsSimulating(false);
        } else {
          setIsSimulating(true);
        }
      }
    };
    
    window.addEventListener("refresh_simulation", handleSimulationProgress);
    return () => window.removeEventListener("refresh_simulation", handleSimulationProgress);
  }, [selectedIncident?.id]);

  const handleRunSimulation = async () => {
    if (!selectedIncident) return;
    setIsSimulating(true);
    const success = await api.triggerSimulation(selectedIncident.id);
    if (!success) {
      setIsSimulating(false);
      alert("Failed to start simulation. Verify backend is running and actions exist for this incident.");
    }
  };

  const drawFloodChart = () => {
    const width = 300;
    const height = 120;
    const paddingX = 35;
    const paddingY = 20;
    
    const points = congestionHistory.map((val, idx) => {
      const x = paddingX + ((width - 2 * paddingX) * (idx / 4));
      const y = height - paddingY - ((val / 100) * (height - 2 * paddingY));
      return { x, y, val };
    });

    const pathD = points.length > 0 
      ? points.map((p, idx) => `${idx === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ")
      : "";

    const areaD = points.length > 0
      ? `${pathD} L ${points[points.length - 1].x} ${height - paddingY} L ${points[0].x} ${height - paddingY} Z`
      : "";

    return (
      <div className="flex flex-col space-y-2 py-1">
        <div className="flex justify-between items-center text-[10px] font-bold">
          <span className="text-gray-400 font-bold uppercase tracking-wider">Congestion Index Flow</span>
          <span className={`font-mono px-2 py-0.5 rounded-sm text-[9px] font-bold uppercase ${
            congestionHistory[congestionHistory.length - 1] > 50 
              ? "bg-red-50 text-red-600 border border-red-200" 
              : "bg-emerald-50 text-emerald-600 border border-emerald-200"
          }`}>
            Current: {congestionHistory[congestionHistory.length - 1]}% ({congestionHistory[congestionHistory.length - 1] > 50 ? "Gridlock" : "Flowing"})
          </span>
        </div>
        
        <div className="bg-slate-950 rounded-xl p-3 border border-slate-900 shadow-inner flex items-center justify-center">
          <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} className="overflow-visible">
            <defs>
              <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#ef4444" stopOpacity="0.2" />
                <stop offset="100%" stopColor="#ef4444" stopOpacity="0.0" />
              </linearGradient>
              <linearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#ef4444" />
                <stop offset="50%" stopColor="#f59e0b" />
                <stop offset="100%" stopColor="#10b981" />
              </linearGradient>
            </defs>
            
            <line x1={paddingX} y1={paddingY} x2={width - paddingX} y2={paddingY} stroke="rgba(255,255,255,0.07)" strokeDasharray="3,3" />
            <line x1={paddingX} y1={(height)/2} x2={width - paddingX} y2={(height)/2} stroke="rgba(255,255,255,0.07)" strokeDasharray="3,3" />
            <line x1={paddingX} y1={height - paddingY} x2={width - paddingX} y2={height - paddingY} stroke="rgba(255,255,255,0.15)" />
            
            <text x={paddingX - 8} y={paddingY + 3} textAnchor="end" className="text-[8px] font-mono fill-gray-500 font-bold">90%</text>
            <text x={paddingX - 8} y={(height)/2 + 3} textAnchor="end" className="text-[8px] font-mono fill-gray-500 font-bold">55%</text>
            <text x={paddingX - 8} y={height - paddingY + 3} textAnchor="end" className="text-[8px] font-mono fill-gray-500 font-bold">20%</text>

            {areaD && <path d={areaD} fill="url(#areaGrad)" />}

            {pathD && <path d={pathD} fill="none" stroke="url(#lineGrad)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />}

            {points.map((p, idx) => (
              <g key={idx}>
                <circle 
                  cx={p.x} 
                  cy={p.y} 
                  r="3.5" 
                  className={idx === points.length - 1 ? "fill-emerald-400 stroke-slate-950 stroke-1.5" : "fill-red-500 stroke-slate-950 stroke-1.5"} 
                />
                {idx === points.length - 1 && (
                  <circle cx={p.x} cy={p.y} r="8" className="fill-none stroke-emerald-400 stroke-1 animate-ping" />
                )}
              </g>
            ))}

            <text x={paddingX} y={height - 4} textAnchor="middle" className="text-[8px] font-mono fill-gray-500 font-bold">0m</text>
            <text x={paddingX + (width - 2 * paddingX) * 0.33} y={height - 4} textAnchor="middle" className="text-[8px] font-mono fill-gray-500 font-bold">5m</text>
            <text x={paddingX + (width - 2 * paddingX) * 0.66} y={height - 4} textAnchor="middle" className="text-[8px] font-mono fill-gray-500 font-bold">10m</text>
            <text x={width - paddingX} y={height - 4} textAnchor="middle" className="text-[8px] font-mono fill-gray-500 font-bold">15m</text>
          </svg>
        </div>
      </div>
    );
  };

  const drawHeatwaveMeter = () => {
    const radius = 35;
    const strokeWidth = 7;
    const circ = 2 * Math.PI * radius;
    const offset = circ - (safetyCoverage / 100) * circ;
    
    return (
      <div className="flex items-center gap-6 py-2">
        <div className="relative w-24 h-24 flex items-center justify-center flex-shrink-0">
          <svg className="w-full h-full transform -rotate-90">
            <circle 
              cx="48" 
              cy="48" 
              r={radius} 
              className="stroke-gray-100 fill-none" 
              strokeWidth={strokeWidth} 
            />
            <circle 
              cx="48" 
              cy="48" 
              r={radius} 
              className="stroke-orange-500 fill-none transition-all duration-700 ease-out" 
              strokeWidth={strokeWidth} 
              strokeDasharray={circ} 
              strokeDashoffset={offset} 
              strokeLinecap="round" 
            />
          </svg>
          <div className="absolute flex flex-col items-center justify-center">
            <span className="text-lg font-black text-gray-800 leading-none">{safetyCoverage}%</span>
            <span className="text-[8px] font-extrabold text-gray-400 uppercase tracking-wider mt-0.5">Coverage</span>
          </div>
        </div>
        <div className="flex-1 space-y-1.5">
          <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-wider">
            <span className="text-gray-400">Target</span>
            <span className="text-orange-600 font-bold">Hydration Camps</span>
          </div>
          <div className="text-xs text-gray-600 font-semibold leading-relaxed">
            {safetyCoverage === 0 ? (
              "Hydration camps planned. Dispatch camps to begin monitoring evacuation coverage."
            ) : safetyCoverage < 100 ? (
              `Camps are establishing on-site. Current public safety reach is ${safetyCoverage}%.`
            ) : (
              "All planned cooling & hydration camps are fully operational on-site (100% Coverage)."
            )}
          </div>
        </div>
      </div>
    );
  };

  const getEmergencyLevel = (score: number) => {
    const rounded = Math.min(Math.max(Math.round(score / 2), 1), 5);
    return rounded;
  };

  const getActionBadgeColor = (status: string) => {
    switch (status.toUpperCase()) {
      case "DISPATCHED":
      case "COMPLETED":
        return "bg-green-50 text-green-700 border-green-200";
      case "IN PROGRESS":
      case "PENDING":
        return "bg-orange-50 text-orange-700 border-orange-200";
      case "NOTIFIED":
        return "bg-blue-50 text-blue-700 border-blue-200";
      default:
        return "bg-gray-50 text-gray-600 border-gray-200";
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden flex flex-col h-full">
      {/* Top Accent Gradient Bar */}
      <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${isHeatwave ? "from-amber-500 to-orange-600" : "from-teal-600 to-emerald-600"}`} />
      {/* Card Header */}
      <div className="px-4 pt-5 pb-3 border-b border-gray-100 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-2">
          {isHeatwave ? (
            <Sun className="w-4 h-4 text-orange-500 animate-pulse" />
          ) : (
            <AlertTriangle className="w-4 h-4 text-red-500 animate-pulse" />
          )}
          <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest">
            {isHeatwave ? "Active Heatwaves" : "Active Hazards"}
          </h3>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400">Select Sector:</span>
          <select 
            value={selectedIncident?.id || ""} 
            onChange={(e) => {
              const found = incidents.find(i => i.id === e.target.value);
              if (found) onSelectIncident(found);
            }}
            className="text-xs font-semibold text-gray-600 bg-gray-50 px-2 py-1 rounded border border-gray-200 cursor-pointer outline-none focus:border-red-400"
          >
            {incidents.length === 0 ? (
              <option value="">No Active Sectors</option>
            ) : (
              incidents.map((incident) => {
                const parts = incident.location.split(",");
                let label = parts[0].trim();
                if (label.includes("+")) {
                  const words = label.split(" ").filter(w => !w.includes("+"));
                  if (words.length > 0) {
                    label = words.join(" ");
                  } else if (parts.length > 1) {
                    label = parts.slice(1, 3).join(", ").trim();
                  }
                } else if (parts.length > 1 && (/^\d+$/.test(label) || label.length <= 4)) {
                  label = parts.slice(1, 3).join(", ").trim();
                }
                return (
                  <option key={incident.id} value={incident.id}>
                    {label} ({Number(incident.severity_score).toFixed(1)}/10)
                  </option>
                );
              })
            )}
          </select>
        </div>
      </div>

      {/* Card Body */}
      <div className="p-4 flex-1 overflow-y-auto min-h-[300px]">
        {selectedIncident ? (
          <div className="space-y-4">
            {/* Top Row: Incident Info */}
            <div className={`flex flex-col md:flex-row md:items-center justify-between gap-3 p-3 rounded-lg border ${
              isHeatwave 
                ? "bg-orange-50/40 border-orange-100" 
                : "bg-red-50/30 border-red-100/50"
            }`}>
              <div className="flex items-center gap-2.5">
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center border shadow-sm flex-shrink-0 ${
                  isHeatwave 
                    ? "bg-orange-500 border-orange-600" 
                    : "bg-red-500 border-red-600"
                }`}>
                  {isHeatwave ? (
                    <Sun className="w-5 h-5 text-white" />
                  ) : (
                    <AlertTriangle className="w-5 h-5 text-white" />
                  )}
                </div>
                <div>
                  <h4 className="text-sm font-extrabold text-gray-900 leading-tight">
                    {selectedIncident.location}
                  </h4>
                  <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">
                    Incident ID: {selectedIncident.id}
                  </span>
                </div>
              </div>

              {/* Urgency Level Row */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">Severity Level</span>
                <div className="flex gap-0.5">
                  {[1, 2, 3, 4, 5].map((lvl) => {
                    const active = lvl <= getEmergencyLevel(selectedIncident.severity_score);
                    return (
                      <div 
                        key={lvl}
                        className={`w-3.5 h-3.5 rounded-xs ${
                          active 
                            ? isHeatwave 
                              ? "bg-orange-500 shadow-sm" 
                              : "bg-red-500 shadow-sm" 
                            : "bg-gray-200"
                        }`} 
                      />
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Two Column Layout */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Left Column: Descriptive Log */}
              <div className="space-y-3">
                <div className="text-xs text-gray-600 leading-relaxed font-semibold bg-gray-50 border border-gray-200/60 p-4 rounded-xl shadow-inner min-h-[140px] flex flex-col justify-between">
                  <div>
                    <span className={`text-[10px] font-bold uppercase tracking-wider block mb-1 ${
                      isHeatwave ? "text-orange-500" : "text-red-500"
                    }`}>
                      CoT Response Narrative
                    </span>
                    {isHeatwave ? (
                      <>
                        CIRO verified an active extreme heatwave warning in {selectedIncident.location} at coordinate [{selectedIncident.lat.toFixed(4)}, {selectedIncident.lng.toFixed(4)}]. 
                        The severity index is evaluated to {selectedIncident.severity_score}/10, placing approximately {selectedIncident.estimated_population.toLocaleString()} citizens at critical risk of thermal shock and grid outages. 
                        Hydration deployment and cooling systems have been scheduled.
                      </>
                    ) : (
                      <>
                        CIRO verified an active flood warning in {selectedIncident.location} at coordinate [{selectedIncident.lat.toFixed(4)}, {selectedIncident.lng.toFixed(4)}]. 
                        The severity index is evaluated to {selectedIncident.severity_score}/10, exposing approximately {selectedIncident.estimated_population.toLocaleString()} citizens at high risk. 
                        Tactical resource allocation and emergency evacuation procedures have been successfully finalized.
                      </>
                    )}
                  </div>
                  <div className="flex justify-between items-center text-[10px] text-gray-400 font-bold border-t border-gray-200/50 pt-2 mt-2">
                    <span>ETA Peak: {selectedIncident.peak_impact_eta}</span>
                    <span>Confidence: {(selectedIncident.confidence * 100).toFixed(0)}%</span>
                  </div>
                </div>

                {/* Simulated Impact Graph & Simulation Control Card */}
                <div className="border border-gray-200 rounded-xl p-4 bg-white shadow-xs space-y-4">
                  {/* Header & Trigger Button */}
                  <div className="flex items-center justify-between border-b border-gray-100 pb-2.5">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                      📊 Real-Time Response Impact
                    </span>
                    <button
                      onClick={handleRunSimulation}
                      disabled={isSimulating}
                      className={`text-[9px] font-bold uppercase tracking-wider px-2.5 py-1.5 border rounded-lg shadow-2xs transition-all active:scale-95 flex items-center gap-1.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
                        isHeatwave
                          ? "bg-orange-500 border-orange-600 hover:bg-orange-600 text-white"
                          : "bg-emerald-500 border-emerald-600 hover:bg-emerald-600 text-white"
                      }`}
                    >
                      {isSimulating ? (
                        <>
                          <span className="animate-spin w-2.5 h-2.5 border-2 border-white border-t-transparent rounded-full block" />
                          <span>Simulating...</span>
                        </>
                      ) : (
                        <>
                          <span>⚡ Run Impact Simulation</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Impact Chart Display */}
                  {isHeatwave ? drawHeatwaveMeter() : drawFloodChart()}
                </div>
              </div>

              {/* Right Column: Telemetry Specs */}
              <div className="border border-gray-100 p-3.5 rounded-xl bg-white shadow-sm space-y-1.5 text-xs">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Incident Telemetry</span>
                
                <div className="flex justify-between py-1 border-b border-gray-50">
                  <span className="text-gray-500 font-medium">GPS Latitude:</span>
                  <span className="font-bold text-gray-800">{selectedIncident.lat.toFixed(6)}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-gray-50">
                  <span className="text-gray-500 font-medium">GPS Longitude:</span>
                  <span className="font-bold text-gray-800">{selectedIncident.lng.toFixed(6)}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-gray-50">
                  <span className="text-gray-500 font-medium">Affected Area Radius:</span>
                  <span className="font-semibold text-gray-800">{selectedIncident.affected_radius_km} km</span>
                </div>
                <div className="flex justify-between py-1 border-b border-gray-50">
                  <span className="text-gray-500 font-medium">Active Threat Factors:</span>
                  <span className={`font-semibold truncate max-w-[140px] ${
                    isHeatwave ? "text-orange-600" : "text-red-600"
                  }`} title={selectedIncident.risk_factors?.join(", ")}>
                    {selectedIncident.risk_factors?.length ? selectedIncident.risk_factors.join(", ") : isHeatwave ? "Extreme Heat" : "Heavy Rain"}
                  </span>
                </div>

                {/* Citizen Consensus Poll */}
                <div className="pt-3 mt-2 border-t border-gray-100 space-y-2">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Citizen Consensus Poll</span>
                  <div className="flex justify-between items-center text-[10px] font-bold">
                    <span className="text-emerald-600 flex items-center gap-1">
                      👍 {selectedIncident.confirmations_count || 0} Confirmed
                    </span>
                    <span className="text-rose-500 flex items-center gap-1">
                      👎 {selectedIncident.refutations_count || 0} Clear
                    </span>
                  </div>
                  <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden flex">
                    {((selectedIncident.confirmations_count || 0) + (selectedIncident.refutations_count || 0)) > 0 ? (
                      <>
                        <div 
                          className="bg-emerald-500 h-full transition-all duration-500" 
                          style={{ 
                            width: `${((selectedIncident.confirmations_count || 0) / ((selectedIncident.confirmations_count || 0) + (selectedIncident.refutations_count || 0))) * 100}%` 
                          }}
                        />
                        <div 
                          className="bg-rose-500 h-full transition-all duration-500 flex-1"
                        />
                      </>
                    ) : (
                      <div className="bg-gray-300 w-full h-full" />
                    )}
                  </div>
                  <div className="flex justify-between text-[9px] text-gray-400 font-medium">
                    <span>Retraction: refutations &gt; confirmations + 3</span>
                    {((selectedIncident.refutations_count || 0) > 0) && (
                      <span className="text-rose-500 font-bold">
                        {selectedIncident.refutations_count} / {(selectedIncident.confirmations_count || 0) + 3} towards retraction
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Row: Tabs & Content */}
            <div className="border border-gray-200 rounded-xl p-4 bg-slate-50/60 flex flex-col min-h-[300px]">
              {/* Tab headers */}
              <div className="flex border-b border-gray-200 pb-2 mb-3 items-center justify-between overflow-x-auto scrollbar-none">
                <div className="flex gap-2 sm:gap-4 flex-nowrap">
                  <button
                    onClick={() => setActiveTab("actions")}
                    className={`flex items-center gap-1 pb-1 text-[10px] sm:text-xs font-bold uppercase tracking-wider border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                      activeTab === "actions"
                        ? isHeatwave 
                          ? "border-orange-500 text-orange-600" 
                          : "border-emerald-500 text-emerald-600"
                        : "border-transparent text-gray-400 hover:text-gray-600"
                    }`}
                  >
                    <Shield className="w-3.5 h-3.5 flex-shrink-0" />
                    <span>Actions ({actions.length})</span>
                  </button>
                  <button
                    onClick={() => setActiveTab("logs")}
                    className={`flex items-center gap-1 pb-1 text-[10px] sm:text-xs font-bold uppercase tracking-wider border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                      activeTab === "logs"
                        ? isHeatwave 
                          ? "border-orange-500 text-orange-600" 
                          : "border-emerald-500 text-emerald-600"
                        : "border-transparent text-gray-400 hover:text-gray-600"
                    }`}
                  >
                    <Activity className="w-3.5 h-3.5 flex-shrink-0" />
                    <span>Swarm Logs ({reasoningLogs.length})</span>
                  </button>
                  <button
                    onClick={() => setActiveTab("notifications")}
                    className={`flex items-center gap-1 pb-1 text-[10px] sm:text-xs font-bold uppercase tracking-wider border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                      activeTab === "notifications"
                        ? isHeatwave 
                          ? "border-orange-500 text-orange-600" 
                          : "border-emerald-500 text-emerald-600"
                        : "border-transparent text-gray-400 hover:text-gray-600"
                    }`}
                  >
                    <MessageSquare className="w-3.5 h-3.5 flex-shrink-0" />
                    <span>Stakeholders ({notifications.length})</span>
                  </button>
                </div>

                {selectedIncident && onViewReport && (
                  <button
                    onClick={() => onViewReport(selectedIncident.id)}
                    className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-[10px] font-extrabold uppercase tracking-wider transition-all border shadow-2xs hover:shadow-xs active:scale-95 whitespace-nowrap cursor-pointer ${
                      isHeatwave
                        ? "bg-orange-500 border-orange-600 hover:bg-orange-600 text-white"
                        : "bg-emerald-500 border-emerald-600 hover:bg-emerald-600 text-white"
                    }`}
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>View Swarm Report</span>
                  </button>
                )}
              </div>

              {/* Tab content */}
              {activeTab === "actions" ? (
                loadingActions ? (
                  <div className="text-xs text-gray-400 py-12 text-center animate-pulse font-semibold">
                    Querying Agent actions catalog...
                  </div>
                ) : actions.length === 0 ? (
                  <div className="text-xs text-gray-400 py-12 text-center font-medium">
                    No actions currently planned for this incident.
                  </div>
                ) : (
                  <div className="space-y-2 max-h-[350px] overflow-y-auto pr-1">
                    {actions.map((act) => (
                      <div key={act.id} className={`flex flex-col md:flex-row md:items-center justify-between p-2.5 bg-white border border-gray-200 rounded-lg gap-2 transition-colors shadow-2xs ${
                        isHeatwave ? "hover:border-orange-300" : "hover:border-emerald-300"
                      }`}>
                        <div className="flex items-start gap-2">
                          <CheckCircle2 className={`w-4 h-4 mt-0.5 flex-shrink-0 ${
                            isHeatwave ? "text-orange-500" : "text-emerald-500"
                          }`} />
                          <div>
                            <span className="text-[11px] font-bold text-gray-800 uppercase tracking-wide block">
                              {act.type.replace(/_/g, " ")}
                            </span>
                            <p className="text-[10px] text-gray-500 leading-normal font-semibold mt-0.5">
                              {act.predicted_side_effects}
                            </p>
                          </div>
                        </div>
                        <span className={`text-[9px] font-extrabold uppercase px-2 py-0.5 border rounded-md self-start md:self-center tracking-wider ${getActionBadgeColor(act.status)}`}>
                          {act.status}
                        </span>
                      </div>

                    ))}
                  </div>
                )
              ) : activeTab === "logs" ? (
                loadingLogs ? (
                  <div className="text-xs text-gray-400 py-12 text-center animate-pulse font-semibold">
                    Loading AI reasoning logs from DB...
                  </div>
                ) : reasoningLogs.length === 0 ? (
                  <div className="text-xs text-gray-400 py-12 text-center font-medium">
                    No agent reasoning logs recorded yet for this incident.
                  </div>
                ) : (
                  <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1">
                    {reasoningLogs.map((log) => {
                      const meta = AGENT_META[log.agent_name] || {
                        label: log.agent_name.replace(/_/g, " "),
                        color: "text-gray-700",
                        bg: "bg-gray-50",
                        border: "border-gray-200"
                      };
                      return (
                        <div key={log.id} className={`flex flex-col p-3 bg-white border border-gray-200 rounded-xl gap-2 shadow-2xs transition-colors ${
                          isHeatwave ? "hover:border-orange-200" : "hover:border-emerald-200"
                        }`}>
                          <div className="flex items-center justify-between">
                            <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 border rounded-md tracking-wider ${meta.bg} ${meta.color} ${meta.border}`}>
                              {meta.label}
                            </span>
                            <span className="text-[10px] text-gray-400 font-bold">
                              {new Date(log.created_at).toLocaleTimeString()}
                            </span>
                          </div>
                          <p className="text-[11px] text-gray-600 leading-relaxed font-semibold whitespace-pre-wrap">
                            {log.log_text}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                )
              ) : (
                loadingNotifications ? (
                  <div className="text-xs text-gray-400 py-12 text-center animate-pulse font-semibold">
                    Loading stakeholder alerts...
                  </div>
                ) : (
                  <div className="flex flex-col flex-1">
                    {/* Sub-tabs for stakeholders */}
                    <div className="flex bg-slate-100 rounded-lg p-1 gap-1 mb-3 self-start overflow-x-auto max-w-full scrollbar-none">
                      {[
                        { key: "public", label: "📢 Public" },
                        { key: "police", label: "🚨 Police" },
                        { key: "utility", label: "⚡ Utility" },
                        { key: "hospital", label: "🏥 Medical" },
                      ].map((item) => {
                        const isSubActive = subTab === item.key;
                        return (
                          <button
                            key={item.key}
                            onClick={() => setSubTab(item.key as any)}
                            className={`px-3 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap ${
                              isSubActive ? "bg-white text-gray-900 shadow-2xs font-extrabold" : "text-gray-500 hover:bg-white/40"
                            }`}
                          >
                            {item.label}
                          </button>
                        );
                      })}
                    </div>

                    {/* Display message for chosen stakeholder */}
                    <div className="flex-1 bg-white border border-gray-200 rounded-xl p-4 min-h-[160px] shadow-3xs flex flex-col justify-start">
                      {(() => {
                        const filtered = notifications.filter((n) => {
                          const s = n.stakeholder.toLowerCase();
                          if (subTab === "public") return s === "public";
                          if (subTab === "police") return s === "traffic_auth" || s === "emergency_services" || s.includes("police");
                          if (subTab === "utility") return s === "utility";
                          if (subTab === "hospital") return s === "hospital";
                          return false;
                        });

                        if (filtered.length === 0) {
                          return (
                            <div className="text-xs text-gray-400 py-12 text-center font-medium italic w-full">
                              Awaiting message generation from Notification Agent...
                            </div>
                          );
                        }

                        return (
                          <div className="space-y-3 w-full">
                            {filtered.map((item) => (
                              <div key={item.id} className="border-b border-gray-100 last:border-b-0 pb-3 last:pb-0">
                                <div className="flex items-center justify-between mb-1.5">
                                  <span className={`text-[9px] font-mono font-extrabold uppercase px-1.5 py-0.5 rounded-sm border ${
                                    isHeatwave 
                                      ? "bg-orange-50 text-orange-600 border-orange-200/50" 
                                      : "bg-red-50 text-red-600 border-red-200/50"
                                  }`}>
                                    {item.stakeholder}
                                  </span>
                                  <span className="text-[9px] text-gray-400 font-bold">
                                    Sent: {new Date(item.sent_at).toLocaleTimeString()}
                                  </span>
                                </div>
                                <p className="text-xs text-gray-700 leading-relaxed font-semibold whitespace-pre-wrap select-all">
                                  {item.message}
                                </p>
                              </div>
                            ))}
                          </div>
                        );
                      })()}
                    </div>
                  </div>
                )
              )}
            </div>

          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <AlertTriangle className="w-12 h-12 text-gray-300 mb-3 animate-pulse" />
            <span className="text-sm font-bold uppercase tracking-wider">No Active Crisis Hazards</span>
            <p className="text-xs text-gray-400 mt-1 max-w-[240px] text-center font-medium">
              Initiate simulated emergency telemetries in the top bar to watch the orchestrator run live!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

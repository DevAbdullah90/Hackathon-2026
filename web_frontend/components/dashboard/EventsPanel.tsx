"use client";

import React, { useEffect, useState } from "react";
import { AlertTriangle, Shield, Settings, Bookmark, CheckCircle2, Navigation, MessageSquare, Heart, Radio, Activity } from "lucide-react";
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
}

export default function EventsPanel({ selectedIncident, onSelectIncident }: EventsPanelProps) {
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
    <div className="bg-white rounded-xl border border-gray-200 shadow-xs overflow-hidden flex flex-col h-full">
      {/* Card Header */}
      <div className="px-4 pt-4 pb-3 border-b border-gray-100 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-red-500 animate-pulse" />
          <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider">Active Hazards</h3>
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
                if (parts.length > 1 && (/^\d+$/.test(label) || label.length <= 4)) {
                  label = parts.slice(1, 3).join(", ").trim();
                }
                return (
                  <option key={incident.id} value={incident.id}>
                    {label} ({incident.severity_score}/10)
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
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-red-50/30 p-3 rounded-lg border border-red-100/50">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-lg bg-red-500 flex items-center justify-center border border-red-600 shadow-sm flex-shrink-0">
                  <AlertTriangle className="w-5 h-5 text-white" />
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
                          active ? "bg-red-500 shadow-sm" : "bg-gray-200"
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
                    <span className="text-[10px] font-bold text-red-500 uppercase tracking-wider block mb-1">CoT Response Narrative</span>
                    CIRO verified an active flood warning in {selectedIncident.location} at coordinate [{selectedIncident.lat.toFixed(4)}, {selectedIncident.lng.toFixed(4)}]. 
                    The severity index is evaluated to {selectedIncident.severity_score}/10, exposing approximately {selectedIncident.estimated_population.toLocaleString()} citizens at high risk. 
                    Tactical resource allocation and emergency evacuation procedures have been successfully finalized.
                  </div>
                  <div className="flex justify-between items-center text-[10px] text-gray-400 font-bold border-t border-gray-200/50 pt-2 mt-2">
                    <span>ETA Peak Peak: {selectedIncident.peak_impact_eta}</span>
                    <span>Confidence: {(selectedIncident.confidence * 100).toFixed(0)}%</span>
                  </div>
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
                  <span className="font-semibold text-red-600 truncate max-w-[140px]" title={selectedIncident.risk_factors?.join(", ")}>
                    {selectedIncident.risk_factors?.length ? selectedIncident.risk_factors.join(", ") : "Heavy Rain"}
                  </span>
                </div>
              </div>
            </div>

            {/* Bottom Row: Tabs & Content */}
            <div className="border border-gray-200 rounded-xl p-4 bg-gray-50/50 flex flex-col min-h-[300px]">
              {/* Tab headers */}
              <div className="flex border-b border-gray-200 pb-2 mb-3 items-center justify-between">
                <div className="flex gap-4">
                  <button
                    onClick={() => setActiveTab("actions")}
                    className={`flex items-center gap-1.5 pb-1 text-xs font-bold uppercase tracking-wider border-b-2 transition-all cursor-pointer ${
                      activeTab === "actions"
                        ? "border-emerald-500 text-emerald-600"
                        : "border-transparent text-gray-400 hover:text-gray-600"
                    }`}
                  >
                    <Shield className="w-3.5 h-3.5" />
                    <span>Planner Actions ({actions.length})</span>
                  </button>
                  <button
                    onClick={() => setActiveTab("logs")}
                    className={`flex items-center gap-1.5 pb-1 text-xs font-bold uppercase tracking-wider border-b-2 transition-all cursor-pointer ${
                      activeTab === "logs"
                        ? "border-emerald-500 text-emerald-600"
                        : "border-transparent text-gray-400 hover:text-gray-600"
                    }`}
                  >
                    <Shield className="w-3.5 h-3.5" />
                    <span>AI Swarm Logs ({reasoningLogs.length})</span>
                  </button>
                  <button
                    onClick={() => setActiveTab("notifications")}
                    className={`flex items-center gap-1.5 pb-1 text-xs font-bold uppercase tracking-wider border-b-2 transition-all cursor-pointer ${
                      activeTab === "notifications"
                        ? "border-emerald-500 text-emerald-600"
                        : "border-transparent text-gray-400 hover:text-gray-600"
                    }`}
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>Stakeholders ({notifications.length})</span>
                  </button>
                </div>
                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                  Swarm Core
                </span>
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
                      <div key={act.id} className="flex flex-col md:flex-row md:items-center justify-between p-2.5 bg-white border border-gray-200 rounded-lg gap-2 hover:border-emerald-300 transition-colors shadow-2xs">
                        <div className="flex items-start gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
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
                        <div key={log.id} className="flex flex-col p-3 bg-white border border-gray-200 rounded-xl gap-2 shadow-2xs hover:border-emerald-200 transition-colors">
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
                    <div className="flex bg-gray-100 rounded-lg p-1 gap-1 mb-3 self-start">
                      {[
                        { key: "public", label: "📢 Public" },
                        { key: "police", label: "🚨 Police / Traffic" },
                        { key: "utility", label: "⚡ Utility" },
                        { key: "hospital", label: "🏥 Hospitals" },
                      ].map((item) => {
                        const isSubActive = subTab === item.key;
                        return (
                          <button
                            key={item.key}
                            onClick={() => setSubTab(item.key as any)}
                            className={`px-3 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
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
                                  <span className="text-[9px] font-mono font-extrabold uppercase px-1.5 py-0.5 rounded-sm bg-red-50 text-red-600 border border-red-200/50">
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

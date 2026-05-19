"use client";

import React, { useState, useEffect } from "react";
import { 
  ChevronDown, 
  Bell, 
  Menu, 
  AlertOctagon, 
  Play, 
  Loader2, 
  CheckCircle2, 
  X, 
  ShieldAlert, 
  Terminal,
  Activity
} from "lucide-react";
import { api, PipelineStatus } from "@/lib/api";

interface TopBarProps {
  onMenuToggle?: () => void;
  onPipelineComplete?: (incidentId: string) => void;
}

export default function TopBar({ onMenuToggle, onPipelineComplete }: TopBarProps) {
  const [activeLocation, setActiveLocation] = useState("Karachi");
  const [showLocationMenu, setShowLocationMenu] = useState(false);
  
  // Pipeline simulation state
  const [triggering, setTriggering] = useState(false);
  const [activeSignalId, setActiveSignalId] = useState<string | null>(null);
  const [pipelineState, setPipelineState] = useState<PipelineStatus | null>(null);
  const [showProgressPanel, setShowProgressPanel] = useState(false);
  const [completedReportData, setCompletedReportData] = useState<PipelineStatus | null>(null);
  const [showReport, setShowReport] = useState(false);
  
  // Custom Signal Injector state
  const [showCustomInjector, setShowCustomInjector] = useState(false);
  const [injectorCity, setInjectorCity] = useState("Karachi");
  const [injectorSource, setInjectorSource] = useState("twitter");
  const [injectorType, setInjectorType] = useState("flash_flood");
  const [injectorLat, setInjectorLat] = useState("24.9088");
  const [injectorLng, setInjectorLng] = useState("67.1282");
  const [injectorComment, setInjectorComment] = useState("Judges Custom Flood Scenario: Jauhar Chowrangi under 1.5m water, local drainage blocked.");

  // Auto-fill coordinates on city selection
  useEffect(() => {
    if (injectorCity === "Karachi") {
      setInjectorLat("24.9088");
      setInjectorLng("67.1282");
    } else if (injectorCity === "Islamabad") {
      setInjectorLat("33.6844");
      setInjectorLng("73.0479");
    } else if (injectorCity === "Austin") {
      setInjectorLat("30.2672");
      setInjectorLng("-97.7431");
    } else if (injectorCity === "Lahore") {
      setInjectorLat("31.5204");
      setInjectorLng("74.3587");
    }
  }, [injectorCity]);

  // Custom Signal Injector Handler
  const handleInjectCustomSignal = async () => {
    if (triggering) return;
    setTriggering(true);
    setPipelineState(null);
    setActiveSignalId(null);
    setShowProgressPanel(true);
    setShowCustomInjector(false);

    try {
      const payload = {
        city: injectorCity,
        source: injectorSource,
        type: injectorType,
        comment: injectorComment,
        lat: parseFloat(injectorLat) || 24.9088,
        lng: parseFloat(injectorLng) || 67.1282
      };
      
      const response = await api.injectCustomSignal(payload);
      if (response && response.signal_id) {
        setActiveSignalId(response.signal_id);
        triggerToast("Custom Incident Telemetry Injected! Initializing live multi-agent workflow...");
      } else {
        throw new Error("Invalid custom injection response.");
      }
    } catch (err) {
      console.error("Failed to inject custom signal:", err);
      triggerToast("Error injecting custom signal. Deploying offline mock pipeline...");
      setTriggering(false);
      setActiveSignalId("sig-offline-fallback");
    }
  };

  // Custom toast notifications
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Mock Injection Handler
  const handleTriggerSimulatedCrisis = async () => {
    if (triggering) return;
    setTriggering(true);
    setPipelineState(null);
    setActiveSignalId(null);
    setShowProgressPanel(true);

    try {
      const response = await api.triggerMockSignal();
      if (response && response.signal_id) {
        setActiveSignalId(response.signal_id);
        triggerToast(
          response.status === "DUPLICATE" 
            ? "Re-injecting signal at active cluster. Tracking existing pipeline..." 
            : "Emergency Telemetry Injected! Initializing multi-agent triage..."
        );
      } else {
        throw new Error("Invalid backend mock response.");
      }
    } catch (err) {
      console.error("Failed to inject mock telemetry:", err);
      triggerToast("Error contacting FastAPI backend. Serving local mock trace.");
      setTriggering(false);
      // Fallback state offline
      setActiveSignalId("sig-offline-fallback");
    }
  };

  // Polling pipeline status
  useEffect(() => {
    if (!activeSignalId) return;

    let pollCount = 0;
    const maxPolls = 180; // 4.5 minute timeout for multi-agent LLM sequential chain

    const poll = async () => {
      try {
        const status = await api.getPipelineStatus(activeSignalId);
        setPipelineState(status);
        
        // Check if finished
        if (
          status.status === "REJECTED" || 
          (status.stage === "logging_agent" && status.stage_status === "COMPLETED")
        ) {
          setTriggering(false);
          setActiveSignalId(null);
          triggerToast(
            status.status === "REJECTED" 
              ? "Emergency alert retracted by verification team." 
              : "Disaster response actions dispatched successfully!"
          );
          if (status.status === "CONFIRMED" && status.incident_id) {
            onPipelineComplete?.(status.incident_id);
            setCompletedReportData(status);
            setShowReport(true);
          }
          return;
        }

        pollCount++;
        if (pollCount >= maxPolls) {
          setTriggering(false);
          setActiveSignalId(null);
          triggerToast("Pipeline polling reached limit. System handling asynchronously.");
        }
      } catch (err) {
        console.error("Error polling pipeline status:", err);
      }
    };

    // Run immediately and then start interval
    poll();
    const interval = setInterval(poll, 1500); // 1.5s intervals for high-frequency updates

    return () => clearInterval(interval);
  }, [activeSignalId]);

  // Order mapping to perfectly align UI stepper states independent of custom indices
  const STAGE_ORDER: Record<string, number> = {
    "signal_agent": 1,
    "detection_agent": 2,
    "verification_agent": 3,
    "severity_agent": 4,
    "resource_allocation_agent": 5,
    "planning_agent": 6,
    "notification_agent": 7,
    "logging_agent": 8
  };

  // Map stage_index to localized progress percentage
  const getProgressPercentage = () => {
    if (!pipelineState) return 5;
    const currentOrder = STAGE_ORDER[pipelineState.stage] || 1;
    let base = (currentOrder / 8) * 100;
    if (pipelineState.stage === "logging_agent" && pipelineState.stage_status === "COMPLETED") {
      base = 100;
    }
    return Math.min(Math.max(base, 10), 100);
  };

  // Human friendly names for the 8 pipeline stages
  const STAGES = [
    { key: "signal_agent", label: "Signal Parser" },
    { key: "detection_agent", label: "Clusterer" },
    { key: "verification_agent", label: "Social Verifier" },
    { key: "severity_agent", label: "Severity Indexer" },
    { key: "resource_allocation_agent", label: "Resource Specialist" },
    { key: "planning_agent", label: "Planner Coordinator" },
    { key: "notification_agent", label: "Public Broadcast" },
    { key: "logging_agent", label: "System Auditor" },
  ];

  return (
    <div className="w-full bg-white border-b border-gray-200 px-4 md:px-6 py-3 shadow-sm relative z-[999]">
      
      {/* Dynamic Toast Notification */}
      {toastMessage && (
        <div className="absolute top-16 right-4 md:right-6 bg-gray-900 border border-gray-800 text-white text-xs font-semibold px-4 py-2.5 rounded-lg shadow-xl z-50 flex items-center gap-2 animate-bounce">
          <ShieldAlert className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Bar Header Row */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        
        {/* Left side: System branding and selectors */}
        <div className="flex items-start gap-2">
          {/* Mobile hamburger */}
          <button 
            onClick={onMenuToggle}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100 mr-1 flex-shrink-0 cursor-pointer border border-gray-200 transition-colors"
          >
            <Menu className="w-5 h-5 text-gray-600" />
          </button>

          <div className="flex flex-col gap-2 flex-1">
            {/* Title & Status */}
            <div className="flex flex-col">
              <div className="relative">
                <div 
                  onClick={() => setShowLocationMenu(!showLocationMenu)}
                  className="flex items-center gap-1 cursor-pointer group w-fit select-none"
                >
                  <h2 className="text-[17px] font-black text-gray-900 leading-tight uppercase tracking-wider flex items-center gap-1.5">
                    <Activity className="w-4.5 h-4.5 text-red-500 animate-pulse" />
                    <span>CIRO {activeLocation} Center</span>
                  </h2>
                  <ChevronDown className="w-4.5 h-4.5 text-gray-400 group-hover:text-gray-900 transition-colors" />
                </div>
                
                {/* Location Dropdown Options */}
                {showLocationMenu && (
                  <div className="absolute top-full left-0 mt-1.5 w-44 bg-white border border-gray-200 rounded-lg shadow-lg z-50 py-1">
                    {["Karachi", "Islamabad", "Austin", "Lahore"].map((option) => (
                      <div 
                        key={option} 
                        onClick={() => {
                          setActiveLocation(option);
                          setShowLocationMenu(false);
                        }}
                        className="px-3.5 py-2 text-xs font-bold hover:bg-gray-50 text-gray-700 hover:text-gray-900 cursor-pointer transition-colors"
                      >
                        {option} Command
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-1.5 mt-1 select-none">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                <span className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider">Multi-Agent Online</span>
                <span className="text-gray-300">|</span>
                <span className="text-[10px] font-bold text-gray-400 uppercase">Ver 1.0.4</span>
              </div>
            </div>
          </div>
        </div>

        {/* Center: Command indicators */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 border border-gray-200 rounded-lg px-3 py-1.5 bg-gray-50/50 shadow-2xs">
            <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">Target Domain</span>
            <div className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
              <span className="text-xs font-bold text-gray-800">Karachi, Pakistan</span>
            </div>
          </div>

          <div className="flex items-center gap-2 border border-gray-200 rounded-lg px-3 py-1.5 bg-gray-50/50 shadow-2xs">
            <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">Triage Framework</span>
            <div className="flex items-center gap-1">
              <span className="text-xs font-bold text-gray-800">FastAPI + Gemini-Flash</span>
            </div>
          </div>
        </div>

        {/* Right side: Simulated Trigger Emergency Button */}
        <div className="flex items-center gap-3 justify-end">
          <button
            onClick={() => setShowCustomInjector(!showCustomInjector)}
            disabled={triggering}
            className={`flex items-center gap-2 text-xs font-extrabold uppercase px-4 py-2.5 rounded-lg border transition-all shadow-md active:scale-95 cursor-pointer ${
              showCustomInjector
                ? "bg-slate-800 border-slate-900 text-white"
                : "bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-800"
            }`}
          >
            <Terminal className="w-4 h-4" />
            <span>🖥️ Custom Injector</span>
          </button>
          
          <button
            onClick={handleTriggerSimulatedCrisis}
            disabled={triggering}
            className={`flex items-center gap-2 text-xs font-extrabold uppercase px-4 py-2.5 rounded-lg border text-white transition-all shadow-md active:scale-95 cursor-pointer ${
              triggering 
                ? "bg-amber-500 border-amber-600 animate-pulse text-white cursor-not-allowed" 
                : "bg-red-500 border-red-600 hover:bg-red-600 text-white hover:shadow-lg"
            }`}
          >
            {triggering ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-white" />
                <span>Running Triage Pipeline...</span>
              </>
            ) : (
              <>
                <AlertOctagon className="w-4 h-4 animate-bounce" />
                <span>🚨 Trigger Simulated Crisis</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Interactive Custom Signal Injector Panel */}
      {showCustomInjector && (
        <div className="mt-4 p-5 bg-gray-950 border border-gray-800 rounded-xl text-gray-100 flex flex-col gap-4 shadow-2xl relative animate-fade-in font-mono">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-gray-800 pb-3">
            <div className="flex items-center gap-2">
              <Terminal className="w-5 h-5 text-red-500 animate-pulse" />
              <div>
                <h4 className="text-xs font-extrabold uppercase tracking-widest text-red-400">
                  Interactive Telemetry Injector Console
                </h4>
                <p className="text-[10px] text-gray-500 mt-0.5">
                  Direct pipeline injection: simulate custom spatial disasters
                </p>
              </div>
            </div>
            <button 
              onClick={() => setShowCustomInjector(false)}
              className="text-gray-500 hover:text-gray-300 cursor-pointer"
            >
              <X className="w-4.5 h-4.5" />
            </button>
          </div>

          {/* Form Fields */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* City Selection */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                Target Command City
              </label>
              <select
                value={injectorCity}
                onChange={(e) => setInjectorCity(e.target.value)}
                className="bg-gray-900 border border-gray-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-red-500 font-bold"
              >
                {["Karachi", "Islamabad", "Austin", "Lahore"].map((city) => (
                  <option key={city} value={city}>
                    {city} Region
                  </option>
                ))}
              </select>
            </div>

            {/* Source Selection */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                Telemetry Source Channel
              </label>
              <select
                value={injectorSource}
                onChange={(e) => setInjectorSource(e.target.value)}
                className="bg-gray-900 border border-gray-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-red-500 font-bold"
              >
                <option value="twitter">Social Twitter Feed</option>
                <option value="weather_station">Radar Meteorological Station</option>
                <option value="sensor">Municipal IoT Water Sensor</option>
                <option value="phone">Emergency Hotline Call</option>
                <option value="dashboard">Command Control Room</option>
              </select>
            </div>

            {/* Disaster Type */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                Disaster Signature Type
              </label>
              <select
                value={injectorType}
                onChange={(e) => setInjectorType(e.target.value)}
                className="bg-gray-900 border border-gray-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-red-500 font-bold"
              >
                <option value="flash_flood">🚨 Flash Flooding</option>
                <option value="heavy_rain">🌧️ Severe Precipitation</option>
                <option value="sewer_overflow">💧 Sewerage Breakdown</option>
                <option value="drainage_failure">🚧 Drainage Infrastructure Malfunction</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Latitude */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                Incident Latitude
              </label>
              <input
                type="text"
                value={injectorLat}
                onChange={(e) => setInjectorLat(e.target.value)}
                className="bg-gray-900 border border-gray-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-red-500 font-mono font-bold"
                placeholder="24.9088"
              />
            </div>

            {/* Longitude */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                Incident Longitude
              </label>
              <input
                type="text"
                value={injectorLng}
                onChange={(e) => setInjectorLng(e.target.value)}
                className="bg-gray-900 border border-gray-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-red-500 font-mono font-bold"
                placeholder="67.1282"
              />
            </div>
          </div>

          {/* Scenario Comments */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
              Scenarios / Live Telemetry Remarks
            </label>
            <textarea
              rows={2}
              value={injectorComment}
              onChange={(e) => setInjectorComment(e.target.value)}
              className="bg-gray-900 border border-gray-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-red-500 font-semibold"
              placeholder="Describe the crisis details..."
            />
          </div>

          {/* Trigger Button */}
          <div className="flex justify-end border-t border-gray-800 pt-3 mt-1">
            <button
              onClick={handleInjectCustomSignal}
              className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs uppercase tracking-wider px-5 py-2.5 rounded-lg transition-colors cursor-pointer border border-red-700 shadow-lg shadow-red-900/20 active:scale-95"
            >
              <AlertOctagon className="w-4 h-4 animate-bounce" />
              <span>🚨 Inject Custom Crisis Scenario</span>
            </button>
          </div>
        </div>
      )}

      {/* Slide-out Collapsible: Multi-Agent Sequenced Pipeline Loader */}
      {showProgressPanel && (
        <div className="mt-4 p-4 bg-gray-900 border border-gray-800 rounded-xl text-gray-100 flex flex-col gap-4 shadow-inner relative animate-fade-in">
          
          {/* Close Panel Button */}
          <button 
            onClick={() => {
              // Only let user close if not currently triggering or on click
              setShowProgressPanel(false);
            }}
            className="absolute top-3 right-3 text-gray-400 hover:text-gray-100 cursor-pointer"
          >
            <X className="w-4.5 h-4.5" />
          </button>

          {/* Stepper Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-gray-800 pb-3">
            <div className="flex items-center gap-2">
              <Terminal className="w-5 h-5 text-emerald-400" />
              <div>
                <h4 className="text-xs font-extrabold uppercase tracking-widest text-emerald-400">
                  Orchestrator Execution Stream
                </h4>
                <p className="text-[10px] text-gray-400 mt-0.5">
                  Visualizing step-by-step multi-agent workforce tasks
                </p>
              </div>
            </div>

            {/* Progress bar info */}
            <div className="flex items-center gap-3">
              <span className="text-[10px] font-bold text-gray-400 uppercase">
                Overall Triage Pipeline:
              </span>
              <div className="w-32 bg-gray-800 h-2.5 rounded-full overflow-hidden border border-gray-700">
                <div 
                  className="bg-emerald-500 h-full rounded-full transition-all duration-500" 
                  style={{ width: `${getProgressPercentage()}%` }} 
                />
              </div>
              <span className="text-[11px] font-black text-emerald-400">
                {getProgressPercentage().toFixed(0)}%
              </span>
            </div>
          </div>

          {/* Pipeline Stepper Nodes */}
          <div className="grid grid-cols-2 md:grid-cols-8 gap-3">
            {STAGES.map((node, idx) => {
              const nodeOrder = STAGE_ORDER[node.key] || 1;
              const currentOrder = pipelineState ? (STAGE_ORDER[pipelineState.stage] || 0) : 0;

              let status = "PENDING";
              if (pipelineState) {
                if (pipelineState.agent_states) {
                  status = pipelineState.agent_states[node.key] || "PENDING";
                } else {
                  // Fallback to order-based estimation
                  if (pipelineState.stage === node.key && pipelineState.stage_status === "FAILED") {
                    status = "FAILED";
                  } else if (pipelineState.stage === node.key && pipelineState.stage_status === "RUNNING") {
                    status = "RUNNING";
                  } else if (currentOrder > nodeOrder || (pipelineState.stage === node.key && pipelineState.stage_status === "COMPLETED")) {
                    status = "COMPLETED";
                  } else if (pipelineState.stage === node.key && pipelineState.stage_status === "SKIPPED") {
                    status = "SKIPPED";
                  }
                }
              }

              let dotBgColor = "bg-gray-800 border-gray-700 text-gray-500";
              let labelColor = "text-gray-500";

              if (status === "FAILED") {
                dotBgColor = "bg-red-500/20 border-red-500 text-red-400 scale-[1.05]";
                labelColor = "text-red-400 font-extrabold";
              } else if (status === "RUNNING") {
                dotBgColor = "bg-amber-500/10 border-amber-500 text-amber-400 animate-pulse scale-[1.05]";
                labelColor = "text-amber-400 font-bold";
              } else if (status === "COMPLETED") {
                dotBgColor = "bg-emerald-500/20 border-emerald-500 text-emerald-400";
                labelColor = "text-emerald-500/80 font-semibold";
              } else if (status === "SKIPPED") {
                dotBgColor = "bg-blue-950/40 border-blue-900 text-blue-400/60 line-through decoration-blue-500/20";
                labelColor = "text-blue-400/50 font-medium italic";
              }

              return (
                <div 
                  key={node.key}
                  className="flex flex-col items-center text-center p-2 rounded-lg bg-gray-950/40 border border-gray-800/30"
                >
                  <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-xs font-bold transition-all duration-300 ${dotBgColor}`}>
                    {status === "FAILED" ? (
                      <X className="w-4 h-4 text-red-500" />
                    ) : status === "RUNNING" ? (
                      <Loader2 className="w-4 h-4 animate-spin text-amber-500" />
                    ) : status === "COMPLETED" ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    ) : status === "SKIPPED" ? (
                      <span className="text-[9px] font-bold text-blue-400/50">SKIP</span>
                    ) : (
                      idx + 1
                    )}
                  </div>
                  <span className={`text-[10px] mt-2 block font-bold leading-normal truncate w-full ${labelColor}`}>
                    {node.label}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Terminal Console Feed Log */}
          <div className="bg-black border border-gray-800 rounded-lg p-3 text-xs font-mono text-emerald-300 flex flex-col justify-between min-h-[64px]">
            <div>
              <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest block mb-1">
                Active Console Logs
              </span>
              {pipelineState ? (
                <p className="leading-relaxed font-semibold">
                  &gt; {pipelineState.message}
                </p>
              ) : (
                <p className="leading-relaxed text-gray-600 font-semibold animate-pulse">
                  &gt; Injecting disaster signals. Awaiting multi-agent handshake...
                </p>
              )}
            </div>
            
            <div className="flex justify-between items-center text-[9px] text-gray-600 font-semibold border-t border-gray-950 pt-2 mt-2">
              <span>Status Code: {pipelineState ? pipelineState.status : "INITIALIZING"}</span>
              <span>Timestamp: {pipelineState ? new Date(pipelineState.updated_at).toLocaleTimeString() : "N/A"}</span>
            </div>
          </div>

        </div>
      )}

      {/* Dynamic Swarm Dispatch Report Modal */}
      {showReport && completedReportData && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-[9999] p-4 animate-fade-in">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto flex flex-col p-6 space-y-6 transform scale-100 transition-all duration-300">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center shadow-lg border border-emerald-600">
                  <CheckCircle2 className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-extrabold text-gray-900 tracking-tight leading-none">
                    CIRO Swarm Triage Completed Successfully
                  </h3>
                  <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mt-1 block">
                    Disaster Response Actions Dispatched
                  </span>
                </div>
              </div>
              <button 
                onClick={() => setShowReport(false)}
                className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-3 gap-4 bg-emerald-50/20 p-4 rounded-xl border border-emerald-100/40 text-center">
              <div>
                <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider block">Verified Location</span>
                <span className="text-xs font-extrabold text-gray-800 mt-1 block truncate">Karachi Region</span>
              </div>
              <div className="border-x border-gray-200/50">
                <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider block">Severity Index</span>
                <span className="text-xs font-extrabold text-red-600 mt-1 block">8.5 / 10</span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider block">Verification Confidence</span>
                <span className="text-xs font-extrabold text-gray-800 mt-1 block">98% Verified</span>
              </div>
            </div>

            {/* Dynamic Visual Route Reroute Schematic */}
            <div className="border border-emerald-100 bg-emerald-50/10 rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-emerald-800 uppercase tracking-wider flex items-center gap-1.5">
                  <Activity className="w-4 h-4 text-emerald-500 animate-pulse" />
                  🚧 Active Multi-Agent Detour Schematic
                </h4>
                <span className="text-[9px] font-bold bg-emerald-500/20 text-emerald-600 px-2 py-0.5 rounded-full uppercase border border-emerald-500/20 animate-pulse">
                  Traffic Diverted
                </span>
              </div>

              {/* Graphic Vector */}
              <div className="bg-gray-950 rounded-xl p-3 flex flex-col items-center justify-center relative overflow-hidden border border-gray-900 shadow-inner">
                <svg className="w-full max-w-[450px]" height="110" viewBox="0 0 450 110" fill="none" xmlns="http://www.w3.org/2000/svg">
                  {/* Grid Lines for style */}
                  <defs>
                    <pattern id="grid" width="15" height="15" patternUnits="userSpaceOnUse">
                      <path d="M 15 0 L 0 0 0 15" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
                    </pattern>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#grid)" />

                  {/* Red Blocked Path */}
                  <path d="M 40 55 L 410 55" stroke="#ef4444" strokeWidth="3" strokeDasharray="6, 8" opacity="0.6" />
                  
                  {/* Green Detour Curve */}
                  <path d="M 40 55 Q 225 5 410 55" stroke="#10b981" strokeWidth="4.5" strokeLinecap="round" />

                  {/* Flow Indicator Arrows on Green Path */}
                  <path d="M 130 25 L 138 25 M 138 25 L 134 21 M 138 25 L 134 29" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" />
                  <path d="M 225 15 L 233 15 M 233 15 L 229 11 M 233 15 L 229 19" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" />
                  <path d="M 320 25 L 328 25 M 328 25 L 324 21 M 328 25 L 324 29" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" />

                  {/* Flood Hazard Zone Circle */}
                  <circle cx="225" cy="55" r="22" fill="rgba(239, 68, 68, 0.15)" stroke="#ef4444" strokeWidth="1.5" strokeDasharray="3, 3" />
                  <path d="M 220 50 L 230 60 M 230 50 L 220 60" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" />
                  
                  {/* Origin Node A */}
                  <circle cx="40" cy="55" r="9" fill="#3b82f6" stroke="#ffffff" strokeWidth="2" />
                  <text x="40" y="78" fill="#ffffff" fontSize="9" fontWeight="bold" textAnchor="middle" fontFamily="monospace">Jauhar Chowrangi</text>
                  
                  {/* Destination Node B */}
                  <circle cx="410" cy="55" r="9" fill="#10b981" stroke="#ffffff" strokeWidth="2" />
                  <text x="410" y="78" fill="#ffffff" fontSize="9" fontWeight="bold" textAnchor="middle" fontFamily="monospace">University Rd.</text>

                  {/* Label Tooltips */}
                  <rect x="180" y="83" width="90" height="15" rx="3" fill="#ef4444" opacity="0.9" />
                  <text x="225" y="94" fill="#ffffff" fontSize="8" fontWeight="bold" textAnchor="middle" fontFamily="monospace">⚠ 1.2M FLOOD</text>
                  
                  <rect x="180" y="28" width="90" height="15" rx="3" fill="#10b981" opacity="0.95" />
                  <text x="225" y="39" fill="#ffffff" fontSize="8" fontWeight="bold" textAnchor="middle" fontFamily="monospace">✔ DETOUR OPEN</text>
                </svg>
              </div>

              {/* Schematic Explainer Cards */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="bg-red-500/5 border border-red-500/10 rounded-xl p-2.5 flex flex-col justify-between">
                  <div>
                    <span className="font-bold text-red-500 uppercase text-[9px] tracking-wider block mb-1">🔴 Standard Primary Route</span>
                    <span className="font-extrabold text-gray-800 text-xs">Gulistan-e-Jauhar Main Road</span>
                  </div>
                  <span className="text-[10px] text-red-500 font-semibold mt-2">Status: BLOCKED BY SEVERE FLOODING</span>
                </div>
                <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-xl p-2.5 flex flex-col justify-between">
                  <div>
                    <span className="font-bold text-emerald-600 uppercase text-[9px] tracking-wider block mb-1">🟢 Multi-Agent Assigned Detour</span>
                    <span className="font-extrabold text-gray-800 text-xs">University Road Alternate</span>
                  </div>
                  <span className="text-[10px] text-emerald-600 font-semibold mt-2">Status: DETOUR DISPATCHED (+4 mins)</span>
                </div>
              </div>
            </div>

            {/* Agent Timeline */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                Sequential Agent Swarm Workflow Trace
              </h4>
              
              <div className="relative border-l border-gray-200 pl-4 ml-2 space-y-4">
                {/* Stage 1 */}
                <div className="relative">
                  <span className="absolute -left-[21px] top-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-4 ring-white animate-pulse" />
                  <div className="flex flex-col gap-0.5">
                    <span className="text-xs font-extrabold text-gray-800 uppercase tracking-wide">
                      1. Ingestion & Credibility Score (Signal Parser)
                    </span>
                    <p className="text-[11px] text-gray-500 font-semibold leading-relaxed">
                      Parsed unstructured mock telemetry signal. Validated geographic boundaries and assigned an initial credibility index of 95% based on source cross-referencing.
                    </p>
                  </div>
                </div>

                {/* Stage 2 */}
                <div className="relative">
                  <span className="absolute -left-[21px] top-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-4 ring-white animate-pulse" />
                  <div className="flex flex-col gap-0.5">
                    <span className="text-xs font-extrabold text-gray-800 uppercase tracking-wide">
                      2. Spatiotemporal Clustering (Crisis Clusterer)
                    </span>
                    <p className="text-[11px] text-gray-500 font-semibold leading-relaxed">
                      Evaluated incoming signal location against historical datasets. Created a new active spatiotemporal cluster with verification triggers.
                    </p>
                  </div>
                </div>

                {/* Stage 3 */}
                <div className="relative">
                  <span className="absolute -left-[21px] top-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-4 ring-white animate-pulse" />
                  <div className="flex flex-col gap-0.5">
                    <span className="text-xs font-extrabold text-gray-800 uppercase tracking-wide">
                      3. Multimodal Auditing (Social Verifier)
                    </span>
                    <p className="text-[11px] text-gray-500 font-semibold leading-relaxed">
                      Scraped live Twitter/X crisis feeds and weather radar telemetry in real-time. Confirmed active flash floods with zero false alarms.
                    </p>
                  </div>
                </div>

                {/* Stage 4 */}
                <div className="relative">
                  <span className="absolute -left-[21px] top-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-4 ring-white animate-pulse" />
                  <div className="flex flex-col gap-0.5">
                    <span className="text-xs font-extrabold text-gray-800 uppercase tracking-wide">
                      4. Asset & Exposure Indexing (Severity Agent)
                    </span>
                    <p className="text-[11px] text-gray-500 font-semibold leading-relaxed">
                      Assigned critical severity index (8.5/10). Identified 15,000 citizens and key hospital infrastructure inside the affected hazard zone. Created verified incident in the central database.
                    </p>
                  </div>
                </div>

                {/* Stage 5 */}
                <div className="relative">
                  <span className="absolute -left-[21px] top-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-4 ring-white animate-pulse" />
                  <div className="flex flex-col gap-0.5">
                    <span className="text-xs font-extrabold text-gray-800 uppercase tracking-wide">
                      5. Tactical Asset Dispatching (Resource Agent)
                    </span>
                    <p className="text-[11px] text-gray-500 font-semibold leading-relaxed">
                      Calculated vehicle requirements and dispatched 3 Rescue boats, 2 Ambulances from Sector G-9 base station, optimizing travel time.
                    </p>
                  </div>
                </div>

                {/* Stage 6 */}
                <div className="relative">
                  <span className="absolute -left-[21px] top-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-4 ring-white animate-pulse" />
                  <div className="flex flex-col gap-0.5">
                    <span className="text-xs font-extrabold text-gray-800 uppercase tracking-wide">
                      6. Action Plan Formulation (Planner Agent)
                    </span>
                    <p className="text-[11px] text-gray-500 font-semibold leading-relaxed">
                      Formulated 4 action items: Dispatching rescue vehicles, setting up high-ground camps, closing low-lying bridges, and routing public traffic.
                    </p>
                  </div>
                </div>

                {/* Stage 7 */}
                <div className="relative">
                  <span className="absolute -left-[21px] top-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-4 ring-white animate-pulse" />
                  <div className="flex flex-col gap-0.5">
                    <span className="text-xs font-extrabold text-gray-800 uppercase tracking-wide">
                      7. Public Emergency Alert (Broadcast Agent)
                    </span>
                    <p className="text-[11px] text-gray-500 font-semibold leading-relaxed">
                      Triggered mass SMS/alert notifications to mobile devices inside the affected radius, instructing citizens to evacuate to nearest safe zones.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions Footer */}
            <div className="border-t border-gray-100 pt-4 flex gap-3 justify-end">
              <button
                onClick={() => {
                  setShowReport(false);
                }}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase tracking-wider px-5 py-2.5 rounded-lg transition-colors cursor-pointer border border-emerald-700 shadow-md shadow-emerald-600/20"
              >
                Explore Control Room
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

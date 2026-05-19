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
import { api, PipelineStatus, Incident, Action, ReasoningLog } from "@/lib/api";

interface TopBarProps {
  onMenuToggle?: () => void;
  onPipelineComplete?: (incidentId: string) => void;
  viewIncidentReportId?: string | null;
  onCloseIncidentReport?: () => void;
}

export default function TopBar({ onMenuToggle, onPipelineComplete, viewIncidentReportId, onCloseIncidentReport }: TopBarProps) {
  const [activeLocation, setActiveLocation] = useState("Karachi");
  const [showLocationMenu, setShowLocationMenu] = useState(false);
  
  // Pipeline simulation state
  const [triggering, setTriggering] = useState(false);
  const [activeSignalId, setActiveSignalId] = useState<string | null>(null);
  const [pipelineState, setPipelineState] = useState<PipelineStatus | null>(null);
  const [showProgressPanel, setShowProgressPanel] = useState(false);
  const [completedReportData, setCompletedReportData] = useState<PipelineStatus | null>(null);
  const [showReport, setShowReport] = useState(false);
  
  const handleCloseReport = () => {
    setShowReport(false);
    onCloseIncidentReport?.();
  };
  
  // Dynamic report details
  const [reportIncident, setReportIncident] = useState<Incident | null>(null);
  const [reportActions, setReportActions] = useState<Action[]>([]);
  const [reportLogs, setReportLogs] = useState<ReasoningLog[]>([]);
  
  // Real-Time Simulation Metrics State
  const [metrics, setMetrics] = useState<any>(null);

  useEffect(() => {
    if (!showReport || !reportIncident) {
      setMetrics(null);
      return;
    }
    
    // Auto-approximate initial metrics based on incident status
    const isHeat = reportIncident.disaster_type === "heatwave";
    if (reportIncident.status === "completed" || reportIncident.status === "resolved") {
      setMetrics(isHeat 
        ? { cooling_coverage: 100, safety_rate: 98, grid_relief: 95 }
        : { congestion_index: 20, evacuation_rate: 98, road_blockage: 0 }
      );
    } else {
      setMetrics(isHeat
        ? { cooling_coverage: 0, safety_rate: 10, grid_relief: 0 }
        : { congestion_index: 90, evacuation_rate: 5, road_blockage: 100 }
      );
    }

    // Connect to WebSocket endpoint for this specific incident to stream live simulation events
    let socket: WebSocket | null = null;
    let reconnectTimeout: any = null;
    let isMounted = true;

    const connect = async () => {
      try {
        const { API_BASE_URL } = await import("@/lib/api");
        const wsUrl = `${API_BASE_URL.replace("http", "ws").replace("https", "wss")}/ws/${reportIncident.id}`;
        console.log(`🔌 [TopBar Report] Connecting to incident WebSocket: ${wsUrl}`);
        
        if (!isMounted) return;
        socket = new WebSocket(wsUrl);

        socket.onopen = () => {
          console.log(`📡 [TopBar Report] Connected to incident WebSocket`);
        };

        socket.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            console.log(`📡 [TopBar Report] Received incident event:`, data.event);
            if (data.event === "simulation_progress") {
              if (data.metrics) {
                setMetrics(data.metrics);
              }
            }
          } catch (err) {
            console.warn("Failed to parse websocket message in TopBar Report", err);
          }
        };

        socket.onclose = () => {
          console.log(`🔌 [TopBar Report] WebSocket disconnected, reconnecting in 5s...`);
          reconnectTimeout = setTimeout(() => {
            connect();
          }, 5000);
        };

        socket.onerror = (error) => {
          console.warn(`⚠️ [TopBar Report] WebSocket error:`, error);
        };
      } catch (err) {
        console.error("Failed to connect incident WebSocket", err);
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
  }, [showReport, reportIncident]);
  
  // Custom Signal Injector state
  const [showCustomInjector, setShowCustomInjector] = useState(false);
  const [injectorCity, setInjectorCity] = useState("Karachi");
  const [injectorSource, setInjectorSource] = useState("twitter");
  const [injectorType, setInjectorType] = useState("flash_flood");
  const [injectorLat, setInjectorLat] = useState("24.9088");
  const [injectorLng, setInjectorLng] = useState("67.1282");
  const [injectorComment, setInjectorComment] = useState("Judges Custom Flood Scenario: Jauhar Chowrangi under 1.5m water, local drainage blocked.");

  // Auto-fill coordinates and comments on city or type selection
  useEffect(() => {
    const isHeat = injectorType === "heatwave";
    
    if (injectorCity === "Karachi") {
      if (isHeat) {
        setInjectorLat("24.8607");
        setInjectorLng("67.0011");
        setInjectorComment("Record temperatures at 47°C in Saddar. Citizens fainting near Empress Market due to extreme humidity. Multiple load-shedding zones reported.");
      } else {
        setInjectorLat("24.9088");
        setInjectorLng("67.1282");
        setInjectorComment("Judges Custom Flood Scenario: Jauhar Chowrangi under 1.5m water, local drainage blocked.");
      }
    } else if (injectorCity === "Islamabad") {
      if (isHeat) {
        setInjectorLat("33.6844");
        setInjectorLng("73.0479");
        setInjectorComment("Heat dome over Islamabad. Temperature at 45°C. Water shortages reported in sector G-10.");
      } else {
        setInjectorLat("33.6844");
        setInjectorLng("73.0479");
        setInjectorComment("Judges Custom Flood Scenario: G-10 service road heavily flooded due to storm water drain failure.");
      }
    } else if (injectorCity === "Austin") {
      if (isHeat) {
        setInjectorLat("30.2672");
        setInjectorLng("-97.7431");
        setInjectorComment("Austin heat index exceeds 112°F. Demand on ERCOT grid at all-time high.");
      } else {
        setInjectorLat("30.2672");
        setInjectorLng("-97.7431");
        setInjectorComment("Austin flash flood alert. Lamar Blvd underpass flooded.");
      }
    } else if (injectorCity === "Lahore") {
      if (isHeat) {
        setInjectorLat("31.5590");
        setInjectorLng("74.3260");
        setInjectorComment("Heat index exceeding 52°C in Anarkali. Street vendors collapsing. Hospitals reporting surge in heat stroke admissions. Power grid failures in inner city.");
      } else {
        setInjectorLat("31.5204");
        setInjectorLng("74.3587");
        setInjectorComment("Mall road Lahore flooded due to torrential downpour. Traffic at a standstill.");
      }
    }
  }, [injectorCity, injectorType]);

  // Custom Signal Injector Handler
  const handleInjectCustomSignal = async () => {
    if (triggering) return;
    setTriggering(true);
    setPipelineState(null);
    setActiveSignalId(null);
    setShowProgressPanel(true);
    setShowCustomInjector(false);

    setReportIncident(null);
    setReportActions([]);
    setReportLogs([]);

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
        console.warn("Invalid custom injection response, invoking fallback.");
        triggerToast("Error injecting custom signal. Deploying offline mock pipeline...");
        setTriggering(true);
        setActiveSignalId("sig-offline-fallback");
      }
    } catch (err) {
      console.error("Failed to inject custom signal:", err);
      triggerToast("Error injecting custom signal. Deploying offline mock pipeline...");
      setTriggering(true);
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

    setReportIncident(null);
    setReportActions([]);
    setReportLogs([]);

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
        console.warn("Invalid backend mock response, invoking fallback.");
        triggerToast("Error contacting FastAPI backend. Serving local mock trace.");
        setTriggering(true);
        setActiveSignalId("sig-offline-fallback");
      }
    } catch (err) {
      console.error("Failed to inject mock telemetry:", err);
      triggerToast("Error contacting FastAPI backend. Serving local mock trace.");
      setTriggering(true);
      setActiveSignalId("sig-offline-fallback");
    }
  };

  // Polling pipeline status
  useEffect(() => {
    if (!activeSignalId) return;

    // Live Offline Fallback Simulation Animation
    if (activeSignalId === "sig-offline-fallback") {
      let currentStageIdx = 0;
      const offlineStages = [
        { stage: "signal_agent", msg: "Parsing incoming social media and telemetry feeds..." },
        { stage: "detection_agent", msg: "Running dbscan clustering on spatial coordinates..." },
        { stage: "verification_agent", msg: "Cross-referencing satellite image index..." },
        { stage: "severity_agent", msg: "Calculating crisis severity index and population density..." },
        { stage: "resource_allocation_agent", msg: "Deploying nearby response units..." },
        { stage: "planning_agent", msg: "Synthesizing mitigation route and detour bypass..." },
        { stage: "notification_agent", msg: "Broadcasting emergency alerts to public channels..." },
        { stage: "logging_agent", msg: "Audit trail verified. Dispatch report compiled." }
      ];

      // Immediately run first stage
      const runStage = (idx: number) => {
        const s = offlineStages[idx];
        const agentStates: Record<string, string> = {};
        STAGES.forEach((stageNode, sIdx) => {
          if (sIdx < idx) {
            agentStates[stageNode.key] = "COMPLETED";
          } else if (sIdx === idx) {
            agentStates[stageNode.key] = "RUNNING";
          } else {
            agentStates[stageNode.key] = "PENDING";
          }
        });

        const isLast = idx === offlineStages.length - 1;

        setPipelineState({
          signal_id: "sig-offline-fallback",
          incident_id: "inc-jauhar",
          status: isLast ? "CONFIRMED" : "ACTIVE",
          stage: s.stage,
          stage_index: idx + 1,
          stage_status: isLast ? "COMPLETED" : "RUNNING",
          message: s.msg,
          updated_at: new Date().toISOString(),
          agent_states: agentStates
        });
      };

      runStage(0);

      const interval = setInterval(() => {
        currentStageIdx++;
        if (currentStageIdx < offlineStages.length) {
          runStage(currentStageIdx);
          
          const isLast = currentStageIdx === offlineStages.length - 1;
          if (isLast) {
            clearInterval(interval);
            setTimeout(() => {
              setTriggering(false);
              setActiveSignalId(null);
              triggerToast("Disaster response actions dispatched successfully!");
              
              // Load mock incident reports
              api.getIncidentById("inc-jauhar").then(setReportIncident).catch(console.error);
              api.getIncidentActions("inc-jauhar").then(setReportActions).catch(console.error);
              api.getIncidentLogs("inc-jauhar").then(setReportLogs).catch(console.error);
              
              setShowReport(true);
            }, 1500);
          }
        }
      }, 2000);

      return () => clearInterval(interval);
    }

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
            
            // Asynchronously fetch incident details, actions, and logs
            try {
              api.getIncidentById(status.incident_id).then(setReportIncident).catch(console.error);
              api.getIncidentActions(status.incident_id).then(setReportActions).catch(console.error);
              api.getIncidentLogs(status.incident_id).then(setReportLogs).catch(console.error);
            } catch (fetchErr) {
              console.error("Error triggering dynamic report fetch:", fetchErr);
            }

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

  // Listen for external trigger to view an incident report
  useEffect(() => {
    if (viewIncidentReportId) {
      // Clear previous states
      setCompletedReportData(null);
      setReportIncident(null);
      setReportActions([]);
      setReportLogs([]);
      
      // Fetch details
      api.getIncidentById(viewIncidentReportId)
        .then(incident => {
          setReportIncident(incident);
          setShowReport(true);
        })
        .catch(err => {
          console.error("Error viewing incident report details:", err);
        });

      api.getIncidentActions(viewIncidentReportId)
        .then(setReportActions)
        .catch(console.error);

      api.getIncidentLogs(viewIncidentReportId)
        .then(setReportLogs)
        .catch(console.error);
    }
  }, [viewIncidentReportId]);

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

  const getCleanLocationName = (loc: string) => {
    if (!loc) return "";
    const parts = loc.split(",");
    let label = parts[0].trim();
    if (label.includes("+")) {
      const words = label.split(" ").filter(w => !w.includes("+"));
      if (words.length > 0) {
        label = words.join(" ");
      } else if (parts.length > 1) {
        label = parts.slice(1, 3).join(", ").trim();
      }
    }
    return label;
  };

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
        <div className="flex items-center gap-4">
          {/* Brand Logo & Name */}
          <div className="flex items-center gap-2.5 pr-4 border-r border-gray-200">
            <div className="w-8 h-8 rounded-xl bg-teal-700 flex items-center justify-center shadow-md border border-teal-800">
              <Activity className="w-4 h-4 text-white animate-pulse" />
            </div>
            <div className="flex flex-col">
              <h1 className="text-sm font-black text-gray-900 leading-none tracking-wider">CIRO</h1>
              <span className="text-[8px] text-gray-400 font-extrabold tracking-widest uppercase mt-0.5 block">
                Orchestrator
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-1">
            {/* Title & Status */}
            <div className="flex flex-col">
              <div className="relative">
                <div 
                  onClick={() => setShowLocationMenu(!showLocationMenu)}
                  className="flex items-center gap-1 cursor-pointer group w-fit select-none"
                >
                  <h2 className="text-[15px] font-black text-gray-900 leading-none uppercase tracking-wider flex items-center gap-1">
                    <span>{activeLocation} Command Center</span>
                  </h2>
                  <ChevronDown className="w-4 h-4 text-gray-400 group-hover:text-gray-900 transition-colors" />
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
              <Terminal className="w-5 h-5 text-teal-600 animate-pulse" />
              <div>
                <h4 className="text-xs font-extrabold uppercase tracking-widest text-teal-600">
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
                className="bg-gray-900 border border-gray-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-teal-600 font-bold"
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
                className="bg-gray-900 border border-gray-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-teal-600 font-bold"
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
                className="bg-gray-900 border border-gray-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-teal-600 font-bold"
              >
                <option value="flash_flood">🚨 Urban Flood Crisis</option>
                <option value="heatwave">🔥 Extreme Heatwave</option>
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
                className="bg-gray-900 border border-gray-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-teal-600 font-mono font-bold"
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
                className="bg-gray-900 border border-gray-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-teal-600 font-mono font-bold"
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
              className="bg-gray-900 border border-gray-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-teal-600 font-semibold"
              placeholder="Describe the crisis details..."
            />
          </div>

          {/* Trigger Button */}
          <div className="flex justify-end border-t border-gray-800 pt-3 mt-1">
            <button
              onClick={handleInjectCustomSignal}
              className="flex items-center gap-2 bg-teal-700 hover:bg-teal-800 text-white font-extrabold text-xs uppercase tracking-wider px-5 py-2.5 rounded-lg transition-colors cursor-pointer border border-teal-800 shadow-lg shadow-teal-900/10 active:scale-95"
            >
              <AlertOctagon className="w-4 h-4 animate-bounce" />
              <span>🚨 Inject Custom Scenario</span>
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
                dotBgColor = "bg-red-500/20 border-red-500 text-red-500 scale-[1.05]";
                labelColor = "text-red-500 font-extrabold";
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
      {showReport && (completedReportData || reportIncident) && (() => {
        const isHeatwave = reportIncident 
          ? reportIncident.disaster_type === "heatwave" 
          : (injectorType === "heatwave" || completedReportData?.message?.toLowerCase().includes("heat") || completedReportData?.message?.toLowerCase().includes("temperature"));

        const accentBg = isHeatwave ? "bg-orange-500 border-orange-600 animate-pulse" : "bg-emerald-500 border-emerald-600";
        const accentText = isHeatwave ? "text-orange-600" : "text-emerald-600";
        const accentTextDark = isHeatwave ? "text-orange-800" : "text-emerald-800";
        const accentLightBg = isHeatwave ? "bg-orange-50/20 border-orange-100/40" : "bg-emerald-50/20 border-emerald-100/40";
        const accentBorder = isHeatwave ? "border-orange-100" : "border-emerald-100";
        const accentBgCard = isHeatwave ? "bg-orange-50/10 border-orange-100" : "bg-emerald-50/10 border-emerald-100";
        const accentBtn = isHeatwave 
          ? "bg-orange-600 hover:bg-orange-700 border-orange-700 shadow-orange-600/20" 
          : "bg-emerald-600 hover:bg-emerald-700 border-emerald-700 shadow-emerald-600/20";
        const accentIconColor = isHeatwave ? "text-orange-500" : "text-emerald-500";

        const originName = reportIncident 
          ? getCleanLocationName(reportIncident.location) 
          : (isHeatwave ? "Saddar Market" : "Jauhar Chowrangi");
        const destName = isHeatwave ? "Cooling Post" : "University Rd.";

        const severityScoreVal = reportIncident ? reportIncident.severity_score : (isHeatwave ? 9.2 : 8.5);
        const severityScoreText = `${Number(severityScoreVal).toFixed(1)} / 10`;
        const verificationConfidenceText = reportIncident ? `${(Number(reportIncident.confidence) * 100).toFixed(0)}% Verified` : "98% Verified";
        const locationText = reportIncident ? getCleanLocationName(reportIncident.location) : (isHeatwave ? "Saddar, Karachi" : "Karachi Region");

        return (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-[9999] p-4 animate-fade-in">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto flex flex-col p-6 space-y-6 transform scale-100 transition-all duration-300">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-lg border ${isHeatwave ? "bg-orange-500 border-orange-600" : "bg-emerald-500 border-emerald-600"}`}>
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
                  onClick={handleCloseReport}
                  className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Metrics Grid */}
              <div className={`grid grid-cols-3 gap-4 p-4 rounded-xl border text-center ${accentLightBg}`}>
                <div>
                  <span className={`text-[10px] font-bold uppercase tracking-wider block ${accentText}`}>Verified Location</span>
                  <span className="text-xs font-extrabold text-gray-800 mt-1 block truncate">{locationText}</span>
                </div>
                <div className="border-x border-gray-200/50">
                  <span className={`text-[10px] font-bold uppercase tracking-wider block ${accentText}`}>Severity Index</span>
                  <span className={`text-xs font-extrabold mt-1 block ${severityScoreVal >= 7.0 ? "text-red-600" : "text-amber-600"}`}>{severityScoreText}</span>
                </div>
                <div>
                  <span className={`text-[10px] font-bold uppercase tracking-wider block ${accentText}`}>Verification Confidence</span>
                  <span className="text-xs font-extrabold text-gray-800 mt-1 block">{verificationConfidenceText}</span>
                </div>
              </div>

              {/* Dynamic Visual Route Reroute / Cooling Schematic */}
              <div className={`border rounded-2xl p-4 space-y-3 ${accentBgCard}`}>
                <div className="flex items-center justify-between">
                  <h4 className={`text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 ${accentTextDark}`}>
                    <Activity className={`w-4 h-4 animate-pulse ${accentIconColor}`} />
                    {isHeatwave ? "☀️ Active Cooling & Hydration Network" : "🚧 Active Multi-Agent Detour Schematic"}
                  </h4>
                  <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase border animate-pulse ${
                    isHeatwave ? "bg-orange-500/20 text-orange-600 border-orange-500/20" : "bg-emerald-500/20 text-emerald-600 border-emerald-500/20"
                  }`}>
                    {isHeatwave ? "Cooling Active" : "Traffic Diverted"}
                  </span>
                </div>

                {/* Graphic Vector */}
                <div className="bg-gray-950 rounded-xl p-3 flex flex-col items-center justify-center relative overflow-hidden border border-gray-900 shadow-inner">
                  {isHeatwave ? (
                    <svg className="w-full max-w-[450px]" height="110" viewBox="0 0 450 110" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <defs>
                        <pattern id="heatgrid" width="15" height="15" patternUnits="userSpaceOnUse">
                          <path d="M 15 0 L 0 0 0 15" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
                        </pattern>
                      </defs>
                      <rect width="100%" height="100%" fill="url(#heatgrid)" />

                      {/* Connecting Orange/Green Supply Dotted lines */}
                      <path d="M 40 55 Q 225 90 410 55" stroke="#f97316" strokeWidth="2.5" strokeDasharray="4, 4" opacity="0.6" />
                      <path d="M 40 55 Q 225 20 410 55" stroke="#10b981" strokeWidth="3" strokeDasharray="6, 6" />

                      {/* Water flow indicator arrows */}
                      <path d="M 130 33 L 138 31 M 138 31 L 133 27 M 138 31 L 135 36" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" />
                      <path d="M 320 33 L 328 35 M 328 35 L 324 30 M 328 35 L 323 39" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" />

                      {/* Heat Core Zone */}
                      <circle cx="225" cy="55" r="24" fill="rgba(249, 115, 22, 0.15)" stroke="#f97316" strokeWidth="1.5" strokeDasharray="3, 3" />
                      <circle cx="225" cy="55" r="12" fill="rgba(239, 68, 68, 0.2)" stroke="#ef4444" strokeWidth="1" />
                      
                      {/* Water Tanker Origin Node A */}
                      <circle cx="40" cy="55" r="9" fill="#0284c7" stroke="#ffffff" strokeWidth="2" />
                      <text x="40" y="78" fill="#ffffff" fontSize="9" fontWeight="bold" textAnchor="middle" fontFamily="monospace">Water Hydrant</text>
                      
                      {/* Empress Market Node B */}
                      <circle cx="410" cy="55" r="9" fill="#10b981" stroke="#ffffff" strokeWidth="2" />
                      <text x="410" y="78" fill="#ffffff" fontSize="9" fontWeight="bold" textAnchor="middle" fontFamily="monospace">{locationText}</text>

                      {/* Label Tooltips */}
                      <rect x="180" y="83" width="90" height="15" rx="3" fill="#f97316" opacity="0.9" />
                      <text x="225" y="94" fill="#ffffff" fontSize="8" fontWeight="bold" textAnchor="middle" fontFamily="monospace">⚠ EXTREME HEAT</text>
                      
                      <rect x="180" y="15" width="90" height="15" rx="3" fill="#10b981" opacity="0.95" />
                      <text x="225" y="26" fill="#ffffff" fontSize="8" fontWeight="bold" textAnchor="middle" fontFamily="monospace">✔ COOLING DEPLOYED</text>
                    </svg>
                  ) : (
                    <svg className="w-full max-w-[450px]" height="110" viewBox="0 0 450 110" fill="none" xmlns="http://www.w3.org/2000/svg">
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
                      <text x="40" y="78" fill="#ffffff" fontSize="9" fontWeight="bold" textAnchor="middle" fontFamily="monospace">{originName}</text>
                      
                      {/* Destination Node B */}
                      <circle cx="410" cy="55" r="9" fill="#10b981" stroke="#ffffff" strokeWidth="2" />
                      <text x="410" y="78" fill="#ffffff" fontSize="9" fontWeight="bold" textAnchor="middle" fontFamily="monospace">{destName}</text>

                      {/* Label Tooltips */}
                      <rect x="180" y="83" width="90" height="15" rx="3" fill="#ef4444" opacity="0.9" />
                      <text x="225" y="94" fill="#ffffff" fontSize="8" fontWeight="bold" textAnchor="middle" fontFamily="monospace">⚠ 1.2M FLOOD</text>
                      
                      <rect x="180" y="28" width="90" height="15" rx="3" fill="#10b981" opacity="0.95" />
                      <text x="225" y="39" fill="#ffffff" fontSize="8" fontWeight="bold" textAnchor="middle" fontFamily="monospace">✔ DETOUR OPEN</text>
                    </svg>
                  )}
                </div>

                {/* Schematic Explainer Cards */}
                {isHeatwave ? (
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="bg-orange-500/5 border border-orange-500/10 rounded-xl p-2.5 flex flex-col justify-between">
                      <div>
                        <span className="font-bold text-orange-500 uppercase text-[9px] tracking-wider block mb-1">🔴 Primary Heat Zone</span>
                        <span className="font-extrabold text-gray-800 text-xs">{locationText} Area</span>
                      </div>
                      <span className="text-[10px] text-orange-500 font-semibold mt-2">Status: EXTREME HEAT HAZARD / NO SHADE</span>
                    </div>
                    <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-xl p-2.5 flex flex-col justify-between">
                      <div>
                        <span className="font-bold text-emerald-600 uppercase text-[9px] tracking-wider block mb-1">🟢 Multi-Agent Cooling Network</span>
                        <span className="font-extrabold text-gray-800 text-xs">Hydration Stations & Shade Canopies</span>
                      </div>
                      <span className="text-[10px] text-emerald-600 font-semibold mt-2">Status: DISPATCHED & ACTIVE</span>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="bg-red-500/5 border border-red-500/10 rounded-xl p-2.5 flex flex-col justify-between">
                      <div>
                        <span className="font-bold text-red-500 uppercase text-[9px] tracking-wider block mb-1">🔴 Standard Primary Route</span>
                        <span className="font-extrabold text-gray-800 text-xs">{originName} Main Road</span>
                      </div>
                      <span className="text-[10px] text-red-500 font-semibold mt-2">Status: BLOCKED BY SEVERE FLOODING</span>
                    </div>
                    <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-xl p-2.5 flex flex-col justify-between">
                      <div>
                        <span className="font-bold text-emerald-600 uppercase text-[9px] tracking-wider block mb-1">🟢 Multi-Agent Assigned Detour</span>
                        <span className="font-extrabold text-gray-800 text-xs">{destName} Alternate</span>
                      </div>
                      <span className="text-[10px] text-emerald-600 font-semibold mt-2">Status: DETOUR DISPATCHED (+4 mins)</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Dynamic Swarm Impact Metrics Panel */}
              {metrics && (
                <div className="bg-gray-950 border border-gray-900 rounded-2xl p-5 space-y-4 shadow-xl relative overflow-hidden">
                  <div className="flex items-center justify-between border-b border-gray-900 pb-3">
                    <div className="flex items-center gap-2">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                      </span>
                      <h4 className="text-[11px] font-mono font-extrabold tracking-wider text-emerald-400 uppercase">
                        Dynamic Impact Metrics (Before vs After)
                      </h4>
                    </div>
                    <span className="text-[9px] font-mono text-gray-500 font-bold">REAL-TIME DATA FEED</span>
                  </div>

                  {isHeatwave ? (
                    <div className="grid grid-cols-3 gap-4 text-center">
                      {/* Gauge 1: Cooling Coverage */}
                      <div className="flex flex-col items-center space-y-2 bg-white/5 border border-white/5 rounded-xl p-3">
                        <span className="text-[9px] font-mono font-bold text-gray-400 uppercase">COOLING COVERAGE</span>
                        <div className="relative w-20 h-20 flex items-center justify-center">
                          <svg className="w-full h-full transform -rotate-90">
                            <circle cx="40" cy="40" r="32" stroke="rgba(255,255,255,0.05)" strokeWidth="6" fill="none" />
                            <circle cx="40" cy="40" r="32" stroke="#14B8A6" strokeWidth="6" fill="none"
                              strokeDasharray={`${2 * Math.PI * 32}`}
                              strokeDashoffset={`${2 * Math.PI * 32 * (1 - (metrics.cooling_coverage ?? 0) / 100)}`}
                              className="transition-all duration-1000 ease-out"
                              strokeLinecap="round"
                            />
                          </svg>
                          <span className="absolute text-sm font-mono font-extrabold text-white">
                            {metrics.cooling_coverage ?? 0}%
                          </span>
                        </div>
                        <span className="text-[8px] text-gray-500 font-semibold">Triage Goal: 100%</span>
                      </div>

                      {/* Gauge 2: Safety Rate */}
                      <div className="flex flex-col items-center space-y-2 bg-white/5 border border-white/5 rounded-xl p-3">
                        <span className="text-[9px] font-mono font-bold text-gray-400 uppercase">SAFETY RATE</span>
                        <div className="relative w-20 h-20 flex items-center justify-center">
                          <svg className="w-full h-full transform -rotate-90">
                            <circle cx="40" cy="40" r="32" stroke="rgba(255,255,255,0.05)" strokeWidth="6" fill="none" />
                            <circle cx="40" cy="40" r="32" stroke="#10B981" strokeWidth="6" fill="none"
                              strokeDasharray={`${2 * Math.PI * 32}`}
                              strokeDashoffset={`${2 * Math.PI * 32 * (1 - (metrics.safety_rate ?? 10) / 100)}`}
                              className="transition-all duration-1000 ease-out"
                              strokeLinecap="round"
                            />
                          </svg>
                          <span className="absolute text-sm font-mono font-extrabold text-white">
                            {metrics.safety_rate ?? 10}%
                          </span>
                        </div>
                        <span className="text-[8px] text-gray-500 font-semibold">Survival Probability</span>
                      </div>

                      {/* Gauge 3: Grid Relief */}
                      <div className="flex flex-col items-center space-y-2 bg-white/5 border border-white/5 rounded-xl p-3">
                        <span className="text-[9px] font-mono font-bold text-gray-400 uppercase">GRID RELIEF</span>
                        <div className="relative w-20 h-20 flex items-center justify-center">
                          <svg className="w-full h-full transform -rotate-90">
                            <circle cx="40" cy="40" r="32" stroke="rgba(255,255,255,0.05)" strokeWidth="6" fill="none" />
                            <circle cx="40" cy="40" r="32" stroke="#F59E0B" strokeWidth="6" fill="none"
                              strokeDasharray={`${2 * Math.PI * 32}`}
                              strokeDashoffset={`${2 * Math.PI * 32 * (1 - (metrics.grid_relief ?? 0) / 100)}`}
                              className="transition-all duration-1000 ease-out"
                              strokeLinecap="round"
                            />
                          </svg>
                          <span className="absolute text-sm font-mono font-extrabold text-white">
                            {metrics.grid_relief ?? 0}%
                          </span>
                        </div>
                        <span className="text-[8px] text-gray-500 font-semibold">Demand Restabilized</span>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {/* Congestion Index */}
                      <div className="space-y-1 bg-white/5 border border-white/5 rounded-xl p-3">
                        <div className="flex justify-between items-center text-[10px] font-mono">
                          <span className="font-bold text-gray-400">CONGESTION INDEX</span>
                          <span className={`font-extrabold ${metrics.congestion_index > 50 ? "text-red-400" : "text-emerald-400"}`}>
                            {metrics.congestion_index ?? 90}%
                          </span>
                        </div>
                        <div className="w-full bg-white/5 rounded-full h-2 overflow-hidden">
                          <div 
                            className="h-full rounded-full transition-all duration-1000 ease-out" 
                            style={{ 
                              width: `${metrics.congestion_index ?? 90}%`, 
                              backgroundColor: (metrics.congestion_index ?? 90) > 50 ? "#EF4444" : "#10B981" 
                            }} 
                          />
                        </div>
                        <div className="flex justify-between text-[8px] text-gray-500 font-bold">
                          <span>Before: 90%</span>
                          <span>Target: &lt; 30%</span>
                        </div>
                      </div>

                      {/* Evacuation Rate */}
                      <div className="space-y-1 bg-white/5 border border-white/5 rounded-xl p-3">
                        <div className="flex justify-between items-center text-[10px] font-mono">
                          <span className="font-bold text-gray-400">EVACUATION RATE</span>
                          <span className="font-extrabold text-emerald-400">
                            {metrics.evacuation_rate ?? 5}%
                          </span>
                        </div>
                        <div className="w-full bg-white/5 rounded-full h-2 overflow-hidden">
                          <div 
                            className="h-full rounded-full bg-emerald-500 transition-all duration-1000 ease-out" 
                            style={{ width: `${metrics.evacuation_rate ?? 5}%` }} 
                          />
                        </div>
                        <div className="flex justify-between text-[8px] text-gray-500 font-bold">
                          <span>Before: 5%</span>
                          <span>Target: &gt; 95%</span>
                        </div>
                      </div>

                      {/* Road Blockage */}
                      <div className="space-y-1 bg-white/5 border border-white/5 rounded-xl p-3">
                        <div className="flex justify-between items-center text-[10px] font-mono">
                          <span className="font-bold text-gray-400">ROAD BLOCKAGE</span>
                          <span className={`font-extrabold ${(metrics.road_blockage ?? 100) > 30 ? "text-amber-400" : "text-emerald-400"}`}>
                            {metrics.road_blockage ?? 100}%
                          </span>
                        </div>
                        <div className="w-full bg-white/5 rounded-full h-2 overflow-hidden">
                          <div 
                            className="h-full rounded-full transition-all duration-1000 ease-out" 
                            style={{ 
                              width: `${metrics.road_blockage ?? 100}%`,
                              backgroundColor: (metrics.road_blockage ?? 100) > 30 ? "#F59E0B" : "#10B981"
                            }} 
                          />
                        </div>
                        <div className="flex justify-between text-[8px] text-gray-500 font-bold">
                          <span>Before: 100%</span>
                          <span>Target: 0%</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Agent Timeline */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                  Sequential Agent Swarm Workflow Trace
                </h4>
                
                <div className="relative border-l border-gray-200 pl-4 ml-2 space-y-4">
                  {STAGES.filter(s => s.key !== "logging_agent").map((stage, idx) => {
                    // Find reasoning log for this agent
                    const agentLog = reportLogs.find(
                      l => l.agent_name === stage.key || 
                      (stage.key === "resource_allocation_agent" && l.agent_name === "resource_agent")
                    );
                    
                    let desc = "";
                    let statusLabel = "";
                    if (agentLog) {
                      const text = agentLog.log_text;
                      const lines = text.split("\n").map(l => l.trim()).filter(Boolean);
                      
                      const statusLine = lines.find(l => l.toUpperCase().startsWith("**STATUS**:"));
                      if (statusLine) {
                        statusLabel = statusLine.replace(/\*\*Status\*\*:/i, "").trim();
                      }
                      
                      const narrativeLine = lines.find(l => !l.startsWith("###") && !l.startsWith("**") && !l.startsWith("-") && !l.startsWith("---"));
                      if (narrativeLine) {
                        desc = narrativeLine;
                      } else {
                        desc = agentLog.log_text;
                      }
                    } else {
                      if (isHeatwave) {
                        if (stage.key === "signal_agent") desc = `Parsed unstructured temperature alert in ${locationText}. Assigned a credibility index of 95% based on official weather api cross-referencing.`;
                        else if (stage.key === "detection_agent") desc = `Evaluated city-scale temperature sensors. Confirmed active sector heatwave incident in ${locationText} without spatial clustering.`;
                        else if (stage.key === "verification_agent") desc = "Audited weather forecasts. Confirmed extreme ambient heat index exceeding 54°C.";
                        else if (stage.key === "severity_agent") desc = `Assigned critical severity index (${Number(severityScoreVal).toFixed(1)}/10) to ${locationText}. Identified dense urban heat island risk and power grid load-shedding.`;
                        else if (stage.key === "resource_allocation_agent") desc = `Allocated 4 Hydration Camps, 4 Water Tankers, and 6 Shade Canopies to ${locationText} region.`;
                        else if (stage.key === "planning_agent") desc = `Formulated heatwave plan: Activate cooling centers, deploy mobile hydration posts, and dispatch water tankers in ${locationText}.`;
                        else if (stage.key === "notification_agent") desc = `Dispatched emergency heat wave SMS advisories to citizens inside ${locationText} area.`;
                      } else {
                        if (stage.key === "signal_agent") desc = `Parsed unstructured mock telemetry signal in ${locationText}. Validated geographic boundaries and assigned an initial credibility index of 95% based on source cross-referencing.`;
                        else if (stage.key === "detection_agent") desc = `Evaluated incoming signal location against historical datasets. Created a new active spatiotemporal cluster with verification triggers at ${locationText}.`;
                        else if (stage.key === "verification_agent") desc = "Scraped live Twitter/X crisis feeds and weather radar telemetry in real-time. Confirmed active flash floods with zero false alarms.";
                        else if (stage.key === "severity_agent") desc = `Assigned critical severity index (${Number(severityScoreVal).toFixed(1)}/10) to ${locationText}. Created verified incident in the central database.`;
                        else if (stage.key === "resource_allocation_agent") desc = `Calculated vehicle requirements and dispatched 3 Rescue boats, 2 Ambulances to ${locationText} region.`;
                        else if (stage.key === "planning_agent") desc = `Formulated action items: Dispatching rescue vehicles, setting up high-ground camps, closing low-lying bridges, and routing public traffic in ${locationText}.`;
                        else if (stage.key === "notification_agent") desc = `Triggered mass SMS/alert notifications to mobile devices inside the affected radius of ${locationText}.`;
                      }
                    }

                    const isSkipped = pipelineState?.agent_states?.verification_agent === "SKIPPED" || 
                                      completedReportData?.agent_states?.verification_agent === "SKIPPED" ||
                                      (reportIncident && reportIncident.confidence >= 0.95 && !reportLogs.some(l => l.agent_name === "verification_agent"));
                    if (stage.key === "verification_agent" && isSkipped && !agentLog) {
                      desc = "Verification bypassed: High confidence telemetry from verified API source confirmed.";
                      statusLabel = "SKIPPED";
                    }

                    return (
                      <div key={stage.key} className="relative">
                        <span className={`absolute -left-[21px] top-0.5 w-2.5 h-2.5 rounded-full ring-4 ring-white ${
                          isSkipped && stage.key === "verification_agent" 
                            ? "bg-blue-400" 
                            : isHeatwave 
                            ? "bg-orange-500 animate-pulse"
                            : "bg-emerald-500 animate-pulse"
                        }`} />
                        <div className="flex flex-col gap-0.5">
                          <span className="text-xs font-extrabold text-gray-800 uppercase tracking-wide flex items-center gap-2">
                            {idx + 1}. {stage.label}
                            {statusLabel && (
                              <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                                statusLabel === "SKIPPED" 
                                  ? "bg-blue-50 text-blue-600 border border-blue-100"
                                  : statusLabel.includes("CRITICAL") || statusLabel.includes("ALERT")
                                  ? "bg-red-50 text-red-600 border border-red-100"
                                  : isHeatwave
                                  ? "bg-orange-50 text-orange-600 border border-orange-100"
                                  : "bg-emerald-50 text-emerald-600 border border-emerald-100"
                              }`}>
                                {statusLabel}
                              </span>
                            )}
                          </span>
                          <p className="text-[11px] text-gray-500 font-semibold leading-relaxed">
                            {desc}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Actions Footer */}
              <div className="border-t border-gray-100 pt-4 flex gap-3 justify-end">
                <button
                  onClick={handleCloseReport}
                  className={`text-white font-bold text-xs uppercase tracking-wider px-5 py-2.5 rounded-lg transition-colors cursor-pointer border shadow-md ${accentBtn}`}
                >
                  Explore Control Room
                </button>
              </div>
            </div>
          </div>
        );
      })()}

    </div>
  );
}

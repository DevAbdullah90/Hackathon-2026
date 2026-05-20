"use client";

import React, { useEffect, useState } from "react";
import { Cpu, Settings, Activity, Zap } from "lucide-react";
import { api, AgentWorkforceMember } from "@/lib/api";

export default function CTECCPanel() {
  const [agents, setAgents] = useState<AgentWorkforceMember[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchWorkforce = async () => {
    try {
      const data = await api.getAgentWorkforce();
      setAgents(data);
    } catch (err) {
      console.error("Failed to load agent workforce in CTECCPanel:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkforce();
    const interval = setInterval(fetchWorkforce, 3000); // 3s real-time active polling
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden h-fit flex flex-col">
      {/* Top Accent Gradient Bar */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-600 to-teal-600" />
      <div>
        {/* Card Header */}
        <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Cpu className="w-4 h-4 text-emerald-600 animate-pulse" />
            <h3 className="text-[10px] font-black text-slate-800 uppercase tracking-widest">AI Specialist Workforce</h3>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-[10px] text-gray-400 font-semibold select-none">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              <span>Active Swarm</span>
            </div>
          </div>
        </div>

        {/* Workforce Grid */}
        <div className="p-3 grid grid-cols-1 gap-2">
          {loading ? (
            <div className="text-xs text-gray-400 py-6 text-center animate-pulse font-semibold">
              Querying agent states...
            </div>
          ) : agents.length === 0 ? (
            <div className="text-xs text-gray-400 py-6 text-center font-medium">
              No agents registered. Check FastAPI console logs.
            </div>
          ) : (
            agents.map((agentItem, idx) => {
              const isProcessing = agentItem.status === "PROCESSING";
              return (
                <div 
                  key={idx} 
                  className={`px-3 py-2 rounded-xl border transition-all duration-300 flex items-center justify-between shadow-2xs ${
                    isProcessing 
                      ? "bg-emerald-50/50 border-emerald-300 shadow-emerald-50/50 scale-[1.01]" 
                      : "bg-slate-50/60 border-slate-100 hover:border-slate-200"
                  }`}
                >
                  {/* Agent Info */}
                  <div className="flex items-center gap-2.5 min-w-0">
                    {isProcessing ? (
                      <Zap className="w-3.5 h-3.5 text-emerald-500 animate-pulse flex-shrink-0" />
                    ) : (
                      <Activity className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                    )}
                    <div className="flex flex-col min-w-0">
                      <span className="text-[11px] font-extrabold text-slate-700 truncate leading-tight">
                        {agentItem.agent}
                      </span>
                      {agentItem.active_incident && (
                        <span className="text-[8px] font-mono text-slate-400 mt-0.5 leading-none">
                          Sec: {agentItem.active_incident.substring(0, 8)}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Agent Status Badge */}
                  <span className={`text-[9px] font-extrabold uppercase px-1.5 py-0.5 border rounded-md tracking-wider flex-shrink-0 ${
                    isProcessing 
                      ? "bg-emerald-100 text-emerald-700 border-emerald-300 animate-pulse" 
                      : "bg-slate-100 text-slate-400 border-slate-200"
                  }`}>
                    {agentItem.status}
                  </span>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

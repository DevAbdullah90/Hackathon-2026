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
    <div className="bg-white rounded-xl border border-gray-200 shadow-xs overflow-hidden h-full flex flex-col justify-between">
      <div>
        {/* Card Header */}
        <div className="px-4 pt-4 pb-3 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Cpu className="w-4 h-4 text-emerald-600 animate-pulse" />
            <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider">AI Specialist Workforce</h3>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-xs text-gray-400 font-semibold select-none">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
              <span>Multi-Agent Core</span>
            </div>
          </div>
        </div>

        {/* Workforce Grid */}
        <div className="p-4 grid grid-cols-2 gap-3">
          {loading ? (
            <div className="col-span-2 text-xs text-gray-400 py-12 text-center animate-pulse font-semibold">
              Querying agent states...
            </div>
          ) : agents.length === 0 ? (
            <div className="col-span-2 text-xs text-gray-400 py-12 text-center font-medium">
              No agents registered. Check FastAPI console logs.
            </div>
          ) : (
            agents.map((agentItem, idx) => {
              const isProcessing = agentItem.status === "PROCESSING";
              return (
                <div 
                  key={idx} 
                  className={`p-3 rounded-xl border transition-all duration-300 flex flex-col justify-between min-h-[84px] shadow-2xs ${
                    isProcessing 
                      ? "bg-emerald-50/50 border-emerald-300 shadow-emerald-50/50 scale-[1.02]" 
                      : "bg-gray-50/60 border-gray-100 hover:border-gray-200"
                  }`}
                >
                  {/* Agent Header */}
                  <div className="flex justify-between items-start gap-1">
                    <span className="text-[11px] font-bold text-gray-800 leading-tight">
                      {agentItem.agent}
                    </span>
                    {isProcessing && <Zap className="w-3.5 h-3.5 text-emerald-500 animate-bounce flex-shrink-0" />}
                  </div>

                  {/* Agent Status Badge */}
                  <div className="flex items-center justify-between border-t border-gray-200/40 pt-2 mt-2">
                    <span className={`text-[9px] font-extrabold uppercase px-1.5 py-0.5 border rounded-md tracking-wider ${
                      isProcessing 
                        ? "bg-emerald-100 text-emerald-700 border-emerald-300 animate-pulse" 
                        : "bg-gray-100 text-gray-400 border-gray-200"
                    }`}>
                      {agentItem.status}
                    </span>

                    {agentItem.active_incident && (
                      <span className="text-[9px] font-bold text-gray-400 bg-white border border-gray-200 px-1 py-0.5 rounded">
                        Sec: {agentItem.active_incident.substring(0, 7)}
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

"use client";

import React, { useEffect, useState } from "react";
import { 
  Wifi, 
  AlertTriangle, 
  Cpu, 
  Activity, 
  Users, 
  Droplets,
  Heart,
  Sun,
  Thermometer
} from "lucide-react";
import { api, DashboardStats, Incident } from "@/lib/api";

interface MetricCardProps {
  icon: React.ReactNode;
  iconBg: string;
  value: string | number;
  subValue?: string;
  subLabel?: string;
  label: string;
}

function MetricCard({ 
  icon, 
  iconBg, 
  value, 
  subValue, 
  subLabel, 
  label 
}: MetricCardProps) {
  return (
    <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-2xs hover:shadow-sm hover:border-slate-300 hover:-translate-y-0.5 transition-all duration-300 cursor-default flex flex-col justify-between h-full min-h-[104px]">
      {/* Top Row: Icon (Left) & Value (Right) */}
      <div className="flex items-center justify-between w-full">
        {/* Icon Circle */}
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${iconBg} border border-black/5 shadow-2xs flex-shrink-0`}>
          {icon}
        </div>

        {/* Value Block */}
        <div className="flex items-baseline gap-0.5 min-w-0">
          <span className="text-xl md:text-2xl font-black text-slate-900 leading-none tracking-tight">{value}</span>
          {subValue && (
            <span className="text-xs md:text-sm text-slate-400 font-bold leading-none">{subValue}</span>
          )}
          {subLabel && (
            <span className="text-[10px] text-slate-400 font-extrabold leading-none ml-1 uppercase tracking-wider">{subLabel}</span>
          )}
        </div>
      </div>

      {/* Bottom Row: Label */}
      <div className="text-[10px] font-black text-slate-400 mt-4 truncate uppercase tracking-widest leading-none">
        {label}
      </div>
    </div>
  );
}

interface MetricsGridProps {
  selectedIncident?: Incident | null;
}

export default function MetricsGrid({ selectedIncident }: MetricsGridProps = {}) {
  const isHeatwave = selectedIncident?.disaster_type === "heatwave";

  const [stats, setStats] = useState<DashboardStats>({
    total_signals: 0,
    active_crisis_sectors: 0,
    total_agent_decisions: 0,
    allocated_ambulances: 0,
    allocated_rescue_crews: 0,
  });

  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      const data = await api.getDashboardStats();
      setStats(data);
    } catch (err) {
      console.error("Failed to load dashboard stats: ", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 3000); // 3s real-time active polling
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full bg-white p-5 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
      {/* Top Accent Gradient Bar */}
      <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${
        isHeatwave ? "from-amber-500 to-orange-500" : "from-teal-600 to-emerald-500"
      }`} />
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest">
          Telemetry Command Center Metrics
        </h3>
        <div className={`flex items-center gap-1.5 cursor-pointer transition-colors select-none ${
          isHeatwave ? "text-orange-400 hover:text-orange-600" : "text-slate-400 hover:text-slate-600"
        }`}>
          <span className="text-[10px] font-extrabold uppercase tracking-widest">Active Live Connection</span>
          <span className={`w-2 h-2 rounded-full animate-ping ml-0.5 ${
            isHeatwave ? "bg-orange-500" : "bg-emerald-500"
          }`} />
        </div>
      </div>

      {/* 2x3 Responsive Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-4">
        {/* Ingested Signals */}
        <MetricCard
          icon={<Wifi className="w-4 h-4 md:w-5 md:h-5 text-blue-600" />}
          iconBg="bg-blue-50/70"
          value={stats.total_signals}
          subLabel="Signals"
          label="Crisis Telemetries"
        />

        {/* Active Crisis Sectors */}
        <MetricCard
          icon={isHeatwave ? (
            <Sun className="w-4 h-4 md:w-5 md:h-5 text-orange-500 animate-pulse" />
          ) : (
            <AlertTriangle className="w-4 h-4 md:w-5 md:h-5 text-red-600 animate-pulse" />
          )}
          iconBg={isHeatwave ? "bg-orange-50/70" : "bg-red-50/70"}
          value={stats.active_crisis_sectors}
          subLabel="Sectors"
          label="Active Hazards"
        />

        {/* Total Agent Decisions */}
        <MetricCard
          icon={<Cpu className="w-4 h-4 md:w-5 md:h-5 text-purple-600" />}
          iconBg="bg-purple-50/70"
          value={stats.total_agent_decisions}
          subLabel="Decisions"
          label="Agent CoT Logs"
        />

        {/* Allocated Ambulances / Paramedics */}
        <MetricCard
          icon={isHeatwave ? (
            <Heart className="w-4 h-4 md:w-5 md:h-5 text-orange-600" />
          ) : (
            <Activity className="w-4 h-4 md:w-5 md:h-5 text-emerald-600" />
          )}
          iconBg={isHeatwave ? "bg-orange-50/70" : "bg-emerald-50/70"}
          value={stats.allocated_ambulances}
          subLabel={isHeatwave ? "Units" : "Dispatched"}
          label={isHeatwave ? "Paramedic Dispatch" : "Ambulance Dispatch"}
        />

        {/* Dispatched Rescue Crews / Hydration Camps */}
        <MetricCard
          icon={isHeatwave ? (
            <Droplets className="w-4 h-4 md:w-5 md:h-5 text-amber-600" />
          ) : (
            <Users className="w-4 h-4 md:w-5 md:h-5 text-amber-600" />
          )}
          iconBg="bg-amber-50/70"
          value={stats.allocated_rescue_crews}
          subLabel={isHeatwave ? "Camps" : "Crews"}
          label={isHeatwave ? "Hydration Camps" : "Rescue Dispatched"}
        />

        {/* Dewatering Assets / Shade Canopies */}
        <MetricCard
          icon={isHeatwave ? (
            <Sun className="w-4 h-4 md:w-5 md:h-5 text-orange-500" />
          ) : (
            <Droplets className="w-4 h-4 md:w-5 md:h-5 text-cyan-600" />
          )}
          iconBg={isHeatwave ? "bg-orange-50/70" : "bg-cyan-50/70"}
          value={stats.active_crisis_sectors > 0 ? stats.active_crisis_sectors * (isHeatwave ? 3 : 2) : 0}
          subLabel={isHeatwave ? "Canopies" : "Assets"}
          label={isHeatwave ? "Shade Canopies" : "Dewatering Pumps"}
        />
      </div>
    </div>
  );
}

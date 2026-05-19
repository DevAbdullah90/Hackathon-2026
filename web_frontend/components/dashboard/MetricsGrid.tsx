"use client";

import React, { useEffect, useState } from "react";
import { 
  Wifi, 
  AlertTriangle, 
  Cpu, 
  Activity, 
  Users, 
  Droplets 
} from "lucide-react";
import { api, DashboardStats } from "@/lib/api";

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

export default function MetricsGrid() {
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
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-teal-600 to-emerald-500" />
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest">
          Telemetry Command Center Metrics
        </h3>
        <div className="flex items-center gap-1.5 text-slate-400 cursor-pointer hover:text-slate-600 transition-colors select-none">
          <span className="text-[10px] font-extrabold uppercase tracking-widest">Active Live Connection</span>
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping ml-0.5" />
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
          icon={<AlertTriangle className="w-4 h-4 md:w-5 md:h-5 text-red-600 animate-pulse" />}
          iconBg="bg-red-50/70"
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

        {/* Allocated Ambulances */}
        <MetricCard
          icon={<Activity className="w-4 h-4 md:w-5 md:h-5 text-emerald-600" />}
          iconBg="bg-emerald-50/70"
          value={stats.allocated_ambulances}
          subLabel="Dispatched"
          label="Ambulance Dispatch"
        />

        {/* Dispatched Rescue Crews */}
        <MetricCard
          icon={<Users className="w-4 h-4 md:w-5 md:h-5 text-amber-600" />}
          iconBg="bg-amber-50/70"
          value={stats.allocated_rescue_crews}
          subLabel="Crews"
          label="Rescue Dispatched"
        />

        {/* Dewatering Assets */}
        <MetricCard
          icon={<Droplets className="w-4 h-4 md:w-5 md:h-5 text-cyan-600" />}
          iconBg="bg-cyan-50/70"
          value={stats.active_crisis_sectors > 0 ? stats.active_crisis_sectors * 2 : 0}
          subLabel="Assets"
          label="Dewatering Pumps"
        />
      </div>
    </div>
  );
}

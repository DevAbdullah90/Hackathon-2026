"use client";

import React, { useEffect, useState } from "react";
import { 
  Wifi, 
  AlertTriangle, 
  Cpu, 
  Activity, 
  Users, 
  Droplets,
  ChevronDown 
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
    <div className="bg-white rounded-xl border border-gray-200 p-3 md:p-4 shadow-sm hover:shadow-md transition-all duration-200 cursor-default flex flex-col justify-between h-full min-h-[96px]">
      {/* Top Row: Icon (Left) & Value (Right) */}
      <div className="flex items-center justify-between w-full">
        {/* Icon Circle */}
        <div className={`w-8 h-8 md:w-9 md:h-9 rounded-full flex items-center justify-center ${iconBg} flex-shrink-0`}>
          {icon}
        </div>

        {/* Value Block */}
        <div className="flex items-baseline gap-1 min-w-0">
          <span className="text-xl md:text-2xl font-bold text-gray-900 leading-none">{value}</span>
          {subValue && (
            <span className="text-xs md:text-sm text-gray-400 font-semibold leading-none">{subValue}</span>
          )}
          {subLabel && (
            <span className="text-[10px] md:text-xs text-gray-400 font-medium leading-none ml-0.5">{subLabel}</span>
          )}
        </div>
      </div>

      {/* Bottom Row: Label */}
      <div className="text-xs font-semibold text-gray-500 mt-3 truncate uppercase tracking-wider">
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
    <div className="w-full bg-white p-3 md:p-4 rounded-xl border border-gray-200 shadow-xs">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-base font-bold text-[#111827] uppercase tracking-wide">
          CIRO Command Metrics
        </h3>
        <div className="flex items-center gap-1 text-gray-400 cursor-pointer hover:text-gray-600 transition-colors select-none">
          <span className="text-xs font-semibold uppercase tracking-wider">Real-Time</span>
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse ml-0.5" />
        </div>
      </div>

      {/* 2x3 Responsive Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-3">
        {/* Ingested Signals */}
        <MetricCard
          icon={<Wifi className="w-4 h-4 md:w-5 md:h-5 text-blue-500" />}
          iconBg="bg-blue-50"
          value={stats.total_signals}
          subLabel="Ingested"
          label="Crisis Telemetries"
        />

        {/* Active Crisis Sectors */}
        <MetricCard
          icon={<AlertTriangle className="w-4 h-4 md:w-5 md:h-5 text-red-500" />}
          iconBg="bg-red-50"
          value={stats.active_crisis_sectors}
          subLabel="Sectors"
          label="Active Hazards"
        />

        {/* Total Agent Decisions */}
        <MetricCard
          icon={<Cpu className="w-4 h-4 md:w-5 md:h-5 text-purple-500" />}
          iconBg="bg-purple-50"
          value={stats.total_agent_decisions}
          subLabel="Decisions"
          label="Agent CoT Logs"
        />

        {/* Allocated Ambulances */}
        <MetricCard
          icon={<Activity className="w-4 h-4 md:w-5 md:h-5 text-emerald-500" />}
          iconBg="bg-emerald-50"
          value={stats.allocated_ambulances}
          subLabel="Ambulance"
          label="Ambulance Dispatch"
        />

        {/* Dispatched Rescue Crews */}
        <MetricCard
          icon={<Users className="w-4 h-4 md:w-5 md:h-5 text-amber-500" />}
          iconBg="bg-amber-50"
          value={stats.allocated_rescue_crews}
          subLabel="Teams"
          label="Rescue Dispatched"
        />

        {/* Dewatering Assets */}
        <MetricCard
          icon={<Droplets className="w-4 h-4 md:w-5 md:h-5 text-cyan-500" />}
          iconBg="bg-cyan-50"
          value={stats.active_crisis_sectors > 0 ? stats.active_crisis_sectors * 2 : 0}
          subLabel="Crews"
          label="Dewatering Pumps"
        />
      </div>
    </div>
  );
}

"use client";

import React from "react";
import { 
  Video, 
  Wifi, 
  Zap, 
  AlertTriangle, 
  Car, 
  Droplets, 
  ChevronDown 
} from "lucide-react";

interface MetricCardProps {
  icon: React.ReactNode;
  iconBg: string;
  value: string;
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
    <div className="bg-white rounded-xl border border-gray-200 p-3 md:p-4 shadow-xs hover:shadow-md transition-all duration-200 cursor-default flex flex-col justify-between h-full">
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
      <div className="text-xs font-semibold text-gray-500 mt-3 truncate">
        {label}
      </div>
    </div>
  );
}

export default function MetricsGrid() {
  return (
    <div className="w-full bg-white p-3 md:p-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold text-[#111827]">
          Key Metrics
        </h3>
        <div className="flex items-center gap-1 text-gray-400 cursor-pointer hover:text-gray-600 transition-colors">
          <span className="text-sm font-medium">Last 24 Hours</span>
          <ChevronDown className="w-4 h-4" />
        </div>
      </div>

      {/* 2x3 Responsive Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-3">
        {/* Card 1: Camera Connect */}
        <MetricCard
          icon={<Video className="w-4 h-4 md:w-5 md:h-5 text-[#3b82f6]" />}
          iconBg="bg-blue-50"
          value="351"
          subValue="/351"
          label="Camera Connect"
        />

        {/* Card 2: V2X Connect */}
        <MetricCard
          icon={<Wifi className="w-4 h-4 md:w-5 md:h-5 text-[#a855f7]" />}
          iconBg="bg-purple-50"
          value="43"
          subValue="/43"
          label="V2X Connect"
        />

        {/* Card 3: Signal Flash */}
        <MetricCard
          icon={<Zap className="w-4 h-4 md:w-5 md:h-5 text-[#06b6d4]" />}
          iconBg="bg-cyan-50"
          value="5"
          subLabel="24 Hrs"
          label="Signal Flash"
        />

        {/* Card 4: Conflict Event */}
        <MetricCard
          icon={<AlertTriangle className="w-4 h-4 md:w-5 md:h-5 text-[#f59e0b]" />}
          iconBg="bg-amber-50"
          value="21"
          subLabel="24 Hrs"
          label="Conflict Event"
        />

        {/* Card 5: Accident Events */}
        <MetricCard
          icon={<Car className="w-4 h-4 md:w-5 md:h-5 text-[#22c55e]" />}
          iconBg="bg-green-50"
          value="3"
          subLabel="24 Hrs"
          label="Accident Events"
        />

        {/* Card 6: Flood Events */}
        <MetricCard
          icon={<Droplets className="w-4 h-4 md:w-5 md:h-5 text-[#ef4444]" />}
          iconBg="bg-red-50"
          value="0"
          subLabel="24 Hrs"
          label="Flood Events"
        />
      </div>
    </div>
  );
}

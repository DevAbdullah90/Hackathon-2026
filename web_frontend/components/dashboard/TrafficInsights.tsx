"use client";

import React, { useState } from "react";
import {
  AreaChart, Area, XAxis, YAxis, Tooltip,
  ResponsiveContainer
} from "recharts";
import { Settings, RefreshCw, ChevronDown, Bookmark } from "lucide-react";

const vehicleData = [
  { time: "00:00", avg: 28, max: 45, min: 12 },
  { time: "01:00", avg: 22, max: 38, min: 10 },
  { time: "02:00", avg: 18, max: 30, min: 8  },
  { time: "03:00", avg: 15, max: 25, min: 6  },
  { time: "04:00", avg: 20, max: 35, min: 9  },
  { time: "05:00", avg: 32, max: 50, min: 15 },
  { time: "06:00", avg: 42, max: 58, min: 22 },
  { time: "07:00", avg: 38, max: 55, min: 20 },
];

const speedData = [
  { time: "00:00", avg: 35, max: 45, min: 20, normal: 35 },
  { time: "01:00", avg: 38, max: 48, min: 22, normal: 35 },
  { time: "02:00", avg: 40, max: 50, min: 25, normal: 35 },
  { time: "03:00", avg: 42, max: 52, min: 28, normal: 35 },
  { time: "04:00", avg: 38, max: 47, min: 24, normal: 35 },
  { time: "05:00", avg: 30, max: 40, min: 18, normal: 35 },
  { time: "06:00", avg: 25, max: 38, min: 15, normal: 35 },
  { time: "07:00", avg: 35, max: 45, min: 20, normal: 35 },
];

export default function TrafficInsights() {
  const [timeRange, setTimeRange] = useState("Last 3 Hours");
  const [showTimeDropdown, setShowTimeDropdown] = useState(false);
  const [direction, setDirection] = useState("Northbound");
  const [showDirDropdown, setShowDirDropdown] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefreshClick = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
    }, 1000);
  };

  return (
    <div className="w-full bg-white rounded-xl border border-gray-200 p-4 shadow-xs">
      
      {/* Header Row */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <h3 className="font-semibold text-gray-900 text-base">
          Traffic Insights
        </h3>
        
        <div className="flex flex-wrap items-center gap-2">
          {/* Pill button: Last 3 Hours */}
          <div className="relative">
            <div 
              onClick={() => setShowTimeDropdown(!showTimeDropdown)}
              className="flex items-center gap-1 text-xs font-semibold text-gray-500 border border-gray-200 rounded-lg px-2.5 py-1.5 hover:bg-gray-50 cursor-pointer select-none transition-colors"
            >
              <span>{timeRange}</span>
              <ChevronDown className="w-3.5 h-3.5" />
            </div>
            {showTimeDropdown && (
              <div className="absolute top-full right-0 mt-1 w-36 bg-white border border-gray-200 rounded-lg shadow-lg z-50 py-1">
                {["Last 1 Hour", "Last 3 Hours", "Last 6 Hours", "Last 24 Hours"].map(opt => (
                  <div
                    key={opt}
                    onClick={() => {
                      setTimeRange(opt);
                      setShowTimeDropdown(false);
                    }}
                    className="px-3.5 py-2 text-xs font-semibold hover:bg-gray-50 text-gray-700 hover:text-gray-900 cursor-pointer transition-colors"
                  >
                    {opt}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Pill button: Northbound */}
          <div className="relative">
            <div 
              onClick={() => setShowDirDropdown(!showDirDropdown)}
              className="flex items-center gap-1 text-xs font-semibold text-gray-500 border border-gray-200 rounded-lg px-2.5 py-1.5 hover:bg-gray-50 cursor-pointer select-none transition-colors"
            >
              <span>{direction}</span>
              <ChevronDown className="w-3.5 h-3.5" />
            </div>
            {showDirDropdown && (
              <div className="absolute top-full right-0 mt-1 w-36 bg-white border border-gray-200 rounded-lg shadow-lg z-50 py-1">
                {["Northbound", "Southbound", "Eastbound", "Westbound"].map(opt => (
                  <div
                    key={opt}
                    onClick={() => {
                      setDirection(opt);
                      setShowDirDropdown(false);
                    }}
                    className="px-3.5 py-2 text-xs font-semibold hover:bg-gray-50 text-gray-700 hover:text-gray-900 cursor-pointer transition-colors"
                  >
                    {opt}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Green button: Rest Change */}
          <button 
            onClick={handleRefreshClick}
            className={`flex items-center gap-1.5 text-xs text-white bg-kemetra-green hover:bg-green-600 rounded-lg px-3 py-1.5 font-semibold transition-colors cursor-pointer border border-transparent shadow-xs ${
              isRefreshing ? "animate-pulse" : ""
            }`}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin" : ""}`} />
            <span>{isRefreshing ? "Resetting..." : "Rest Change"}</span>
          </button>
        </div>
      </div>

      {/* Charts Column/Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* CHART CARD 1: Vehicle Count */}
        <div className="bg-gray-50 rounded-xl border border-gray-100 p-4">
          <div className="flex items-start justify-between w-full">
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-gray-600">Vehicle Count</span>
              <span className="text-[10px] text-gray-400 mt-0.5">Last update: 20:32</span>
            </div>
            <div className="flex items-center gap-2">
              <Settings className="w-4 h-4 text-gray-400 cursor-pointer hover:text-gray-600 transition-colors" />
              <Bookmark className="w-4 h-4 text-orange-400 fill-orange-400 cursor-pointer" />
            </div>
          </div>

          {/* Big Value */}
          <div className="flex items-baseline gap-1 mt-3 mb-1">
            <span className="text-4xl font-extrabold text-orange-500 tracking-tight">137</span>
            <span className="text-base font-bold text-orange-400">VEH</span>
          </div>

          {/* Legends */}
          <div className="flex flex-wrap items-center gap-4 mb-3">
            <div className="flex items-center gap-1.5">
              <div className="border-t-2 border-dashed border-gray-400 w-5" />
              <span className="text-[11px] font-semibold text-gray-400">Average</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="bg-orange-500 h-0.5 w-5 rounded-full" />
              <span className="text-[11px] font-semibold text-gray-400">Max</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="bg-blue-400 h-0.5 w-5 rounded-full" />
              <span className="text-[11px] font-semibold text-gray-400">Min</span>
            </div>
          </div>

          {/* Recharts Area Chart */}
          <div className="w-full">
            <ResponsiveContainer width="100%" height={120}>
              <AreaChart data={vehicleData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="orangeGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f97316" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis 
                  dataKey="time" 
                  tick={{ fontSize: 9, fill: "#9ca3af", fontWeight: 600 }}
                  axisLine={false} 
                  tickLine={false} 
                />
                <YAxis 
                  domain={[0, 60]}
                  tick={{ fontSize: 9, fill: "#9ca3af", fontWeight: 600 }}
                  axisLine={false} 
                  tickLine={false} 
                />
                <Tooltip
                  contentStyle={{ 
                    fontSize: 11, 
                    borderRadius: 8, 
                    border: "1px solid #e5e7eb",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.08)" 
                  }} 
                />
                <Area 
                  type="monotone" 
                  dataKey="avg"
                  stroke="#f97316" 
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  fill="url(#orangeGrad)" 
                  dot={false} 
                />
                <Area 
                  type="monotone" 
                  dataKey="max"
                  stroke="#f97316" 
                  strokeWidth={2}
                  fill="none" 
                  dot={false} 
                />
                <Area 
                  type="monotone" 
                  dataKey="min"
                  stroke="#93c5fd" 
                  strokeWidth={1.5}
                  fill="none" 
                  dot={false} 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* CHART CARD 2: Vehicle Speed */}
        <div className="bg-gray-50 rounded-xl border border-gray-100 p-4">
          <div className="flex items-start justify-between w-full">
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-gray-600">Vehicle Count</span>
              <span className="text-[10px] text-gray-400 mt-0.5">Last update: 20:32</span>
            </div>
            <div className="flex items-center gap-2">
              <Settings className="w-4 h-4 text-gray-400 cursor-pointer hover:text-gray-600 transition-colors" />
              <Bookmark className="w-4 h-4 text-orange-400 fill-orange-400 cursor-pointer" />
            </div>
          </div>

          {/* Big Value */}
          <div className="flex items-baseline gap-1 mt-3 mb-1">
            <span className="text-4xl font-extrabold text-orange-500 tracking-tight">35</span>
            <span className="text-base font-bold text-orange-400">MPH</span>
          </div>

          {/* Legends */}
          <div className="flex flex-wrap items-center gap-4 mb-3">
            <div className="flex items-center gap-1.5">
              <div className="border-t-2 border-dashed border-gray-400 w-5" />
              <span className="text-[11px] font-semibold text-gray-400">Average</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="bg-[#d4b896] h-0.5 w-5 rounded-full" />
              <span className="text-[11px] font-semibold text-gray-400">Normal</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="bg-orange-500 h-0.5 w-5 rounded-full" />
              <span className="text-[11px] font-semibold text-gray-400">Max</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="bg-blue-400 h-0.5 w-5 rounded-full" />
              <span className="text-[11px] font-semibold text-gray-400">Min</span>
            </div>
          </div>

          {/* Recharts Area Chart */}
          <div className="w-full">
            <ResponsiveContainer width="100%" height={120}>
              <AreaChart data={speedData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="beigeGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#d4b896" stopOpacity={0.5}/>
                    <stop offset="95%" stopColor="#d4b896" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis 
                  dataKey="time" 
                  tick={{ fontSize: 9, fill: "#9ca3af", fontWeight: 600 }}
                  axisLine={false} 
                  tickLine={false} 
                />
                <YAxis 
                  domain={[0, 60]}
                  tick={{ fontSize: 9, fill: "#9ca3af", fontWeight: 600 }}
                  axisLine={false} 
                  tickLine={false} 
                />
                <Tooltip
                  contentStyle={{
                    fontSize: 11, 
                    borderRadius: 8,
                    border: "1px solid #e5e7eb",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.08)"
                  }} 
                />
                <Area 
                  type="monotone" 
                  dataKey="avg"
                  stroke="#9ca3af" 
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  fill="none" 
                  dot={false} 
                />
                <Area 
                  type="monotone" 
                  dataKey="normal"
                  stroke="#d4b896" 
                  strokeWidth={2}
                  fill="url(#beigeGrad)" 
                  dot={false} 
                />
                <Area 
                  type="monotone" 
                  dataKey="max"
                  stroke="#f97316" 
                  strokeWidth={2}
                  fill="none" 
                  dot={false} 
                />
                <Area 
                  type="monotone" 
                  dataKey="min"
                  stroke="#93c5fd" 
                  strokeWidth={1.5}
                  fill="none" 
                  dot={false} 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </div>
  );
}

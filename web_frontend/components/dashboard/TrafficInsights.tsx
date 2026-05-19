"use client";

import React, { useState } from "react";
import {
  AreaChart, Area, XAxis, YAxis, Tooltip,
  ResponsiveContainer
} from "recharts";
import { Settings, RefreshCw, ChevronDown, CloudRain, Droplets } from "lucide-react";

// Curated telemetry timeline datasets representing historical accumulation and rate
const waterDepthData = [
  { time: "18:00", avg: 12, max: 20, min: 5 },
  { time: "19:00", avg: 18, max: 28, min: 10 },
  { time: "20:00", avg: 25, max: 38, min: 15 },
  { time: "21:00", avg: 35, max: 48, min: 20 },
  { time: "22:00", avg: 42, max: 55, min: 25 },
  { time: "23:00", avg: 40, max: 52, min: 22 },
  { time: "00:00", avg: 36, max: 46, min: 18 },
  { time: "01:00", avg: 30, max: 40, min: 12 },
];

const rainRateData = [
  { time: "18:00", avg: 8, max: 12, min: 4, baseline: 1.5 },
  { time: "19:00", avg: 15, max: 22, min: 8, baseline: 1.5 },
  { time: "20:00", avg: 28, max: 35, min: 15, baseline: 1.5 },
  { time: "21:00", avg: 32, max: 42, min: 18, baseline: 1.5 },
  { time: "22:00", avg: 24, max: 30, min: 12, baseline: 1.5 },
  { time: "23:00", avg: 18, max: 25, min: 6, baseline: 1.5 },
  { time: "00:00", avg: 10, max: 18, min: 4, baseline: 1.5 },
  { time: "01:00", avg: 5, max: 10, min: 2, baseline: 1.5 },
];

export default function TrafficInsights() {
  const [timeRange, setTimeRange] = useState("Last 6 Hours");
  const [showTimeDropdown, setShowTimeDropdown] = useState(false);
  const [sector, setSector] = useState("G-10 Sector");
  const [showSectorDropdown, setShowSectorDropdown] = useState(false);
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
        <h3 className="font-bold text-gray-800 text-sm uppercase tracking-wider flex items-center gap-1.5">
          <CloudRain className="w-4 h-4 text-blue-500" />
          <span>Flood Telemetry Insights</span>
        </h3>
        
        <div className="flex flex-wrap items-center gap-2">
          {/* Time range dropdown */}
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

          {/* Sector selection dropdown */}
          <div className="relative">
            <div 
              onClick={() => setShowSectorDropdown(!showSectorDropdown)}
              className="flex items-center gap-1 text-xs font-semibold text-gray-500 border border-gray-200 rounded-lg px-2.5 py-1.5 hover:bg-gray-50 cursor-pointer select-none transition-colors"
            >
              <span>{sector}</span>
              <ChevronDown className="w-3.5 h-3.5" />
            </div>
            {showSectorDropdown && (
              <div className="absolute top-full right-0 mt-1 w-36 bg-white border border-gray-200 rounded-lg shadow-lg z-50 py-1">
                {["G-10 Sector", "F-6 Sector", "E-11 Sector", "Blue Area", "I-9 Sector"].map(opt => (
                  <div
                    key={opt}
                    onClick={() => {
                      setSector(opt);
                      setShowSectorDropdown(false);
                    }}
                    className="px-3.5 py-2 text-xs font-semibold hover:bg-gray-50 text-gray-700 hover:text-gray-900 cursor-pointer transition-colors"
                  >
                    {opt}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Refresh button */}
          <button 
            onClick={handleRefreshClick}
            className={`flex items-center gap-1.5 text-xs text-white bg-emerald-500 hover:bg-emerald-600 rounded-lg px-3 py-1.5 font-bold transition-colors cursor-pointer border border-transparent shadow-xs ${
              isRefreshing ? "animate-pulse" : ""
            }`}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin" : ""}`} />
            <span>{isRefreshing ? "Syncing..." : "Sync Sensor"}</span>
          </button>
        </div>
      </div>

      {/* Charts Column/Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* CHART CARD 1: Water Level Depth */}
        <div className="bg-gray-50 rounded-xl border border-gray-100 p-4">
          <div className="flex items-start justify-between w-full">
            <div className="flex flex-col">
              <span className="text-xs font-bold text-gray-600 uppercase tracking-wider">Water Level Depth</span>
              <span className="text-[10px] text-gray-400 font-semibold mt-0.5">Islamabad Nullah Inundation</span>
            </div>
            <Droplets className="w-4 h-4 text-cyan-500" />
          </div>

          {/* Big Value */}
          <div className="flex items-baseline gap-1 mt-3 mb-1">
            <span className="text-3xl font-black text-cyan-600 tracking-tight">42.5</span>
            <span className="text-xs font-bold text-cyan-400">CM DEPTH</span>
          </div>

          {/* Legends */}
          <div className="flex flex-wrap items-center gap-4 mb-3">
            <div className="flex items-center gap-1.5">
              <div className="border-t-2 border-dashed border-gray-400 w-5" />
              <span className="text-[11px] font-semibold text-gray-400">Mean Level</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="h-2 w-2 rounded-full bg-cyan-500" />
              <span className="text-[11px] font-semibold text-gray-400">Peak Flood Depth</span>
            </div>
          </div>

          {/* Recharts Area Container */}
          <div className="w-full h-44 text-xs font-semibold text-gray-400">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={waterDepthData} margin={{ top: 10, right: 5, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorDepth" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="time" stroke="#9ca3af" fontSize={10} tickLine={false} />
                <YAxis stroke="#9ca3af" fontSize={10} tickLine={false} />
                <Tooltip />
                <Area
                  type="monotone"
                  dataKey="max"
                  stroke="#06b6d4"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#colorDepth)"
                />
                <Area
                  type="monotone"
                  dataKey="avg"
                  stroke="#9ca3af"
                  strokeDasharray="4 4"
                  strokeWidth={1.5}
                  fill="none"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* CHART CARD 2: Rain Gauge Rate */}
        <div className="bg-gray-50 rounded-xl border border-gray-100 p-4">
          <div className="flex items-start justify-between w-full">
            <div className="flex flex-col">
              <span className="text-xs font-bold text-gray-600 uppercase tracking-wider">Precipitation Rate</span>
              <span className="text-[10px] text-gray-400 font-semibold mt-0.5">Rain Gauge Sensor Activity</span>
            </div>
            <CloudRain className="w-4 h-4 text-indigo-500" />
          </div>

          {/* Big Value */}
          <div className="flex items-baseline gap-1 mt-3 mb-1">
            <span className="text-3xl font-black text-indigo-600 tracking-tight">32.8</span>
            <span className="text-xs font-bold text-indigo-400">MM/HR RATE</span>
          </div>

          {/* Legends */}
          <div className="flex flex-wrap items-center gap-4 mb-3">
            <div className="flex items-center gap-1.5">
              <div className="border-t-2 border-dashed border-gray-400 w-5" />
              <span className="text-[11px] font-semibold text-gray-400">Baseline</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="h-2 w-2 rounded-full bg-indigo-500" />
              <span className="text-[11px] font-semibold text-gray-400">Intensity Spikes</span>
            </div>
          </div>

          {/* Recharts Area Container */}
          <div className="w-full h-44 text-xs font-semibold text-gray-400">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={rainRateData} margin={{ top: 10, right: 5, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRain" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="time" stroke="#9ca3af" fontSize={10} tickLine={false} />
                <YAxis stroke="#9ca3af" fontSize={10} tickLine={false} />
                <Tooltip />
                <Area
                  type="monotone"
                  dataKey="max"
                  stroke="#6366f1"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#colorRain)"
                />
                <Area
                  type="monotone"
                  dataKey="baseline"
                  stroke="#9ca3af"
                  strokeDasharray="4 4"
                  strokeWidth={1.5}
                  fill="none"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </div>
  );
}

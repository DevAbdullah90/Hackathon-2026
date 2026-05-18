"use client";

import React from "react";
import { AlertTriangle, Camera, Settings, Bookmark } from "lucide-react";

interface TelemetryRowProps {
  label: string;
  value: string;
  isPositive: boolean;
}

function TelemetryRow({ label, value, isPositive }: TelemetryRowProps) {
  return (
    <div className="flex items-start gap-1.5">
      <span className="text-gray-400 text-xs mt-0.5 select-none">•</span>
      <span className="text-xs text-gray-500">{label}:</span>
      <span className={`text-xs font-semibold ${isPositive ? "text-[#16a34a]" : "text-[#374151]"}`}>
        {value}
      </span>
    </div>
  );
}

export default function EventsPanel() {
  const telemetryData = [
    { label: "Accident Occurred", value: "Yes", isPositive: true },
    { label: "Weather Condition", value: "Sunny", isPositive: true },
    { label: "Vehicle Types", value: "Car vs. Car", isPositive: true },
    { label: "Accident Type", value: "Collision", isPositive: true },
    { label: "VRU Involved", value: "No", isPositive: false },
    { label: "Affected Lanes", value: "1 Lane", isPositive: false },
    { label: "Ambulance Present", value: "Yes", isPositive: true },
    { label: "Fire Truck Present", value: "No", isPositive: false },
    { label: "Police on Scene", value: "No", isPositive: false },
    { label: "Fire on Scene", value: "No", isPositive: false },
  ];

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-xs overflow-hidden">
      
      {/* Card Header */}
      <div className="px-4 pt-4 pb-3 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-500" />
          <h3 className="text-sm font-semibold text-gray-800">Events</h3>
        </div>

        <div className="flex items-center gap-3">
          <Camera className="w-4 h-4 text-gray-400 cursor-pointer hover:text-gray-600 transition-colors" />
          <Settings className="w-4 h-4 text-gray-400 cursor-pointer hover:text-gray-600 transition-colors" />
          <Bookmark className="w-4 h-4 text-orange-400 fill-orange-400 cursor-pointer" />
          <div className="h-4 w-px bg-gray-200" />
          <span className="text-xs text-gray-400">Last update: 20:32</span>
          <span className="text-xs text-gray-400 font-semibold bg-gray-50 px-1.5 py-0.5 rounded border border-gray-200">
            Event ID: 7C2-21
          </span>
        </div>
      </div>

      {/* Card Body */}
      <div className="p-4">
        
        {/* Alert Title Row */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center border border-amber-100">
              <AlertTriangle className="w-5 h-5 text-amber-500 fill-amber-50" />
            </div>
            <span className="text-sm font-bold text-gray-900">Accident Detected</span>
          </div>
          <AlertTriangle className="w-5 h-5 text-orange-500 fill-orange-100" />
        </div>

        {/* Urgency Level Row */}
        <div className="flex items-center gap-2 mb-4">
          <span className="text-xs font-semibold text-gray-500">Emergency Level</span>
          <div className="flex gap-1 ml-2">
            <div className="w-4 h-3.5 rounded-xs bg-orange-500" />
            <div className="w-4 h-3.5 rounded-xs bg-orange-500" />
            <div className="w-4 h-3.5 rounded-xs bg-orange-500" />
            <div className="w-4 h-3.5 rounded-xs bg-orange-500" />
            <div className="w-4 h-3.5 rounded-xs bg-gray-200" />
          </div>
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* Left Column: Descriptive Log */}
          <div className="text-xs text-gray-600 leading-relaxed font-medium bg-gray-50 border border-gray-100 p-3.5 rounded-xl">
            Two vehicles collided in the northbound lane. No VRUS 
            were involved. Lane blockage is causing moderate 
            congestion. Traffic mode was switched to FLASH. V2X 
            alert were broadcast to nearby connected vehicles 
            of the obstruction.
          </div>

          {/* Right Column: Telemetry Specs */}
          <div className="space-y-1 border border-gray-100 p-3.5 rounded-xl bg-white shadow-3xs">
            {telemetryData.map((data, index) => (
              <TelemetryRow
                key={index}
                label={data.label}
                value={data.value}
                isPositive={data.isPositive}
              />
            ))}
          </div>

        </div>

      </div>

    </div>
  );
}

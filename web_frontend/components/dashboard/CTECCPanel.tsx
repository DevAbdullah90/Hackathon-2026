"use client";

import React, { useState } from "react";
import { Bell, Settings, Bookmark } from "lucide-react";

type Status = "In Progress" | "Dispatched" | "Notified" | "Triggered";

interface StatusRowProps {
  department: string;
  status: Status;
  onClick: () => void;
}

function StatusRow({ department, status, onClick }: StatusRowProps) {
  const getBadgeStyle = (currentStatus: string) => {
    switch (currentStatus) {
      case "In Progress":
        return "bg-red-50 text-red-600 border border-red-100";
      case "Dispatched":
        return "bg-green-50 text-green-600 border border-green-100";
      case "Notified":
        return "bg-orange-50 text-orange-600 border border-orange-100";
      case "Triggered":
        return "bg-gray-100 text-gray-500 border border-gray-200";
      default:
        return "bg-gray-50 text-gray-400";
    }
  };

  return (
    <div className="flex items-center justify-between py-2.5 border-b border-gray-50 last:border-0">
      <span className="text-sm text-gray-700 font-semibold">{department}</span>
      <span 
        onClick={onClick}
        className={`text-xs font-semibold px-2.5 py-0.5 rounded-md cursor-pointer select-none transition-all hover:opacity-80 active:scale-95 ${getBadgeStyle(status)}`}
      >
        {status}
      </span>
    </div>
  );
}

export default function CTECCPanel() {
  const statuses: Status[] = ["In Progress", "Dispatched", "Notified", "Triggered"];

  const [dispatchData, setDispatchData] = useState<{ department: string; status: Status }[]>([
    { department: "Medical Department", status: "In Progress" },
    { department: "Police Department", status: "Dispatched" },
    { department: "Fire Department", status: "Dispatched" },
    { department: "Water Department", status: "Notified" },
    { department: "Transport Department", status: "Notified" },
    { department: "V2X Broadcast System", status: "Triggered" },
  ]);

  const handleBadgeClick = (index: number) => {
    setDispatchData(prev => prev.map((item, i) => {
      if (i !== index) return item;
      const currentIdx = statuses.indexOf(item.status);
      const nextIdx = (currentIdx + 1) % statuses.length;
      return { ...item, status: statuses[nextIdx] };
    }));
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-xs overflow-hidden h-full flex flex-col justify-between">
      <div>
        {/* Card Header */}
        <div className="px-4 pt-4 pb-3 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-gray-600 animate-swing" />
            <h3 className="text-sm font-semibold text-gray-800">CTECC</h3>
          </div>

          <div className="flex items-center gap-3">
            <Settings className="w-4 h-4 text-gray-400 cursor-pointer hover:text-gray-600 transition-colors" />
            <Bookmark className="w-4 h-4 text-orange-400 fill-orange-400 cursor-pointer" />
            <div className="h-4 w-px bg-gray-200" />
            <span className="text-xs text-gray-400">Last update: 20:32</span>
            <span className="text-xs text-gray-400 font-semibold bg-gray-50 px-1.5 py-0.5 rounded border border-gray-200">
              Event ID: 7C2-21
            </span>
          </div>
        </div>

        {/* Status List */}
        <div className="px-4 pb-4 pt-2 space-y-0">
          {dispatchData.map((row, index) => (
            <StatusRow
              key={index}
              department={row.department}
              status={row.status}
              onClick={() => handleBadgeClick(index)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

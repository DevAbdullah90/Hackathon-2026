"use client";

import React, { useEffect, useState } from "react";
import { Shield, Home, Users } from "lucide-react";
import { api, SafeHaven } from "@/lib/api";

export default function SafeHavensPanel() {
  const [shelters, setShelters] = useState<SafeHaven[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchShelters = async () => {
    try {
      const data = await api.getSafeHavens();
      setShelters(data);
    } catch (err) {
      console.error("Failed to load safe havens in SafeHavensPanel:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShelters();
    const interval = setInterval(fetchShelters, 5000); // 5s active polling
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden h-fit flex flex-col">
      {/* Top Accent Gradient Bar */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 to-indigo-600" />
      
      <div>
        {/* Card Header */}
        <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-blue-600 animate-pulse" />
            <h3 className="text-[10px] font-black text-slate-800 uppercase tracking-widest">Safe Haven Capacity</h3>
          </div>
          <div className="flex items-center gap-1.5 text-[10px] text-gray-400 font-semibold select-none">
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-ping" />
            <span>Shelter Status</span>
          </div>
        </div>

        {/* Shelter List */}
        <div className="p-3 space-y-2.5">
          {loading ? (
            <div className="text-xs text-gray-400 py-6 text-center animate-pulse font-semibold">
              Querying shelter capacities...
            </div>
          ) : shelters.length === 0 ? (
            <div className="text-xs text-gray-400 py-6 text-center font-medium">
              No municipal shelters configured in the database.
            </div>
          ) : (
            shelters.map((shelter) => {
              const pct = (shelter.current_occupancy / shelter.capacity) * 100;
              let barColor = "bg-emerald-500";
              let textColor = "text-emerald-700 bg-emerald-50 border-emerald-100";
              
              if (pct >= 85) {
                barColor = "bg-red-500";
                textColor = "text-red-700 bg-red-50 border-red-100";
              } else if (pct >= 70) {
                barColor = "bg-amber-500";
                textColor = "text-amber-700 bg-amber-50 border-amber-100";
              }

              return (
                <div key={shelter.id} className="space-y-1 border-b border-slate-50 pb-2 last:border-0 last:pb-0">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <Home className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                      <span className="text-[11px] font-extrabold text-slate-700 truncate">{shelter.name}</span>
                    </div>
                    <span className={`text-[9px] font-extrabold px-1.5 py-0.5 border rounded-md uppercase tracking-wide flex-shrink-0 ${textColor}`}>
                      {pct.toFixed(1)}% Full
                    </span>
                  </div>
                  
                  {/* Progress Bar Container */}
                  <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden relative">
                    <div 
                      className={`h-full ${barColor} transition-all duration-500 rounded-full`}
                      style={{ width: `${Math.min(pct, 100)}%` }}
                    />
                  </div>

                  <div className="flex justify-between items-center text-[9px] text-slate-500">
                    <div className="flex items-center gap-1">
                      <Users className="w-3 h-3 text-slate-400" />
                      <span>Occupancy: <strong>{shelter.current_occupancy}</strong> / {shelter.capacity} citizens</span>
                    </div>
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

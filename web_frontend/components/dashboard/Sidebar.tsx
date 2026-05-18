"use client";

import React from "react";
import { 
  LayoutDashboard, 
  Cpu, 
  BarChart3, 
  BellRing, 
  Settings, 
  ChevronLeft,
  Activity,
  X
} from "lucide-react";

interface SidebarProps {
  activePage: string;
  onNavigate: (page: string) => void;
  onClose?: () => void;
}

export default function Sidebar({ activePage, onNavigate, onClose }: SidebarProps) {
  const navItems = [
    { name: "Dashboard", icon: LayoutDashboard },
    { name: "Devices", icon: Cpu },
    { name: "Analytics", icon: BarChart3 },
    { name: "Alerts", icon: BellRing },
    { name: "Settings", icon: Settings },
  ];

  return (
    <div className="h-screen w-64 bg-white border-r border-card-border flex flex-col justify-between shadow-xs select-none relative">
      
      {/* Mobile close button */}
      <button 
        onClick={onClose}
        className="lg:hidden absolute top-4 right-4 p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-all duration-150 cursor-pointer border border-gray-200"
      >
        <X className="w-5 h-5" />
      </button>

      {/* Top Brand / Logo */}
      <div className="flex flex-col">
        <div className="flex items-center gap-3 px-6 py-5 border-b border-card-border">
          <div className="w-9 h-9 rounded-xl bg-kemetra-green flex items-center justify-center shadow-xs">
            <Activity className="w-5 h-5 text-white animate-pulse" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-900 leading-none">Kemetra</h1>
            <span className="text-[10px] text-gray-400 font-semibold tracking-wider uppercase mt-1 block">
              Traffic Intelligence
            </span>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="mt-6 px-4 space-y-1">
          {navItems.map((item) => {
            const isActive = item.name === activePage;
            const Icon = item.icon;
            
            return (
              <a
                key={item.name}
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  onNavigate(item.name);
                }}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-150 cursor-pointer ${
                  isActive 
                    ? "bg-kemetra-sidebar-active-bg text-kemetra-green" 
                    : "text-sidebar-text hover:bg-gray-50 hover:text-gray-900"
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? "text-kemetra-green" : "text-gray-400 group-hover:text-gray-900"}`} />
                <span>{item.name}</span>
              </a>
            );
          })}
        </nav>
      </div>

      {/* Footer Collapse Button / Meta Info */}
      <div className="p-4 border-t border-card-border">
        <div className="flex items-center justify-between px-3 py-2 rounded-xl hover:bg-gray-50 cursor-pointer transition-colors text-gray-500 hover:text-gray-900">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-kemetra-green animate-ping" />
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">
              Active Server
            </span>
          </div>
          <ChevronLeft className="w-4 h-4 text-gray-400" />
        </div>
      </div>

    </div>
  );
}

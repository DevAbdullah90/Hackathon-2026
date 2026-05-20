"use client";

import React from "react";
import { 
  LayoutDashboard, 
  ChevronLeft,
  Activity,
  X,
  ShieldCheck
} from "lucide-react";

interface SidebarProps {
  activePage: string;
  onNavigate: (page: string) => void;
  onClose?: () => void;
}

export default function Sidebar({ activePage, onNavigate, onClose }: SidebarProps) {
  const navItems = [
    { name: "Dashboard", icon: LayoutDashboard },
  ];

  return (
    <div className="h-screen w-64 bg-white border-r border-gray-200 flex flex-col justify-between shadow-xs select-none relative">
      
      {/* Mobile close button */}
      <button 
        onClick={onClose}
        className="lg:hidden absolute top-4 right-4 p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-all duration-150 cursor-pointer border border-gray-200"
      >
        <X className="w-5 h-5" />
      </button>

      {/* Top Brand / Logo */}
      <div className="flex flex-col">
        <div className="flex items-center gap-3 px-6 py-5 border-b border-gray-100 bg-gray-50/20">
          <div className="w-9 h-9 rounded-xl bg-red-500 flex items-center justify-center shadow-md border border-red-600">
            <Activity className="w-5 h-5 text-white animate-pulse" />
          </div>
          <div>
            <h1 className="text-lg font-black text-gray-900 leading-none tracking-wider">CIRO by AQUA</h1>
            <span className="text-[9px] text-gray-400 font-extrabold tracking-widest uppercase mt-1 block">
              Crisis Orchestrator
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
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-extrabold uppercase tracking-wider transition-all duration-150 cursor-pointer ${
                  isActive 
                    ? "bg-red-50/60 text-red-500 border-l-4 border-red-500 font-black" 
                    : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? "text-red-500" : "text-gray-400 group-hover:text-gray-900"}`} />
                <span>{item.name}</span>
              </a>
            );
          })}
        </nav>
      </div>

      {/* Footer Collapse Button / Meta Info */}
      <div className="p-4 border-t border-gray-100 bg-gray-50/30">
        <div className="flex items-center justify-between px-3 py-2 rounded-xl hover:bg-gray-50 cursor-pointer transition-colors text-gray-500 hover:text-gray-900">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-500 animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-wider text-gray-400">
              FASTAPI LIVE
            </span>
          </div>
          <ChevronLeft className="w-4 h-4 text-gray-400" />
        </div>
      </div>

    </div>
  );
}

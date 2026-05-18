"use client";

import React, { useState } from "react";
import { ChevronDown, Bell, Menu } from "lucide-react";

interface TopBarProps {
  onMenuToggle?: () => void;
}

export default function TopBar({ onMenuToggle }: TopBarProps) {
  const [activeLocation, setActiveLocation] = useState("Central Austin");
  const [showLocationMenu, setShowLocationMenu] = useState(false);
  const [activeTab, setActiveTab] = useState("Overview");
  
  const [showBadge, setShowBadge] = useState(true);
  const [showToast, setShowToast] = useState(false);

  const handleBellClick = () => {
    setShowBadge(false);
    setShowToast(true);
    setTimeout(() => {
      setShowToast(false);
    }, 2000);
  };

  return (
    <div className="w-full bg-white border-b border-card-border px-4 md:px-6 py-3 shadow-xs relative">
      
      {/* Absolute Toast */}
      {showToast && (
        <div className="absolute top-16 right-4 md:right-6 bg-gray-900 text-white text-xs font-semibold px-3 py-2 rounded-lg shadow-lg z-50 animate-bounce">
          All notifications cleared!
        </div>
      )}

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        
        {/* Left Section */}
        <div className="flex items-start gap-2">
          {/* Hamburger Menu - Mobile Only */}
          <button 
            onClick={onMenuToggle}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100 mr-1 flex-shrink-0 cursor-pointer border border-gray-200 transition-colors"
          >
            <Menu className="w-5 h-5 text-gray-600" />
          </button>

          <div className="flex flex-col gap-3 flex-1">
            {/* Title & Online Status */}
            <div className="flex flex-col">
              <div className="relative">
                <div 
                  onClick={() => setShowLocationMenu(!showLocationMenu)}
                  className="flex items-center gap-1 cursor-pointer group w-fit select-none"
                >
                  <h2 className="text-[18px] font-bold text-gray-900 leading-tight">{activeLocation}</h2>
                  <ChevronDown className="w-5 h-5 text-gray-500 group-hover:text-gray-900 transition-colors mt-0.5" />
                </div>
                
                {/* Location Dropdown Options */}
                {showLocationMenu && (
                  <div className="absolute top-full left-0 mt-1.5 w-44 bg-white border border-gray-200 rounded-lg shadow-lg z-50 py-1">
                    {["Central Austin", "East 7th", "West 6th", "South 1st"].map((option) => (
                      <div 
                        key={option} 
                        onClick={() => {
                          setActiveLocation(option);
                          setShowLocationMenu(false);
                        }}
                        className="px-3.5 py-2 text-sm font-semibold hover:bg-gray-50 text-gray-700 hover:text-gray-900 cursor-pointer transition-colors"
                      >
                        {option}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-1.5 mt-1 select-none">
                <span className="text-kemetra-green text-[10px]">●</span>
                <span className="text-[12px] font-semibold text-kemetra-green">Online</span>
                <span className="text-[12px] text-gray-400">Update 20-32</span>
              </div>
            </div>

            {/* Selectors */}
            <div className="flex items-center gap-2 flex-wrap">
              {/* Location Pill */}
              <div className="flex items-center gap-2 border border-card-border rounded-lg px-3 py-1.5 bg-white shadow-2xs">
                <span className="text-[11px] font-medium text-gray-400 uppercase tracking-wider">Location</span>
                <div className="flex items-center gap-1.5">
                  <span className="text-blue-500 text-[10px]">●</span>
                  <span className="text-sm font-semibold text-gray-800">East 7th</span>
                </div>
              </div>
              {/* Subication Pill */}
              <div className="flex items-center gap-2 border border-card-border rounded-lg px-3 py-1.5 bg-white shadow-2xs cursor-pointer hover:bg-gray-50 transition-colors">
                <span className="text-[11px] font-medium text-gray-400 uppercase tracking-wider">Subication</span>
                <div className="flex items-center gap-1">
                  <span className="text-sm font-semibold text-gray-800">7th & Comal (Segment ID:7C2)</span>
                  <ChevronDown className="w-4 h-4 text-gray-500" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Center Tabs */}
        <div className="flex items-center justify-center w-full md:w-auto">
          <div className="flex items-center gap-1 bg-gray-50 p-1 rounded-lg border border-card-border w-full md:w-auto justify-between md:justify-start">
            {["Overview", "Device log", "Settings"].map((tab) => {
              const isActive = tab === activeTab;
              return (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex-1 md:flex-none px-3 py-1.5 md:px-4 md:py-2 text-xs md:text-sm font-semibold rounded-md transition-all cursor-pointer ${
                    isActive 
                      ? "bg-kemetra-green text-white shadow-xs" 
                      : "text-gray-500 hover:text-gray-900 hover:bg-gray-100"
                  }`}
                >
                  {tab}
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center justify-between md:justify-end gap-4">
          {/* Notification Bell */}
          <div 
            onClick={handleBellClick}
            className="relative p-2 text-gray-500 hover:text-gray-700 bg-gray-50 hover:bg-gray-100 rounded-full border border-card-border cursor-pointer transition-colors shadow-2xs"
          >
            <Bell className="w-5 h-5" />
            {showBadge && (
              <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white ring-2 ring-white animate-pulse">
                1
              </span>
            )}
          </div>

          <div className="hidden md:block h-8 w-px bg-gray-200" />

          {/* User Profile */}
          <div className="flex items-center gap-3 cursor-pointer group">
            {/* Avatar Placeholder */}
            <div className="w-10 h-10 rounded-full bg-gray-100 border border-card-border flex items-center justify-center text-gray-600 font-bold text-sm shadow-inner group-hover:border-gray-300 transition-colors">
              JC
            </div>
            <div className="flex flex-col text-left">
              <span className="text-sm font-bold text-gray-900 leading-tight">Jane Cooper</span>
              <span className="text-[11px] text-gray-400 mt-0.5">A14AT0  ID</span>
            </div>
            <ChevronDown className="w-4 h-4 text-gray-500 group-hover:text-gray-900 transition-colors mt-0.5" />
          </div>
        </div>

      </div>
    </div>
  );
}

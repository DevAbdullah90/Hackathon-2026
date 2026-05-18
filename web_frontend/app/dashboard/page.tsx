"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import Sidebar from "@/components/dashboard/Sidebar";
import TopBar from "@/components/dashboard/TopBar";
import MetricsGrid from "@/components/dashboard/MetricsGrid";
import TrafficInsights from "@/components/dashboard/TrafficInsights";
import EventsPanel from "@/components/dashboard/EventsPanel";
import CTECCPanel from "@/components/dashboard/CTECCPanel";

const MapPanel = dynamic(
  () => import("@/components/dashboard/MapPanel"),
  {
    ssr: false,
    loading: () => (
      <div
        className="border-r border-gray-200 bg-gray-100 
                   animate-pulse flex items-center justify-center 
                   text-gray-400 text-sm flex-shrink-0"
        style={{ width: "420px" }}
      >
        Loading Map...
      </div>
    ),
  }
);

export default function DashboardPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activePage, setActivePage] = useState("Dashboard");

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed lg:relative z-30 h-full
        transition-transform duration-300 ease-in-out
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
      `}>
        <Sidebar
          activePage={activePage}
          onNavigate={(page) => {
            setActivePage(page);
            setSidebarOpen(false);
          }}
          onClose={() => setSidebarOpen(false)}
        />
      </div>

      {/* Main content */}
      <div className="flex flex-col flex-1 overflow-hidden min-w-0">

        {/* TopBar */}
        <TopBar onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />

        {/* Body */}
        <div className="flex flex-1 overflow-hidden">

          {/* Map Panel - hidden on mobile/tablet */}
          <div className="hidden xl:block flex-shrink-0">
            <MapPanel />
          </div>

          {/* Right scrollable content */}
          <div className="flex-1 overflow-y-auto bg-gray-50 
                          p-3 md:p-4 space-y-4 min-w-0">
            <div className="fade-in" style={{ animationDelay: "0ms" }}>
              <MetricsGrid />
            </div>
            <div className="fade-in" style={{ animationDelay: "100ms" }}>
              <TrafficInsights />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 pb-4 fade-in" style={{ animationDelay: "200ms" }}>
              <EventsPanel />
              <CTECCPanel />
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

"use client";

import * as React from "react";
import {
  Home,
  QrCode,
  CreditCard,
  Activity,
  Calendar,
  Dumbbell,
  Receipt,
  User,
} from "lucide-react";

export type PortalTab =
  | "home"
  | "card"
  | "membership"
  | "attendance"
  | "classes"
  | "workouts"
  | "billing"
  | "profile";

interface PortalBottomNavProps {
  activeTab: PortalTab;
  onTabChange: (tab: PortalTab) => void;
  hasUnpaidInvoices?: boolean;
}

export function PortalBottomNav({
  activeTab,
  onTabChange,
  hasUnpaidInvoices = false,
}: PortalBottomNavProps) {
  const tabs = [
    { id: "home" as PortalTab, label: "Home", icon: Home },
    { id: "card" as PortalTab, label: "Pass", icon: QrCode },
    { id: "membership" as PortalTab, label: "Plan", icon: CreditCard },
    { id: "attendance" as PortalTab, label: "Visits", icon: Activity },
    { id: "classes" as PortalTab, label: "Classes", icon: Calendar },
    { id: "workouts" as PortalTab, label: "Workouts", icon: Dumbbell },
    {
      id: "billing" as PortalTab,
      label: "Billing",
      icon: Receipt,
      hasDot: hasUnpaidInvoices,
    },
    { id: "profile" as PortalTab, label: "Profile", icon: User },
  ];

  return (
    <>
      {/* Desktop / Tablet Top Tab Switcher */}
      <div className="hidden sm:flex items-center justify-center border-b border-slate-200 bg-white py-2 px-4 shadow-sm">
        <nav className="flex flex-wrap gap-1 rounded-xl bg-slate-100 p-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`relative flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                  isActive
                    ? "bg-white text-indigo-600 shadow-sm"
                    : "text-slate-600 hover:text-slate-900 hover:bg-white/50"
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                <span>{tab.label}</span>
                {tab.hasDot && (
                  <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Mobile Fixed Bottom Navigation Bar (scrollable horizontally if needed) */}
      <nav className="sm:hidden fixed bottom-0 left-0 right-0 z-40 flex h-16 items-center justify-around border-t border-slate-200 bg-white/95 backdrop-blur-md px-1 shadow-lg overflow-x-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`relative flex min-w-[48px] flex-col items-center justify-center py-1 transition-colors ${
                isActive
                  ? "text-indigo-600 font-bold"
                  : "text-slate-500 hover:text-slate-700 font-medium"
              }`}
            >
              <div className="relative">
                <Icon
                  className={`h-4 w-4 transition-transform ${
                    isActive ? "scale-110" : ""
                  }`}
                />
                {tab.hasDot && (
                  <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-rose-500" />
                )}
              </div>
              <span className="text-[9px] mt-0.5 tracking-tight whitespace-nowrap">
                {tab.label}
              </span>
            </button>
          );
        })}
      </nav>
    </>
  );
}

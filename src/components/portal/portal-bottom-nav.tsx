"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  QrCode,
  Dumbbell,
  Receipt,
  User,
  TrendingUp,
  Trophy,
} from "lucide-react";

export type PortalTab =
  | "home"
  | "card"
  | "membership"
  | "attendance"
  | "classes"
  | "workouts"
  | "progress"
  | "challenges"
  | "billing"
  | "profile";

interface PortalBottomNavProps {
  activeTab: PortalTab;
  onTabChange?: (tab: PortalTab) => void;
  hasUnpaidInvoices?: boolean;
}

interface NavItem {
  id: PortalTab;
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  hasDot?: boolean;
  mobilePrimary?: boolean;
}

export function PortalBottomNav({
  activeTab,
  onTabChange,
  hasUnpaidInvoices = false,
}: PortalBottomNavProps) {
  const pathname = usePathname();

  const tabs: NavItem[] = [
    {
      id: "home",
      label: "Home",
      href: "/member/home",
      icon: Home,
      mobilePrimary: true,
    },
    {
      id: "workouts",
      label: "Workouts",
      href: "/member/workouts",
      icon: Dumbbell,
      mobilePrimary: true,
    },
    {
      id: "progress",
      label: "Progress",
      href: "/member/progress",
      icon: TrendingUp,
      mobilePrimary: true,
    },
    {
      id: "membership",
      label: "Pass & Plan",
      href: "/member/membership",
      icon: QrCode,
      mobilePrimary: true,
    },
    {
      id: "challenges",
      label: "Challenges",
      href: "/member/challenges",
      icon: Trophy,
      mobilePrimary: true,
    },
    {
      id: "billing",
      label: "Payments",
      href: "/member/payments",
      icon: Receipt,
      hasDot: hasUnpaidInvoices,
      mobilePrimary: true,
    },
    {
      id: "profile",
      label: "Profile",
      href: "/member/profile",
      icon: User,
      mobilePrimary: true,
    },
  ];

  const handleTabClick = (tab: NavItem) => {
    if (onTabChange) {
      onTabChange(tab.id);
    }
  };

  return (
    <>
      {/* Desktop / Tablet Top Tab Switcher */}
      <div className="hidden sm:flex items-center justify-center border-b border-[#E2E8F0] bg-white py-2.5 px-4 shadow-xs">
        <nav className="flex flex-wrap gap-1 rounded-xl bg-[#F8FAFC] p-1 border border-[#E2E8F0]">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isTabActive =
              activeTab === tab.id ||
              (pathname ? pathname.startsWith(tab.href) : false);

            return (
              <Link
                key={tab.id}
                href={tab.href}
                onClick={() => handleTabClick(tab)}
                className={`relative flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-all ${
                  isTabActive
                    ? "bg-[#0B6B4F] text-white shadow-xs"
                    : "text-[#64748B] hover:text-[#0F172A] hover:bg-white"
                }`}
              >
                <Icon
                  className={`h-3.5 w-3.5 ${
                    isTabActive ? "text-white" : "text-[#64748B]"
                  }`}
                />
                <span>{tab.label}</span>
                {tab.hasDot && (
                  <span className="h-2 w-2 rounded-full bg-rose-500 animate-pulse" />
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Mobile Fixed Bottom Navigation Bar */}
      <nav
        aria-label="Member Navigation"
        className="sm:hidden fixed bottom-0 left-0 right-0 z-40 flex h-16 items-center justify-around border-t border-[#E2E8F0] bg-white/95 backdrop-blur-md px-1 shadow-lg pb-[env(safe-area-inset-bottom)]"
      >
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isTabActive =
            activeTab === tab.id ||
            (pathname ? pathname.startsWith(tab.href) : false);

          return (
            <Link
              key={tab.id}
              href={tab.href}
              onClick={() => handleTabClick(tab)}
              className={`relative flex flex-1 flex-col items-center justify-center py-1 transition-colors min-w-0 ${
                isTabActive
                  ? "text-[#0B6B4F] font-bold"
                  : "text-[#64748B] hover:text-[#0F172A] font-medium"
              }`}
            >
              {isTabActive && (
                <span className="absolute top-0 h-0.5 w-6 rounded-full bg-[#0B6B4F]" />
              )}
              <div className="relative mt-1">
                <Icon
                  className={`h-4 w-4 transition-transform ${
                    isTabActive ? "scale-110 text-[#0B6B4F]" : "text-[#64748B]"
                  }`}
                />
                {tab.hasDot && (
                  <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-rose-500" />
                )}
              </div>
              <span className="text-[10px] mt-0.5 tracking-tight truncate max-w-[48px] text-center">
                {tab.label}
              </span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}

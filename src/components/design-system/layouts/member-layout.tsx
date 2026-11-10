"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Dumbbell,
  TrendingUp,
  User,
  QrCode,
  Trophy,
  WifiOff,
} from "lucide-react";

function subscribeOnline(callback: () => void) {
  window.addEventListener("online", callback);
  window.addEventListener("offline", callback);
  return () => {
    window.removeEventListener("online", callback);
    window.removeEventListener("offline", callback);
  };
}

function getOnlineSnapshot() {
  return navigator.onLine;
}

function getOnlineServerSnapshot() {
  return true;
}

export interface MemberLayoutProps {
  gymName: string;
  gymSlug?: string;
  user: {
    name?: string | null;
    email?: string | null;
  };
  onOpenQrPass?: () => void;
  children: React.ReactNode;
}

const navTabs = [
  { href: "/member/home", label: "Home", icon: Home },
  { href: "/member/workouts", label: "Workouts", icon: Dumbbell },
  { href: "/member/progress", label: "Progress", icon: TrendingUp },
  { href: "/member/challenges", label: "Challenges", icon: Trophy },
  { href: "/member/profile", label: "Profile", icon: User },
];

export function MemberLayout({
  gymName,
  gymSlug,
  user,
  onOpenQrPass,
  children,
}: MemberLayoutProps) {
  const pathname = usePathname();
  const isOnline = React.useSyncExternalStore(
    subscribeOnline,
    getOnlineSnapshot,
    getOnlineServerSnapshot
  );
  const isOffline = !isOnline;

  return (
    <div className="min-h-screen bg-[#F5F6F4] font-sans text-[#0F172A] antialiased pb-24 md:pb-8">
      {/* Offline Alert Banner */}
      {isOffline && (
        <div className="bg-[#FEF2F2] border-b border-[#FECACA] px-4 py-2 text-center text-xs font-medium text-[#991B1B] flex items-center justify-center gap-1.5">
          <WifiOff className="h-3.5 w-3.5 shrink-0" />
          <span>You are currently offline. Cached membership pass remains valid for check-in.</span>
        </div>
      )}

      {/* Top Header */}
      <header className="sticky top-0 z-20 border-b border-[#E3E7E4] bg-white/90 px-4 sm:px-6 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-2xl sm:max-w-4xl items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#0B6B4F] text-white font-bold text-xs">
              {gymName ? gymName[0].toUpperCase() : "G"}
            </div>
            <div>
              <h2 className="font-heading text-sm font-bold text-[#0F172A] leading-tight">
                {gymName}
              </h2>
              {gymSlug && (
                <span className="text-[10px] text-[#64748B] font-mono leading-tight">
                  Member Portal
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onOpenQrPass && (
              <button
                type="button"
                onClick={onOpenQrPass}
                className="inline-flex items-center gap-1.5 rounded-lg bg-[#E4F2EB] px-2.5 py-1 text-xs font-semibold text-[#0B6B4F] hover:bg-[#0B6B4F] hover:text-white transition-colors"
              >
                <QrCode className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Check-in QR</span>
              </button>
            )}

            <div
              className="flex h-8 w-8 items-center justify-center rounded-full bg-[#0B6B4F] text-xs font-bold text-white shadow-xs select-none"
              title={user.name || user.email || "Member"}
            >
              {user.name ? user.name[0].toUpperCase() : "M"}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="mx-auto max-w-2xl sm:max-w-4xl px-4 py-6 animate-in fade-in duration-200">
        {children}
      </main>

      {/* Mobile Bottom Fixed Navigation Bar */}
      <nav
        aria-label="Member Navigation"
        className="fixed inset-x-3 bottom-3 z-30 grid grid-cols-5 rounded-2xl border border-[#E3E7E4] bg-white/95 pb-[env(safe-area-inset-bottom)] shadow-lg backdrop-blur md:hidden"
      >
        {navTabs.map((tab) => {
          const isActive = pathname === tab.href || pathname.startsWith(`${tab.href}/`);
          const Icon = tab.icon;

          return (
            <Link
              key={tab.href}
              href={tab.href}
              aria-current={isActive ? "page" : undefined}
              className={`flex flex-col items-center gap-1 py-2.5 text-[11px] transition-colors ${
                isActive
                  ? "font-semibold text-[#0B6B4F]"
                  : "text-[#64748B] hover:text-[#0F172A]"
              }`}
            >
              <Icon
                className={`h-4 w-4 ${isActive ? "text-[#0B6B4F]" : "text-[#64748B]"}`}
              />
              <span>{tab.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

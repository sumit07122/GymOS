"use client";

import * as React from "react";
import {
  Menu,
  PanelLeftClose,
  PanelLeft,
  Search,
  Bell,
  Building2,
} from "lucide-react";

export interface TopbarProps {
  currentGym?: {
    name: string;
    slug?: string;
    status?: string;
  };
  user?: {
    name?: string | null;
    email?: string | null;
  };
  breadcrumbs?: React.ReactNode;
  actions?: React.ReactNode;
  onMobileMenuToggle?: () => void;
  onSidebarCollapseToggle?: () => void;
  isSidebarCollapsed?: boolean;
  onSearchClick?: () => void;
  unreadNotificationsCount?: number;
  className?: string;
}

export function Topbar({
  currentGym,
  user,
  breadcrumbs,
  actions,
  onMobileMenuToggle,
  onSidebarCollapseToggle,
  isSidebarCollapsed,
  onSearchClick,
  unreadNotificationsCount = 0,
  className = "",
}: TopbarProps) {
  return (
    <header
      className={`sticky top-0 z-20 flex h-16 shrink-0 items-center justify-between border-b border-[#E3E7E4] bg-white/85 px-4 sm:px-8 backdrop-blur transition-all ${className}`}
    >
      {/* Left side: Navigation toggles & Workspace/Breadcrumb info */}
      <div className="flex items-center gap-3 min-w-0">
        {onMobileMenuToggle && (
          <button
            type="button"
            onClick={onMobileMenuToggle}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#E3E7E4] bg-white text-[#64748B] hover:text-[#0F172A] md:hidden"
            aria-label="Open mobile menu"
          >
            <Menu className="h-5 w-5" />
          </button>
        )}

        {onSidebarCollapseToggle && (
          <button
            type="button"
            onClick={onSidebarCollapseToggle}
            className="hidden md:flex h-9 w-9 items-center justify-center rounded-lg text-[#64748B] hover:bg-[#F8FAFC] hover:text-[#0F172A] transition-colors"
            aria-label="Toggle sidebar collapse"
          >
            {isSidebarCollapsed ? (
              <PanelLeft className="h-4 w-4" />
            ) : (
              <PanelLeftClose className="h-4 w-4" />
            )}
          </button>
        )}

        {breadcrumbs ? (
          <div className="hidden sm:block min-w-0">{breadcrumbs}</div>
        ) : currentGym ? (
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#E4F2EB] text-[#0B6B4F] shrink-0 font-bold">
              <Building2 className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-bold text-xs sm:text-sm text-[#0F172A] truncate">
                  {currentGym.name}
                </span>
                {currentGym.status && (
                  <span className="hidden sm:inline-block rounded-full bg-[#ECFDF5] px-2 py-0.2 text-[10px] font-semibold text-[#065F46] border border-[#A7F3D0]/60">
                    {currentGym.status}
                  </span>
                )}
              </div>
              {currentGym.slug && (
                <span className="font-mono text-[10px] text-[#64748B] hidden md:inline truncate">
                  /g/{currentGym.slug}
                </span>
              )}
            </div>
          </div>
        ) : null}
      </div>

      {/* Right side: Search, Actions, Notifications, User */}
      <div className="flex items-center gap-3 shrink-0">
        {/* Search trigger */}
        <button
          type="button"
          onClick={onSearchClick}
          className="hidden sm:flex items-center gap-2 rounded-lg border border-[#E3E7E4] bg-[#F8FAFC] px-3 py-1.5 text-xs text-[#64748B] hover:border-[#CBD5E1] transition-colors w-48 lg:w-64"
        >
          <Search className="h-3.5 w-3.5 text-[#94A3B8]" />
          <span className="flex-1 text-left truncate">Search workspace...</span>
          <kbd className="hidden lg:inline rounded border border-[#E3E7E4] bg-white px-1.5 py-0.5 text-[10px] font-mono text-[#94A3B8]">
            Ctrl K
          </kbd>
        </button>

        {/* Custom Actions Slot */}
        {actions}

        {/* Notification Bell */}
        <button
          type="button"
          className="relative flex h-9 w-9 items-center justify-center rounded-lg text-[#64748B] hover:bg-[#F8FAFC] hover:text-[#0F172A] transition-colors"
          title="Notifications"
        >
          <Bell className="h-4 w-4" />
          {unreadNotificationsCount > 0 && (
            <span className="absolute top-1.5 right-1.5 flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#059669] opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#059669]" />
            </span>
          )}
        </button>

        {/* User Avatar */}
        {user && (
          <div
            className="flex h-8 w-8 items-center justify-center rounded-full bg-[#0B6B4F] text-white text-xs font-bold shadow-xs select-none"
            title={user.name || user.email || "Account"}
          >
            {user.name ? user.name[0].toUpperCase() : "U"}
          </div>
        )}
      </div>
    </header>
  );
}

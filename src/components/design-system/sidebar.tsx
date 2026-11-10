"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Building2,
  X,
  LogOut,
  User,
} from "lucide-react";

export interface SidebarNavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string | number;
  badgeVariant?: "teal" | "neutral" | "danger";
  exact?: boolean;
}

export interface SidebarNavGroup {
  label?: string;
  items: SidebarNavItem[];
}

export interface SidebarProps {
  groups: SidebarNavGroup[];
  brandTitle?: string;
  brandTag?: string;
  brandHref?: string;
  currentGym?: {
    name: string;
    slug?: string;
    plan?: string;
    logoUrl?: string;
  };
  user?: {
    name?: string | null;
    email?: string | null;
    role?: string;
    avatarUrl?: string;
  };
  collapsed?: boolean;
  onToggleCollapse?: () => void;
  isMobileOpen?: boolean;
  onMobileClose?: () => void;
  onSignOut?: () => void;
  className?: string;
}

export function Sidebar({
  groups,
  brandTitle = "FIXIA GymOS",
  brandTag,
  brandHref = "/",
  currentGym,
  user,
  collapsed = false,
  isMobileOpen = false,
  onMobileClose,
  onSignOut,
  className = "",
}: SidebarProps) {
  const pathname = usePathname();

  const isItemActive = (item: SidebarNavItem) => {
    if (item.exact) {
      return pathname === item.href;
    }
    return pathname === item.href || pathname.startsWith(`${item.href}/`);
  };

  const navContent = (
    <div className="flex h-full flex-col justify-between bg-white">
      {/* Top Section: Brand + Gym Switcher */}
      <div className="flex flex-col">
        {/* Brand Header */}
        <div className="flex h-16 shrink-0 items-center justify-between border-b border-[#E3E7E4] px-5">
          <Link
            href={brandHref}
            className="flex items-center gap-2.5 font-heading font-bold text-base text-[#0F172A] tracking-tight hover:opacity-90 transition-opacity"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#0B6B4F] text-white shadow-xs">
              <span className="text-sm font-black">F</span>
            </div>
            {!collapsed && (
              <div className="flex items-center gap-1.5 min-w-0">
                <span className="truncate">{brandTitle}</span>
                {brandTag && (
                  <span className="rounded-md bg-[#F1F5F9] px-1.5 py-0.5 text-[10px] font-semibold text-[#64748B] shrink-0 uppercase tracking-wide">
                    {brandTag}
                  </span>
                )}
              </div>
            )}
          </Link>

          {isMobileOpen && (
            <button
              type="button"
              onClick={onMobileClose}
              className="rounded-lg p-1 text-[#64748B] hover:bg-[#F8FAFC] hover:text-[#0F172A] md:hidden"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>

        {/* Current Gym Pill (if provided) */}
        {currentGym && !collapsed && (
          <div className="mx-3 mt-3 flex items-center justify-between rounded-xl border border-[#E3E7E4] bg-[#F8FAFC] p-2.5">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#E4F2EB] text-[#0B6B4F]">
                <Building2 className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-[#0F172A] truncate">
                  {currentGym.name}
                </p>
                {currentGym.slug && (
                  <p className="font-mono text-[10px] text-[#64748B] truncate">
                    /{currentGym.slug}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Navigation Groups */}
        <nav
          aria-label="Sidebar Navigation"
          className="flex-1 space-y-5 overflow-y-auto px-3 py-4"
        >
          {groups.map((group, gIdx) => (
            <div key={gIdx} className="space-y-1">
              {group.label && !collapsed && (
                <p className="px-2 pb-1.5 text-[10px] font-semibold uppercase tracking-wider text-[#94A3B8]">
                  {group.label}
                </p>
              )}
              <ul className="space-y-0.5">
                {group.items.map((item) => {
                  const active = isItemActive(item);
                  const Icon = item.icon;

                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        onClick={onMobileClose}
                        title={collapsed ? item.label : undefined}
                        className={`flex items-center gap-3 rounded-lg px-2.5 py-2 text-xs font-medium transition-colors ${
                          active
                            ? "bg-[#E4F2EB] text-[#0B6B4F] font-semibold"
                            : "text-[#5F6B65] hover:bg-[#F8FAFC] hover:text-[#0F172A]"
                        } ${collapsed ? "justify-center px-2" : ""}`}
                      >
                        <Icon
                          className={`h-4 w-4 shrink-0 ${
                            active ? "text-[#0B6B4F]" : "text-[#64748B]"
                          }`}
                        />
                        {!collapsed && (
                          <div className="flex flex-1 items-center justify-between min-w-0">
                            <span className="truncate">{item.label}</span>
                            {item.badge !== undefined && (
                              <span
                                className={`rounded-full px-1.5 py-0.2 text-[10px] font-semibold ${
                                  item.badgeVariant === "danger"
                                    ? "bg-[#FEF2F2] text-[#DC2626]"
                                    : "bg-[#E4F2EB] text-[#0B6B4F]"
                                }`}
                              >
                                {item.badge}
                              </span>
                            )}
                          </div>
                        )}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>
      </div>

      {/* Footer Profile Section */}
      {user && (
        <div className="border-t border-[#E3E7E4] p-3">
          <div
            className={`flex items-center gap-3 rounded-xl p-2 transition-colors hover:bg-[#F8FAFC] ${
              collapsed ? "justify-center" : ""
            }`}
          >
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#E4F2EB] text-xs font-bold text-[#0B6B4F]">
              {user.name ? user.name[0].toUpperCase() : <User className="h-4 w-4" />}
            </div>
            {!collapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-[#0F172A] truncate">
                  {user.name || "User"}
                </p>
                <p className="text-[11px] text-[#64748B] truncate">
                  {user.email || user.role}
                </p>
              </div>
            )}
            {!collapsed && onSignOut && (
              <button
                type="button"
                onClick={onSignOut}
                className="rounded-lg p-1.5 text-[#94A3B8] hover:bg-[#F1F5F9] hover:text-[#DC2626] transition-colors"
                title="Sign out"
              >
                <LogOut className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={`hidden md:flex flex-col border-r border-[#E3E7E4] bg-white transition-all duration-300 z-30 ${
          collapsed ? "w-[72px]" : "w-64"
        } ${className}`}
      >
        {navContent}
      </aside>

      {/* Mobile Drawer */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="fixed inset-0 bg-[#0F172A]/40 backdrop-blur-xs transition-opacity"
            onClick={onMobileClose}
            aria-hidden="true"
          />
          <aside className="fixed inset-y-0 left-0 w-72 max-w-full bg-white shadow-2xl animate-in slide-in-from-left duration-200">
            {navContent}
          </aside>
        </div>
      )}
    </>
  );
}

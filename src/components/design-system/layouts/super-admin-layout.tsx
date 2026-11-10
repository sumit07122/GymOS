"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ShieldAlert,
  Building2,
  CreditCard,
  Layers,
  Activity,
  FileText,
  Sliders,
  LogOut,
  Sparkles,
} from "lucide-react";

export interface SuperAdminLayoutProps {
  user?: {
    name?: string | null;
    email?: string | null;
  };
  children: React.ReactNode;
}

const navItems = [
  { href: "/platform-admin", label: "Overview", icon: Activity, exact: true },
  { href: "/platform-admin/gyms", label: "Gym Tenants", icon: Building2 },
  { href: "/platform-admin/subscriptions", label: "Subscriptions", icon: CreditCard },
  { href: "/platform-admin/plans", label: "SaaS Plans", icon: Layers },
  { href: "/platform-admin/entitlements", label: "Entitlements", icon: Sliders },
  { href: "/platform-admin/addons", label: "Add-ons", icon: Sparkles },
  { href: "/platform-admin/audit-logs", label: "Audit Logs", icon: FileText },
];

export function SuperAdminLayout({ user, children }: SuperAdminLayoutProps) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-screen flex-col bg-[#F5F6F4] font-sans text-[#0F172A] antialiased">
      {/* Super Admin Top Banner */}
      <div className="bg-[#062E23] text-white px-4 py-1.5 text-[11px] font-medium flex items-center justify-between border-b border-[#0B6B4F]/40">
        <div className="flex items-center gap-2">
          <ShieldAlert className="h-3.5 w-3.5 text-[#7FD6B2]" />
          <span>FIXIA Platform Administration Realm — Strict Super Admin Security Enforced</span>
        </div>
        <div className="hidden sm:flex items-center gap-3 text-[#A7F3D0]/80">
          <span>Global Root Context</span>
          <span>•</span>
          <span>Zero-Trust DB Schema</span>
        </div>
      </div>

      {/* Primary Top Header Navigation */}
      <header className="sticky top-0 z-30 border-b border-[#E3E7E4] bg-white/95 px-4 sm:px-8 backdrop-blur">
        <div className="flex h-16 items-center justify-between">
          {/* Brand */}
          <div className="flex items-center gap-4">
            <Link
              href="/platform-admin"
              className="flex items-center gap-2.5 font-heading text-base font-bold text-[#0F172A]"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#0B6B4F] text-white">
                <span className="text-sm font-black">F</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span>FIXIA</span>
                <span className="rounded-md bg-[#ECFDF5] px-1.5 py-0.5 text-[10px] font-semibold text-[#065F46] border border-[#A7F3D0]/60">
                  PLATFORM ADMIN
                </span>
              </div>
            </Link>
          </div>

          {/* Desktop Links */}
          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => {
              const active = item.exact
                ? pathname === item.href
                : pathname === item.href || pathname.startsWith(`${item.href}/`);
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                    active
                      ? "bg-[#E4F2EB] text-[#0B6B4F] font-semibold"
                      : "text-[#5F6B65] hover:bg-[#F8FAFC] hover:text-[#0F172A]"
                  }`}
                >
                  <Icon className={`h-3.5 w-3.5 ${active ? "text-[#0B6B4F]" : "text-[#64748B]"}`} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* User Profile */}
          <div className="flex items-center gap-3">
            {user && (
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#0B6B4F] text-white text-xs font-bold">
                  {user.name ? user.name[0].toUpperCase() : "A"}
                </div>
                <div className="hidden sm:block text-left">
                  <p className="text-xs font-semibold text-[#0F172A] leading-tight">
                    {user.name || "Super Admin"}
                  </p>
                  <p className="text-[10px] text-[#64748B] leading-tight">
                    {user.email || "Platform Architect"}
                  </p>
                </div>
              </div>
            )}
            <form action="/api/auth/signout" method="POST">
              <button
                type="submit"
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#E3E7E4] text-[#64748B] hover:bg-[#FEF2F2] hover:text-[#DC2626] transition-colors"
                title="Sign out"
              >
                <LogOut className="h-3.5 w-3.5" />
              </button>
            </form>
          </div>
        </div>

        {/* Mobile Horizontal Scroll Nav */}
        <div className="flex lg:hidden overflow-x-auto pb-2 gap-1 scrollbar-none border-t border-[#E3E7E4]/50 pt-1">
          {navItems.map((item) => {
            const active = item.exact
              ? pathname === item.href
              : pathname === item.href || pathname.startsWith(`${item.href}/`);
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`inline-flex shrink-0 items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium ${
                  active
                    ? "bg-[#E4F2EB] text-[#0B6B4F] font-semibold"
                    : "text-[#5F6B65] hover:bg-[#F8FAFC]"
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </header>

      {/* Main Page Canvas */}
      <main className="flex-1 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in duration-200">
        {children}
      </main>
    </div>
  );
}

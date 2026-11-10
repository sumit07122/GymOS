"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ShieldCheck,
  Building2,
  PlusCircle,
  CreditCard,
  Package,
  Layers,
  Sliders,
  Receipt,
  Activity,
  History,
  LayoutDashboard,
  ExternalLink,
  Menu,
  X,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface PlatformAdminNavProps {
  user: {
    email?: string | null;
    name?: string | null;
  };
}

export function PlatformAdminNav({ user }: PlatformAdminNavProps) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const navItems = [
    { href: "/platform-admin", label: "Overview", icon: LayoutDashboard, exact: true },
    { href: "/platform-admin/gyms", label: "Gyms", icon: Building2, exact: true },
    { href: "/platform-admin/gyms/new", label: "Onboard Gym", icon: PlusCircle, highlight: true },
    { href: "/platform-admin/subscriptions", label: "Subscriptions", icon: CreditCard },
    { href: "/platform-admin/plans", label: "Plans", icon: Package },
    { href: "/platform-admin/addons", label: "Add-ons", icon: Layers },
    { href: "/platform-admin/entitlements", label: "Entitlements", icon: Sliders },
    { href: "/platform-admin/payments", label: "Payments", icon: Receipt },
    { href: "/platform-admin/usage", label: "Usage", icon: Activity },
    { href: "/platform-admin/audit-logs", label: "Audit Logs", icon: History },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-800 bg-slate-950 text-white shadow-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand / Title */}
        <div className="flex items-center gap-4 lg:gap-6">
          <Link href="/platform-admin" className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-xs">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-sm sm:text-base tracking-tight text-white">
                  FIXIA GymOS
                </span>
                <Badge
                  variant="outline"
                  className="bg-indigo-950 text-indigo-300 border-indigo-700 text-[9px] font-bold px-1.5 py-0"
                >
                  SUPER ADMIN
                </Badge>
              </div>
              <p className="text-[10px] text-slate-400 font-medium">
                Platform Operations &bull; gms.fixia.in
              </p>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden xl:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = item.exact
                ? pathname === item.href
                : pathname.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    item.highlight
                      ? "bg-indigo-600 text-white hover:bg-indigo-500 shadow-sm"
                      : isActive
                      ? "bg-slate-800 text-white"
                      : "text-slate-400 hover:text-white hover:bg-slate-900"
                  }`}
                >
                  <Icon className="h-3.5 w-3.5 shrink-0" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Right Admin Profile & Toggle */}
        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <div className="text-xs font-semibold text-slate-200">
              {user.name || user.email || "Super Administrator"}
            </div>
            <div className="text-[10px] text-emerald-400 font-medium">
              SUPER_ADMIN Session
            </div>
          </div>

          <Link
            href="/login"
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-900 border border-slate-800 transition-colors"
          >
            <span>Exit</span>
            <ExternalLink className="h-3.5 w-3.5" />
          </Link>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="xl:hidden p-2 rounded-lg bg-slate-900 text-slate-300 hover:text-white border border-slate-800"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Dropdown */}
      {mobileMenuOpen && (
        <div className="xl:hidden border-t border-slate-800 bg-slate-950 px-4 py-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = item.exact
              ? pathname === item.href
              : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                  item.highlight
                    ? "bg-indigo-600 text-white font-semibold"
                    : isActive
                    ? "bg-slate-800 text-white font-semibold"
                    : "text-slate-400 hover:text-white hover:bg-slate-900"
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{item.label}</span>
              </Link>
            );
          })}
          <div className="pt-2 border-t border-slate-800">
            <Link
              href="/login"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-between px-3 py-2 rounded-lg text-xs text-rose-400 hover:bg-slate-900"
            >
              <span>Sign out of Admin</span>
              <ExternalLink className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}

"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
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
  ShieldCheck,
  User,
} from "lucide-react";
import { Logo } from "@/components/ui";

interface PlatformAdminNavProps {
  user: {
    email?: string | null;
    name?: string | null;
  };
}

interface AdminNavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  exact?: boolean;
  highlight?: boolean;
}

export function PlatformAdminNav({ user }: PlatformAdminNavProps) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  // Grouped navigation for clarity and scannability
  const primaryNavItems: AdminNavItem[] = [
    { href: "/platform-admin", label: "Overview", icon: LayoutDashboard, exact: true },
    { href: "/platform-admin/gyms", label: "Gyms", icon: Building2, exact: true },
    { href: "/platform-admin/subscriptions", label: "Subscriptions", icon: CreditCard },
    { href: "/platform-admin/plans", label: "Plans", icon: Package },
    { href: "/platform-admin/addons", label: "Add-ons", icon: Layers },
    { href: "/platform-admin/entitlements", label: "Entitlements", icon: Sliders },
    { href: "/platform-admin/payments", label: "Payments", icon: Receipt },
    { href: "/platform-admin/usage", label: "Usage", icon: Activity },
    { href: "/platform-admin/audit-logs", label: "Audit Logs", icon: History },
  ];

  const allNavItems: AdminNavItem[] = [
    { href: "/platform-admin/gyms/new", label: "Onboard Gym", icon: PlusCircle, highlight: true },
    ...primaryNavItems,
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-line bg-white/95 backdrop-blur-md text-ink shadow-xs">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-3 sm:px-6 lg:px-8 gap-2">
        {/* Brand / Logo */}
        <div className="flex items-center gap-3 shrink-0">
          <Link href="/platform-admin" className="flex items-center gap-2">
            <Logo />
            <span className="rounded-md bg-pine-soft px-1.5 py-0.5 text-[10px] sm:text-[11px] font-semibold text-pine flex items-center gap-1 border border-pine/20">
              <ShieldCheck className="h-3 w-3" />
              <span>Admin</span>
            </span>
          </Link>
        </div>

        {/* Desktop / Tablet Horizontal Scrollable Navigation */}
        <nav className="hidden md:flex items-center gap-1 overflow-x-auto no-scrollbar py-1 max-w-[620px] lg:max-w-none">
          {primaryNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = item.exact
              ? pathname === item.href
              : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                  isActive
                    ? "bg-pine-soft text-pine font-semibold border border-pine/20"
                    : "text-muted hover:text-ink hover:bg-black/[0.04]"
                }`}
              >
                <Icon className="h-3.5 w-3.5 shrink-0" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Right CTA & Profile */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Prominent Onboard Gym Button */}
          <Link
            href="/platform-admin/gyms/new"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold shadow-xs transition-colors ${
              pathname === "/platform-admin/gyms/new"
                ? "bg-pine-deep text-white ring-2 ring-pine/30"
                : "bg-pine text-white hover:bg-pine-deep active:scale-[0.98]"
            }`}
          >
            <PlusCircle className="h-3.5 w-3.5 shrink-0" />
            <span className="hidden sm:inline">Onboard Gym</span>
            <span className="sm:hidden">Onboard</span>
          </Link>

          {/* User Badge */}
          <div className="text-right hidden lg:block">
            <div className="text-xs font-semibold text-ink truncate max-w-[150px]">
              {user.name || user.email || "Super Administrator"}
            </div>
            <div className="text-[10px] text-pine font-medium font-mono">
              SUPER_ADMIN
            </div>
          </div>

          {/* Exit Link */}
          <Link
            href="/login"
            className="hidden sm:flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-muted hover:text-rose-600 border border-line hover:bg-canvas transition-colors"
            title="Switch User / Logout"
          >
            <span>Exit</span>
            <ExternalLink className="h-3 w-3" />
          </Link>

          {/* Mobile Hamburger Button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg text-muted hover:text-ink border border-line bg-canvas/50"
            aria-label="Toggle navigation menu"
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X className="h-5 w-5 text-ink" /> : <Menu className="h-5 w-5 text-ink" />}
          </button>
        </div>
      </div>

      {/* Mobile Dropdown Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-line bg-white px-4 py-3 space-y-3 animate-in slide-in-from-top-2 duration-150 shadow-lg">
          {/* User Info Card in Drawer */}
          <div className="flex items-center justify-between pb-2 border-b border-line">
            <div className="flex items-center gap-2">
              <div className="h-7 w-7 rounded-full bg-pine-soft text-pine flex items-center justify-center font-bold text-xs">
                <User className="h-3.5 w-3.5" />
              </div>
              <div>
                <div className="text-xs font-semibold text-ink">
                  {user.name || user.email || "Super Admin"}
                </div>
                <div className="text-[10px] text-pine font-mono">SUPER_ADMIN Session</div>
              </div>
            </div>
            <Link
              href="/login"
              onClick={() => setMobileMenuOpen(false)}
              className="text-xs text-rose-600 font-medium hover:underline flex items-center gap-1"
            >
              <span>Exit</span>
              <ExternalLink className="h-3 w-3" />
            </Link>
          </div>

          {/* Mobile Nav Links */}
          <div className="grid grid-cols-2 gap-1.5">
            {allNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = item.exact
                ? pathname === item.href
                : pathname.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                    item.highlight
                      ? "col-span-2 bg-pine text-white font-semibold justify-center py-2.5 shadow-xs"
                      : isActive
                      ? "bg-pine-soft text-pine font-semibold border border-pine/20"
                      : "text-muted hover:text-ink hover:bg-black/[0.04] bg-canvas/40"
                  }`}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  <span className="truncate">{item.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </header>
  );
}

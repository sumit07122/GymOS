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
} from "lucide-react";
import { Logo } from "@/components/ui";

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
    <header className="sticky top-0 z-50 w-full border-b border-line bg-white/90 backdrop-blur text-ink shadow-xs">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand / Title */}
        <div className="flex items-center gap-4 lg:gap-6">
          <Link href="/platform-admin" className="flex items-center gap-2">
            <Logo />
            <span className="rounded-md bg-pine-soft px-1.5 py-0.5 text-[11px] font-semibold text-pine">
              Admin
            </span>
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
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    item.highlight
                      ? "bg-pine text-white hover:bg-pine-deep font-semibold shadow-xs"
                      : isActive
                      ? "bg-pine-soft text-pine font-semibold"
                      : "text-muted hover:text-ink hover:bg-black/[0.04]"
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
            <div className="text-xs font-semibold text-ink">
              {user.name || user.email || "Super Administrator"}
            </div>
            <div className="text-[10px] text-pine font-medium font-mono">
              SUPER_ADMIN Session
            </div>
          </div>

          <Link
            href="/login"
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-muted hover:text-rose-600 border border-line hover:bg-canvas transition-colors"
          >
            <span>Exit</span>
            <ExternalLink className="h-3.5 w-3.5" />
          </Link>

          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="xl:hidden p-2 rounded-lg text-muted hover:text-ink border border-line"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="xl:hidden border-b border-line bg-white px-4 py-3 space-y-1">
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
                className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                  item.highlight
                    ? "bg-pine text-white"
                    : isActive
                    ? "bg-pine-soft text-pine font-semibold"
                    : "text-muted hover:text-ink hover:bg-black/[0.04]"
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      )}
    </header>
  );
}

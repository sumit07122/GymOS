"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ShieldCheck,
  Building2,
  CreditCard,
  History,
  LayoutDashboard,
  ExternalLink,
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

  const navItems = [
    { href: "/admin", label: "Overview", icon: LayoutDashboard },
    { href: "/admin/gyms", label: "Gyms", icon: Building2 },
    { href: "/admin/plans", label: "SaaS Plans", icon: CreditCard },
    { href: "/admin/audit", label: "Audit Logs", icon: History },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-800 bg-slate-950 text-white shadow-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand / Title */}
        <div className="flex items-center gap-6">
          <Link href="/admin" className="flex items-center gap-2.5">
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
                  className="bg-indigo-950 text-indigo-300 border-indigo-700 text-[10px] font-bold px-1.5 py-0"
                >
                  PLATFORM ADMIN
                </Badge>
              </div>
              <p className="text-[10px] text-slate-400 font-medium">
                SaaS Super Administration
              </p>
            </div>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                item.href === "/admin"
                  ? pathname === "/admin"
                  : pathname.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    isActive
                      ? "bg-slate-800 text-white"
                      : "text-slate-400 hover:text-white hover:bg-slate-900"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Right Admin Profile */}
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
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-900 border border-slate-800 transition-colors"
          >
            <span>Exit Admin</span>
            <ExternalLink className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </header>
  );
}


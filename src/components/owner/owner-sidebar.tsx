"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "cn";
import {
  LayoutDashboard,
  Users,
  QrCode,
  CreditCard,
  Receipt,
  TrendingDown,
  UserPlus,
  Dumbbell,
  Trophy,
  Package,
  MessageSquareText,
  BarChart3,
  Settings,
  ShieldCheck,
  Globe,
  Smartphone,
  ExternalLink,
  Building2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

export interface OwnerSidebarProps {
  currentGym: {
    id: string;
    name: string;
    slug: string;
    currency: string;
    status: string;
  };
  user: {
    id: string;
    name: string | null;
    email: string | null;
  };
  className?: string;
  onItemClick?: () => void;
}

export const OWNER_NAV_ITEMS = [
  {
    title: "Dashboard",
    href: "/owner/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Members & KYC",
    href: "/owner/members",
    icon: Users,
  },
  {
    title: "Attendance & QR",
    href: "/owner/attendance",
    icon: QrCode,
  },
  {
    title: "Memberships",
    href: "/owner/memberships",
    icon: CreditCard,
  },
  {
    title: "Payments & Dues",
    href: "/owner/payments",
    icon: Receipt,
  },
  {
    title: "Operating Expenses",
    href: "/owner/expenses",
    icon: TrendingDown,
  },
  {
    title: "Leads & CRM",
    href: "/owner/leads",
    icon: UserPlus,
  },
  {
    title: "Workouts & Fitness",
    href: "/owner/fitness",
    icon: Dumbbell,
  },
  {
    title: "Challenges & Motivation",
    href: "/owner/motivation",
    icon: Trophy,
  },
  {
    title: "Retail & Inventory",
    href: "/owner/inventory",
    icon: Package,
  },
  {
    title: "WhatsApp Alerts",
    href: "/owner/whatsapp",
    icon: MessageSquareText,
  },
  {
    title: "Reports & Analytics",
    href: "/owner/reports",
    icon: BarChart3,
  },
  {
    title: "Gym Settings",
    href: "/owner/settings",
    icon: Settings,
  },
  {
    title: "SaaS Subscription",
    href: "/owner/subscription",
    icon: ShieldCheck,
  },
];

export function OwnerSidebar({
  currentGym,
  user,
  className,
  onItemClick,
}: OwnerSidebarProps) {
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        "flex h-full w-64 flex-col bg-[#0B132B] text-slate-300 border-r border-slate-800 shadow-xl select-none",
        className
      )}
    >
      {/* Brand Header */}
      <div className="flex h-16 shrink-0 items-center justify-between border-b border-slate-800 px-4">
        <Link
          href="/owner/dashboard"
          className="flex items-center gap-2.5 transition hover:opacity-90"
          onClick={onItemClick}
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-md shadow-indigo-900/50">
            <Building2 className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5 font-bold tracking-tight text-white">
              <span className="text-base tracking-wider font-extrabold">FIXIA</span>
              <span className="text-sm font-semibold text-indigo-400">GymOS</span>
            </div>
            <p className="text-[10px] text-slate-400 font-medium tracking-wide uppercase">
              Owner Workspace
            </p>
          </div>
        </Link>
        <Badge
          variant="outline"
          className="border-indigo-500/30 bg-indigo-500/10 text-indigo-400 text-[10px] px-1.5 py-0 h-4 font-mono font-medium"
        >
          OWNER
        </Badge>
      </div>

      {/* Gym Identifier Badge */}
      <div className="p-3 border-b border-slate-800/80 bg-slate-950/40">
        <div className="text-xs font-bold text-white truncate">{currentGym.name}</div>
        <div className="flex items-center justify-between mt-0.5">
          <span className="text-[10px] font-mono text-slate-400 truncate">
            /g/{currentGym.slug}
          </span>
          <Badge
            variant="outline"
            className="text-[9px] bg-emerald-950 text-emerald-300 border-emerald-800 px-1 py-0"
          >
            {currentGym.status}
          </Badge>
        </div>
      </div>

      {/* Navigation Items List */}
      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-1">
        {OWNER_NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onItemClick}
              className={cn(
                "group flex items-center gap-3 rounded-lg px-3 py-2 text-xs font-medium transition-all",
                isActive
                  ? "bg-indigo-600 text-white shadow-sm font-semibold"
                  : "text-slate-400 hover:bg-slate-800/60 hover:text-white"
              )}
            >
              <Icon
                className={cn(
                  "h-4 w-4 shrink-0 transition-colors",
                  isActive ? "text-white" : "text-slate-400 group-hover:text-indigo-400"
                )}
              />
              <span className="truncate">{item.title}</span>
            </Link>
          );
        })}
      </div>

      {/* Bottom Actions & User Profile */}
      <div className="border-t border-slate-800 p-3 bg-slate-950/60 space-y-2">
        <div className="grid grid-cols-2 gap-1.5">
          <Link
            href={`/g/${currentGym.slug}`}
            target="_blank"
            className="flex items-center justify-center gap-1 rounded-md bg-slate-900 border border-slate-800 px-2 py-1.5 text-[10px] font-medium text-slate-300 hover:text-white hover:bg-slate-850 transition"
          >
            <Globe className="h-3 w-3 text-indigo-400" />
            <span>Public Site</span>
          </Link>
          <Link
            href="/member/home"
            className="flex items-center justify-center gap-1 rounded-md bg-slate-900 border border-slate-800 px-2 py-1.5 text-[10px] font-medium text-slate-300 hover:text-white hover:bg-slate-850 transition"
          >
            <Smartphone className="h-3 w-3 text-emerald-400" />
            <span>Member App</span>
          </Link>
        </div>

        <div className="pt-2 border-t border-slate-850 flex items-center justify-between">
          <div className="truncate pr-2">
            <div className="text-[11px] font-semibold text-slate-200 truncate">
              {user.name || user.email}
            </div>
            <div className="text-[9px] text-slate-500 truncate">{user.email}</div>
          </div>
          <Link
            href="/login"
            className="text-slate-500 hover:text-rose-400 p-1.5 rounded transition"
            title="Log out"
          >
            <ExternalLink className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </aside>
  );
}


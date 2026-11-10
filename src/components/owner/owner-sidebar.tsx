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
} from "lucide-react";
import { Logo } from "@/components/ui";

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
        "flex h-full w-64 flex-col bg-white text-ink border-r border-line select-none",
        className
      )}
    >
      {/* Brand Header */}
      <div className="flex h-16 shrink-0 items-center justify-between border-b border-line px-5">
        <Link
          href="/owner/dashboard"
          className="flex items-center gap-2"
          onClick={onItemClick}
        >
          <Logo />
        </Link>
        <span className="rounded-md bg-pine-soft px-1.5 py-0.5 text-[11px] font-semibold text-pine">
          Owner
        </span>
      </div>

      {/* Gym Identifier Strip */}
      <div className="p-3.5 border-b border-line bg-canvas/60">
        <div className="text-xs font-bold text-ink truncate">{currentGym.name}</div>
        <div className="flex items-center justify-between mt-1 text-[11px]">
          <span className="font-mono text-muted truncate">
            /g/{currentGym.slug}
          </span>
          <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-pine bg-pine-soft px-2 py-0.5 rounded-full">
            <span className="size-1.5 rounded-full bg-pine" />
            {currentGym.status}
          </span>
        </div>
      </div>

      {/* Navigation Items List */}
      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-0.5">
        {OWNER_NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onItemClick}
              className={cn(
                "group flex items-center gap-2.5 rounded-[10px] px-3 py-2 text-xs font-medium transition-colors",
                isActive
                  ? "bg-pine-soft text-pine font-semibold"
                  : "text-muted hover:bg-black/[.04] hover:text-ink"
              )}
            >
              <Icon
                className={cn(
                  "h-4 w-4 shrink-0 transition-colors",
                  isActive ? "text-pine" : "text-muted group-hover:text-ink"
                )}
              />
              <span className="truncate">{item.title}</span>
            </Link>
          );
        })}
      </div>

      {/* Bottom Actions & User Profile */}
      <div className="border-t border-line p-3 bg-canvas/40 space-y-2">
        <div className="grid grid-cols-2 gap-1.5">
          <Link
            href={`/g/${currentGym.slug}`}
            target="_blank"
            className="flex items-center justify-center gap-1 rounded-lg bg-white border border-line px-2 py-1.5 text-[11px] font-medium text-muted hover:text-ink hover:bg-canvas transition"
          >
            <Globe className="h-3 w-3 text-pine" />
            <span>Public Site</span>
          </Link>
          <Link
            href="/member/home"
            className="flex items-center justify-center gap-1 rounded-lg bg-white border border-line px-2 py-1.5 text-[11px] font-medium text-muted hover:text-ink hover:bg-canvas transition"
          >
            <Smartphone className="h-3 w-3 text-pine" />
            <span>Member App</span>
          </Link>
        </div>

        <div className="pt-2 border-t border-line flex items-center justify-between">
          <div className="truncate pr-2">
            <div className="text-[11px] font-semibold text-ink truncate">
              {user.name || user.email}
            </div>
            <div className="text-[10px] text-muted truncate">{user.email}</div>
          </div>
          <Link
            href="/login"
            className="text-muted hover:text-rose-600 p-1.5 rounded transition"
            title="Log out"
          >
            <ExternalLink className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </aside>
  );
}

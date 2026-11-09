"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "cn";
import {
  ChevronsUpDown,
  PlusCircle,
  Dumbbell,
  Clock,
  ShieldCheck,
  Check,
  Building2,
} from "lucide-react";
import { NAVIGATION_ITEMS, NavItem } from "./nav-items";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export interface GymSummary {
  id: string;
  name: string;
  slug: string;
  city?: string | null;
  role: string;
}

interface SidebarProps {
  currentGym: {
    id: string;
    name: string;
    slug: string;
    currency: string;
  };
  userGyms: GymSummary[];
  userRole: string;
  className?: string;
  onItemClick?: () => void;
}

export function Sidebar({
  currentGym,
  userGyms,
  userRole,
  className,
  onItemClick,
}: SidebarProps) {
  const pathname = usePathname();
  const [selectedUpcomingModule, setSelectedUpcomingModule] =
    React.useState<NavItem | null>(null);
  const [isGymSwitcherOpen, setIsGymSwitcherOpen] = React.useState(false);

  return (
    <>
      <aside
        className={cn(
          "flex h-full w-64 flex-col bg-[#0B132B] text-slate-300 border-r border-slate-800 shadow-xl select-none",
          className
        )}
      >
        {/* Brand Header */}
        <div className="flex h-16 shrink-0 items-center justify-between border-b border-slate-800 px-4">
          <Link
            href={`/${currentGym.slug}/dashboard`}
            className="flex items-center gap-2.5 transition hover:opacity-90"
            onClick={onItemClick}
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-600 text-white shadow-md shadow-emerald-900/50">
              <Dumbbell className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5 font-bold tracking-tight text-white">
                <span className="text-base tracking-wider font-extrabold">FIXIA</span>
                <span className="text-sm font-semibold text-emerald-400">GymOS</span>
              </div>
              <p className="text-[10px] text-slate-400 font-medium tracking-wide uppercase">
                Enterprise SaaS
              </p>
            </div>
          </Link>
          <Badge
            variant="outline"
            className="border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-[10px] px-1.5 py-0 h-4 font-mono font-medium"
          >
            V1
          </Badge>
        </div>

        {/* Gym Switcher */}
        <div className="relative p-3 border-b border-slate-800/80">
          <button
            type="button"
            onClick={() => setIsGymSwitcherOpen((prev) => !prev)}
            className="flex w-full items-center justify-between rounded-lg bg-slate-900/80 hover:bg-slate-850 px-3 py-2 text-left transition border border-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-slate-800 text-slate-300">
                <Building2 className="h-4 w-4 text-emerald-400" />
              </div>
              <div className="truncate">
                <div className="truncate text-xs font-semibold text-white">
                  {currentGym.name}
                </div>
                <div className="text-[10px] text-slate-400 font-mono">
                  /{currentGym.slug}
                </div>
              </div>
            </div>
            <ChevronsUpDown className="h-4 w-4 shrink-0 text-slate-400" />
          </button>

          {/* Switcher Dropdown */}
          {isGymSwitcherOpen && (
            <div className="absolute left-3 right-3 top-16 z-50 rounded-lg border border-slate-700 bg-slate-900 p-1.5 shadow-2xl animate-in fade-in-50 zoom-in-95">
              <div className="px-2 py-1 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                My Workspaces
              </div>
              <div className="max-h-48 space-y-0.5 overflow-y-auto py-1">
                {userGyms.map((gym) => {
                  const isCurrent = gym.id === currentGym.id;
                  return (
                    <Link
                      key={gym.id}
                      href={`/${gym.slug}/dashboard`}
                      onClick={() => {
                        setIsGymSwitcherOpen(false);
                        if (onItemClick) onItemClick();
                      }}
                      className={cn(
                        "flex items-center justify-between rounded-md px-2.5 py-1.5 text-xs transition",
                        isCurrent
                          ? "bg-emerald-600/20 text-emerald-300 font-medium"
                          : "text-slate-300 hover:bg-slate-800"
                      )}
                    >
                      <div className="truncate">
                        <div className="truncate font-medium">{gym.name}</div>
                        <div className="text-[10px] text-slate-400 capitalize">
                          {gym.role.toLowerCase()}
                        </div>
                      </div>
                      {isCurrent && (
                        <Check className="h-3.5 w-3.5 text-emerald-400 shrink-0 ml-2" />
                      )}
                    </Link>
                  );
                })}
              </div>

              <div className="my-1 border-t border-slate-800" />

              <Link
                href="/onboarding"
                onClick={() => {
                  setIsGymSwitcherOpen(false);
                  if (onItemClick) onItemClick();
                }}
                className="flex items-center gap-2 rounded-md px-2.5 py-2 text-xs font-medium text-emerald-400 hover:bg-slate-800 transition"
              >
                <PlusCircle className="h-4 w-4" />
                <span>Register New Gym</span>
              </Link>
            </div>
          )}
        </div>

        {/* Navigation List */}
        <div className="flex-1 overflow-y-auto px-3 py-3 space-y-1">
          <div className="px-2 pb-1 text-[10px] font-semibold tracking-wider text-slate-400 uppercase">
            Operations
          </div>

          {NAVIGATION_ITEMS.map((item) => {
            const itemUrl = `/${currentGym.slug}${item.href}`;
            const isActive =
              item.isAvailable &&
              (pathname === itemUrl || pathname.startsWith(`${itemUrl}/`));

            if (item.isAvailable) {
              return (
                <Link
                  key={item.title}
                  href={itemUrl}
                  onClick={onItemClick}
                  className={cn(
                    "flex items-center justify-between rounded-lg px-3 py-2 text-xs font-medium transition group",
                    isActive
                      ? "bg-emerald-600 text-white shadow-sm font-semibold"
                      : "text-slate-300 hover:bg-slate-900/90 hover:text-white"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <item.icon
                      className={cn(
                        "h-4 w-4 shrink-0 transition",
                        isActive
                          ? "text-white"
                          : "text-slate-400 group-hover:text-emerald-400"
                      )}
                    />
                    <span>{item.title}</span>
                  </div>
                </Link>
              );
            }

            // Upcoming / Roadmap Modules
            return (
              <button
                key={item.title}
                type="button"
                onClick={() => setSelectedUpcomingModule(item)}
                className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-xs font-medium text-slate-400 hover:bg-slate-900/60 hover:text-slate-200 transition group"
              >
                <div className="flex items-center gap-3">
                  <item.icon className="h-4 w-4 shrink-0 text-slate-400 group-hover:text-slate-300" />
                  <span className="text-slate-400 group-hover:text-slate-300">
                    {item.title}
                  </span>
                </div>
                {item.milestone && (
                  <Badge
                    variant="outline"
                    className="border-slate-800 bg-slate-900/60 text-slate-400 text-[10px] px-1.5 py-0 h-4 font-mono font-normal"
                  >
                    {item.milestone}
                  </Badge>
                )}
              </button>
            );
          })}
        </div>

        {/* Sidebar Footer */}
        <div className="border-t border-slate-800/80 p-3 bg-slate-950/60">
          <div className="flex items-center justify-between rounded-md bg-slate-900/60 p-2">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-emerald-400" />
              <div>
                <div className="text-[11px] font-semibold text-slate-200">
                  {userRole}
                </div>
                <div className="text-[10px] text-slate-400">Strict Tenant Isolation</div>
              </div>
            </div>
            <span className="text-[10px] font-mono text-slate-400">v1.0-M05</span>
          </div>
        </div>
      </aside>

      {/* Roadmap / Unavailable Module Informational Dialog */}
      <Dialog
        open={!!selectedUpcomingModule}
        onOpenChange={(open) => {
          if (!open) setSelectedUpcomingModule(null);
        }}
      >
        <DialogContent className="max-w-md bg-white border border-slate-200 shadow-2xl p-6">
          <DialogHeader className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
                <Clock className="h-4 w-4" />
              </div>
              <div>
                <DialogTitle className="text-base font-bold text-slate-900">
                  {selectedUpcomingModule?.title} Module
                </DialogTitle>
                <div className="text-xs text-slate-500">
                  Scheduled for Milestone {selectedUpcomingModule?.milestone}
                </div>
              </div>
            </div>
          </DialogHeader>

          <div className="py-3 text-xs text-slate-600 space-y-3 leading-relaxed">
            <p>{selectedUpcomingModule?.description}</p>
            <div className="rounded-lg bg-slate-50 border border-slate-200 p-3 text-slate-700">
              <span className="font-semibold text-slate-900">
                FIXIA GymOS Engineering Protocol:
              </span>{" "}
              In accordance with our frozen V1 incremental roadmap, this feature is
              scheduled for implementation in Milestone{" "}
              <span className="font-semibold text-emerald-700 font-mono">
                {selectedUpcomingModule?.milestone}
              </span>
              . No placeholder or mock data is permitted in production builds.
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setSelectedUpcomingModule(null)}
              className="w-full text-xs"
            >
              Understood
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}


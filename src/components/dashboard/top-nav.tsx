"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bell,
  ChevronRight,
  LogOut,
  User as UserIcon,
  Menu,
  Shield,
  CheckCircle2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { logoutAction } from "@/lib/auth/actions";

interface TopNavProps {
  gym: {
    id: string;
    name: string;
    slug: string;
  };
  user: {
    id: string;
    name: string | null;
    email: string | null;
    role: string;
  };
  onOpenMobileMenu?: () => void;
}

export function TopNav({ gym, user, onOpenMobileMenu }: TopNavProps) {
  const pathname = usePathname();
  const [isProfileOpen, setIsProfileOpen] = React.useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = React.useState(false);

  // Derive readable breadcrumb path
  const pathSegments = pathname.split("/").filter(Boolean);
  const currentSection = pathSegments[1]
    ? pathSegments[1].charAt(0).toUpperCase() + pathSegments[1].slice(1)
    : "Dashboard";

  return (
    <>
      <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center justify-between border-b border-slate-200 bg-white/90 px-4 md:px-6 backdrop-blur-md">
        {/* Left: Mobile hamburger & Breadcrumbs */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onOpenMobileMenu}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 md:hidden"
            aria-label="Open navigation menu"
          >
            <Menu className="h-5 w-5" />
          </button>

          <nav
            aria-label="Breadcrumb"
            className="flex items-center gap-1.5 text-xs text-slate-500 font-medium"
          >
            <Link
              href={`/${gym.slug}/dashboard`}
              className="hover:text-slate-900 transition flex items-center gap-1"
            >
              <span>{gym.name}</span>
            </Link>
            <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
            <span className="font-semibold text-slate-900">{currentSection}</span>
          </nav>
        </div>

        {/* Right: Tenant badge, Notifications, and Profile */}
        <div className="flex items-center gap-2.5">
          {/* Tenant Status Pill */}
          <div className="hidden sm:flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50/80 px-2.5 py-1 text-xs font-medium text-emerald-800">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Active Tenant</span>
          </div>

          {/* Notification Bell */}
          <button
            type="button"
            onClick={() => setIsNotificationsOpen(true)}
            className="relative flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition"
            aria-label="Notifications"
          >
            <Bell className="h-4 w-4" />
            <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-emerald-500" />
          </button>

          {/* Profile Dropdown Trigger */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsProfileOpen((prev) => !prev)}
              className="flex items-center gap-2 rounded-lg border border-slate-200 p-1.5 pr-2.5 hover:bg-slate-50 transition"
            >
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-900 font-bold text-xs text-white">
                {user.name ? user.name.charAt(0).toUpperCase() : "U"}
              </div>
              <div className="hidden text-left md:block">
                <div className="text-xs font-semibold text-slate-800 line-clamp-1 max-w-[120px]">
                  {user.name || "Gym User"}
                </div>
                <div className="text-[10px] text-slate-500 capitalize">
                  {user.role.toLowerCase().replace("_", " ")}
                </div>
              </div>
            </button>

            {/* Profile Dropdown Menu */}
            {isProfileOpen && (
              <div className="absolute right-0 top-12 z-50 w-56 rounded-xl border border-slate-200 bg-white p-2 shadow-xl animate-in fade-in-50 zoom-in-95">
                <div className="border-b border-slate-100 px-3 py-2">
                  <p className="text-xs font-semibold text-slate-900">
                    {user.name || "Authenticated User"}
                  </p>
                  <p className="text-[11px] text-slate-500 truncate">
                    {user.email}
                  </p>
                  <div className="mt-1.5">
                    <Badge
                      variant="outline"
                      className="border-slate-300 bg-slate-50 text-[10px] text-slate-700"
                    >
                      <Shield className="h-3 w-3 mr-1 text-emerald-600" />
                      {user.role}
                    </Badge>
                  </div>
                </div>

                <div className="py-1">
                  <Link
                    href={`/${gym.slug}/settings`}
                    onClick={() => setIsProfileOpen(false)}
                    className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
                  >
                    <UserIcon className="h-4 w-4 text-slate-400" />
                    <span>Gym Settings</span>
                  </Link>
                </div>

                <div className="border-t border-slate-100 pt-1">
                  <form action={logoutAction}>
                    <button
                      type="submit"
                      className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 transition"
                    >
                      <LogOut className="h-4 w-4" />
                      <span>Log Out</span>
                    </button>
                  </form>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Notifications Dialog */}
      <Dialog
        open={isNotificationsOpen}
        onOpenChange={setIsNotificationsOpen}
      >
        <DialogContent className="max-w-md bg-white border border-slate-200 shadow-2xl p-6">
          <DialogHeader className="space-y-1">
            <DialogTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Bell className="h-4 w-4 text-emerald-600" />
              Notifications
            </DialogTitle>
          </DialogHeader>

          <div className="py-3 space-y-3">
            <div className="flex items-start gap-3 rounded-lg border border-emerald-100 bg-emerald-50/50 p-3">
              <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
              <div className="text-xs">
                <div className="font-semibold text-emerald-950">
                  Tenant Isolation Verified
                </div>
                <div className="text-emerald-800/80 mt-0.5">
                  Workspace &ldquo;{gym.name}&rdquo; is operating under strict server-side
                  tenant security.
                </div>
                <div className="text-[10px] text-emerald-600 font-mono mt-1">
                  Database Session Active
                </div>
              </div>
            </div>

            <div className="rounded-lg border border-slate-100 bg-slate-50 p-3 text-xs text-slate-600 text-center">
              No unread operational alerts for this gym.
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsNotificationsOpen(false)}
              className="w-full text-xs"
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}


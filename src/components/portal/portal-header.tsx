/* eslint-disable @next/next/no-img-element */
"use client";

import * as React from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dumbbell,
  LogOut,
  LayoutDashboard,
  ShieldCheck,
  AlertCircle,
  Clock,
} from "lucide-react";
import { logoutAction } from "@/lib/auth/actions";

interface PortalHeaderProps {
  gym: {
    name: string;
    slug: string;
    logoUrl?: string | null;
    city?: string | null;
  };
  member: {
    fullName: string;
    memberCode: string;
    status: string;
  } | null;
  isStaffOrAdmin?: boolean;
}

export function PortalHeader({
  gym,
  member,
  isStaffOrAdmin = false,
}: PortalHeaderProps) {
  const [isLoggingOut, setIsLoggingOut] = React.useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    await logoutAction();
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return (
          <Badge className="bg-emerald-500/15 text-emerald-700 hover:bg-emerald-500/20 border-emerald-500/30 gap-1 text-xs">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Active Member
          </Badge>
        );
      case "EXPIRING_SOON":
        return (
          <Badge className="bg-amber-500/15 text-amber-700 border-amber-500/30 gap-1 text-xs">
            <Clock className="h-3 w-3" />
            Expiring Soon
          </Badge>
        );
      case "EXPIRED":
        return (
          <Badge className="bg-rose-500/15 text-rose-700 border-rose-500/30 gap-1 text-xs">
            <AlertCircle className="h-3 w-3" />
            Expired
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="text-xs">
            {status}
          </Badge>
        );
    }
  };

  return (
    <header className="sticky top-0 z-30 w-full border-b border-slate-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80">
      <div className="mx-auto flex h-16 max-w-4xl items-center justify-between px-4 sm:px-6">
        {/* Gym Brand / Logo */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-slate-900 to-indigo-600 text-white shadow-sm shadow-slate-900/10">
            {gym.logoUrl ? (
              <img
                src={gym.logoUrl}
                alt={gym.name}
                className="h-8 w-8 rounded-lg object-contain"
              />
            ) : (
              <Dumbbell className="h-5 w-5" />
            )}
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-slate-900 text-sm sm:text-base leading-tight">
              {gym.name}
            </span>
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <ShieldCheck className="h-3 w-3 text-indigo-500" />
              <span>Member Portal</span>
              {gym.city && <span>• {gym.city}</span>}
            </div>
          </div>
        </div>

        {/* Member Status & Action Buttons */}
        <div className="flex items-center gap-2">
          {member && (
            <div className="hidden sm:flex items-center gap-2">
              <span className="text-xs font-mono font-medium text-slate-500 bg-slate-100 px-2 py-1 rounded">
                {member.memberCode}
              </span>
              {getStatusBadge(member.status)}
            </div>
          )}

          {isStaffOrAdmin && (
            <Link href={`/${gym.slug}/dashboard`}>
              <Button
                variant="outline"
                size="sm"
                className="text-xs gap-1.5 h-8 border-indigo-200 text-indigo-700 hover:bg-indigo-50"
              >
                <LayoutDashboard className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Admin</span> Dashboard
              </Button>
            </Link>
          )}

          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="text-slate-500 hover:text-slate-900 h-8 px-2"
            title="Log out"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </header>
  );
}

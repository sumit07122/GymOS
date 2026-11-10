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
  Sparkles,
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
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#E4F2EB] px-2.5 py-0.5 text-[11px] font-semibold text-[#0B6B4F] border border-[#A7F3D0]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#0B6B4F] animate-pulse" />
            Active Member
          </span>
        );
      case "EXPIRING_SOON":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-0.5 text-[11px] font-semibold text-amber-700 border border-amber-200">
            <Clock className="h-3 w-3" />
            Expiring Soon
          </span>
        );
      case "EXPIRED":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-50 px-2.5 py-0.5 text-[11px] font-semibold text-rose-700 border border-rose-200">
            <AlertCircle className="h-3 w-3" />
            Expired
          </span>
        );
      default:
        return (
          <Badge variant="outline" className="text-[11px] font-medium border-[#E2E8F0] text-[#64748B]">
            {status}
          </Badge>
        );
    }
  };

  return (
    <header className="sticky top-0 z-30 w-full border-b border-[#E2E8F0] bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80">
      <div className="mx-auto flex h-14 max-w-4xl items-center justify-between px-4 sm:px-6">
        {/* Gym Brand / Logo */}
        <Link href="/member/home" className="flex items-center gap-2.5 hover:opacity-90 transition-opacity">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#0B6B4F] text-white shadow-xs">
            {gym.logoUrl ? (
              <img
                src={gym.logoUrl}
                alt={gym.name}
                className="h-7 w-7 rounded-lg object-contain"
              />
            ) : (
              <Dumbbell className="h-4 w-4" />
            )}
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-[#0F172A] text-sm leading-tight tracking-tight">
                {gym.name}
              </span>
              <span className="hidden sm:inline-flex items-center gap-1 rounded bg-[#E4F2EB] px-1.5 py-0.2 text-[10px] font-semibold text-[#0B6B4F]">
                <Sparkles className="h-2.5 w-2.5" /> GymOS
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-[#64748B]">
              <ShieldCheck className="h-3 w-3 text-[#0B6B4F]" />
              <span>Member Companion</span>
              {gym.city && <span>• {gym.city}</span>}
            </div>
          </div>
        </Link>

        {/* Member Status & Action Buttons */}
        <div className="flex items-center gap-2">
          {member && (
            <div className="hidden sm:flex items-center gap-2">
              <span className="text-xs font-mono font-medium text-[#475569] bg-[#F1F5F9] px-2 py-0.5 rounded-md border border-[#E2E8F0]">
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
                className="text-xs gap-1.5 h-8 border-[#A7F3D0] text-[#0B6B4F] hover:bg-[#E4F2EB]"
              >
                <LayoutDashboard className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Owner</span> Console
              </Button>
            </Link>
          )}

          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="text-[#64748B] hover:text-[#0F172A] hover:bg-[#F1F5F9] h-8 px-2"
            title="Log out"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </header>
  );
}

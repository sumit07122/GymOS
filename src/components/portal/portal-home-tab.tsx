"use client";

import * as React from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import {
  QrCode,
  Calendar,
  Dumbbell,
  Receipt,
  ArrowRight,
  Clock,
  AlertCircle,
  Activity,
  Flame,
  Trophy,
  TrendingUp,
  Sparkles,
} from "lucide-react";
import { PortalTab } from "./portal-bottom-nav";

interface PortalHomeTabProps {
  gym: {
    name: string;
    currency: string;
  };
  member: {
    firstName: string;
    fullName: string;
    memberCode: string;
    status: string;
  };
  membership: {
    planName: string;
    endDate: string;
    daysRemaining: number | null;
    expiryStatus: "ACTIVE" | "EXPIRING_SOON" | "EXPIRED" | "NONE";
  } | null;
  attendance: {
    totalCheckIns: number;
    monthCheckIns: number;
    lastCheckIn: string | null;
  };
  billing: {
    outstandingBalance: number;
  };
  workoutPlanName: string | null;
  nextClassBooking: {
    className: string;
    startTime: string;
  } | null;
  recentActivity: Array<{
    id: string;
    type: "attendance" | "payment" | "booking";
    title: string;
    subtitle: string;
    time: string;
  }>;
  onNavigate: (tab: PortalTab) => void;
}

export function PortalHomeTab({
  gym,
  member,
  membership,
  attendance,
  billing,
  workoutPlanName,
  nextClassBooking,
  recentActivity,
  onNavigate,
}: PortalHomeTabProps) {
  // Time-of-day greeting
  const hour = new Date().getHours();
  const greeting =
    hour < 12
      ? "Good morning"
      : hour < 17
      ? "Good afternoon"
      : "Good evening";

  return (
    <div className="space-y-4 pb-6">
      {/* 1. Personalized Greeting Banner */}
      <div className="relative overflow-hidden rounded-[16px] bg-gradient-to-br from-[#0B1528] via-[#0F1E36] to-[#0A261E] p-5 sm:p-6 text-white shadow-md border border-slate-800">
        <div className="absolute -right-12 -top-12 h-48 w-48 rounded-full bg-[#0B6B4F]/25 blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-5">
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#A7F3D0] bg-white/5 border border-white/10 px-2.5 py-1 rounded-full mb-2">
              <Sparkles className="h-3 w-3 text-emerald-400" />
              <span>{greeting}, {member.firstName}!</span>
            </div>
            <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-white">
              Welcome to {gym.name}
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1.5 leading-relaxed font-normal">
              Your personal fitness companion. Scan your dynamic pass at the turnstile or front desk to check in.
            </p>
          </div>

          {/* Framed Digital Pass Box */}
          <div className="shrink-0">
            <Link
              href="/member/membership"
              onClick={() => onNavigate("membership")}
              className="group flex items-center gap-3.5 rounded-[12px] bg-white/10 hover:bg-white/15 border border-white/15 p-2.5 sm:p-3 backdrop-blur-md shadow-sm transition-all"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-[10px] bg-white text-[#111613] shadow-xs p-1.5 group-hover:scale-105 transition-transform">
                <QrCode className="h-8 w-8 text-[#0B6B4F]" />
              </div>
              <div className="pr-2">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-semibold text-white">Digital Check-in Pass</span>
                  <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
                </div>
                <span className="text-[11px] text-slate-300 block font-mono">
                  ID: {member.memberCode}
                </span>
              </div>
            </Link>
          </div>
        </div>
      </div>

      {/* 2. Membership Expiry Alert Banner */}
      {membership && membership.expiryStatus === "EXPIRING_SOON" && (
        <div className="flex items-center justify-between rounded-[16px] bg-amber-50 border border-amber-200 p-3.5 text-xs text-amber-900">
          <div className="flex items-center gap-2.5">
            <Clock className="h-5 w-5 text-amber-600 shrink-0" />
            <div>
              <span className="font-semibold">
                Membership Renewal Reminder:
              </span>{" "}
              Your plan expires in {membership.daysRemaining} days (
              {new Date(membership.endDate).toLocaleDateString()}).
            </div>
          </div>
          <Link
            href="/member/membership"
            onClick={() => onNavigate("membership")}
            className="rounded-[10px] border border-amber-300 text-amber-900 hover:bg-amber-100 text-[11px] font-semibold px-2.5 py-1"
          >
            Review Plan
          </Link>
        </div>
      )}

      {membership && membership.expiryStatus === "EXPIRED" && (
        <div className="flex items-center justify-between rounded-[16px] bg-rose-50 border border-rose-200 p-3.5 text-xs text-rose-900">
          <div className="flex items-center gap-2.5">
            <AlertCircle className="h-5 w-5 text-rose-600 shrink-0" />
            <div>
              <span className="font-semibold">Membership Expired:</span> Your
              plan expired on {new Date(membership.endDate).toLocaleDateString()}.
              Please speak with front desk to renew your pass.
            </div>
          </div>
          <Link
            href="/member/membership"
            onClick={() => onNavigate("membership")}
            className="rounded-[10px] bg-rose-600 hover:bg-rose-700 text-white text-[11px] font-semibold px-2.5 py-1"
          >
            View Details
          </Link>
        </div>
      )}

      {billing.outstandingBalance > 0 && (
        <div className="flex items-center justify-between rounded-[16px] bg-amber-50/70 border border-amber-200 p-3 text-xs text-amber-900">
          <div className="flex items-center gap-2">
            <Receipt className="h-4 w-4 text-amber-600 shrink-0" />
            <span>
              You have an outstanding dues balance of{" "}
              <strong>
                {gym.currency} {billing.outstandingBalance.toFixed(2)}
              </strong>
              .
            </span>
          </div>
          <Link
            href="/member/payments"
            onClick={() => onNavigate("billing")}
            className="text-[11px] font-bold text-[#0B6B4F] hover:underline"
          >
            View Invoices →
          </Link>
        </div>
      )}

      {/* 3. Quick Stats Overview Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="rounded-[16px] border border-line bg-white p-3.5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[#5F6B65]">
              This month
            </span>
            <Flame className="h-4 w-4 text-amber-500" />
          </div>
          <div className="mt-2 font-display text-2xl font-bold text-[#111613] tabular-nums">
            {attendance.monthCheckIns}
          </div>
          <span className="text-[11px] text-[#5F6B65]">Workouts logged</span>
        </div>

        <div className="rounded-[16px] border border-line bg-white p-3.5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[#5F6B65]">
              Lifetime
            </span>
            <Activity className="h-4 w-4 text-[#0B6B4F]" />
          </div>
          <div className="mt-2 font-display text-2xl font-bold text-[#111613] tabular-nums">
            {attendance.totalCheckIns}
          </div>
          <span className="text-[11px] text-[#5F6B65]">Total visits</span>
        </div>

        <div className="rounded-[16px] border border-line bg-white p-3.5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[#5F6B65]">
              Current plan
            </span>
            <Badge
              variant="outline"
              className={`text-[10px] py-0 px-1.5 font-normal ${
                membership?.expiryStatus === "ACTIVE"
                  ? "bg-[#E4F2EB] text-[#0B6B4F] border-[#A7F3D0]"
                  : "border-line text-[#5F6B65]"
              }`}
            >
              {membership?.expiryStatus === "ACTIVE" ? "Active" : "Plan"}
            </Badge>
          </div>
          <div className="mt-2 text-sm font-bold text-[#111613] truncate" title={membership?.planName || "None"}>
            {membership?.planName || "No Plan"}
          </div>
          <span className="text-[11px] text-[#5F6B65]">
            {membership?.daysRemaining !== null && membership?.daysRemaining !== undefined
              ? `${membership.daysRemaining} days left`
              : "Inactive"}
          </span>
        </div>

        <div className="rounded-[16px] border border-line bg-white p-3.5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[#5F6B65]">
              Next class
            </span>
            <Calendar className="h-4 w-4 text-[#0B6B4F]" />
          </div>
          <div className="mt-2 text-sm font-bold text-[#111613] truncate">
            {nextClassBooking ? nextClassBooking.className : "No Booking"}
          </div>
          <span className="text-[11px] text-[#5F6B65] truncate block">
            {nextClassBooking
              ? new Date(nextClassBooking.startTime).toLocaleDateString(undefined, {
                  weekday: "short",
                  hour: "2-digit",
                  minute: "2-digit",
                })
              : "Check schedule"}
          </span>
        </div>
      </div>

      {/* 4. Quick Action Shortcuts Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
        {/* Workouts Shortcut */}
        <Link
          href="/member/workouts"
          onClick={() => onNavigate("workouts")}
          className="group rounded-[16px] border border-line bg-white p-3.5 shadow-xs hover:border-[#0B6B4F] hover:shadow-xs transition-all flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-[#E4F2EB] text-[#0B6B4F] group-hover:bg-[#0B6B4F] group-hover:text-white transition-colors">
              <Dumbbell className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-[#111613]">
                Workouts
              </h3>
              <p className="text-[11px] text-[#5F6B65] truncate max-w-[130px]">
                {workoutPlanName || "Daily routines"}
              </p>
            </div>
          </div>
          <ArrowRight className="h-4 w-4 text-[#5F6B65] group-hover:text-[#0B6B4F] group-hover:translate-x-0.5 transition-all" />
        </Link>

        {/* Progress Shortcut */}
        <Link
          href="/member/progress"
          onClick={() => onNavigate("progress")}
          className="group rounded-[16px] border border-line bg-white p-3.5 shadow-xs hover:border-[#0B6B4F] hover:shadow-xs transition-all flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-[#E4F2EB] text-[#0B6B4F] group-hover:bg-[#0B6B4F] group-hover:text-white transition-colors">
              <TrendingUp className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-[#111613]">
                Progress
              </h3>
              <p className="text-[11px] text-[#5F6B65]">
                Attendance & weight
              </p>
            </div>
          </div>
          <ArrowRight className="h-4 w-4 text-[#5F6B65] group-hover:text-[#0B6B4F] group-hover:translate-x-0.5 transition-all" />
        </Link>

        {/* Challenges Shortcut */}
        <Link
          href="/member/challenges"
          onClick={() => onNavigate("challenges")}
          className="group rounded-[16px] border border-line bg-white p-3.5 shadow-xs hover:border-[#0B6B4F] hover:shadow-xs transition-all flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-amber-50 text-amber-600 group-hover:bg-amber-600 group-hover:text-white transition-colors">
              <Trophy className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-[#111613]">
                Challenges
              </h3>
              <p className="text-[11px] text-[#5F6B65]">
                Leaderboards & badges
              </p>
            </div>
          </div>
          <ArrowRight className="h-4 w-4 text-[#5F6B65] group-hover:text-amber-600 group-hover:translate-x-0.5 transition-all" />
        </Link>

        {/* Billing Shortcut */}
        <Link
          href="/member/payments"
          onClick={() => onNavigate("billing")}
          className="group rounded-[16px] border border-line bg-white p-3.5 shadow-xs hover:border-[#0B6B4F] hover:shadow-xs transition-all flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-[#F1F5F9] text-[#475569] group-hover:bg-[#0B6B4F] group-hover:text-white transition-colors">
              <Receipt className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-[#111613]">
                Payments
              </h3>
              <p className="text-[11px] text-[#5F6B65]">
                Invoices & history
              </p>
            </div>
          </div>
          <ArrowRight className="h-4 w-4 text-[#5F6B65] group-hover:text-[#0B6B4F] group-hover:translate-x-0.5 transition-all" />
        </Link>
      </div>

      {/* 5. Recent Activity Timeline */}
      <div className="rounded-[16px] border border-line bg-white p-4 shadow-xs">
        <div className="flex items-center justify-between border-b border-line pb-3">
          <h2 className="text-sm font-bold text-[#111613] flex items-center gap-2">
            <Activity className="h-4 w-4 text-[#0B6B4F]" />
            <span>Recent activity</span>
          </h2>
          <span className="text-[11px] text-[#5F6B65]">Verified log</span>
        </div>

        {recentActivity.length > 0 ? (
          <div className="mt-3 divide-y divide-[#F1F5F9]">
            {recentActivity.map((act) => (
              <div key={act.id} className="flex items-center justify-between py-2.5">
                <div className="flex items-center gap-3">
                  <div
                    className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                      act.type === "attendance"
                        ? "bg-[#E4F2EB] text-[#0B6B4F]"
                        : act.type === "payment"
                        ? "bg-blue-50 text-blue-600"
                        : "bg-amber-50 text-amber-600"
                    }`}
                  >
                    {act.type === "attendance" && <QrCode className="h-4 w-4" />}
                    {act.type === "payment" && <Receipt className="h-4 w-4" />}
                    {act.type === "booking" && <Calendar className="h-4 w-4" />}
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-[#0F172A] leading-tight">
                      {act.title}
                    </h4>
                    <span className="text-[11px] text-[#64748B]">
                      {act.subtitle}
                    </span>
                  </div>
                </div>
                <span className="text-[10px] text-[#94A3B8] font-mono">
                  {act.time}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-6 text-center text-xs text-[#64748B]">
            No activity records yet. Scan your pass at the gym entrance to get started!
          </div>
        )}
      </div>
    </div>
  );
}

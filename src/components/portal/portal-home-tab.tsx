"use client";

import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
    <div className="space-y-5 pb-6">
      {/* 1. Personalized Greeting Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 p-5 text-white shadow-md">
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-indigo-300">
              {greeting}, {member.firstName}! 👋
            </span>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white mt-0.5">
              Welcome to {gym.name}
            </h1>
            <p className="text-xs text-indigo-200 mt-1">
              Ready to crush your goals today? Scan your digital pass at the entrance.
            </p>
          </div>

          <Button
            onClick={() => onNavigate("card")}
            className="self-start sm:self-auto bg-white text-indigo-900 hover:bg-indigo-50 font-semibold text-xs shadow-md gap-2"
          >
            <QrCode className="h-4 w-4" />
            <span>Show Digital Pass</span>
          </Button>
        </div>
      </div>

      {/* 2. Membership Expiry Alert Banner */}
      {membership && membership.expiryStatus === "EXPIRING_SOON" && (
        <div className="flex items-center justify-between rounded-xl bg-amber-50 border border-amber-200 p-3.5 text-xs text-amber-900">
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
          <Button
            size="sm"
            variant="outline"
            onClick={() => onNavigate("billing")}
            className="border-amber-300 text-amber-900 hover:bg-amber-100 text-[11px] h-7"
          >
            Review Plan
          </Button>
        </div>
      )}

      {membership && membership.expiryStatus === "EXPIRED" && (
        <div className="flex items-center justify-between rounded-xl bg-rose-50 border border-rose-200 p-3.5 text-xs text-rose-900">
          <div className="flex items-center gap-2.5">
            <AlertCircle className="h-5 w-5 text-rose-600 shrink-0" />
            <div>
              <span className="font-semibold">Membership Expired:</span> Your
              plan expired on {new Date(membership.endDate).toLocaleDateString()}.
              Please speak with front desk to renew your pass.
            </div>
          </div>
          <Button
            size="sm"
            variant="destructive"
            onClick={() => onNavigate("billing")}
            className="text-[11px] h-7"
          >
            View Details
          </Button>
        </div>
      )}

      {billing.outstandingBalance > 0 && (
        <div className="flex items-center justify-between rounded-xl bg-amber-50/60 border border-amber-200/80 p-3 text-xs text-amber-900">
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
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onNavigate("billing")}
            className="text-[11px] h-7 text-indigo-600 hover:text-indigo-800"
          >
            View Invoices
          </Button>
        </div>
      )}

      {/* 3. Quick Stats Overview Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">
              This Month
            </span>
            <Flame className="h-4 w-4 text-orange-500" />
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-900">
            {attendance.monthCheckIns}
          </div>
          <span className="text-[10px] text-slate-500">Gym visits logged</span>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">
              All-Time
            </span>
            <Activity className="h-4 w-4 text-emerald-500" />
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-900">
            {attendance.totalCheckIns}
          </div>
          <span className="text-[10px] text-slate-500">Total lifetime visits</span>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">
              Current Plan
            </span>
            <Badge variant="outline" className="text-[10px] py-0 px-1.5 font-normal">
              {membership?.expiryStatus === "ACTIVE" ? "Active" : "Plan"}
            </Badge>
          </div>
          <div className="mt-2 text-sm font-bold text-slate-900 truncate" title={membership?.planName || "None"}>
            {membership?.planName || "No Plan"}
          </div>
          <span className="text-[10px] text-slate-500">
            {membership?.daysRemaining !== null && membership?.daysRemaining !== undefined
              ? `${membership.daysRemaining} days left`
              : "Inactive"}
          </span>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">
              Next Class
            </span>
            <Calendar className="h-4 w-4 text-indigo-500" />
          </div>
          <div className="mt-2 text-sm font-bold text-slate-900 truncate">
            {nextClassBooking ? nextClassBooking.className : "No Booking"}
          </div>
          <span className="text-[10px] text-slate-500 truncate">
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
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Classes Shortcut */}
        <div
          onClick={() => onNavigate("classes")}
          className="group cursor-pointer rounded-2xl border border-slate-200 bg-white p-4 shadow-sm hover:border-indigo-300 hover:shadow-md transition-all flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
              <Calendar className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Class Schedules
              </h3>
              <p className="text-xs text-slate-500">
                Book upcoming sessions
              </p>
            </div>
          </div>
          <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-0.5 transition-all" />
        </div>

        {/* Workouts Shortcut */}
        <div
          onClick={() => onNavigate("workouts")}
          className="group cursor-pointer rounded-2xl border border-slate-200 bg-white p-4 shadow-sm hover:border-indigo-300 hover:shadow-md transition-all flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
              <Dumbbell className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Workout Plan
              </h3>
              <p className="text-xs text-slate-500">
                {workoutPlanName || "View routine & exercises"}
              </p>
            </div>
          </div>
          <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-emerald-600 group-hover:translate-x-0.5 transition-all" />
        </div>

        {/* Billing Shortcut */}
        <div
          onClick={() => onNavigate("billing")}
          className="group cursor-pointer rounded-2xl border border-slate-200 bg-white p-4 shadow-sm hover:border-indigo-300 hover:shadow-md transition-all flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 text-violet-600 group-hover:bg-violet-600 group-hover:text-white transition-colors">
              <Receipt className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Invoices & Dues
              </h3>
              <p className="text-xs text-slate-500">
                Payment history & receipts
              </p>
            </div>
          </div>
          <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-violet-600 group-hover:translate-x-0.5 transition-all" />
        </div>
      </div>

      {/* 5. Recent Activity Timeline */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Activity className="h-4 w-4 text-indigo-600" />
            <span>Recent Activity</span>
          </h2>
          <span className="text-[11px] text-slate-500">Latest records</span>
        </div>

        {recentActivity.length > 0 ? (
          <div className="mt-3 divide-y divide-slate-100">
            {recentActivity.map((act) => (
              <div key={act.id} className="flex items-center justify-between py-2.5">
                <div className="flex items-center gap-3">
                  <div
                    className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                      act.type === "attendance"
                        ? "bg-emerald-50 text-emerald-600"
                        : act.type === "payment"
                        ? "bg-indigo-50 text-indigo-600"
                        : "bg-amber-50 text-amber-600"
                    }`}
                  >
                    {act.type === "attendance" && <QrCode className="h-4 w-4" />}
                    {act.type === "payment" && <Receipt className="h-4 w-4" />}
                    {act.type === "booking" && <Calendar className="h-4 w-4" />}
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-slate-900 leading-tight">
                      {act.title}
                    </h4>
                    <span className="text-[11px] text-slate-500">
                      {act.subtitle}
                    </span>
                  </div>
                </div>
                <span className="text-[10px] text-slate-400 font-mono">
                  {act.time}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-6 text-center text-xs text-slate-500">
            No activity records yet. Scan your pass at the gym entrance to get started!
          </div>
        )}
      </div>
    </div>
  );
}

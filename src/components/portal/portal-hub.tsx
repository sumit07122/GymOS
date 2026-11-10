/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import * as React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  UserCheck,
} from "lucide-react";
import { PortalHeader } from "./portal-header";
import { PortalBottomNav, PortalTab } from "./portal-bottom-nav";
import { DigitalMembershipCard } from "./digital-membership-card";
import { PortalHomeTab } from "./portal-home-tab";
import { PortalMembershipTab } from "./portal-membership-tab";
import { PortalBillingTab } from "./portal-billing-tab";
import { PortalAttendanceTab } from "./portal-attendance-tab";
import { PortalWorkoutsTab } from "./portal-workouts-tab";
import { PortalScheduleTab } from "./portal-schedule-tab";
import { PortalProfileTab } from "./portal-profile-tab";

interface PortalHubProps {
  initialData: any;
  isStaffOrAdmin?: boolean;
}

export function PortalHub({ initialData, isStaffOrAdmin = false }: PortalHubProps) {
  const [activeTab, setActiveTab] = React.useState<PortalTab>("home");

  // Fallback state if user does not have an active Member profile linked to this gym
  if (!initialData.hasLinkedProfile || !initialData.member) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col justify-between">
        <PortalHeader
          gym={initialData.gym}
          member={null}
          isStaffOrAdmin={isStaffOrAdmin}
        />
        <main className="mx-auto max-w-md px-4 py-16 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 border border-amber-200 shadow-sm mb-4">
            <UserCheck className="h-7 w-7" />
          </div>
          <h1 className="text-xl font-bold text-slate-900">
            No Member Profile Linked
          </h1>
          <p className="mt-2 text-xs text-slate-600 leading-relaxed">
            Your login account is active, but you do not currently have an active
            member record associated with <strong>{initialData.gym.name}</strong>.
          </p>

          <div className="mt-6 flex flex-col gap-2.5">
            {isStaffOrAdmin ? (
              <Link href={`/${initialData.gym.slug}/dashboard`}>
                <Button className="w-full text-xs h-9 gap-2 bg-indigo-600 hover:bg-indigo-700">
                  <LayoutDashboard className="h-4 w-4" />
                  <span>Go to Staff / Admin Dashboard</span>
                </Button>
              </Link>
            ) : (
              <div className="rounded-xl bg-slate-100 p-3 text-xs text-slate-600">
                Please ask your gym front desk staff to link your membership profile with email:{" "}
                <span className="font-semibold text-slate-800">
                  {initialData.userEmail || "your account email"}
                </span>
                .
              </div>
            )}
          </div>
        </main>
        <footer className="py-4 text-center text-xs text-slate-400">
          FIXIA GymOS • Member Portal
        </footer>
      </div>
    );
  }

  const { gym, member, qrCard, membership, attendance, billing, workouts, classes } =
    initialData;

  // Build unified recent activity feed
  const recentActivity: Array<{
    id: string;
    type: "attendance" | "payment" | "booking";
    title: string;
    subtitle: string;
    time: string;
  }> = [];

  if (attendance.records[0]) {
    recentActivity.push({
      id: `att-${attendance.records[0].id}`,
      type: "attendance",
      title: "Gym Check-In",
      subtitle: `${attendance.records[0].checkInMethod === "QR_SCAN" ? "Dynamic QR Pass" : "Verified Entry"} at ${gym.name}`,
      time: new Date(attendance.records[0].checkInTime).toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
      }),
    });
  }

  if (classes.myBookings[0]) {
    recentActivity.push({
      id: `bk-${classes.myBookings[0].id}`,
      type: "booking",
      title: `Class: ${classes.myBookings[0].className}`,
      subtitle: `Status: ${classes.myBookings[0].status} • with ${classes.myBookings[0].instructorName}`,
      time: new Date(classes.myBookings[0].startTime).toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
      }),
    });
  }

  if (billing.payments[0]) {
    recentActivity.push({
      id: `pay-${billing.payments[0].id}`,
      type: "payment",
      title: `Payment: ${gym.currency} ${billing.payments[0].amount.toFixed(2)}`,
      subtitle: `Via ${billing.payments[0].method} • Ref: ${billing.payments[0].paymentNumber}`,
      time: new Date(billing.payments[0].receivedAt).toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
      }),
    });
  }

  const nextClassBooking =
    classes.upcoming.find((c: any) => c.isBooked) || null;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Top Header */}
      <PortalHeader
        gym={gym}
        member={member}
        isStaffOrAdmin={isStaffOrAdmin}
      />

      {/* Main Container */}
      <main className="flex-1 mx-auto w-full max-w-4xl px-4 sm:px-6 pt-5 pb-20 sm:pb-12">
        {/* Navigation Tabs Bar (Desktop Top Bar) */}
        <PortalBottomNav
          activeTab={activeTab}
          onTabChange={setActiveTab}
          hasUnpaidInvoices={billing.outstandingBalance > 0}
        />

        {/* Tab Body Router */}
        <div className="mt-5">
          {activeTab === "home" && (
            <PortalHomeTab
              gym={gym}
              member={member}
              membership={membership.active}
              attendance={attendance}
              billing={billing}
              workoutPlanName={workouts.activePlan?.name || null}
              nextClassBooking={
                nextClassBooking
                  ? {
                      className: nextClassBooking.className,
                      startTime: nextClassBooking.startTime,
                    }
                  : null
              }
              recentActivity={recentActivity}
              onNavigate={setActiveTab}
            />
          )}

          {activeTab === "card" && (
            <div className="py-4">
              <DigitalMembershipCard
                gym={gym}
                member={member}
                membership={membership.active}
                initialQr={qrCard}
              />
            </div>
          )}

          {activeTab === "membership" && (
            <PortalMembershipTab gym={gym} membership={membership} />
          )}

          {activeTab === "attendance" && (
            <PortalAttendanceTab attendance={attendance} />
          )}

          {activeTab === "classes" && (
            <PortalScheduleTab gymSlug={gym.slug} classes={classes} />
          )}

          {activeTab === "workouts" && (
            <PortalWorkoutsTab gymSlug={gym.slug} workouts={workouts} />
          )}

          {activeTab === "billing" && (
            <PortalBillingTab gym={gym} member={member} billing={billing} />
          )}

          {activeTab === "profile" && (
            <PortalProfileTab gym={gym} member={member} />
          )}
        </div>
      </main>

      {/* Mobile Fixed Bottom Nav */}
      <PortalBottomNav
        activeTab={activeTab}
        onTabChange={setActiveTab}
        hasUnpaidInvoices={billing.outstandingBalance > 0}
      />
    </div>
  );
}

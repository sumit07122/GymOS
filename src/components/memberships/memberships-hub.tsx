"use client";

import * as React from "react";
import { useState } from "react";
import { PlanData, PlanModal } from "./plan-modal";
import { PlanListTable } from "./plan-list-table";
import {
  ExpiringMembershipItem,
  ExpiringMembershipsTable,
} from "./expiring-memberships-table";
import {
  AssignMembershipModal,
  PlanOption,
  MemberOption,
} from "./membership-lifecycle-modals";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  CreditCard,
  Plus,
  UserCheck,
  AlertCircle,
  CalendarCheck,
  TrendingUp,
} from "lucide-react";

interface MembershipsHubProps {
  gymId: string;
  gymSlug: string;
  currency: string;
  userRole?: string;
  plans: (PlanData & {
    _count?: {
      memberships: number;
    };
  })[];
  expiringMemberships: ExpiringMembershipItem[];
  activeMembershipsCount: number;
  membersList: MemberOption[];
}

export function MembershipsHub({
  gymId,
  gymSlug,
  currency,
  userRole,
  plans,
  expiringMemberships,
  activeMembershipsCount,
  membersList,
}: MembershipsHubProps) {
  const isOwner = userRole === "OWNER" || userRole === "SUPER_ADMIN";
  const [activeTab, setActiveTab] = useState<"plans" | "expiring">("plans");
  const [isNewPlanOpen, setIsNewPlanOpen] = useState(false);
  const [isAssignOpen, setIsAssignOpen] = useState(false);

  const planOptions: PlanOption[] = plans
    .filter((p) => p.isActive)
    .map((p) => ({
      id: p.id!,
      name: p.name,
      durationDays: p.durationDays,
      price: p.price,
      admissionFee: p.admissionFee,
    }));

  const activePlansCount = plans.filter((p) => p.isActive).length;

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <CreditCard className="h-6 w-6 text-emerald-600" />
            Membership Plans & Subscriptions
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage subscription plans, pricing tiers, contract lifecycles, and renewal schedules.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setIsAssignOpen(true)}
            className="text-xs h-9 gap-1.5 border-slate-200"
          >
            <UserCheck className="h-4 w-4 text-emerald-600" />
            <span>Assign Membership</span>
          </Button>

          {isOwner && (
            <Button
              type="button"
              size="sm"
              onClick={() => setIsNewPlanOpen(true)}
              className="text-xs h-9 bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5 shadow-xs"
            >
              <Plus className="h-4 w-4" />
              <span>Create Plan</span>
            </Button>
          )}
        </div>
      </div>

      {/* KPI Highlight Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-slate-200 shadow-xs">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-slate-500 uppercase">
                Active Plans
              </span>
              <CreditCard className="h-4 w-4 text-emerald-600" />
            </div>
            <div className="mt-2 text-2xl font-bold text-slate-900">
              {activePlansCount}
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              {plans.length} total tiers defined
            </p>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-xs">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-slate-500 uppercase">
                Active Memberships
              </span>
              <CalendarCheck className="h-4 w-4 text-emerald-600" />
            </div>
            <div className="mt-2 text-2xl font-bold text-slate-900">
              {activeMembershipsCount}
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Enrolled gym members
            </p>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-xs">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-slate-500 uppercase">
                Expiring in 14d
              </span>
              <AlertCircle className="h-4 w-4 text-amber-600" />
            </div>
            <div className="mt-2 text-2xl font-bold text-amber-700">
              {expiringMemberships.length}
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Actionable renewal pipeline
            </p>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-xs">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-slate-500 uppercase">
                Renewal Value (14d)
              </span>
              <TrendingUp className="h-4 w-4 text-emerald-600" />
            </div>
            <div className="mt-2 text-2xl font-bold text-slate-900 font-mono">
              {currency}{" "}
              {expiringMemberships
                .reduce((acc, curr) => acc + Number(curr.plan.price), 0)
                .toLocaleString(undefined, {
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 0,
                })}
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Upcoming renewal revenue
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs navigation */}
      <div className="flex border-b border-slate-200 text-xs font-semibold">
        <button
          type="button"
          onClick={() => setActiveTab("plans")}
          className={`px-4 py-2.5 border-b-2 transition ${
            activeTab === "plans"
              ? "border-emerald-600 text-emerald-700 font-bold"
              : "border-transparent text-slate-500 hover:text-slate-900"
          }`}
        >
          Membership Plans ({plans.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("expiring")}
          className={`px-4 py-2.5 border-b-2 transition flex items-center gap-1.5 ${
            activeTab === "expiring"
              ? "border-emerald-600 text-emerald-700 font-bold"
              : "border-transparent text-slate-500 hover:text-slate-900"
          }`}
        >
          <span>Expiring Soon</span>
          {expiringMemberships.length > 0 && (
            <span className="rounded-full bg-amber-100 text-amber-800 text-[10px] px-1.5 py-0.2">
              {expiringMemberships.length}
            </span>
          )}
        </button>
      </div>

      {/* Tab Panels */}
      {activeTab === "plans" && (
        <PlanListTable
          gymId={gymId}
          gymSlug={gymSlug}
          currency={currency}
          plans={plans}
          userRole={userRole}
        />
      )}

      {activeTab === "expiring" && (
        <ExpiringMembershipsTable
          gymId={gymId}
          gymSlug={gymSlug}
          currency={currency}
          items={expiringMemberships}
          plans={planOptions}
        />
      )}

      {/* Create Plan Modal */}
      {isNewPlanOpen && (
        <PlanModal
          isOpen={isNewPlanOpen}
          onClose={() => setIsNewPlanOpen(false)}
          gymId={gymId}
          gymSlug={gymSlug}
          currency={currency}
        />
      )}

      {/* Assign Membership Modal */}
      {isAssignOpen && (
        <AssignMembershipModal
          isOpen={isAssignOpen}
          onClose={() => setIsAssignOpen(false)}
          gymId={gymId}
          gymSlug={gymSlug}
          currency={currency}
          plans={planOptions}
          members={membersList}
        />
      )}
    </div>
  );
}


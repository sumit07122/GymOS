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
import {
  CreditCard,
  Plus,
  UserCheck,
  AlertCircle,
  CalendarCheck,
  TrendingUp,
} from "lucide-react";
import { PageHeader } from "@/components/design-system/page-header";
import { StatCard } from "@/components/design-system/stat-card";

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
      <PageHeader
        title="Membership Plans & Subscriptions"
        description="Manage subscription plans, pricing tiers, contract lifecycles, and renewal schedules."
        actions={
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsAssignOpen(true)}
              className="text-xs h-9 gap-1.5 border-line bg-white hover:bg-canvas text-ink rounded-lg shadow-xs"
            >
              <UserCheck className="h-4 w-4 text-pine" />
              <span>Assign Membership</span>
            </Button>

            {isOwner && (
              <Button
                type="button"
                size="sm"
                onClick={() => setIsNewPlanOpen(true)}
                className="text-xs h-9 bg-pine hover:bg-pine/90 text-white gap-1.5 rounded-lg shadow-xs transition"
              >
                <Plus className="h-4 w-4" />
                <span>Create Plan</span>
              </Button>
            )}
          </div>
        }
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          label="Active Plans"
          value={activePlansCount}
          icon={CreditCard}
          subtext={`${plans.length} total tiers configured`}
        />
        <StatCard
          label="Active Subscriptions"
          value={activeMembershipsCount}
          icon={CalendarCheck}
          subtext="Members with current plans"
        />
        <StatCard
          label="Expiring (Next 7 Days)"
          value={expiringMemberships.length}
          icon={AlertCircle}
          trend={
            expiringMemberships.length > 0
              ? { value: "Needs renewal", isPositive: false }
              : undefined
          }
          subtext="Actionable renewals"
        />
        <StatCard
          label="Tier Retention"
          value="94.2%"
          icon={TrendingUp}
          subtext="Rolling 90-day renewal rate"
        />
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-line text-xs font-semibold">
        <button
          type="button"
          onClick={() => setActiveTab("plans")}
          className={`px-4 py-2.5 border-b-2 transition flex items-center gap-1.5 ${
            activeTab === "plans"
              ? "border-pine text-pine font-bold"
              : "border-transparent text-muted hover:text-ink"
          }`}
        >
          <CreditCard className="h-4 w-4" />
          <span>Configured Plans ({plans.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("expiring")}
          className={`px-4 py-2.5 border-b-2 transition flex items-center gap-1.5 ${
            activeTab === "expiring"
              ? "border-pine text-pine font-bold"
              : "border-transparent text-muted hover:text-ink"
          }`}
        >
          <AlertCircle className="h-4 w-4 text-amber-500" />
          <span>Expiring Soon ({expiringMemberships.length})</span>
        </button>
      </div>

      {/* Tab Panels */}
      {activeTab === "plans" ? (
        <PlanListTable
          gymId={gymId}
          gymSlug={gymSlug}
          currency={currency}
          plans={plans}
        />
      ) : (
        <ExpiringMembershipsTable
          gymId={gymId}
          gymSlug={gymSlug}
          currency={currency}
          items={expiringMemberships}
          plans={planOptions}
        />
      )}

      {/* New Plan Modal */}
      {isOwner && (
        <PlanModal
          gymId={gymId}
          gymSlug={gymSlug}
          currency={currency}
          isOpen={isNewPlanOpen}
          onClose={() => setIsNewPlanOpen(false)}
        />
      )}

      {/* Assign Membership Modal */}
      <AssignMembershipModal
        gymId={gymId}
        gymSlug={gymSlug}
        currency={currency}
        isOpen={isAssignOpen}
        onClose={() => setIsAssignOpen(false)}
        plans={planOptions}
        members={membersList}
      />
    </div>
  );
}

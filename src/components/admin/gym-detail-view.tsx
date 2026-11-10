"use client";

import * as React from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  updateGymAccountStatusAction,
  updateGymSupportNotesAction,
  assignGymSubscriptionAction,
} from "@/lib/actions/platform-admin";
import { GymStatus, SaasSubscriptionStatus, SaasBillingPeriod } from "@prisma/client";
import { ALL_SAAS_FEATURES } from "@/lib/saas/features";
import {
  Building2,
  CheckCircle2,
  AlertTriangle,
  ArrowLeft,
  CreditCard,
  FileText,
  ShieldAlert,
  Loader2,
  Sparkles,
} from "lucide-react";

interface PlanOption {
  id: string;
  name: string;
  code: string;
  monthlyPrice: number;
  yearlyPrice: number;
  maxMembers: number;
  features: string;
}

interface GymDetailViewProps {
  data: {
    gym: {
      id: string;
      name: string;
      slug: string;
      email: string | null;
      phone: string | null;
      addressLine1: string | null;
      city: string | null;
      country: string;
      currency: string;
      timezone: string;
      status: GymStatus;
      createdAt: string;
      updatedAt: string;
    };
    counts: {
      members: number;
      userRoles: number;
      classes: number;
      invoices: number;
      payments: number;
      inventoryItems: number;
    };
    users: Array<{
      userId: string;
      name: string | null;
      email: string | null;
      gymRole: string;
      systemRole: string;
    }>;
    subscription: {
      id: string;
      status: SaasSubscriptionStatus;
      billingPeriod: SaasBillingPeriod;
      currentPeriodStart: string;
      currentPeriodEnd: string;
      trialEndsAt: string | null;
      gracePeriodEndsAt: string | null;
      customFeatureOverrides: string | null;
      notes: string | null;
      plan: {
        id: string;
        name: string;
        code: string;
        monthlyPrice: number;
        yearlyPrice: number;
        maxMembers: number;
        maxStaff: number;
        maxClasses: number;
        features: string;
      };
    } | null;
    availablePlans: PlanOption[];
    auditHistory: Array<{
      id: string;
      action: string;
      details: string | null;
      createdAt: string;
      adminEmail: string;
    }>;
  };
}

export function GymDetailView({ data }: GymDetailViewProps) {
  const [gymStatus, setGymStatus] = React.useState<GymStatus>(data.gym.status);
  const [supportNotes, setSupportNotes] = React.useState(data.subscription?.notes || "");
  const [isSavingNotes, setIsSavingNotes] = React.useState(false);
  const [notesFeedback, setNotesFeedback] = React.useState<string | null>(null);

  // Status Change Modal State
  const [isStatusModalOpen, setIsStatusModalOpen] = React.useState(false);
  const [selectedTargetStatus, setSelectedTargetStatus] = React.useState<GymStatus>(GymStatus.SUSPENDED);
  const [statusReason, setStatusReason] = React.useState("");
  const [isUpdatingStatus, setIsUpdatingStatus] = React.useState(false);
  const [statusError, setStatusError] = React.useState<string | null>(null);

  // Subscription Assignment Modal State
  const [isSubModalOpen, setIsSubModalOpen] = React.useState(false);
  const [selectedPlanId, setSelectedPlanId] = React.useState(
    data.subscription?.plan.id || (data.availablePlans[0]?.id ?? "")
  );
  const [billingPeriod, setBillingPeriod] = React.useState<SaasBillingPeriod>(
    data.subscription?.billingPeriod || SaasBillingPeriod.MONTHLY
  );
  const [subscriptionStatus, setSubscriptionStatus] = React.useState<SaasSubscriptionStatus>(
    data.subscription?.status || SaasSubscriptionStatus.ACTIVE
  );
  const [overrides, setOverrides] = React.useState<Record<string, boolean>>(() => {
    try {
      return data.subscription?.customFeatureOverrides
        ? JSON.parse(data.subscription.customFeatureOverrides)
        : {};
    } catch {
      return {};
    }
  });
  const [isAssigningSub, setIsAssigningSub] = React.useState(false);
  const [subError, setSubError] = React.useState<string | null>(null);

  // Parse plan features
  let planFeaturesList: string[] = [];
  try {
    planFeaturesList = data.subscription?.plan.features
      ? JSON.parse(data.subscription.plan.features)
      : [];
  } catch {
    planFeaturesList = [];
  }

  const statusBadgeStyle: Record<string, string> = {
    ACTIVE: "bg-emerald-50 text-emerald-700 border-emerald-200",
    TRIAL: "bg-blue-50 text-blue-700 border-blue-200",
    SUSPENDED: "bg-rose-50 text-rose-700 border-rose-200",
    INACTIVE: "bg-slate-100 text-slate-700 border-slate-200",
  };

  const handleSaveNotes = async () => {
    setIsSavingNotes(true);
    setNotesFeedback(null);
    try {
      const res = await updateGymSupportNotesAction(data.gym.id, {
        notes: supportNotes,
      });
      if (res.success) {
        setNotesFeedback("Support notes saved successfully.");
      } else {
        setNotesFeedback(res.error || "Failed to save notes.");
      }
    } catch {
      setNotesFeedback("Error occurred while saving notes.");
    } finally {
      setIsSavingNotes(false);
    }
  };

  const handleStatusSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!statusReason.trim()) {
      setStatusError("Mandatory audit reason required.");
      return;
    }
    setIsUpdatingStatus(true);
    setStatusError(null);
    try {
      const res = await updateGymAccountStatusAction(data.gym.id, {
        status: selectedTargetStatus,
        reason: statusReason.trim(),
      });
      if (res.success && res.status) {
        setGymStatus(res.status);
        setIsStatusModalOpen(false);
      } else {
        setStatusError(res.error || "Failed to update status.");
      }
    } catch {
      setStatusError("Unexpected error occurred.");
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleAssignSubscription = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAssigningSub(true);
    setSubError(null);
    try {
      const res = await assignGymSubscriptionAction(data.gym.id, {
        planId: selectedPlanId,
        billingPeriod,
        status: subscriptionStatus,
        customFeatureOverrides: overrides,
        notes: supportNotes,
      });

      if (res.success) {
        setIsSubModalOpen(false);
        window.location.reload();
      } else {
        setSubError(res.error || "Failed to assign subscription.");
      }
    } catch {
      setSubError("Unexpected error occurred.");
    } finally {
      setIsAssigningSub(false);
    }
  };

  const toggleOverride = (featKey: string) => {
    setOverrides((prev) => {
      const current = prev[featKey];
      if (current === undefined) {
        return { ...prev, [featKey]: true };
      }
      if (current === true) {
        return { ...prev, [featKey]: false };
      }
      const next = { ...prev };
      delete next[featKey];
      return next;
    });
  };

  return (
    <div className="space-y-6">
      {/* Back and Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-200 pb-4">
        <div>
          <Link
            href="/platform-admin/gyms"
            className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-900 font-semibold mb-2"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back to All Gyms</span>
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              {data.gym.name}
            </h1>
            <Badge
              variant="outline"
              className={`${statusBadgeStyle[gymStatus] || "bg-slate-100"} text-xs font-bold`}
            >
              {gymStatus}
            </Badge>
          </div>
          <p className="text-xs text-slate-500 font-mono mt-0.5">
            ID: {data.gym.id} • Slug: /{data.gym.slug} • Created:{" "}
            {new Date(data.gym.createdAt).toLocaleDateString()}
          </p>
        </div>

        {/* Status Action Buttons */}
        <div className="flex items-center gap-2">
          {gymStatus === GymStatus.SUSPENDED ? (
            <Button
              variant="outline"
              onClick={() => {
                setSelectedTargetStatus(GymStatus.ACTIVE);
                setStatusReason("");
                setIsStatusModalOpen(true);
              }}
              className="text-xs border-emerald-300 text-emerald-700 hover:bg-emerald-50 gap-1.5"
            >
              <CheckCircle2 className="h-3.5 w-3.5" />
              <span>Reactivate Gym</span>
            </Button>
          ) : (
            <Button
              variant="outline"
              onClick={() => {
                setSelectedTargetStatus(GymStatus.SUSPENDED);
                setStatusReason("");
                setIsStatusModalOpen(true);
              }}
              className="text-xs border-rose-300 text-rose-700 hover:bg-rose-50 gap-1.5"
            >
              <AlertTriangle className="h-3.5 w-3.5" />
              <span>Suspend Gym</span>
            </Button>
          )}

          <Button
            onClick={() => setIsSubModalOpen(true)}
            className="text-xs bg-slate-900 hover:bg-slate-800 text-white gap-1.5"
          >
            <CreditCard className="h-3.5 w-3.5" />
            <span>Manage Subscription</span>
          </Button>
        </div>
      </div>

      {/* Overview Cards Row */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-xs">
          <span className="text-[10px] uppercase font-bold text-slate-400 block">Members</span>
          <span className="text-xl font-black text-slate-900 mt-1 block">{data.counts.members}</span>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-xs">
          <span className="text-[10px] uppercase font-bold text-slate-400 block">Staff / Trainers</span>
          <span className="text-xl font-black text-slate-900 mt-1 block">{data.counts.userRoles}</span>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-xs">
          <span className="text-[10px] uppercase font-bold text-slate-400 block">Classes</span>
          <span className="text-xl font-black text-slate-900 mt-1 block">{data.counts.classes}</span>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-xs">
          <span className="text-[10px] uppercase font-bold text-slate-400 block">Invoices</span>
          <span className="text-xl font-black text-slate-900 mt-1 block">{data.counts.invoices}</span>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-xs">
          <span className="text-[10px] uppercase font-bold text-slate-400 block">Payments</span>
          <span className="text-xl font-black text-slate-900 mt-1 block">{data.counts.payments}</span>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-xs">
          <span className="text-[10px] uppercase font-bold text-slate-400 block">Inventory</span>
          <span className="text-xl font-black text-slate-900 mt-1 block">{data.counts.inventoryItems}</span>
        </div>
      </div>

      {/* Main Grid: Details & Subscription & Support */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Gym Information */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
            <Building2 className="h-4 w-4 text-slate-700" />
            <span>Workspace Profile & Contact</span>
          </h3>

          <div className="space-y-2.5 text-xs">
            <div>
              <span className="text-slate-400 block text-[11px]">Contact Email</span>
              <span className="font-semibold text-slate-800">{data.gym.email || "Not set"}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">Phone</span>
              <span className="font-semibold text-slate-800">{data.gym.phone || "Not set"}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">Location</span>
              <span className="font-semibold text-slate-800">
                {data.gym.city ? `${data.gym.city}, ${data.gym.country}` : data.gym.country}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">Currency & Timezone</span>
              <span className="font-semibold text-slate-800">
                {data.gym.currency} • {data.gym.timezone}
              </span>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100">
            <h4 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
              Associated Staff & Owners
            </h4>
            <div className="space-y-2 text-xs">
              {data.users.map((u) => (
                <div key={u.userId} className="flex items-center justify-between bg-slate-50 p-2 rounded-lg">
                  <div>
                    <span className="font-semibold text-slate-900 block">{u.name || "User"}</span>
                    <span className="text-[11px] text-slate-400">{u.email}</span>
                  </div>
                  <Badge variant="outline" className="text-[10px] font-bold">
                    {u.gymRole}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Center Column: SaaS Subscription Details */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-emerald-600" />
              <span>FIXIA SaaS Subscription</span>
            </h3>
            {data.subscription && (
              <Badge variant="outline" className="text-[10px] font-bold bg-emerald-50 text-emerald-700 border-emerald-200">
                {data.subscription.status}
              </Badge>
            )}
          </div>

          {data.subscription ? (
            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-black text-slate-900">
                    {data.subscription.plan.name}
                  </span>
                  <span className="text-xs font-bold text-slate-700">
                    {data.subscription.billingPeriod === "YEARLY"
                      ? `$${data.subscription.plan.yearlyPrice}/yr`
                      : `$${data.subscription.plan.monthlyPrice}/mo`}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Code: {data.subscription.plan.code} • Max {data.subscription.plan.maxMembers === -1 ? "Unlimited" : data.subscription.plan.maxMembers} members
                </p>
              </div>

              <div className="space-y-1.5 pt-1">
                <div className="flex justify-between">
                  <span className="text-slate-400">Billing Cycle:</span>
                  <span className="font-semibold text-slate-800">{data.subscription.billingPeriod}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Current Period End:</span>
                  <span className="font-semibold text-slate-800">
                    {new Date(data.subscription.currentPeriodEnd).toLocaleDateString()}
                  </span>
                </div>
                {data.subscription.trialEndsAt && (
                  <div className="flex justify-between">
                    <span className="text-slate-400">Trial Ends:</span>
                    <span className="font-semibold text-blue-700">
                      {new Date(data.subscription.trialEndsAt).toLocaleDateString()}
                    </span>
                  </div>
                )}
                {data.subscription.gracePeriodEndsAt && (
                  <div className="flex justify-between">
                    <span className="text-slate-400">Grace Period Cutoff:</span>
                    <span className="font-semibold text-amber-700">
                      {new Date(data.subscription.gracePeriodEndsAt).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="py-8 text-center text-slate-400 text-xs space-y-2">
              <p>No SaaS subscription plan is currently assigned to this gym.</p>
              <Button
                size="sm"
                onClick={() => setIsSubModalOpen(true)}
                className="text-xs bg-indigo-600 hover:bg-indigo-700 text-white"
              >
                Assign SaaS Subscription
              </Button>
            </div>
          )}
        </div>

        {/* Right Column: Support Notes */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
            <FileText className="h-4 w-4 text-indigo-600" />
            <span>Support & Internal Notes</span>
          </h3>

          <p className="text-[11px] text-slate-500">
            Confidential platform administration notes regarding this gym&apos;s support history, payment arrangements, or custom terms.
          </p>

          <textarea
            rows={5}
            value={supportNotes}
            onChange={(e) => setSupportNotes(e.target.value)}
            placeholder="Add internal support notes here..."
            className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-900"
          />

          {notesFeedback && (
            <div className="text-[11px] font-semibold text-emerald-700">
              {notesFeedback}
            </div>
          )}

          <div className="flex justify-end">
            <Button
              size="sm"
              disabled={isSavingNotes}
              onClick={handleSaveNotes}
              className="text-xs bg-slate-900 hover:bg-slate-800 text-white"
            >
              {isSavingNotes ? (
                <>
                  <Loader2 className="h-3 w-3 animate-spin mr-1.5" />
                  <span>Saving...</span>
                </>
              ) : (
                <span>Save Notes</span>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Feature Entitlements Checklist */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-indigo-600" />
              <span>Feature Entitlements Matrix</span>
            </h3>
            <p className="text-xs text-slate-500">
              Active capabilities permitted for this gym based on SaaS plan tier and admin overrides.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {ALL_SAAS_FEATURES.map((feat) => {
            const isPlanIncluded = planFeaturesList.includes(feat.key) || planFeaturesList.includes("*");
            const overrideVal = overrides[feat.key];
            const isEnabled =
              overrideVal !== undefined ? overrideVal : isPlanIncluded;

            return (
              <div
                key={feat.key}
                className={`p-3 rounded-xl border flex items-center justify-between text-xs transition-colors ${
                  isEnabled
                    ? "bg-slate-50 border-slate-200"
                    : "bg-slate-100/50 border-slate-200/50 opacity-60"
                }`}
              >
                <div>
                  <span className="font-bold text-slate-900 block">{feat.name}</span>
                  <span className="text-[10px] text-slate-400 block">{feat.description}</span>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  {overrideVal !== undefined && (
                    <Badge variant="outline" className="text-[9px] bg-amber-50 text-amber-700 border-amber-200">
                      Override
                    </Badge>
                  )}
                  <Badge
                    variant="outline"
                    className={`text-[10px] font-bold ${
                      isEnabled
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                        : "bg-slate-200 text-slate-600 border-slate-300"
                    }`}
                  >
                    {isEnabled ? "Enabled" : "Disabled"}
                  </Badge>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Gym Platform Audit Logs */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-xs space-y-4">
        <h3 className="text-base font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
          <ShieldAlert className="h-4 w-4 text-slate-700" />
          <span>Platform Audit Trail for this Workspace</span>
        </h3>

        {data.auditHistory.length === 0 ? (
          <div className="py-8 text-center text-slate-400 text-xs">
            No administrative operations recorded for this gym.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {data.auditHistory.map((item) => (
              <div key={item.id} className="py-2.5 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="font-mono text-[10px] font-bold">
                    {item.action}
                  </Badge>
                  <span className="text-slate-600">{item.details}</span>
                </div>
                <div className="text-[11px] text-slate-400">
                  {item.adminEmail} • {new Date(item.createdAt).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Status Modal */}
      {isStatusModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200 space-y-4">
            <h3 className="text-base font-bold text-slate-900">
              Update Workspace Status: {selectedTargetStatus}
            </h3>

            {statusError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
                {statusError}
              </div>
            )}

            <form onSubmit={handleStatusSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  New Status
                </label>
                <select
                  value={selectedTargetStatus}
                  onChange={(e) => setSelectedTargetStatus(e.target.value as GymStatus)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-900"
                >
                  <option value={GymStatus.ACTIVE}>ACTIVE</option>
                  <option value={GymStatus.TRIAL}>TRIAL</option>
                  <option value={GymStatus.SUSPENDED}>SUSPENDED</option>
                  <option value={GymStatus.INACTIVE}>INACTIVE</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Mandatory Audit Reason
                </label>
                <textarea
                  rows={3}
                  value={statusReason}
                  onChange={(e) => setStatusReason(e.target.value)}
                  placeholder="Reason for changing status..."
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-900"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsStatusModalOpen(false)}
                  className="text-xs"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isUpdatingStatus}
                  className="text-xs bg-slate-900 hover:bg-slate-800 text-white"
                >
                  {isUpdatingStatus ? "Updating..." : "Confirm Status Change"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Subscription Assignment Modal */}
      {isSubModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-200 space-y-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-base font-bold text-slate-900">
              Assign / Update FIXIA SaaS Subscription
            </h3>

            {subError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
                {subError}
              </div>
            )}

            <form onSubmit={handleAssignSubscription} className="space-y-4 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Select SaaS Plan</label>
                <select
                  value={selectedPlanId}
                  onChange={(e) => setSelectedPlanId(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-900"
                >
                  {data.availablePlans.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} (${p.monthlyPrice}/mo, ${p.yearlyPrice}/yr)
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Billing Period</label>
                  <select
                    value={billingPeriod}
                    onChange={(e) => setBillingPeriod(e.target.value as SaasBillingPeriod)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-900"
                  >
                    <option value={SaasBillingPeriod.MONTHLY}>MONTHLY</option>
                    <option value={SaasBillingPeriod.YEARLY}>YEARLY</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Subscription Status</label>
                  <select
                    value={subscriptionStatus}
                    onChange={(e) => setSubscriptionStatus(e.target.value as SaasSubscriptionStatus)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-900"
                  >
                    <option value={SaasSubscriptionStatus.ACTIVE}>ACTIVE</option>
                    <option value={SaasSubscriptionStatus.TRIALING}>TRIALING</option>
                    <option value={SaasSubscriptionStatus.PAST_DUE}>PAST_DUE</option>
                    <option value={SaasSubscriptionStatus.SUSPENDED}>SUSPENDED</option>
                    <option value={SaasSubscriptionStatus.CANCELLED}>CANCELLED</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1.5">
                  Custom Feature Overrides (Optional Super Admin Grant / Deny)
                </label>
                <div className="space-y-1.5 border border-slate-200 rounded-xl p-3 bg-slate-50 max-h-48 overflow-y-auto">
                  {ALL_SAAS_FEATURES.map((feat) => {
                    const currentOverride = overrides[feat.key];
                    return (
                      <div
                        key={feat.key}
                        className="flex items-center justify-between text-xs py-1 border-b border-slate-100 last:border-0"
                      >
                        <span className="font-medium text-slate-800">{feat.name}</span>
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => toggleOverride(feat.key)}
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              currentOverride === true
                                ? "bg-emerald-600 text-white"
                                : currentOverride === false
                                ? "bg-rose-600 text-white"
                                : "bg-slate-200 text-slate-700"
                            }`}
                          >
                            {currentOverride === true
                              ? "Force Enabled"
                              : currentOverride === false
                              ? "Force Denied"
                              : "Default Plan"}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsSubModalOpen(false)}
                  className="text-xs"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isAssigningSub}
                  className="text-xs bg-slate-900 hover:bg-slate-800 text-white"
                >
                  {isAssigningSub ? "Saving..." : "Save Subscription"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

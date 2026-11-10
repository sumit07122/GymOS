"use client";

import * as React from "react";
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
  CreditCard,
  FileText,
  ShieldAlert,
  Loader2,
  Sparkles,
  Users,
  Calendar,
  Package,
  Receipt,
} from "lucide-react";
import { PageHeader } from "@/components/design-system/page-header";
import { StatCard } from "@/components/design-system/stat-card";
import { StatusBadge } from "@/components/design-system/status-badge";

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

  // Parse existing feature overrides
  const [overrides, setOverrides] = React.useState<Record<string, boolean>>(() => {
    try {
      if (data.subscription?.customFeatureOverrides) {
        return JSON.parse(data.subscription.customFeatureOverrides);
      }
    } catch {
      // fallback
    }
    return {};
  });

  const [isAssigningSub, setIsAssigningSub] = React.useState(false);
  const [subError, setSubError] = React.useState<string | null>(null);

  let planFeaturesList: string[] = [];
  if (data.subscription?.plan?.features) {
    try {
      planFeaturesList = JSON.parse(data.subscription.plan.features);
    } catch {
      planFeaturesList = [];
    }
  }

  const handleSaveNotes = async () => {
    setIsSavingNotes(true);
    setNotesFeedback(null);
    try {
      const res = await updateGymSupportNotesAction(data.gym.id, { notes: supportNotes });
      if (res.success) {
        setNotesFeedback("Support notes saved successfully.");
        setTimeout(() => setNotesFeedback(null), 3000);
      } else {
        setNotesFeedback(res.error || "Failed to save notes.");
      }
    } catch {
      setNotesFeedback("Error saving notes.");
    } finally {
      setIsSavingNotes(false);
    }
  };

  const handleStatusSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!statusReason.trim() || statusReason.trim().length < 3) {
      setStatusError("Please provide an audit reason of at least 3 characters.");
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
      {/* Page Header */}
      <PageHeader
        title={data.gym.name}
        description={`Tenant Workspace ID: ${data.gym.id} • Route: /g/${data.gym.slug} • Provisioned: ${new Date(data.gym.createdAt).toLocaleDateString()}`}
        badge={<StatusBadge status={gymStatus} />}
        breadcrumbs={[
          { label: "Overview", href: "/platform-admin" },
          { label: "Gyms Directory", href: "/platform-admin/gyms" },
          { label: data.gym.name },
        ]}
        actions={
          <div className="flex items-center gap-2">
            {gymStatus === GymStatus.SUSPENDED ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSelectedTargetStatus(GymStatus.ACTIVE);
                  setStatusReason("");
                  setIsStatusModalOpen(true);
                }}
                className="h-9 text-xs border-pine/30 text-pine hover:bg-pine-soft gap-1.5"
              >
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span>Reactivate Workspace</span>
              </Button>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSelectedTargetStatus(GymStatus.SUSPENDED);
                  setStatusReason("");
                  setIsStatusModalOpen(true);
                }}
                className="h-9 text-xs border-rose-200 text-rose-700 hover:bg-rose-50 gap-1.5"
              >
                <AlertTriangle className="h-3.5 w-3.5" />
                <span>Suspend Workspace</span>
              </Button>
            )}

            <Button
              size="sm"
              onClick={() => setIsSubModalOpen(true)}
              className="h-9 text-xs bg-pine hover:bg-pine/90 text-white gap-1.5 font-semibold"
            >
              <CreditCard className="h-3.5 w-3.5" />
              <span>Manage Subscription</span>
            </Button>
          </div>
        }
      />

      {/* Overview Cards Row */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        <StatCard
          label="Active Members"
          value={data.counts.members}
          icon={Users}
          subtext="Enrolled records"
        />
        <StatCard
          label="Staff & Roles"
          value={data.counts.userRoles}
          icon={ShieldAlert}
          subtext="Assigned users"
        />
        <StatCard
          label="Class Catalog"
          value={data.counts.classes}
          icon={Calendar}
          subtext="Scheduled classes"
        />
        <StatCard
          label="Invoices Generated"
          value={data.counts.invoices}
          icon={Receipt}
          subtext="Member invoices"
        />
        <StatCard
          label="Payments Logged"
          value={data.counts.payments}
          icon={CreditCard}
          subtext="Reconciled payments"
        />
        <StatCard
          label="Inventory Items"
          value={data.counts.inventoryItems}
          icon={Package}
          subtext="Retail products"
        />
      </div>

      {/* Main Grid: Details & Subscription & Support */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Gym Information */}
        <div className="rounded-xl border border-line bg-white p-5 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-ink flex items-center gap-2 border-b border-line pb-3">
            <Building2 className="h-4 w-4 text-pine" />
            <span>Workspace Profile & Contact</span>
          </h3>

          <div className="space-y-2.5 text-xs">
            <div>
              <span className="text-muted block text-[11px]">Contact Email</span>
              <span className="font-semibold text-ink">{data.gym.email || "Not configured"}</span>
            </div>
            <div>
              <span className="text-muted block text-[11px]">Official Phone</span>
              <span className="font-semibold text-ink">{data.gym.phone || "Not configured"}</span>
            </div>
            <div>
              <span className="text-muted block text-[11px]">Location</span>
              <span className="font-semibold text-ink">
                {data.gym.city ? `${data.gym.city}, ${data.gym.country}` : data.gym.country}
              </span>
            </div>
            <div>
              <span className="text-muted block text-[11px]">Currency & Timezone</span>
              <span className="font-semibold text-ink">
                {data.gym.currency} • {data.gym.timezone}
              </span>
            </div>
          </div>

          <div className="pt-3 border-t border-line">
            <h4 className="text-[11px] font-bold text-muted uppercase tracking-wider mb-2">
              Associated Staff & Owners
            </h4>
            <div className="space-y-2 text-xs">
              {data.users.map((u) => (
                <div key={u.userId} className="flex items-center justify-between bg-canvas p-2.5 rounded-lg border border-line/60">
                  <div>
                    <span className="font-semibold text-ink block">{u.name || "Owner"}</span>
                    <span className="text-[11px] text-muted">{u.email}</span>
                  </div>
                  <Badge variant="outline" className="text-[10px] font-bold bg-white text-pine border-pine/30">
                    {u.gymRole}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Center Column: SaaS Subscription Details */}
        <div className="rounded-xl border border-line bg-white p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-line pb-3">
            <h3 className="text-sm font-bold text-ink flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-pine" />
              <span>FIXIA SaaS Subscription</span>
            </h3>
            {data.subscription && (
              <Badge variant="outline" className="text-[10px] font-bold bg-pine-soft text-pine border-pine/30">
                {data.subscription.status}
              </Badge>
            )}
          </div>

          {data.subscription ? (
            <div className="space-y-3 text-xs">
              <div className="p-3.5 rounded-lg bg-canvas border border-line">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-ink">
                    {data.subscription.plan.name}
                  </span>
                  <span className="text-xs font-bold text-pine">
                    {data.subscription.billingPeriod === "YEARLY"
                      ? `₹${data.subscription.plan.yearlyPrice}/yr`
                      : `₹${data.subscription.plan.monthlyPrice}/mo`}
                  </span>
                </div>
                <p className="text-[11px] text-muted mt-0.5">
                  Code: {data.subscription.plan.code} • Max {data.subscription.plan.maxMembers === -1 ? "Unlimited" : data.subscription.plan.maxMembers} members
                </p>
              </div>

              <div className="space-y-2 pt-1">
                <div className="flex justify-between">
                  <span className="text-muted">Billing Cycle:</span>
                  <span className="font-semibold text-ink">{data.subscription.billingPeriod}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted">Current Period End:</span>
                  <span className="font-semibold text-ink">
                    {new Date(data.subscription.currentPeriodEnd).toLocaleDateString()}
                  </span>
                </div>
                {data.subscription.trialEndsAt && (
                  <div className="flex justify-between">
                    <span className="text-muted">Trial Ends:</span>
                    <span className="font-semibold text-blue-700">
                      {new Date(data.subscription.trialEndsAt).toLocaleDateString()}
                    </span>
                  </div>
                )}
                {data.subscription.gracePeriodEndsAt && (
                  <div className="flex justify-between">
                    <span className="text-muted">Grace Period Cutoff:</span>
                    <span className="font-semibold text-amber-700">
                      {new Date(data.subscription.gracePeriodEndsAt).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="py-8 text-center text-muted text-xs space-y-3">
              <p>No commercial subscription plan is currently assigned to this gym.</p>
              <Button
                size="sm"
                onClick={() => setIsSubModalOpen(true)}
                className="text-xs bg-pine hover:bg-pine/90 text-white font-semibold"
              >
                Assign SaaS Subscription
              </Button>
            </div>
          )}
        </div>

        {/* Right Column: Support Notes */}
        <div className="rounded-xl border border-line bg-white p-5 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-ink flex items-center gap-2 border-b border-line pb-3">
            <FileText className="h-4 w-4 text-pine" />
            <span>Support & Internal Notes</span>
          </h3>

          <p className="text-[11px] text-muted">
            Confidential platform administration notes regarding this gym&apos;s support history, payment arrangements, or custom terms.
          </p>

          <textarea
            rows={5}
            value={supportNotes}
            onChange={(e) => setSupportNotes(e.target.value)}
            placeholder="Add internal support notes here..."
            className="w-full text-xs p-2.5 rounded-lg border border-line focus:outline-hidden focus:ring-2 focus:ring-pine/30 focus:border-pine transition"
          />

          {notesFeedback && (
            <div className="text-[11px] font-semibold text-pine">
              {notesFeedback}
            </div>
          )}

          <div className="flex justify-end">
            <Button
              size="sm"
              disabled={isSavingNotes}
              onClick={handleSaveNotes}
              className="text-xs bg-pine hover:bg-pine/90 text-white font-semibold h-8"
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
      <div className="rounded-xl border border-line bg-white p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-line pb-3">
          <div>
            <h3 className="text-sm sm:text-base font-bold text-ink flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-pine" />
              <span>Feature Entitlements Matrix</span>
            </h3>
            <p className="text-xs text-muted">
              Active capabilities permitted for this gym based on SaaS plan tier and admin overrides.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {ALL_SAAS_FEATURES.map((feat) => {
            const isPlanIncluded = planFeaturesList.includes(feat.key) || planFeaturesList.includes("*");
            const overrideVal = overrides[feat.key];
            const isEnabled = overrideVal !== undefined ? overrideVal : isPlanIncluded;

            return (
              <div
                key={feat.key}
                className={`p-3 rounded-lg border flex items-center justify-between text-xs transition-colors ${
                  isEnabled
                    ? "bg-canvas border-line text-ink"
                    : "bg-canvas/40 border-line/50 text-muted opacity-60"
                }`}
              >
                <div>
                  <span className="font-bold text-ink block">{feat.name}</span>
                  <span className="text-[10px] text-muted block">{feat.description}</span>
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
                        ? "bg-pine-soft text-pine border-pine/30"
                        : "bg-slate-100 text-slate-600 border-slate-200"
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
      <div className="rounded-xl border border-line bg-white p-5 sm:p-6 shadow-xs space-y-4">
        <h3 className="text-sm sm:text-base font-bold text-ink flex items-center gap-2 border-b border-line pb-3">
          <ShieldAlert className="h-4 w-4 text-pine" />
          <span>Platform Audit Trail for this Workspace</span>
        </h3>

        {data.auditHistory.length === 0 ? (
          <div className="py-8 text-center text-muted text-xs">
            No administrative operations recorded for this gym.
          </div>
        ) : (
          <div className="divide-y divide-line/60">
            {data.auditHistory.map((item) => (
              <div key={item.id} className="py-2.5 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="font-mono text-[10px] font-bold bg-canvas text-ink border-line">
                    {item.action}
                  </Badge>
                  <span className="text-ink">{item.details}</span>
                </div>
                <div className="text-[11px] text-muted">
                  {item.adminEmail} • {new Date(item.createdAt).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Status Modal */}
      {isStatusModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl border border-line space-y-4 animate-in fade-in zoom-in-95">
            <h3 className="text-sm font-bold text-ink">
              Update Workspace Status: {selectedTargetStatus}
            </h3>

            {statusError && (
              <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs">
                {statusError}
              </div>
            )}

            <form onSubmit={handleStatusSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-ink block mb-1">
                  New Status
                </label>
                <select
                  value={selectedTargetStatus}
                  onChange={(e) => setSelectedTargetStatus(e.target.value as GymStatus)}
                  className="w-full text-xs p-2.5 rounded-lg border border-line focus:ring-pine/30 focus:border-pine"
                >
                  <option value={GymStatus.ACTIVE}>ACTIVE</option>
                  <option value={GymStatus.TRIAL}>TRIAL</option>
                  <option value={GymStatus.SUSPENDED}>SUSPENDED</option>
                  <option value={GymStatus.INACTIVE}>INACTIVE</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-ink block mb-1">
                  Mandatory Audit Reason *
                </label>
                <textarea
                  rows={3}
                  value={statusReason}
                  onChange={(e) => setStatusReason(e.target.value)}
                  placeholder="Reason for changing status..."
                  className="w-full text-xs p-2.5 rounded-lg border border-line focus:ring-pine/30 focus:border-pine"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsStatusModalOpen(false)}
                  className="text-xs h-9 border-line hover:bg-canvas"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isUpdatingStatus}
                  className="text-xs h-9 bg-pine hover:bg-pine/90 text-white font-semibold"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 shadow-xl border border-line space-y-4 max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95">
            <h3 className="text-sm font-bold text-ink">
              Assign / Update FIXIA SaaS Subscription
            </h3>

            {subError && (
              <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs">
                {subError}
              </div>
            )}

            <form onSubmit={handleAssignSubscription} className="space-y-4 text-xs">
              <div>
                <label className="font-semibold text-ink block mb-1">Select SaaS Plan</label>
                <select
                  value={selectedPlanId}
                  onChange={(e) => setSelectedPlanId(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-line focus:ring-pine/30 focus:border-pine"
                >
                  {data.availablePlans.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} (₹{p.monthlyPrice}/mo, ₹{p.yearlyPrice}/yr)
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-ink block mb-1">Billing Period</label>
                  <select
                    value={billingPeriod}
                    onChange={(e) => setBillingPeriod(e.target.value as SaasBillingPeriod)}
                    className="w-full p-2.5 rounded-lg border border-line focus:ring-pine/30 focus:border-pine"
                  >
                    <option value={SaasBillingPeriod.MONTHLY}>MONTHLY</option>
                    <option value={SaasBillingPeriod.YEARLY}>YEARLY</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-ink block mb-1">Subscription Status</label>
                  <select
                    value={subscriptionStatus}
                    onChange={(e) => setSubscriptionStatus(e.target.value as SaasSubscriptionStatus)}
                    className="w-full p-2.5 rounded-lg border border-line focus:ring-pine/30 focus:border-pine"
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
                <label className="font-semibold text-ink block mb-1.5">
                  Custom Feature Overrides (Optional Super Admin Grant / Deny)
                </label>
                <div className="space-y-1.5 border border-line rounded-lg p-3 bg-canvas max-h-48 overflow-y-auto">
                  {ALL_SAAS_FEATURES.map((feat) => {
                    const currentOverride = overrides[feat.key];
                    return (
                      <div
                        key={feat.key}
                        className="flex items-center justify-between text-xs py-1.5 border-b border-line/60 last:border-0"
                      >
                        <span className="font-medium text-ink">{feat.name}</span>
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => toggleOverride(feat.key)}
                            className={`px-2 py-0.5 rounded text-[10px] font-bold transition ${
                              currentOverride === true
                                ? "bg-pine text-white"
                                : currentOverride === false
                                ? "bg-rose-600 text-white"
                                : "bg-white text-muted border border-line"
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

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-line">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsSubModalOpen(false)}
                  className="text-xs h-9 border-line hover:bg-canvas"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isAssigningSub}
                  className="text-xs h-9 bg-pine hover:bg-pine/90 text-white font-semibold"
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

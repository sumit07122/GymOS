"use client";

import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  createSaasPlanAction,
  updateSaasPlanAction,
} from "@/lib/actions/platform-admin";
import { ALL_SAAS_FEATURES } from "@/lib/saas/features";
import {
  CreditCard,
  Plus,
  Edit2,
  Loader2,
  AlertCircle,
  Building2,
  Package,
} from "lucide-react";
import { PageHeader } from "@/components/design-system/page-header";
import { StatCard } from "@/components/design-system/stat-card";

interface SaasPlanItem {
  id: string;
  name: string;
  code: string;
  description: string | null;
  monthlyPrice: number;
  yearlyPrice: number;
  trialDays: number;
  gracePeriodDays: number;
  maxMembers: number;
  maxStaff: number;
  maxClasses: number;
  features: string[];
  isActive: boolean;
  subscriberCount: number;
  createdAt: string;
}

interface SaasPlansManagerProps {
  initialPlans: SaasPlanItem[];
}

export function SaasPlansManager({ initialPlans }: SaasPlansManagerProps) {
  const [plans, setPlans] = React.useState<SaasPlanItem[]>(initialPlans);
  const [isCreateModalOpen, setIsCreateModalOpen] = React.useState(false);
  const [editingPlan, setEditingPlan] = React.useState<SaasPlanItem | null>(null);

  // Form State
  const [name, setName] = React.useState("");
  const [code, setCode] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [monthlyPrice, setMonthlyPrice] = React.useState("1999");
  const [yearlyPrice, setYearlyPrice] = React.useState("19990");
  const [trialDays, setTrialDays] = React.useState("14");
  const [gracePeriodDays, setGracePeriodDays] = React.useState("7");
  const [maxMembers, setMaxMembers] = React.useState("250");
  const [maxStaff, setMaxStaff] = React.useState("5");
  const [maxClasses, setMaxClasses] = React.useState("20");
  const [selectedFeatures, setSelectedFeatures] = React.useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [formError, setFormError] = React.useState<string | null>(null);

  const totalSubscribers = plans.reduce((acc, p) => acc + p.subscriberCount, 0);

  const resetForm = () => {
    setName("");
    setCode("");
    setDescription("");
    setMonthlyPrice("1999");
    setYearlyPrice("19990");
    setTrialDays("14");
    setGracePeriodDays("7");
    setMaxMembers("250");
    setMaxStaff("5");
    setMaxClasses("20");
    setSelectedFeatures(ALL_SAAS_FEATURES.map((f) => f.key));
    setFormError(null);
  };

  const handleOpenCreate = () => {
    resetForm();
    setIsCreateModalOpen(true);
  };

  const handleOpenEdit = (plan: SaasPlanItem) => {
    setEditingPlan(plan);
    setName(plan.name);
    setCode(plan.code);
    setDescription(plan.description || "");
    setMonthlyPrice(plan.monthlyPrice.toString());
    setYearlyPrice(plan.yearlyPrice.toString());
    setTrialDays(plan.trialDays.toString());
    setGracePeriodDays(plan.gracePeriodDays.toString());
    setMaxMembers(plan.maxMembers.toString());
    setMaxStaff(plan.maxStaff.toString());
    setMaxClasses(plan.maxClasses.toString());
    setSelectedFeatures(plan.features || []);
    setFormError(null);
  };

  const toggleFeature = (featKey: string) => {
    setSelectedFeatures((prev) =>
      prev.includes(featKey) ? prev.filter((f) => f !== featKey) : [...prev, featKey]
    );
  };

  const selectAllFeatures = () => {
    setSelectedFeatures(ALL_SAAS_FEATURES.map((f) => f.key));
  };

  const clearAllFeatures = () => {
    setSelectedFeatures([]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFormError(null);

    try {
      if (editingPlan) {
        const res = await updateSaasPlanAction(editingPlan.id, {
          name,
          description: description || undefined,
          monthlyPrice: Number(monthlyPrice),
          yearlyPrice: Number(yearlyPrice),
          trialDays: Number(trialDays),
          gracePeriodDays: Number(gracePeriodDays),
          maxMembers: Number(maxMembers),
          maxStaff: Number(maxStaff),
          maxClasses: Number(maxClasses),
          features: selectedFeatures,
        });

        if (res.success && res.plan) {
          setPlans((prev) =>
            prev.map((p) =>
              p.id === editingPlan.id
                ? {
                    ...p,
                    name: res.plan.name,
                    description: res.plan.description,
                    monthlyPrice: Number(res.plan.monthlyPrice),
                    yearlyPrice: Number(res.plan.yearlyPrice),
                    trialDays: res.plan.trialDays,
                    gracePeriodDays: res.plan.gracePeriodDays,
                    maxMembers: res.plan.maxMembers,
                    maxStaff: res.plan.maxStaff,
                    maxClasses: res.plan.maxClasses,
                    features: selectedFeatures,
                  }
                : p
            )
          );
          setEditingPlan(null);
        } else {
          setFormError(res.error || "Failed to update SaaS plan.");
        }
      } else {
        const res = await createSaasPlanAction({
          name,
          code: code.toUpperCase().trim(),
          description: description || undefined,
          monthlyPrice: Number(monthlyPrice),
          yearlyPrice: Number(yearlyPrice),
          trialDays: Number(trialDays),
          gracePeriodDays: Number(gracePeriodDays),
          maxMembers: Number(maxMembers),
          maxStaff: Number(maxStaff),
          maxClasses: Number(maxClasses),
          features: selectedFeatures,
          isActive: true,
        });

        if (res.success && res.plan) {
          window.location.reload();
        } else {
          setFormError(res.error || "Failed to create SaaS plan.");
        }
      }
    } catch {
      setFormError("Unexpected error occurred while saving plan.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        title="FIXIA SaaS Subscription Plans"
        description="Configure pricing tiers, usage quotas, and platform feature entitlement packages for commercial gym subscriptions."
        breadcrumbs={[
          { label: "Overview", href: "/platform-admin" },
          { label: "Plans" },
        ]}
        actions={
          <Button
            onClick={handleOpenCreate}
            className="bg-pine hover:bg-pine/90 text-white font-semibold text-xs h-9 rounded-lg gap-1.5 shadow-xs transition"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>New SaaS Plan</span>
          </Button>
        }
      />

      {/* KPI Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <StatCard
          label="Configured Plans"
          value={plans.length}
          icon={Package}
          subtext="Active license tiers"
        />
        <StatCard
          label="Subscribed Gyms"
          value={totalSubscribers}
          icon={Building2}
          subtext="Total gym deployments"
        />
        <StatCard
          label="Base Entry Tier"
          value={plans.length > 0 ? `₹${Math.min(...plans.map((p) => p.monthlyPrice))}/mo` : "N/A"}
          icon={CreditCard}
          subtext="Starting subscription price"
        />
      </div>

      {/* Plan Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <div
            key={plan.id}
            className="rounded-xl border border-line bg-white p-6 shadow-xs flex flex-col justify-between space-y-5"
          >
            <div>
              {/* Top Row: Name, Code & Subscriber Count */}
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="text-base font-bold text-ink">
                    {plan.name}
                  </h3>
                  <Badge variant="outline" className="font-mono text-[10px] uppercase font-bold mt-1 bg-canvas border-line text-ink">
                    {plan.code}
                  </Badge>
                </div>

                <Badge
                  variant="outline"
                  className="bg-pine-soft text-pine border-pine/30 text-xs font-semibold"
                >
                  {plan.subscriberCount} {plan.subscriberCount === 1 ? "gym" : "gyms"}
                </Badge>
              </div>

              {plan.description && (
                <p className="text-xs text-muted mt-2 line-clamp-2">
                  {plan.description}
                </p>
              )}

              {/* Pricing Display */}
              <div className="mt-4 pt-4 border-t border-line flex items-baseline gap-1">
                <span className="text-2xl font-bold text-ink">
                  ₹{plan.monthlyPrice.toLocaleString("en-IN")}
                </span>
                <span className="text-xs text-muted font-medium">/month</span>
                <span className="text-[11px] text-muted ml-2">
                  (₹{plan.yearlyPrice.toLocaleString("en-IN")}/yr)
                </span>
              </div>

              {/* Limits */}
              <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-line text-center">
                <div className="bg-canvas p-2 rounded-lg border border-line/60">
                  <span className="text-[10px] text-muted block font-semibold">Members</span>
                  <span className="text-xs font-bold text-ink">
                    {plan.maxMembers === -1 ? "Unlimited" : plan.maxMembers}
                  </span>
                </div>
                <div className="bg-canvas p-2 rounded-lg border border-line/60">
                  <span className="text-[10px] text-muted block font-semibold">Staff</span>
                  <span className="text-xs font-bold text-ink">
                    {plan.maxStaff === -1 ? "Unlimited" : plan.maxStaff}
                  </span>
                </div>
                <div className="bg-canvas p-2 rounded-lg border border-line/60">
                  <span className="text-[10px] text-muted block font-semibold">Classes</span>
                  <span className="text-xs font-bold text-ink">
                    {plan.maxClasses === -1 ? "Unlimited" : plan.maxClasses}
                  </span>
                </div>
              </div>

              {/* Feature Checklist */}
              <div className="mt-4 space-y-1.5 pt-2 border-t border-line">
                <span className="text-[11px] font-bold text-muted uppercase tracking-wider block mb-1">
                  Included Entitlements ({plan.features.length})
                </span>
                <div className="flex flex-wrap gap-1">
                  {plan.features.map((feat) => {
                    const featObj = ALL_SAAS_FEATURES.find((f) => f.key === feat);
                    return (
                      <span
                        key={feat}
                        className="px-2 py-0.5 rounded-md bg-pine-soft text-pine text-[10px] font-semibold border border-pine/20"
                      >
                        {featObj ? featObj.name : feat}
                      </span>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Bottom Edit Action */}
            <div className="pt-3 border-t border-line flex items-center justify-between">
              <span className="text-[11px] text-muted">
                {plan.trialDays}d trial • {plan.gracePeriodDays}d grace
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleOpenEdit(plan)}
                className="text-xs gap-1 h-8 border-line hover:bg-canvas text-ink"
              >
                <Edit2 className="h-3 w-3" />
                <span>Edit Plan</span>
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal for Create or Edit SaaS Plan */}
      {(isCreateModalOpen || editingPlan) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl max-w-xl w-full p-6 shadow-xl border border-line space-y-4 max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-line pb-3">
              <h3 className="text-sm font-bold text-ink">
                {editingPlan ? `Edit SaaS Plan: ${editingPlan.name}` : "Create New FIXIA SaaS Plan"}
              </h3>
            </div>

            {formError && (
              <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-ink block mb-1">Plan Name *</label>
                  <Input
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Starter Studio"
                    className="h-9 text-xs border-line focus:ring-pine/30 focus:border-pine"
                  />
                </div>
                <div>
                  <label className="font-semibold text-ink block mb-1">Unique Plan Code *</label>
                  <Input
                    required
                    disabled={!!editingPlan}
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="e.g. STARTER"
                    className="h-9 text-xs font-mono uppercase border-line focus:ring-pine/30 focus:border-pine"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-ink block mb-1">Description</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Target gym profile and plan summary..."
                  className="w-full text-xs p-2.5 rounded-lg border border-line focus:outline-hidden focus:ring-2 focus:ring-pine/30 focus:border-pine transition"
                />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="font-semibold text-ink block mb-1">Monthly (₹) *</label>
                  <Input
                    type="number"
                    step="0.01"
                    required
                    value={monthlyPrice}
                    onChange={(e) => setMonthlyPrice(e.target.value)}
                    className="h-9 text-xs border-line focus:ring-pine/30 focus:border-pine"
                  />
                </div>
                <div>
                  <label className="font-semibold text-ink block mb-1">Yearly (₹) *</label>
                  <Input
                    type="number"
                    step="0.01"
                    required
                    value={yearlyPrice}
                    onChange={(e) => setYearlyPrice(e.target.value)}
                    className="h-9 text-xs border-line focus:ring-pine/30 focus:border-pine"
                  />
                </div>
                <div>
                  <label className="font-semibold text-ink block mb-1">Trial Days</label>
                  <Input
                    type="number"
                    required
                    value={trialDays}
                    onChange={(e) => setTrialDays(e.target.value)}
                    className="h-9 text-xs border-line focus:ring-pine/30 focus:border-pine"
                  />
                </div>
                <div>
                  <label className="font-semibold text-ink block mb-1">Grace Period</label>
                  <Input
                    type="number"
                    required
                    value={gracePeriodDays}
                    onChange={(e) => setGracePeriodDays(e.target.value)}
                    className="h-9 text-xs border-line focus:ring-pine/30 focus:border-pine"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-semibold text-ink block mb-1">Max Members (-1=unlim)</label>
                  <Input
                    type="number"
                    required
                    value={maxMembers}
                    onChange={(e) => setMaxMembers(e.target.value)}
                    className="h-9 text-xs border-line focus:ring-pine/30 focus:border-pine"
                  />
                </div>
                <div>
                  <label className="font-semibold text-ink block mb-1">Max Staff</label>
                  <Input
                    type="number"
                    required
                    value={maxStaff}
                    onChange={(e) => setMaxStaff(e.target.value)}
                    className="h-9 text-xs border-line focus:ring-pine/30 focus:border-pine"
                  />
                </div>
                <div>
                  <label className="font-semibold text-ink block mb-1">Max Classes</label>
                  <Input
                    type="number"
                    required
                    value={maxClasses}
                    onChange={(e) => setMaxClasses(e.target.value)}
                    className="h-9 text-xs border-line focus:ring-pine/30 focus:border-pine"
                  />
                </div>
              </div>

              {/* Feature Entitlements Checkbox List */}
              <div className="space-y-2 pt-2 border-t border-line">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-ink block">
                    Feature Entitlements ({selectedFeatures.length} selected)
                  </label>
                  <div className="space-x-2">
                    <button
                      type="button"
                      onClick={selectAllFeatures}
                      className="text-[11px] text-pine font-semibold hover:underline"
                    >
                      Select All
                    </button>
                    <span>•</span>
                    <button
                      type="button"
                      onClick={clearAllFeatures}
                      className="text-[11px] text-muted font-semibold hover:underline"
                    >
                      Clear
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 border border-line rounded-lg p-3 bg-canvas max-h-48 overflow-y-auto">
                  {ALL_SAAS_FEATURES.map((feat) => {
                    const isChecked = selectedFeatures.includes(feat.key);
                    return (
                      <label
                        key={feat.key}
                        className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-white cursor-pointer transition-colors"
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleFeature(feat.key)}
                          className="rounded border-line text-pine focus:ring-pine h-3.5 w-3.5"
                        />
                        <span className="font-medium text-ink text-xs">
                          {feat.name}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-line">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsCreateModalOpen(false);
                    setEditingPlan(null);
                  }}
                  className="text-xs h-9 border-line hover:bg-canvas"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="text-xs h-9 bg-pine hover:bg-pine/90 text-white font-semibold"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <span>{editingPlan ? "Update Plan" : "Create Plan"}</span>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

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
} from "lucide-react";

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
  const [monthlyPrice, setMonthlyPrice] = React.useState("49");
  const [yearlyPrice, setYearlyPrice] = React.useState("490");
  const [trialDays, setTrialDays] = React.useState("14");
  const [gracePeriodDays, setGracePeriodDays] = React.useState("7");
  const [maxMembers, setMaxMembers] = React.useState("200");
  const [maxStaff, setMaxStaff] = React.useState("5");
  const [maxClasses, setMaxClasses] = React.useState("20");
  const [selectedFeatures, setSelectedFeatures] = React.useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [formError, setFormError] = React.useState<string | null>(null);

  const resetForm = () => {
    setName("");
    setCode("");
    setDescription("");
    setMonthlyPrice("49");
    setYearlyPrice("490");
    setTrialDays("14");
    setGracePeriodDays("7");
    setMaxMembers("200");
    setMaxStaff("5");
    setMaxClasses("20");
    setSelectedFeatures([]);
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <CreditCard className="h-6 w-6 text-slate-800" />
            <span>FIXIA SaaS Subscription Plans</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Configure pricing tiers, usage limits, and centralized feature entitlements for gym subscriptions.
          </p>
        </div>

        <Button
          onClick={handleOpenCreate}
          className="text-xs bg-slate-900 hover:bg-slate-800 text-white gap-1.5 self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          <span>New SaaS Plan</span>
        </Button>
      </div>

      {/* Plan Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <div
            key={plan.id}
            className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs flex flex-col justify-between space-y-5"
          >
            <div>
              {/* Top Row: Name, Code & Subscriber Count */}
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="text-lg font-black text-slate-900 tracking-tight">
                    {plan.name}
                  </h3>
                  <Badge variant="outline" className="font-mono text-[10px] uppercase font-bold mt-1">
                    {plan.code}
                  </Badge>
                </div>

                <Badge
                  variant="outline"
                  className="bg-emerald-50 text-emerald-700 border-emerald-200 text-xs font-bold"
                >
                  {plan.subscriberCount} {plan.subscriberCount === 1 ? "gym" : "gyms"}
                </Badge>
              </div>

              {plan.description && (
                <p className="text-xs text-slate-500 mt-2 line-clamp-2">
                  {plan.description}
                </p>
              )}

              {/* Pricing Display */}
              <div className="mt-4 pt-4 border-t border-slate-100 flex items-baseline gap-1">
                <span className="text-3xl font-black text-slate-900 tracking-tight">
                  ${plan.monthlyPrice}
                </span>
                <span className="text-xs text-slate-500 font-medium">/month</span>
                <span className="text-[11px] text-slate-400 ml-2">
                  (${plan.yearlyPrice}/yr)
                </span>
              </div>

              {/* Limits */}
              <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-slate-100 text-center">
                <div className="bg-slate-50 p-2 rounded-xl">
                  <span className="text-[10px] text-slate-400 block font-semibold">Members</span>
                  <span className="text-xs font-bold text-slate-800">
                    {plan.maxMembers === -1 ? "Unlimited" : plan.maxMembers}
                  </span>
                </div>
                <div className="bg-slate-50 p-2 rounded-xl">
                  <span className="text-[10px] text-slate-400 block font-semibold">Staff</span>
                  <span className="text-xs font-bold text-slate-800">
                    {plan.maxStaff === -1 ? "Unlimited" : plan.maxStaff}
                  </span>
                </div>
                <div className="bg-slate-50 p-2 rounded-xl">
                  <span className="text-[10px] text-slate-400 block font-semibold">Classes</span>
                  <span className="text-xs font-bold text-slate-800">
                    {plan.maxClasses === -1 ? "Unlimited" : plan.maxClasses}
                  </span>
                </div>
              </div>

              {/* Feature Checklist */}
              <div className="mt-4 space-y-1.5 pt-2 border-t border-slate-100">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                  Included Entitlements ({plan.features.length})
                </span>
                <div className="flex flex-wrap gap-1">
                  {plan.features.map((feat) => {
                    const featObj = ALL_SAAS_FEATURES.find((f) => f.key === feat);
                    return (
                      <span
                        key={feat}
                        className="px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 text-[10px] font-semibold border border-indigo-100"
                      >
                        {featObj ? featObj.name : feat}
                      </span>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Bottom Edit Action */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[11px] text-slate-400">
                {plan.trialDays}d trial • {plan.gracePeriodDays}d grace
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleOpenEdit(plan)}
                className="text-xs gap-1 h-8"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-xl border border-slate-200 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">
                {editingPlan ? `Edit SaaS Plan: ${editingPlan.name}` : "Create New FIXIA SaaS Plan"}
              </h3>
            </div>

            {formError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Plan Name</label>
                  <Input
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Starter Studio"
                    className="h-9 text-xs"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Unique Plan Code</label>
                  <Input
                    required
                    disabled={!!editingPlan}
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="e.g. STARTER"
                    className="h-9 text-xs font-mono uppercase"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Description</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Target gym profile and plan summary..."
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Monthly Price ($)</label>
                  <Input
                    type="number"
                    step="0.01"
                    required
                    value={monthlyPrice}
                    onChange={(e) => setMonthlyPrice(e.target.value)}
                    className="h-9 text-xs"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Yearly Price ($)</label>
                  <Input
                    type="number"
                    step="0.01"
                    required
                    value={yearlyPrice}
                    onChange={(e) => setYearlyPrice(e.target.value)}
                    className="h-9 text-xs"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Trial Days</label>
                  <Input
                    type="number"
                    required
                    value={trialDays}
                    onChange={(e) => setTrialDays(e.target.value)}
                    className="h-9 text-xs"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Grace Period</label>
                  <Input
                    type="number"
                    required
                    value={gracePeriodDays}
                    onChange={(e) => setGracePeriodDays(e.target.value)}
                    className="h-9 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Max Members (-1 = unlim)</label>
                  <Input
                    type="number"
                    required
                    value={maxMembers}
                    onChange={(e) => setMaxMembers(e.target.value)}
                    className="h-9 text-xs"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Max Staff</label>
                  <Input
                    type="number"
                    required
                    value={maxStaff}
                    onChange={(e) => setMaxStaff(e.target.value)}
                    className="h-9 text-xs"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Max Classes</label>
                  <Input
                    type="number"
                    required
                    value={maxClasses}
                    onChange={(e) => setMaxClasses(e.target.value)}
                    className="h-9 text-xs"
                  />
                </div>
              </div>

              {/* Feature Entitlements Checkbox List */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-slate-900 block">
                    Feature Entitlements ({selectedFeatures.length} selected)
                  </label>
                  <div className="space-x-2">
                    <button
                      type="button"
                      onClick={selectAllFeatures}
                      className="text-[11px] text-indigo-600 font-semibold hover:underline"
                    >
                      Select All
                    </button>
                    <span>•</span>
                    <button
                      type="button"
                      onClick={clearAllFeatures}
                      className="text-[11px] text-slate-500 font-semibold hover:underline"
                    >
                      Clear
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 border border-slate-200 rounded-xl p-3 bg-slate-50 max-h-48 overflow-y-auto">
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
                          className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 h-3.5 w-3.5"
                        />
                        <span className="font-medium text-slate-800 text-xs">
                          {feat.name}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsCreateModalOpen(false);
                    setEditingPlan(null);
                  }}
                  className="text-xs"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="text-xs bg-slate-900 hover:bg-slate-800 text-white"
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

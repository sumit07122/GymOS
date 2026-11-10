/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  Building2,
  User,
  CreditCard,
  Sliders,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ShieldCheck,
  Send,
  Copy,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { onboardGymAction } from "@/lib/actions/platform-admin";

interface OnboardGymFormProps {
  plans: Array<{
    id: string;
    name: string;
    code: string;
    monthlyPrice: number;
    quarterlyPrice: number | null;
    yearlyPrice: number;
    features: string[];
    maxMembers: number | null;
  }>;
}

export function OnboardGymForm({ plans }: OnboardGymFormProps) {
  const router = useRouter();
  const [isPending, setIsPending] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [resultData, setResultData] = React.useState<any | null>(null);

  // Form State
  const [formData, setFormData] = React.useState({
    name: "",
    slug: "",
    phone: "",
    email: "",
    city: "",
    country: "IN",
    currency: "INR",
    timezone: "Asia/Kolkata",
    openingHours: "Mon-Sat: 6:00 AM - 10:00 PM, Sun: Closed",

    ownerName: "",
    ownerEmail: "",
    ownerPassword: "",

    planId: plans[0]?.id || "",
    billingPeriod: "MONTHLY",
    customPricingOverride: "",
    trialDays: 14,
    maxMembersOverride: "",
    notes: "Manual onboarding via FIXIA Super Administration.",
  });

  // Feature overrides state
  const [featureOverrides, setFeatureOverrides] = React.useState<Record<string, boolean>>({
    CORE_MEMBERS: true,
    CORE_PLANS: true,
    ATTENDANCE_QR: true,
    BILLING_INVOICING: true,
    MEMBER_PORTAL: true,
    CRM_LEADS: true,
    EXPENSE_TRACKING: true,
    CLASS_SCHEDULING: true,
    INVENTORY_MANAGEMENT: true,
    WORKOUT_PLANS: true,
    PUBLIC_WEBSITE: true,
    WHATSAPP_NOTIFICATIONS: true,
    BUSINESS_ANALYTICS: true,
  });

  // Auto-generate slug from name if slug not touched
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    const generatedSlug = val
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
    setFormData((prev) => ({
      ...prev,
      name: val,
      slug: prev.slug === "" || prev.slug === prev.name.toLowerCase().replace(/[^a-z0-9]+/g, "-") ? generatedSlug : prev.slug,
    }));
  };

  const handleFeatureToggle = (key: string) => {
    setFeatureOverrides((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const generateRandomPassword = () => {
    const chars = "abcdefghjkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789!@#$%";
    let pass = "";
    for (let i = 0; i < 12; i++) {
      pass += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setFormData((prev) => ({ ...prev, ownerPassword: pass }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsPending(true);
    setError(null);

    try {
      const res = await onboardGymAction({
        name: formData.name,
        slug: formData.slug,
        phone: formData.phone,
        email: formData.email,
        city: formData.city,
        country: formData.country,
        currency: formData.currency,
        timezone: formData.timezone,
        openingHours: formData.openingHours || undefined,
        ownerName: formData.ownerName,
        ownerEmail: formData.ownerEmail,
        ownerPassword: formData.ownerPassword || undefined,
        planId: formData.planId,
        billingPeriod: formData.billingPeriod as any,
        customPricingOverride: formData.customPricingOverride ? parseFloat(formData.customPricingOverride) : undefined,
        trialDays: formData.trialDays,
        maxMembersOverride: formData.maxMembersOverride ? parseInt(formData.maxMembersOverride) : undefined,
        notes: formData.notes || undefined,
        featureOverrides,
      });

      if (res && !res.success) {
        setError(res.error || "Onboarding failed. Please review inputs.");
      } else if (res && res.success) {
        setResultData(res.data);
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred during onboarding.");
    } finally {
      setIsPending(false);
    }
  };

  const [copied, setCopied] = React.useState(false);
  const copyCredentials = () => {
    if (!resultData) return;
    const text = `FIXIA GymOS Workspace Provisioned!\nGym: ${resultData.gym.name}\nDashboard URL: https://gms.fixia.in/owner/dashboard\nGym Website: https://gms.fixia.in/g/${resultData.gym.slug}\nOwner Email: ${resultData.owner.email}\nTemporary Password: ${resultData.temporaryPassword || "(as set)"}\nInvitation Code: ${resultData.invitation?.token || "N/A"}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  if (resultData) {
    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="rounded-2xl border border-emerald-500/30 bg-emerald-950/40 p-6 text-slate-100 shadow-xl backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-lg">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">
                Workspace Successfully Provisioned!
              </h2>
              <p className="text-xs text-emerald-300">
                Tenant <strong>{resultData.gym.name}</strong> is live and initialized with isolated database context.
              </p>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-4 space-y-2">
              <div className="text-[11px] font-bold uppercase text-slate-400">Gym Workspace</div>
              <div className="font-semibold text-white text-sm">{resultData.gym.name}</div>
              <div className="text-slate-400">Slug: <span className="font-mono text-indigo-400">/{resultData.gym.slug}</span></div>
              <div className="text-slate-400">Plan: <Badge variant="outline" className="bg-indigo-950 text-indigo-300 border-indigo-800">{resultData.subscription.plan.name}</Badge></div>
              <div className="text-slate-400">Trial Period: <strong className="text-white">{resultData.subscription.trialEndsAt ? new Date(resultData.subscription.trialEndsAt).toLocaleDateString() : "None"}</strong></div>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-4 space-y-2">
              <div className="text-[11px] font-bold uppercase text-slate-400">Owner Credentials</div>
              <div className="font-semibold text-white text-sm">{resultData.owner.name}</div>
              <div className="text-slate-400">Email: <span className="font-mono text-slate-200">{resultData.owner.email}</span></div>
              <div className="text-slate-400">
                Password: <span className="font-mono bg-slate-950 px-2 py-0.5 rounded text-amber-400 border border-slate-800">{resultData.temporaryPassword || "(Entered during onboarding)"}</span>
              </div>
              <div className="text-slate-400">Status: <Badge variant="outline" className="bg-emerald-950 text-emerald-300 border-emerald-800">ACTIVE</Badge></div>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Button
              onClick={copyCredentials}
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs gap-2"
            >
              <Copy className="h-4 w-4" />
              <span>{copied ? "Copied Credentials!" : "Copy Welcome Packet"}</span>
            </Button>
            <Button
              variant="outline"
              onClick={() => router.push(`/platform-admin/gyms/${resultData.gym.id}`)}
              className="border-slate-700 bg-slate-800 hover:bg-slate-700 text-white text-xs gap-1.5"
            >
              <span>View Gym Details</span>
              <ExternalLink className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="ghost"
              onClick={() => {
                setResultData(null);
                setFormData((prev) => ({
                  ...prev,
                  name: "",
                  slug: "",
                  phone: "",
                  email: "",
                  city: "",
                  ownerName: "",
                  ownerEmail: "",
                  ownerPassword: "",
                }));
              }}
              className="text-slate-400 hover:text-white text-xs"
            >
              Onboard Another Gym
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-4xl mx-auto space-y-6">
      {error && (
        <div className="rounded-xl border border-rose-500/30 bg-rose-950/40 p-4 text-xs text-rose-300 flex items-start gap-2.5">
          <AlertCircle className="h-5 w-5 shrink-0 text-rose-400 mt-0.5" />
          <div>
            <div className="font-bold text-rose-200">Onboarding Validation Error</div>
            <p className="mt-0.5">{error}</p>
          </div>
        </div>
      )}

      {/* 1. Gym Business Details */}
      <Card className="border-slate-800 bg-slate-950/70 text-slate-100 shadow-md">
        <CardHeader className="pb-4">
          <CardTitle className="text-base font-bold flex items-center gap-2 text-white">
            <Building2 className="h-5 w-5 text-indigo-400" />
            <span>1. Gym Business Information</span>
          </CardTitle>
          <CardDescription className="text-xs text-slate-400">
            Legal identity, localization, and public routing identifiers.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5 sm:col-span-2">
            <label className="text-xs font-semibold text-slate-300">Gym Legal / Display Name *</label>
            <Input
              required
              placeholder="e.g. IronForge Elite Fitness"
              value={formData.name}
              onChange={handleNameChange}
              className="bg-slate-900 border-slate-700 text-white text-xs h-9"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Tenant Slug (URL Identifier) *</label>
            <div className="flex items-center">
              <span className="text-xs text-slate-500 bg-slate-900 border border-r-0 border-slate-700 px-2.5 h-9 flex items-center rounded-l-md font-mono">
                /g/
              </span>
              <Input
                required
                placeholder="ironforge-elite"
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]+/g, "") })}
                className="bg-slate-900 border-slate-700 text-white text-xs h-9 rounded-l-none font-mono"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Official Gym Phone *</label>
            <Input
              required
              placeholder="+91 98765 43210"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="bg-slate-900 border-slate-700 text-white text-xs h-9"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Official Gym Email *</label>
            <Input
              required
              type="email"
              placeholder="contact@ironforge.in"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="bg-slate-900 border-slate-700 text-white text-xs h-9"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">City *</label>
            <Input
              required
              placeholder="e.g. Mumbai, Bengaluru"
              value={formData.city}
              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              className="bg-slate-900 border-slate-700 text-white text-xs h-9"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Country Code</label>
            <Input
              value={formData.country}
              onChange={(e) => setFormData({ ...formData, country: e.target.value.toUpperCase() })}
              className="bg-slate-900 border-slate-700 text-white text-xs h-9 font-mono"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Currency Code</label>
            <Input
              value={formData.currency}
              onChange={(e) => setFormData({ ...formData, currency: e.target.value.toUpperCase() })}
              className="bg-slate-900 border-slate-700 text-white text-xs h-9 font-mono"
            />
          </div>

          <div className="space-y-1.5 sm:col-span-2">
            <label className="text-xs font-semibold text-slate-300">Operating Schedule</label>
            <Input
              placeholder="Mon-Sat: 6:00 AM - 10:00 PM, Sun: Closed"
              value={formData.openingHours}
              onChange={(e) => setFormData({ ...formData, openingHours: e.target.value })}
              className="bg-slate-900 border-slate-700 text-white text-xs h-9"
            />
          </div>
        </CardContent>
      </Card>

      {/* 2. Gym Owner Account */}
      <Card className="border-slate-800 bg-slate-950/70 text-slate-100 shadow-md">
        <CardHeader className="pb-4">
          <CardTitle className="text-base font-bold flex items-center gap-2 text-white">
            <User className="h-5 w-5 text-emerald-400" />
            <span>2. Gym Owner Credentials</span>
          </CardTitle>
          <CardDescription className="text-xs text-slate-400">
            The primary administrator assigned with OWNER role authority for this gym.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Owner Full Name *</label>
            <Input
              required
              placeholder="e.g. Rajesh Sharma"
              value={formData.ownerName}
              onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })}
              className="bg-slate-900 border-slate-700 text-white text-xs h-9"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Owner Email Address *</label>
            <Input
              required
              type="email"
              placeholder="owner@ironforge.in"
              value={formData.ownerEmail}
              onChange={(e) => setFormData({ ...formData, ownerEmail: e.target.value })}
              className="bg-slate-900 border-slate-700 text-white text-xs h-9"
            />
          </div>

          <div className="space-y-1.5 sm:col-span-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-300">Password</label>
              <button
                type="button"
                onClick={generateRandomPassword}
                className="text-[11px] text-indigo-400 hover:text-indigo-300 font-semibold"
              >
                Auto-generate secure password
              </button>
            </div>
            <Input
              type="text"
              placeholder="Leave blank to auto-generate, or enter at least 8 characters"
              value={formData.ownerPassword}
              onChange={(e) => setFormData({ ...formData, ownerPassword: e.target.value })}
              className="bg-slate-900 border-slate-700 text-white text-xs h-9 font-mono"
            />
          </div>
        </CardContent>
      </Card>

      {/* 3. SaaS Subscription Package */}
      <Card className="border-slate-800 bg-slate-950/70 text-slate-100 shadow-md">
        <CardHeader className="pb-4">
          <CardTitle className="text-base font-bold flex items-center gap-2 text-white">
            <CreditCard className="h-5 w-5 text-indigo-400" />
            <span>3. SaaS Subscription Package & Custom Pricing</span>
          </CardTitle>
          <CardDescription className="text-xs text-slate-400">
            Select base plan, configure custom price overrides, and set trial periods.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Base SaaS Tier *</label>
            <select
              value={formData.planId}
              onChange={(e) => setFormData({ ...formData, planId: e.target.value })}
              className="w-full bg-slate-900 border border-slate-700 rounded-md text-white text-xs h-9 px-3"
            >
              {plans.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({formData.currency} {p.monthlyPrice}/mo &bull; {p.maxMembers ? `Max ${p.maxMembers} members` : "Unlimited"})
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Billing Cycle</label>
            <select
              value={formData.billingPeriod}
              onChange={(e) => setFormData({ ...formData, billingPeriod: e.target.value })}
              className="w-full bg-slate-900 border border-slate-700 rounded-md text-white text-xs h-9 px-3"
            >
              <option value="MONTHLY">Monthly</option>
              <option value="QUARTERLY">Quarterly</option>
              <option value="YEARLY">Annual (Yearly)</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Custom Price Override (Optional)</label>
            <Input
              type="number"
              step="0.01"
              placeholder="e.g. 1999 (Overrides plan price)"
              value={formData.customPricingOverride}
              onChange={(e) => setFormData({ ...formData, customPricingOverride: e.target.value })}
              className="bg-slate-900 border-slate-700 text-white text-xs h-9"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Trial Period (Days)</label>
            <Input
              type="number"
              min="0"
              max="365"
              value={formData.trialDays}
              onChange={(e) => setFormData({ ...formData, trialDays: parseInt(e.target.value) || 0 })}
              className="bg-slate-900 border-slate-700 text-white text-xs h-9"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Max Member Limit Override</label>
            <Input
              type="number"
              placeholder="Leave blank for plan default"
              value={formData.maxMembersOverride}
              onChange={(e) => setFormData({ ...formData, maxMembersOverride: e.target.value })}
              className="bg-slate-900 border-slate-700 text-white text-xs h-9"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Administrative Notes</label>
            <Input
              placeholder="e.g. Negotiated annual contract"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="bg-slate-900 border-slate-700 text-white text-xs h-9"
            />
          </div>
        </CardContent>
      </Card>

      {/* 4. Feature Entitlements */}
      <Card className="border-slate-800 bg-slate-950/70 text-slate-100 shadow-md">
        <CardHeader className="pb-4">
          <CardTitle className="text-base font-bold flex items-center gap-2 text-white">
            <Sliders className="h-5 w-5 text-amber-400" />
            <span>4. Feature Entitlement Flags</span>
          </CardTitle>
          <CardDescription className="text-xs text-slate-400">
            Granularly grant or restrict platform modules for this tenant workspace.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {Object.entries(featureOverrides).map(([key, enabled]) => (
              <button
                type="button"
                key={key}
                onClick={() => handleFeatureToggle(key)}
                className={`p-3 rounded-xl border text-left transition-all flex items-center justify-between cursor-pointer ${
                  enabled
                    ? "bg-indigo-950/40 border-indigo-700 text-white"
                    : "bg-slate-900/60 border-slate-800 text-slate-400"
                }`}
              >
                <div>
                  <div className="text-xs font-bold">{key.replace(/_/g, " ")}</div>
                  <div className="text-[10px] text-slate-400">
                    {enabled ? "Enabled in workspace" : "Disabled / Locked"}
                  </div>
                </div>
                <div
                  className={`size-4 rounded-full border flex items-center justify-center ${
                    enabled
                      ? "bg-indigo-600 border-indigo-500 text-white"
                      : "border-slate-700 bg-slate-950"
                  }`}
                >
                  {enabled && <CheckCircle2 className="h-3 w-3" />}
                </div>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Submit Action */}
      <div className="pt-2 flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <ShieldCheck className="h-4 w-4 text-emerald-400" />
          <span>Provisioning creates isolated tenant RLS boundaries and audit logs.</span>
        </div>

        <Button
          type="submit"
          disabled={isPending}
          className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs h-11 px-6 gap-2 shadow-lg shadow-indigo-600/30"
        >
          {isPending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Provisioning Workspace...</span>
            </>
          ) : (
            <>
              <Send className="h-4 w-4" />
              <span>Complete Gym Onboarding</span>
            </>
          )}
        </Button>
      </div>
    </form>
  );
}

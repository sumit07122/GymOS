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
  ChevronRight,
  ChevronLeft,
  Key,
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
    description?: string | null;
    monthlyPrice: number;
    quarterlyPrice: number | null;
    yearlyPrice: number;
    features: string[];
    maxMembers: number | null;
  }>;
}

const STEPS = [
  { id: 1, title: "Gym Profile", desc: "Identity & routing", icon: Building2 },
  { id: 2, title: "Owner Account", desc: "Credentials & admin", icon: User },
  { id: 3, title: "SaaS Package", desc: "Pricing & tier", icon: CreditCard },
  { id: 4, title: "Entitlements", desc: "Modules & flags", icon: Sliders },
  { id: 5, title: "Review & Provision", desc: "Confirm & launch", icon: ShieldCheck },
];

export function cleanErrorMessage(raw: string | null): string {
  if (!raw) return "";
  const trimmed = raw.trim();
  if ((trimmed.startsWith("[") || trimmed.startsWith("{")) && (trimmed.includes('"message"') || trimmed.includes('"code"') || trimmed.includes('"path"'))) {
    try {
      const parsed = JSON.parse(trimmed);
      if (Array.isArray(parsed)) {
        return parsed
          .map((item: any) => item.message || (item.path ? `${item.path.join(".")}: ${item.code}` : JSON.stringify(item)))
          .filter(Boolean)
          .join(". ");
      } else if (parsed && typeof parsed === "object" && parsed.message) {
        return String(parsed.message);
      }
    } catch {
      // fallback
    }
  }
  return raw;
}

export function OnboardGymForm({ plans }: OnboardGymFormProps) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = React.useState(1);
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

  // Auto-generate slug from name if slug not manually edited
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

  // Step validation before advancing
  const canAdvance = (step: number): boolean => {
    if (step === 1) {
      if (!formData.name.trim() || !formData.slug.trim() || !formData.phone.trim() || !formData.email.trim() || !formData.city.trim()) {
        setError("Please fill in all mandatory fields with valid values before proceeding.");
        return false;
      }
      return true;
    }
    if (step === 2) {
      if (!formData.ownerName.trim()) {
        setError("Owner full name is required.");
        return false;
      }
      if (!formData.ownerEmail.trim()) {
        setError("Owner business email is required.");
        return false;
      }
      const pass = formData.ownerPassword?.trim();
      if (pass && pass.length > 0 && pass.length < 8) {
        setError(`Password must be at least 8 characters (currently ${pass.length} characters). You can also leave it blank to auto-generate.`);
        return false;
      }
      return true;
    }
    if (step === 3) {
      if (!formData.planId) {
        setError("Please select a SaaS subscription plan.");
        return false;
      }
      return true;
    }
    return true;
  };

  const handleNext = () => {
    setError(null);
    if (!canAdvance(currentStep)) {
      return;
    }
    setCurrentStep((prev) => Math.min(prev + 1, 5));
  };

  const handleBack = () => {
    setError(null);
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsPending(true);
    setError(null);

    const trimmedPass = formData.ownerPassword?.trim();
    if (trimmedPass && trimmedPass.length > 0 && trimmedPass.length < 8) {
      setError(`Password must be at least 8 characters (currently ${trimmedPass.length} characters). You can also leave it blank to auto-generate.`);
      setCurrentStep(2);
      setIsPending(false);
      return;
    }

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
        ownerPassword: trimmedPass && trimmedPass.length >= 8 ? trimmedPass : undefined,
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
    const tempPassword = resultData.owner?.temporaryPassword || resultData.temporaryPassword || "(as configured)";
    const text = `FIXIA GymOS Workspace Provisioned!\nGym: ${resultData.gym.name}\nDashboard URL: https://gms.fixia.in/owner/dashboard\nGym Website: https://gms.fixia.in/g/${resultData.gym.slug}\nOwner Email: ${resultData.owner.email}\nTemporary Password: ${tempPassword}\nInvitation Code: ${resultData.invitation?.token || "N/A"}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  // Success view
  if (resultData) {
    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="rounded-xl border border-pine/30 bg-white p-6 text-ink shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-pine-soft text-pine">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-ink">
                Gym Workspace Successfully Provisioned!
              </h2>
              <p className="text-xs text-muted">
                Tenant <strong>{resultData.gym.name}</strong> is live and initialized with strict tenant database isolation.
              </p>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="rounded-lg border border-line bg-canvas p-4 space-y-2">
              <div className="text-[11px] font-bold uppercase tracking-wider text-muted">Gym Workspace</div>
              <div className="font-semibold text-ink text-sm">{resultData.gym.name}</div>
              <div className="text-muted">Slug: <span className="font-mono text-pine">/{resultData.gym.slug}</span></div>
              <div className="text-muted">Plan: <Badge variant="outline" className="bg-pine-soft text-pine border-pine/30">{resultData.subscription?.plan?.name || resultData.subscription?.planName || "SaaS Plan"}</Badge></div>
              <div className="text-muted">Trial Period: <strong className="text-ink">{resultData.subscription?.trialEndsAt ? new Date(resultData.subscription.trialEndsAt).toLocaleDateString() : "None"}</strong></div>
            </div>

            <div className="rounded-lg border border-line bg-canvas p-4 space-y-2">
              <div className="text-[11px] font-bold uppercase tracking-wider text-muted">Owner Credentials</div>
              <div className="font-semibold text-ink text-sm">{resultData.owner.name}</div>
              <div className="text-muted">Email: <span className="font-mono text-ink">{resultData.owner.email}</span></div>
              <div className="text-muted">
                Password: <span className="font-mono bg-white px-2 py-0.5 rounded text-amber-700 border border-line">{resultData.owner?.temporaryPassword || resultData.temporaryPassword || "(Entered during onboarding)"}</span>
              </div>
              <div className="text-muted">Role: <Badge variant="outline" className="bg-pine-soft text-pine border-pine/30">OWNER</Badge></div>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-3 pt-4 border-t border-line">
            <Button
              onClick={copyCredentials}
              className="bg-pine hover:bg-pine/90 text-white font-semibold text-xs h-9 rounded-lg gap-2 shadow-xs transition"
            >
              <Copy className="h-3.5 w-3.5" />
              <span>{copied ? "Copied Welcome Packet!" : "Copy Welcome Packet"}</span>
            </Button>
            <Button
              variant="outline"
              onClick={() => router.push(`/platform-admin/gyms/${resultData.gym.id}`)}
              className="border-line text-ink hover:bg-canvas text-xs h-9 gap-1.5"
            >
              <span>View Gym Details</span>
              <ExternalLink className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="ghost"
              onClick={() => {
                setResultData(null);
                setCurrentStep(1);
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
              className="text-muted hover:text-ink text-xs h-9"
            >
              Onboard Another Gym
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const selectedPlan = plans.find((p) => p.id === formData.planId) || plans[0];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* 5-Step Stepper Ribbon */}
      <div className="bg-white rounded-xl border border-line p-3 sm:p-4 shadow-xs">
        <div className="grid grid-cols-5 gap-2 text-center">
          {STEPS.map((s) => {
            const Icon = s.icon;
            const isCompleted = currentStep > s.id;
            const isCurrent = currentStep === s.id;

            return (
              <button
                type="button"
                key={s.id}
                onClick={() => {
                  if (s.id < currentStep) setCurrentStep(s.id);
                }}
                disabled={s.id > currentStep}
                className={`flex flex-col items-center gap-1.5 p-2 rounded-lg transition text-left sm:text-center ${
                  isCurrent
                    ? "bg-pine-soft text-pine font-bold"
                    : isCompleted
                    ? "text-pine cursor-pointer hover:bg-canvas"
                    : "text-muted opacity-50 cursor-not-allowed"
                }`}
              >
                <div
                  className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${
                    isCurrent
                      ? "bg-pine text-white"
                      : isCompleted
                      ? "bg-pine/20 text-pine"
                      : "bg-canvas text-muted border border-line"
                  }`}
                >
                  {isCompleted ? <CheckCircle2 className="h-4 w-4" /> : <Icon className="h-3.5 w-3.5" />}
                </div>
                <div className="hidden sm:block">
                  <div className="text-xs leading-none font-semibold">{s.title}</div>
                  <div className="text-[10px] text-muted mt-0.5">{s.desc}</div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-xs text-rose-800 flex items-start justify-between gap-3 shadow-xs">
          <div className="flex items-start gap-2.5">
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-600 mt-0.5" />
            <div>
              <div className="font-bold text-rose-900">Validation Error</div>
              <p className="mt-0.5 text-rose-800">{cleanErrorMessage(error)}</p>
            </div>
          </div>
          {error.toLowerCase().includes("password") && currentStep === 5 && (
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => {
                setCurrentStep(2);
                setError(null);
              }}
              className="border-rose-300 text-rose-800 hover:bg-rose-100 text-xs shrink-0 bg-white"
            >
              Fix Password in Step 2
            </Button>
          )}
        </div>
      )}

      {/* Wizard Step Content */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Step 1: Gym Business Profile */}
        {currentStep === 1 && (
          <Card className="border-line bg-white shadow-xs">
            <CardHeader className="pb-4">
              <CardTitle className="text-sm font-bold flex items-center gap-2 text-ink">
                <Building2 className="h-4 w-4 text-pine" />
                <span>Step 1: Gym Business Information</span>
              </CardTitle>
              <CardDescription className="text-xs text-muted">
                Official business identity, localization, and public routing identifiers.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-xs font-semibold text-ink">Gym Legal / Display Name *</label>
                <Input
                  required
                  placeholder="e.g. IronForge Elite Fitness"
                  value={formData.name}
                  onChange={handleNameChange}
                  className="bg-white border-line text-ink text-xs h-9 focus:ring-pine/30 focus:border-pine"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-ink">Tenant Slug (URL Identifier) *</label>
                <div className="flex items-center">
                  <span className="text-xs text-muted bg-canvas border border-r-0 border-line px-2.5 h-9 flex items-center rounded-l-md font-mono">
                    /g/
                  </span>
                  <Input
                    required
                    placeholder="ironforge-elite"
                    value={formData.slug}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]+/g, ""),
                      })
                    }
                    className="bg-white border-line text-ink text-xs h-9 rounded-l-none font-mono focus:ring-pine/30 focus:border-pine"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-ink">Official Gym Phone *</label>
                <Input
                  required
                  placeholder="+91 98765 43210"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="bg-white border-line text-ink text-xs h-9 focus:ring-pine/30 focus:border-pine"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-ink">Official Gym Email *</label>
                <Input
                  required
                  type="email"
                  placeholder="contact@ironforge.in"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="bg-white border-line text-ink text-xs h-9 focus:ring-pine/30 focus:border-pine"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-ink">City *</label>
                <Input
                  required
                  placeholder="e.g. Mumbai, Bengaluru"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="bg-white border-line text-ink text-xs h-9 focus:ring-pine/30 focus:border-pine"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-ink">Country Code</label>
                <Input
                  value={formData.country}
                  onChange={(e) => setFormData({ ...formData, country: e.target.value.toUpperCase() })}
                  className="bg-white border-line text-ink text-xs h-9 font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-ink">Currency Code</label>
                <Input
                  value={formData.currency}
                  onChange={(e) => setFormData({ ...formData, currency: e.target.value.toUpperCase() })}
                  className="bg-white border-line text-ink text-xs h-9 font-mono"
                />
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-xs font-semibold text-ink">Operating Schedule</label>
                <Input
                  placeholder="Mon-Sat: 6:00 AM - 10:00 PM, Sun: Closed"
                  value={formData.openingHours}
                  onChange={(e) => setFormData({ ...formData, openingHours: e.target.value })}
                  className="bg-white border-line text-ink text-xs h-9 focus:ring-pine/30 focus:border-pine"
                />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Owner Account */}
        {currentStep === 2 && (
          <Card className="border-line bg-white shadow-xs">
            <CardHeader className="pb-4">
              <CardTitle className="text-sm font-bold flex items-center gap-2 text-ink">
                <User className="h-4 w-4 text-pine" />
                <span>Step 2: Gym Owner Credentials</span>
              </CardTitle>
              <CardDescription className="text-xs text-muted">
                The primary administrator provisioned with OWNER role authority for this gym tenant.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-ink">Owner Full Name *</label>
                <Input
                  required
                  placeholder="e.g. Rajesh Sharma"
                  value={formData.ownerName}
                  onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })}
                  className="bg-white border-line text-ink text-xs h-9 focus:ring-pine/30 focus:border-pine"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-ink">Owner Business Email *</label>
                <Input
                  required
                  type="email"
                  placeholder="owner@ironforge.in"
                  value={formData.ownerEmail}
                  onChange={(e) => setFormData({ ...formData, ownerEmail: e.target.value })}
                  className="bg-white border-line text-ink text-xs h-9 focus:ring-pine/30 focus:border-pine"
                />
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-ink">Password</label>
                  <button
                    type="button"
                    onClick={generateRandomPassword}
                    className="text-[11px] text-pine hover:underline font-semibold flex items-center gap-1"
                  >
                    <Key className="h-3 w-3" />
                    <span>Auto-generate secure password</span>
                  </button>
                </div>
                <Input
                  type="text"
                  placeholder="Leave blank to auto-generate, or enter at least 8 characters"
                  value={formData.ownerPassword}
                  onChange={(e) => {
                    setError(null);
                    setFormData({ ...formData, ownerPassword: e.target.value });
                  }}
                  className={`bg-white border-line text-ink text-xs h-9 font-mono focus:ring-pine/30 focus:border-pine ${
                    formData.ownerPassword && formData.ownerPassword.trim().length > 0 && formData.ownerPassword.trim().length < 8
                      ? "border-amber-400 focus:border-amber-500"
                      : ""
                  }`}
                />
                {formData.ownerPassword && formData.ownerPassword.trim().length > 0 && formData.ownerPassword.trim().length < 8 && (
                  <p className="text-[11px] text-amber-600 font-medium flex items-center gap-1 mt-1">
                    <AlertCircle className="h-3 w-3 shrink-0" />
                    <span>Password must be at least 8 characters (currently {formData.ownerPassword.trim().length} characters).</span>
                  </p>
                )}
                {formData.ownerPassword && formData.ownerPassword.trim().length >= 8 && (
                  <p className="text-[11px] text-emerald-600 font-medium flex items-center gap-1 mt-1">
                    <CheckCircle2 className="h-3 w-3 shrink-0" />
                    <span>Valid password ({formData.ownerPassword.trim().length} characters).</span>
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 3: SaaS Subscription Package & Custom Pricing */}
        {currentStep === 3 && (
          <Card className="border-line bg-white shadow-xs">
            <CardHeader className="pb-4">
              <CardTitle className="text-sm font-bold flex items-center gap-2 text-ink">
                <CreditCard className="h-4 w-4 text-pine" />
                <span>Step 3: SaaS Subscription Package & Custom Pricing</span>
              </CardTitle>
              <CardDescription className="text-xs text-muted">
                Select base commercial tier, negotiate custom price overrides, and configure trial windows.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-xs font-semibold text-ink">Select Commercial Plan *</label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {plans.map((p) => {
                    const isSelected = formData.planId === p.id;
                    return (
                      <div
                        key={p.id}
                        onClick={() => setFormData({ ...formData, planId: p.id })}
                        className={`p-3.5 rounded-xl border text-left cursor-pointer transition relative ${
                          isSelected
                            ? "border-pine bg-pine-soft/40 ring-1 ring-pine/30 shadow-xs"
                            : "border-line bg-white hover:border-slate-300"
                        }`}
                      >
                        {p.code === "GROWTH" && (
                          <span className="absolute -top-2.5 right-3 bg-pine text-white text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                            Recommended
                          </span>
                        )}
                        <div className="flex items-center justify-between">
                          <h4 className="text-xs font-bold text-ink">{p.name}</h4>
                          <div
                            className={`h-4 w-4 rounded-full border flex items-center justify-center shrink-0 ${
                              isSelected ? "bg-pine border-pine text-white" : "border-line bg-white"
                            }`}
                          >
                            {isSelected && <CheckCircle2 className="h-3 w-3" />}
                          </div>
                        </div>
                        <div className="mt-2 text-lg font-black text-ink">
                          {formData.currency === "INR" ? "₹" : "$"}{p.monthlyPrice}
                          <span className="text-[10px] font-normal text-muted">/mo</span>
                        </div>
                        <p className="mt-1 text-[11px] text-muted line-clamp-2">
                          {p.description || "Full operational access and features."}
                        </p>
                        <div className="mt-2 text-[10px] font-semibold text-pine">
                          {p.maxMembers && p.maxMembers > 0 ? `Up to ${p.maxMembers} members` : "Unlimited members"}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-ink">Billing Cycle</label>
                <select
                  value={formData.billingPeriod}
                  onChange={(e) => setFormData({ ...formData, billingPeriod: e.target.value })}
                  className="w-full bg-white border border-line rounded-lg text-ink text-xs h-9 px-3 focus:ring-pine/30 focus:border-pine"
                >
                  <option value="MONTHLY">Monthly</option>
                  <option value="QUARTERLY">Quarterly</option>
                  <option value="YEARLY">Annual (Yearly)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-ink">Custom Price Override (Optional)</label>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="e.g. 1999 (Overrides plan price)"
                  value={formData.customPricingOverride}
                  onChange={(e) => setFormData({ ...formData, customPricingOverride: e.target.value })}
                  className="bg-white border-line text-ink text-xs h-9 focus:ring-pine/30 focus:border-pine"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-ink">Trial Period (Days)</label>
                <Input
                  type="number"
                  min="0"
                  max="365"
                  value={formData.trialDays}
                  onChange={(e) => setFormData({ ...formData, trialDays: parseInt(e.target.value) || 0 })}
                  className="bg-white border-line text-ink text-xs h-9 focus:ring-pine/30 focus:border-pine"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-ink">Max Member Limit Override</label>
                <Input
                  type="number"
                  placeholder="Leave blank for plan default"
                  value={formData.maxMembersOverride}
                  onChange={(e) => setFormData({ ...formData, maxMembersOverride: e.target.value })}
                  className="bg-white border-line text-ink text-xs h-9 focus:ring-pine/30 focus:border-pine"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-ink">Administrative Notes</label>
                <Input
                  placeholder="e.g. Negotiated annual contract"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="bg-white border-line text-ink text-xs h-9 focus:ring-pine/30 focus:border-pine"
                />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 4: Feature Entitlement Flags */}
        {currentStep === 4 && (
          <Card className="border-line bg-white shadow-xs">
            <CardHeader className="pb-4">
              <CardTitle className="text-sm font-bold flex items-center gap-2 text-ink">
                <Sliders className="h-4 w-4 text-pine" />
                <span>Step 4: Feature Entitlement Flags</span>
              </CardTitle>
              <CardDescription className="text-xs text-muted">
                Granularly grant or restrict platform capabilities for this tenant workspace.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {Object.entries(featureOverrides).map(([key, enabled]) => (
                  <button
                    type="button"
                    key={key}
                    onClick={() => handleFeatureToggle(key)}
                    className={`p-3 rounded-lg border text-left transition flex items-center justify-between cursor-pointer ${
                      enabled
                        ? "bg-pine-soft/40 border-pine/30 text-ink"
                        : "bg-canvas border-line text-muted"
                    }`}
                  >
                    <div>
                      <div className="text-xs font-bold">{key.replace(/_/g, " ")}</div>
                      <div className="text-[10px] text-muted">
                        {enabled ? "Enabled in workspace" : "Disabled / Locked"}
                      </div>
                    </div>
                    <div
                      className={`h-4 w-4 rounded-full border flex items-center justify-center shrink-0 ${
                        enabled
                          ? "bg-pine border-pine text-white"
                          : "border-line bg-white"
                      }`}
                    >
                      {enabled && <CheckCircle2 className="h-3 w-3" />}
                    </div>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 5: Review & Provision */}
        {currentStep === 5 && (
          <Card className="border-line bg-white shadow-xs">
            <CardHeader className="pb-4">
              <CardTitle className="text-sm font-bold flex items-center gap-2 text-ink">
                <ShieldCheck className="h-4 w-4 text-pine" />
                <span>Step 5: Pre-Flight Review & Workspace Provisioning</span>
              </CardTitle>
              <CardDescription className="text-xs text-muted">
                Inspect configured parameters before executing the transactional provisioning workflow.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="rounded-lg border border-line bg-canvas p-3.5 space-y-1.5">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-muted">Gym Workspace</div>
                  <div className="font-bold text-sm text-ink">{formData.name || "Untitled"}</div>
                  <div className="text-muted font-mono">/g/{formData.slug}</div>
                  <div className="text-muted">{formData.phone} • {formData.email}</div>
                  <div className="text-muted">{formData.city}, {formData.country} ({formData.currency})</div>
                </div>

                <div className="rounded-lg border border-line bg-canvas p-3.5 space-y-1.5">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-muted">Owner Credentials</div>
                  <div className="font-bold text-sm text-ink">{formData.ownerName || "Unassigned"}</div>
                  <div className="text-muted font-mono">{formData.ownerEmail}</div>
                  <div className="text-muted">
                    Password:{" "}
                    <span className={`font-mono ${formData.ownerPassword && formData.ownerPassword.trim().length > 0 && formData.ownerPassword.trim().length < 8 ? "text-rose-600 font-bold" : ""}`}>
                      {formData.ownerPassword && formData.ownerPassword.trim().length >= 8
                        ? "Custom password provided"
                        : formData.ownerPassword && formData.ownerPassword.trim().length > 0
                        ? `Too short (${formData.ownerPassword.trim().length} chars - min 8 required)`
                        : "Will auto-generate secure password"}
                    </span>
                  </div>
                  <div className="text-muted">Role: <span className="font-semibold text-pine">OWNER</span></div>
                </div>

                <div className="rounded-lg border border-line bg-canvas p-3.5 space-y-1.5 sm:col-span-2">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-muted">Subscription Agreement</div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-ink">{selectedPlan?.name}</span>
                    <Badge variant="outline" className="bg-pine-soft text-pine border-pine/30 text-[10px]">
                      {formData.billingPeriod}
                    </Badge>
                  </div>
                  <div className="text-muted">
                    Effective Pricing:{" "}
                    <strong>
                      {formData.currency}{" "}
                      {formData.customPricingOverride || selectedPlan?.monthlyPrice}
                    </strong>{" "}
                    / month &bull; Trial: <strong>{formData.trialDays} days</strong> &bull; Capacity Limit:{" "}
                    <strong>{formData.maxMembersOverride || selectedPlan?.maxMembers || "Unlimited"}</strong>
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-pine-soft/40 border border-pine/20 text-xs text-pine flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 shrink-0" />
                <span>
                  Executing this transaction initializes tenant database schemas, triggers password hashing, and logs immutable audit records.
                </span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Wizard Controls */}
        <div className="flex items-center justify-between pt-2">
          {currentStep > 1 ? (
            <Button
              type="button"
              variant="outline"
              onClick={handleBack}
              disabled={isPending}
              className="border-line text-ink hover:bg-canvas text-xs h-9 gap-1"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
              <span>Back</span>
            </Button>
          ) : (
            <div />
          )}

          {currentStep < 5 ? (
            <Button
              type="button"
              onClick={handleNext}
              className="bg-pine hover:bg-pine/90 text-white font-semibold text-xs h-9 px-5 gap-1.5 rounded-lg shadow-xs transition"
            >
              <span>Next Step</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </Button>
          ) : (
            <Button
              type="submit"
              disabled={isPending}
              className="bg-pine hover:bg-pine/90 text-white font-bold text-xs h-10 px-6 gap-2 rounded-lg shadow-xs transition"
            >
              {isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Provisioning Workspace...</span>
                </>
              ) : (
                <>
                  <Send className="h-3.5 w-3.5" />
                  <span>Execute Provisioning</span>
                </>
              )}
            </Button>
          )}
        </div>
      </form>
    </div>
  );
}

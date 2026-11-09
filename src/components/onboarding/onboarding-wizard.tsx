"use client";

import * as React from "react";
import { useState, useActionState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createGymOnboardingAction, ActionState } from "@/lib/actions/gym";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Building2,
  MapPin,
  Clock,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Dumbbell,
  ShieldCheck,
} from "lucide-react";

interface OnboardingWizardProps {
  user: {
    id: string;
    name: string | null;
    email: string | null;
  };
}

export function OnboardingWizard({ user }: OnboardingWizardProps) {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [, startTransition] = useTransition();

  // Controlled values across steps so state is preserved during step navigation
  const [formDataState, setFormDataState] = useState({
    name: "",
    slug: "",
    phone: "",
    email: user.email || "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    postalCode: "",
    country: "US",
    currency: "USD",
    timezone: "America/New_York",
    openingHours: "Mon - Fri: 06:00 - 22:00\nSat - Sun: 08:00 - 20:00",
    taxRate: "0",
    taxNumber: "",
    logoUrl: "",
  });

  const [state, formAction, isPending] = useActionState<ActionState | null, FormData>(
    async (prev, fd) => {
      const res = await createGymOnboardingAction(prev, fd);
      if (res.success && res.gymSlug) {
        startTransition(() => {
          router.push(`/${res.gymSlug}/dashboard`);
        });
      }
      return res;
    },
    null
  );

  // Auto-generate slug from name if user hasn't explicitly customized slug
  const [isSlugTouched, setIsSlugTouched] = useState(false);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newName = e.target.value;
    if (!isSlugTouched) {
      const generatedSlug = newName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
      setFormDataState((prev) => ({
        ...prev,
        name: newName,
        slug: generatedSlug,
      }));
    } else {
      setFormDataState((prev) => ({ ...prev, name: newName }));
    }
  };

  const handleFieldChange = (
    field: string,
    value: string
  ) => {
    setFormDataState((prev) => ({ ...prev, [field]: value }));
  };

  const validateStep1 = () => {
    if (!formDataState.name.trim() || formDataState.name.length < 2) {
      alert("Please enter a valid gym name (minimum 2 characters).");
      return false;
    }
    if (!formDataState.slug.trim() || formDataState.slug.length < 2) {
      alert("Please enter a valid slug.");
      return false;
    }
    return true;
  };

  return (
    <div className="mx-auto max-w-2xl">
      {/* Brand & Progress Header */}
      <div className="mb-8 text-center">
        <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-lg shadow-emerald-900/20 mb-4">
          <Dumbbell className="h-6 w-6" />
        </div>
        <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
          Register Your Gym Workspace
        </h1>
        <p className="mt-1.5 text-xs text-slate-500 max-w-md mx-auto">
          Set up your multi-tenant gym environment with isolated database tenancy
          and real-time business tools.
        </p>

        {/* Wizard Steps Stepper */}
        <div className="mt-6 flex items-center justify-center gap-2">
          {[
            { num: 1, label: "Identity & URL" },
            { num: 2, label: "Location & Contact" },
            { num: 3, label: "Hours & Regional" },
          ].map((s) => {
            const isActive = step === s.num;
            const isCompleted = step > s.num;
            return (
              <div key={s.num} className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    if (s.num < step) setStep(s.num as 1 | 2 | 3);
                  }}
                  className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold transition ${
                    isActive
                      ? "bg-emerald-600 text-white shadow-xs"
                      : isCompleted
                      ? "bg-emerald-100 text-emerald-800"
                      : "bg-slate-100 text-slate-400"
                  }`}
                >
                  {isCompleted ? (
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-700" />
                  ) : (
                    <span>{s.num}</span>
                  )}
                  <span className="hidden sm:inline">{s.label}</span>
                </button>
                {s.num < 3 && (
                  <span className="h-0.5 w-4 bg-slate-200" />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Wizard Form */}
      <form action={formAction} className="space-y-6">
        {/* Hidden inputs to preserve earlier steps across the submission */}
        {Object.entries(formDataState).map(([key, val]) => (
          <input key={key} type="hidden" name={key} value={val} />
        ))}

        {/* Global Error Banner */}
        {state?.error && (
          <div className="flex items-center gap-3 rounded-xl border border-rose-200 bg-rose-50 p-4 text-xs text-rose-900">
            <AlertCircle className="h-5 w-5 text-rose-600 shrink-0" />
            <div>
              <div className="font-semibold">Setup Encountered an Error</div>
              <div>{state.error}</div>
            </div>
          </div>
        )}

        {/* STEP 1: Gym Identity & Slug */}
        {step === 1 && (
          <Card className="border-slate-200 shadow-md">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-emerald-600" />
                  <CardTitle className="text-base font-bold text-slate-900">
                    Step 1: Gym Identity & Unique URL
                  </CardTitle>
                </div>
                <Badge variant="outline" className="text-xs">
                  Step 1 of 3
                </Badge>
              </div>
              <CardDescription className="text-xs text-slate-500">
                Choose the business name and your private subdomain workspace URL.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Owner Identity pill */}
              <div className="flex items-center gap-2.5 rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs">
                <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0" />
                <div>
                  <span className="text-slate-500">Owner Account: </span>
                  <span className="font-semibold text-slate-900">
                    {user.name || "Gym Owner"}
                  </span>
                  <span className="text-slate-500"> ({user.email})</span>
                </div>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="w-name" className="text-xs font-semibold text-slate-700">
                  Gym Business Name <span className="text-rose-500">*</span>
                </label>
                <Input
                  id="w-name"
                  value={formDataState.name}
                  onChange={handleNameChange}
                  placeholder="e.g. Iron Peak Fitness Club"
                  required
                  className="text-xs h-10"
                />
                {state?.fieldErrors?.name && (
                  <p className="text-[11px] text-rose-600">{state.fieldErrors.name}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <label htmlFor="w-slug" className="text-xs font-semibold text-slate-700">
                  Gym URL Workspace Slug <span className="text-rose-500">*</span>
                </label>
                <div className="flex items-center rounded-lg border border-slate-200 bg-slate-50 px-3 focus-within:border-emerald-500 focus-within:ring-1 focus-within:ring-emerald-500">
                  <span className="text-xs font-mono text-slate-400 select-none">
                    fixia.app/
                  </span>
                  <input
                    id="w-slug"
                    value={formDataState.slug}
                    onChange={(e) => {
                      setIsSlugTouched(true);
                      handleFieldChange("slug", e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""));
                    }}
                    placeholder="iron-peak-fitness"
                    required
                    className="w-full bg-transparent py-2 text-xs font-mono text-slate-900 focus:outline-none"
                  />
                </div>
                <p className="text-[10px] text-slate-400">
                  Lowercase letters, numbers and hyphens only. Used for routing and QR codes.
                </p>
                {state?.fieldErrors?.slug && (
                  <p className="text-[11px] text-rose-600">{state.fieldErrors.slug}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <label htmlFor="w-logo" className="text-xs font-medium text-slate-700">
                  Logo URL (Optional)
                </label>
                <Input
                  id="w-logo"
                  value={formDataState.logoUrl}
                  onChange={(e) => handleFieldChange("logoUrl", e.target.value)}
                  placeholder="https://example.com/logo.png"
                  className="text-xs h-9"
                />
              </div>

              <div className="flex justify-end pt-3">
                <Button
                  type="button"
                  onClick={() => {
                    if (validateStep1()) setStep(2);
                  }}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs h-9 px-5 gap-1.5"
                >
                  <span>Continue to Location</span>
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* STEP 2: Address & Contact */}
        {step === 2 && (
          <Card className="border-slate-200 shadow-md">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-emerald-600" />
                  <CardTitle className="text-base font-bold text-slate-900">
                    Step 2: Location & Contact Details
                  </CardTitle>
                </div>
                <Badge variant="outline" className="text-xs">
                  Step 2 of 3
                </Badge>
              </div>
              <CardDescription className="text-xs text-slate-500">
                Provide the gym&apos;s physical address and phone number for member receipts.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label htmlFor="w-email" className="text-xs font-medium text-slate-700">
                    Public Contact Email
                  </label>
                  <Input
                    id="w-email"
                    type="email"
                    value={formDataState.email}
                    onChange={(e) => handleFieldChange("email", e.target.value)}
                    placeholder="info@yourgym.com"
                    className="text-xs h-9"
                  />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="w-phone" className="text-xs font-medium text-slate-700">
                    Public Phone Number
                  </label>
                  <Input
                    id="w-phone"
                    value={formDataState.phone}
                    onChange={(e) => handleFieldChange("phone", e.target.value)}
                    placeholder="+1 (555) 234-5678"
                    className="text-xs h-9"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="w-addr1" className="text-xs font-medium text-slate-700">
                  Street Address Line 1
                </label>
                <Input
                  id="w-addr1"
                  value={formDataState.addressLine1}
                  onChange={(e) => handleFieldChange("addressLine1", e.target.value)}
                  placeholder="450 Lexington Ave, Suite 300"
                  className="text-xs h-9"
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="w-addr2" className="text-xs font-medium text-slate-700">
                  Street Address Line 2 (Optional)
                </label>
                <Input
                  id="w-addr2"
                  value={formDataState.addressLine2}
                  onChange={(e) => handleFieldChange("addressLine2", e.target.value)}
                  placeholder="Building 4"
                  className="text-xs h-9"
                />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="space-y-1.5">
                  <label htmlFor="w-city" className="text-xs font-medium text-slate-700">
                    City
                  </label>
                  <Input
                    id="w-city"
                    value={formDataState.city}
                    onChange={(e) => handleFieldChange("city", e.target.value)}
                    placeholder="Austin"
                    className="text-xs h-9"
                  />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="w-state" className="text-xs font-medium text-slate-700">
                    State
                  </label>
                  <Input
                    id="w-state"
                    value={formDataState.state}
                    onChange={(e) => handleFieldChange("state", e.target.value)}
                    placeholder="TX"
                    className="text-xs h-9"
                  />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="w-zip" className="text-xs font-medium text-slate-700">
                    Postal Code
                  </label>
                  <Input
                    id="w-zip"
                    value={formDataState.postalCode}
                    onChange={(e) => handleFieldChange("postalCode", e.target.value)}
                    placeholder="78701"
                    className="text-xs h-9"
                  />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="w-country" className="text-xs font-medium text-slate-700">
                    Country
                  </label>
                  <Input
                    id="w-country"
                    value={formDataState.country}
                    onChange={(e) => handleFieldChange("country", e.target.value.toUpperCase())}
                    placeholder="US"
                    className="text-xs h-9 uppercase"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setStep(1)}
                  className="text-xs h-9 gap-1.5"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span>Back</span>
                </Button>
                <Button
                  type="button"
                  onClick={() => setStep(3)}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs h-9 px-5 gap-1.5"
                >
                  <span>Continue to Operations</span>
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* STEP 3: Operating Hours, Currency & Confirmation */}
        {step === 3 && (
          <Card className="border-slate-200 shadow-md">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-emerald-600" />
                  <CardTitle className="text-base font-bold text-slate-900">
                    Step 3: Operating Hours & Regional Settings
                  </CardTitle>
                </div>
                <Badge variant="outline" className="text-xs">
                  Step 3 of 3
                </Badge>
              </div>
              <CardDescription className="text-xs text-slate-500">
                Configure your operating hours, billing currency, and standard tax rate.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <label htmlFor="w-hours" className="text-xs font-semibold text-slate-700">
                  Opening Hours
                </label>
                <textarea
                  id="w-hours"
                  rows={3}
                  value={formDataState.openingHours}
                  onChange={(e) => handleFieldChange("openingHours", e.target.value)}
                  className="w-full rounded-md border border-slate-200 bg-white p-2.5 text-xs text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label htmlFor="w-currency" className="text-xs font-semibold text-slate-700">
                    Primary Currency
                  </label>
                  <select
                    id="w-currency"
                    value={formDataState.currency}
                    onChange={(e) => handleFieldChange("currency", e.target.value)}
                    className="w-full rounded-md border border-slate-200 bg-white h-9 px-2.5 text-xs text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  >
                    <option value="USD">USD ($) - US Dollar</option>
                    <option value="EUR">EUR (€) - Euro</option>
                    <option value="GBP">GBP (£) - British Pound</option>
                    <option value="CAD">CAD ($) - Canadian Dollar</option>
                    <option value="AUD">AUD ($) - Australian Dollar</option>
                    <option value="INR">INR (₹) - Indian Rupee</option>
                    <option value="AED">AED (د.إ) - UAE Dirham</option>
                    <option value="SGD">SGD ($) - Singapore Dollar</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="w-tz" className="text-xs font-semibold text-slate-700">
                    Operating Timezone
                  </label>
                  <select
                    id="w-tz"
                    value={formDataState.timezone}
                    onChange={(e) => handleFieldChange("timezone", e.target.value)}
                    className="w-full rounded-md border border-slate-200 bg-white h-9 px-2.5 text-xs text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  >
                    <option value="America/New_York">America/New_York (Eastern)</option>
                    <option value="America/Chicago">America/Chicago (Central)</option>
                    <option value="America/Denver">America/Denver (Mountain)</option>
                    <option value="America/Los_Angeles">America/Los_Angeles (Pacific)</option>
                    <option value="Europe/London">Europe/London (GMT/BST)</option>
                    <option value="Europe/Paris">Europe/Paris (CET)</option>
                    <option value="Asia/Dubai">Asia/Dubai (GST)</option>
                    <option value="Asia/Kolkata">Asia/Kolkata (IST)</option>
                    <option value="Asia/Singapore">Asia/Singapore (SGT)</option>
                    <option value="Australia/Sydney">Australia/Sydney (AEST)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label htmlFor="w-tax" className="text-xs font-semibold text-slate-700">
                    Standard Tax / VAT Rate (%)
                  </label>
                  <Input
                    id="w-tax"
                    type="number"
                    step="0.01"
                    min="0"
                    max="100"
                    value={formDataState.taxRate}
                    onChange={(e) => handleFieldChange("taxRate", e.target.value)}
                    className="text-xs h-9"
                  />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="w-taxno" className="text-xs font-semibold text-slate-700">
                    Tax ID / VAT Registration #
                  </label>
                  <Input
                    id="w-taxno"
                    value={formDataState.taxNumber}
                    onChange={(e) => handleFieldChange("taxNumber", e.target.value)}
                    placeholder="Optional"
                    className="text-xs h-9 font-mono"
                  />
                </div>
              </div>

              {/* Summary Review Card */}
              <div className="rounded-xl border border-emerald-100 bg-emerald-50/60 p-4 text-xs space-y-2">
                <div className="font-bold text-emerald-950 flex items-center gap-1.5">
                  <Sparkles className="h-4 w-4 text-emerald-600" />
                  Workspace Confirmation
                </div>
                <div className="grid grid-cols-2 gap-2 text-slate-700">
                  <div>
                    <span className="text-slate-500">Gym: </span>
                    <span className="font-semibold">{formDataState.name || "Untitled"}</span>
                  </div>
                  <div>
                    <span className="text-slate-500">URL: </span>
                    <span className="font-mono text-emerald-800">fixia.app/{formDataState.slug}</span>
                  </div>
                  <div>
                    <span className="text-slate-500">Currency: </span>
                    <span className="font-semibold">{formDataState.currency}</span>
                  </div>
                  <div>
                    <span className="text-slate-500">Security: </span>
                    <span className="font-semibold text-emerald-800">HMAC-SHA256 Token QR</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setStep(2)}
                  className="text-xs h-9 gap-1.5"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span>Back</span>
                </Button>
                <Button
                  type="submit"
                  disabled={isPending}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs h-10 px-6 font-semibold shadow-md shadow-emerald-800/20"
                >
                  {isPending ? "Creating Workspace..." : "Create & Launch Gym"}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </form>
    </div>
  );
}


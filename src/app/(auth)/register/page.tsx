"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useActionState } from "react";
import { registerOwnerAction } from "@/lib/auth/actions";
import {
  Building2,
  User,
  Mail,
  Lock,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  Eye,
  EyeOff,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const PACKAGES = [
  {
    id: "STARTER",
    name: "Starter Studio",
    price: "₹999",
    period: "/mo",
    badge: "Boutique & Single Studio",
    desc: "Up to 100 members with dynamic QR check-in & billing.",
  },
  {
    id: "GROWTH",
    name: "Growth Athletic",
    price: "₹1,999",
    period: "/mo",
    badge: "Most Popular",
    popular: true,
    desc: "Up to 500 members with CRM leads, classes & website.",
  },
  {
    id: "PRO",
    name: "Pro Enterprise",
    price: "₹3,499",
    period: "/mo",
    badge: "Unlimited Scale",
    desc: "Unlimited members, WhatsApp automation & multi-branch analytics.",
  },
];

export default function RegisterPage() {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(registerOwnerAction, null);
  const [showPassword, setShowPassword] = React.useState(false);
  const [selectedPlan, setSelectedPlan] = React.useState("GROWTH");

  const [passwordInput, setPasswordInput] = React.useState("");

  // Real-time password rules
  const hasMinLen = passwordInput.length >= 8;
  const hasUpper = /[A-Z]/.test(passwordInput);
  const hasLower = /[a-z]/.test(passwordInput);
  const hasNumber = /[0-9]/.test(passwordInput);
  const hasSpecial = /[^A-Za-z0-9]/.test(passwordInput);

  React.useEffect(() => {
    if (state?.success && state.redirectUrl) {
      router.push(state.redirectUrl);
    }
  }, [state, router]);

  return (
    <div className="min-h-screen bg-[#F7FAF8] text-[#171C19] flex flex-col font-sans selection:bg-[#E8F9EE] selection:text-[#16A34A] py-12 px-4 sm:px-6 lg:px-8">
      {/* Top Navbar Brand */}
      <div className="max-w-4xl mx-auto w-full flex items-center justify-between mb-8">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#1BC95A] text-white shadow-xs group-hover:bg-[#16A34A] transition-colors">
            <span className="font-display text-base font-extrabold tracking-tight">G</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="font-display text-xl font-extrabold tracking-tight text-[#171C19]">
              Gym<span className="text-[#1BC95A]">OS</span>
            </span>
          </div>
        </Link>

        <div className="text-xs text-[#69736E]">
          Already have an account?{" "}
          <Link href="/login" className="font-bold text-[#16A34A] hover:underline">
            Sign in
          </Link>
        </div>
      </div>

      {/* Main Registration Card */}
      <div className="max-w-2xl mx-auto w-full">
        <div className="rounded-3xl border border-[#E7ECE9] bg-white p-6 sm:p-10 shadow-lg">
          {/* Header */}
          <div className="text-center max-w-lg mx-auto mb-8">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-[#E8F9EE] px-3.5 py-1 text-xs font-bold text-[#16A34A] border border-[#1BC95A]/30 mb-3">
              <Sparkles className="h-3.5 w-3.5" />
              <span>14-Day Full Access Trial &bull; No Credit Card Required</span>
            </div>

            <h1 className="font-display text-2xl sm:text-3xl font-extrabold tracking-tight text-[#171C19]">
              Register your gym on Gym<span className="text-[#1BC95A]">OS</span>
            </h1>
            <p className="mt-2 text-xs sm:text-sm text-[#69736E] leading-relaxed">
              Create your dedicated gym workspace, configure owner credentials, and launch operations in under 2 minutes.
            </p>
          </div>

          {/* Form */}
          <form action={formAction} className="space-y-6">
            {state?.error && (
              <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-xs text-rose-800 flex items-start gap-2.5 shadow-xs">
                <AlertCircle className="h-4 w-4 shrink-0 text-rose-600 mt-0.5" />
                <div>
                  <div className="font-bold text-rose-900">Registration Anomaly</div>
                  <p className="mt-0.5 text-rose-800">{state.error}</p>
                </div>
              </div>
            )}

            {/* Section 1: Gym Details */}
            <div className="space-y-4">
              <div className="text-xs font-bold text-[#171C19] uppercase tracking-wider text-[#69736E] border-b border-[#E7ECE9] pb-2 flex items-center gap-1.5">
                <Building2 className="h-3.5 w-3.5 text-[#1BC95A]" />
                <span>1. Gym Facility Details</span>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#171C19] mb-1.5" htmlFor="gymName">
                  Gym / Fitness Studio Name *
                </label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#69736E]/60 pointer-events-none" />
                  <input
                    id="gymName"
                    name="gymName"
                    type="text"
                    required
                    placeholder="e.g. IronForge Athletic Club"
                    className="w-full rounded-xl border border-[#E7ECE9] bg-white py-2.5 pl-9 pr-3 text-xs text-[#171C19] placeholder:text-[#69736E]/50 focus:border-[#1BC95A] focus:outline-hidden focus:ring-2 focus:ring-[#1BC95A]/20 transition"
                  />
                </div>
                {state?.fieldErrors?.gymName && (
                  <p className="text-[11px] text-rose-600 mt-1">{state.fieldErrors.gymName.join(", ")}</p>
                )}
              </div>
            </div>

            {/* Section 2: Owner Credentials */}
            <div className="space-y-4 pt-2">
              <div className="text-xs font-bold text-[#171C19] uppercase tracking-wider text-[#69736E] border-b border-[#E7ECE9] pb-2 flex items-center gap-1.5">
                <User className="h-3.5 w-3.5 text-[#1BC95A]" />
                <span>2. Gym Owner Account</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#171C19] mb-1.5" htmlFor="ownerName">
                    Your Full Name *
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#69736E]/60 pointer-events-none" />
                    <input
                      id="ownerName"
                      name="ownerName"
                      type="text"
                      required
                      placeholder="e.g. Alex Vance"
                      className="w-full rounded-xl border border-[#E7ECE9] bg-white py-2.5 pl-9 pr-3 text-xs text-[#171C19] placeholder:text-[#69736E]/50 focus:border-[#1BC95A] focus:outline-hidden focus:ring-2 focus:ring-[#1BC95A]/20 transition"
                    />
                  </div>
                  {state?.fieldErrors?.ownerName && (
                    <p className="text-[11px] text-rose-600 mt-1">{state.fieldErrors.ownerName.join(", ")}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#171C19] mb-1.5" htmlFor="email">
                    Business Email *
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#69736E]/60 pointer-events-none" />
                    <input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      placeholder="owner@yourgym.com"
                      className="w-full rounded-xl border border-[#E7ECE9] bg-white py-2.5 pl-9 pr-3 text-xs text-[#171C19] placeholder:text-[#69736E]/50 focus:border-[#1BC95A] focus:outline-hidden focus:ring-2 focus:ring-[#1BC95A]/20 transition"
                    />
                  </div>
                  {state?.fieldErrors?.email && (
                    <p className="text-[11px] text-rose-600 mt-1">{state.fieldErrors.email.join(", ")}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#171C19] mb-1.5" htmlFor="password">
                  Create Master Password *
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#69736E]/60 pointer-events-none" />
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    required
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    placeholder="Minimum 8 characters with upper, lower, number & symbol"
                    className="w-full rounded-xl border border-[#E7ECE9] bg-white py-2.5 pl-9 pr-10 text-xs text-[#171C19] placeholder:text-[#69736E]/50 focus:border-[#1BC95A] focus:outline-hidden focus:ring-2 focus:ring-[#1BC95A]/20 transition font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#69736E] hover:text-[#171C19]"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>

                {/* Password strength checklist */}
                {passwordInput.length > 0 && (
                  <div className="mt-2.5 grid grid-cols-2 sm:grid-cols-4 gap-2 text-[10px]">
                    <div className={`flex items-center gap-1 ${hasMinLen ? "text-[#16A34A] font-semibold" : "text-[#69736E]"}`}>
                      <CheckCircle2 className={`h-3 w-3 ${hasMinLen ? "text-[#1BC95A]" : "text-[#E7ECE9]"}`} />
                      <span>8+ characters</span>
                    </div>
                    <div className={`flex items-center gap-1 ${hasUpper && hasLower ? "text-[#16A34A] font-semibold" : "text-[#69736E]"}`}>
                      <CheckCircle2 className={`h-3 w-3 ${hasUpper && hasLower ? "text-[#1BC95A]" : "text-[#E7ECE9]"}`} />
                      <span>Upper & lower</span>
                    </div>
                    <div className={`flex items-center gap-1 ${hasNumber ? "text-[#16A34A] font-semibold" : "text-[#69736E]"}`}>
                      <CheckCircle2 className={`h-3 w-3 ${hasNumber ? "text-[#1BC95A]" : "text-[#E7ECE9]"}`} />
                      <span>At least 1 number</span>
                    </div>
                    <div className={`flex items-center gap-1 ${hasSpecial ? "text-[#16A34A] font-semibold" : "text-[#69736E]"}`}>
                      <CheckCircle2 className={`h-3 w-3 ${hasSpecial ? "text-[#1BC95A]" : "text-[#E7ECE9]"}`} />
                      <span>Special symbol</span>
                    </div>
                  </div>
                )}

                {state?.fieldErrors?.password && (
                  <p className="text-[11px] text-rose-600 mt-1">{state.fieldErrors.password.join(", ")}</p>
                )}
              </div>
            </div>

            {/* Section 3: Package Selection */}
            <div className="space-y-3 pt-2">
              <div className="text-xs font-bold text-[#171C19] uppercase tracking-wider text-[#69736E] border-b border-[#E7ECE9] pb-2 flex items-center justify-between">
                <span>3. Select Your Preferred Tier (14 Days Free)</span>
                <span className="text-[11px] text-[#16A34A] font-bold lowercase">No charge today</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {PACKAGES.map((pkg) => {
                  const isSelected = selectedPlan === pkg.id;
                  return (
                    <div
                      key={pkg.id}
                      onClick={() => setSelectedPlan(pkg.id)}
                      className={`cursor-pointer rounded-2xl border p-4 transition text-left flex flex-col justify-between ${
                        isSelected
                          ? "border-[#1BC95A] bg-[#E8F9EE]/40 ring-2 ring-[#1BC95A]/30 shadow-xs"
                          : "border-[#E7ECE9] bg-white hover:border-[#1BC95A]/40"
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[11px] font-bold uppercase tracking-wider text-[#69736E]">
                            {pkg.name}
                          </span>
                          {pkg.popular && (
                            <span className="text-[9px] font-extrabold uppercase bg-[#1BC95A] text-white px-1.5 py-0.5 rounded-full">
                              Popular
                            </span>
                          )}
                        </div>
                        <div className="flex items-baseline gap-1 my-1">
                          <span className="font-display text-xl font-extrabold text-[#171C19]">{pkg.price}</span>
                          <span className="text-xs text-[#69736E]">{pkg.period}</span>
                        </div>
                        <p className="text-[11px] text-[#69736E] leading-snug mt-1">{pkg.desc}</p>
                      </div>

                      <div className="mt-3 pt-2 border-t border-[#E7ECE9]/60 flex items-center justify-between text-[11px] font-bold">
                        <span className={isSelected ? "text-[#16A34A]" : "text-[#69736E]"}>
                          {isSelected ? "Selected Tier" : "Select"}
                        </span>
                        <div
                          className={`h-4 w-4 rounded-full border flex items-center justify-center ${
                            isSelected ? "border-[#1BC95A] bg-[#1BC95A] text-white" : "border-[#E7ECE9]"
                          }`}
                        >
                          {isSelected && <CheckCircle2 className="h-3 w-3" />}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Terms and Submit */}
            <div className="pt-4 space-y-4">
              <Button
                type="submit"
                disabled={isPending}
                className="w-full bg-[#1BC95A] hover:bg-[#16A34A] text-white font-extrabold text-sm h-12 rounded-xl gap-2 shadow-sm transition"
              >
                {isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Provisioning Gym Workspace...</span>
                  </>
                ) : (
                  <>
                    <span>Create Gym Workspace & Start Free Trial</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </Button>

              <div className="flex items-center justify-center gap-4 text-[11px] text-[#69736E] text-center pt-2">
                <span className="flex items-center gap-1">
                  <ShieldCheck className="h-3.5 w-3.5 text-[#1BC95A]" />
                  <span>256-Bit SSL Encryption</span>
                </span>
                <span>&bull;</span>
                <span>Instant Workspace Provisioning</span>
                <span>&bull;</span>
                <span>Cancel Anytime</span>
              </div>
            </div>
          </form>
        </div>

        {/* Security and Trust Footer */}
        <div className="mt-6 text-center text-xs text-[#69736E]">
          By continuing, you agree to the{" "}
          <Link href="/terms" className="text-[#171C19] underline font-medium">
            Terms of Service
          </Link>{" "}
          and{" "}
          <Link href="/privacy" className="text-[#171C19] underline font-medium">
            Privacy Policy
          </Link>
          .
        </div>
      </div>
    </div>
  );
}

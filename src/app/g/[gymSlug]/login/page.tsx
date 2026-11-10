"use client";

import * as React from "react";
import { useActionState, useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Loader2,
  AlertCircle,
  Lock,
  Mail,
  Eye,
  EyeOff,
  Building2,
  QrCode,
  ShieldCheck,
  ArrowRight,
} from "lucide-react";
import { memberLoginAction } from "@/lib/auth/actions";

export default function GymBrandedLoginPage() {
  const params = useParams();
  const router = useRouter();
  const gymSlug = (params?.gymSlug as string) || "";
  const [showPassword, setShowPassword] = useState(false);

  const [state, formAction, isPending] = useActionState(memberLoginAction, null);

  useEffect(() => {
    if (state?.success && state.redirectUrl) {
      router.push(state.redirectUrl);
    }
  }, [state, router]);

  const gymDisplayName = gymSlug
    ? gymSlug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
    : "Gym Workspace";

  return (
    <div
      className="min-h-screen w-full bg-[#062E23] text-white flex flex-col items-center justify-center p-4 py-8 sm:p-8 relative overflow-hidden font-sans"
      style={{
        backgroundImage:
          "radial-gradient(90% 100% at 50% 20%, #0F4A38 0%, #083327 50%, #041E16 100%)",
      }}
    >
      {/* Decorative ambient subtle lines & glows */}
      <div className="absolute inset-0 bg-[radial-gradient(#7FD6B2_1px,transparent_1px)] [background-size:24px_24px] opacity-10 pointer-events-none" />
      <div className="absolute -top-32 left-1/2 -translate-x-1/2 h-96 w-96 rounded-full bg-[#0B6B4F]/30 blur-3xl breathe pointer-events-none" />

      {/* Main Container */}
      <div className="relative z-10 w-full max-w-md my-auto flex flex-col items-center animate-in zoom-in-95 duration-200">
        <Link
          href={`/g/${gymSlug}`}
          className="inline-flex items-center gap-1.5 text-xs text-[#E4F2EB]/70 hover:text-white mb-6 transition"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to {gymDisplayName} Website</span>
        </Link>

        {/* Card Surface */}
        <div className="w-full rounded-2xl border border-white/10 bg-white p-6 sm:p-8 text-[#0F172A] shadow-2xl backdrop-blur-xs">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#E4F2EB] text-[#0B6B4F] mx-auto mb-3 font-bold text-lg">
              <Building2 className="h-6 w-6" />
            </div>

            <h1 className="font-heading text-xl sm:text-2xl font-bold tracking-tight text-[#0F172A]">
              {gymDisplayName}
            </h1>
            <p className="mt-1 text-xs text-[#5F6B65]">
              Member Portal & Digital Pass Sign In
            </p>
          </div>

          <form action={formAction} className="space-y-4">
            <input type="hidden" name="gymSlug" value={gymSlug} />

            {state?.error && (
              <div className="rounded-xl bg-[#FEF2F2] border border-[#FECACA] p-3 text-xs text-[#991B1B] flex items-start gap-2.5 animate-in fade-in">
                <AlertCircle className="h-4 w-4 shrink-0 text-[#DC2626] mt-0.5" />
                <span>{state.error}</span>
              </div>
            )}

            {/* Verified Gym Identifier */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#0F172A] flex justify-between">
                <span>Gym Workspace</span>
                <span className="text-[10px] text-[#0B6B4F] font-mono font-medium">Verified Tenant</span>
              </label>
              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#94A099] pointer-events-none" />
                <input
                  disabled
                  value={`/g/${gymSlug}`}
                  className="w-full rounded-lg border border-[#E3E7E4] bg-[#F8FAFC] py-2 pl-9 pr-3 text-xs text-[#5F6B65] font-mono cursor-not-allowed"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#0F172A]" htmlFor="member-email">
                Registered Member Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#94A099] pointer-events-none" />
                <input
                  id="member-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  placeholder="member@example.com"
                  disabled={isPending}
                  className="w-full rounded-lg border border-[#E3E7E4] bg-white py-2 pl-9 pr-3 text-xs text-[#0F172A] placeholder:text-[#94A099] focus:border-[#0B6B4F] focus:outline-hidden focus:ring-1 focus:ring-[#0B6B4F] disabled:bg-[#F8FAFC]"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#0F172A]" htmlFor="member-password">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#94A099] pointer-events-none" />
                <input
                  id="member-password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  placeholder="••••••••••••"
                  disabled={isPending}
                  className="w-full rounded-lg border border-[#E3E7E4] bg-white py-2 pl-9 pr-9 text-xs text-[#0F172A] placeholder:text-[#94A099] focus:border-[#0B6B4F] focus:outline-hidden focus:ring-1 focus:ring-[#0B6B4F] disabled:bg-[#F8FAFC]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94A099] hover:text-[#0F172A]"
                  tabIndex={-1}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isPending}
              className="w-full mt-2 inline-flex items-center justify-center gap-2 rounded-lg bg-[#0B6B4F] py-2.5 text-xs font-semibold text-white shadow-xs hover:bg-[#09543E] transition-colors disabled:opacity-60 cursor-pointer"
            >
              {isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Verifying Pass...</span>
                </>
              ) : (
                <>
                  <QrCode className="h-3.5 w-3.5" />
                  <span>Enter Member Portal</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </>
              )}
            </button>
          </form>

          {/* Assistance link */}
          <div className="mt-5 text-center text-xs text-[#5F6B65]">
            <span>Need check-in assistance? </span>
            <Link href={`/g/${gymSlug}#contact`} className="font-semibold text-[#0B6B4F] hover:underline">
              Contact Front Desk
            </Link>
          </div>
        </div>

        {/* Security Reassurance */}
        <div className="mt-6 flex items-center gap-2 rounded-full border border-white/10 bg-black/20 px-4 py-1 text-xs text-[#E4F2EB]/80 backdrop-blur-xs">
          <ShieldCheck className="h-3.5 w-3.5 text-[#7FD6B2]" />
          <span>Anti-Passback QR Protection • 60-Second Dynamic Tokens</span>
        </div>
      </div>
    </div>
  );
}

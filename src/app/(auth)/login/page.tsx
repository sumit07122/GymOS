"use client";

import { useActionState, useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { loginAction, memberLoginAction } from "@/lib/auth/actions";
import {
  Users,
  Building2,
  Lock,
  Mail,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  Loader2,
  QrCode,
  CreditCard,
  MessageCircle,
  Sparkles,
} from "lucide-react";

function LoginFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnUrl = searchParams.get("returnUrl");
  const prefillGym = searchParams.get("gym") || "";

  const [activeTab, setActiveTab] = useState<"OWNER" | "MEMBER">(
    prefillGym ? "MEMBER" : "OWNER"
  );
  const [gymSlug, setGymSlug] = useState(prefillGym);
  const [showPassword, setShowPassword] = useState(false);

  const [ownerState, ownerAction, isOwnerPending] = useActionState(loginAction, null);
  const [memberState, memberFormAction, isMemberPending] = useActionState(memberLoginAction, null);

  useEffect(() => {
    if (ownerState?.success && ownerState.redirectUrl) {
      router.push(returnUrl || ownerState.redirectUrl);
    }
  }, [ownerState, router, returnUrl]);

  useEffect(() => {
    if (memberState?.success && memberState.redirectUrl) {
      router.push(returnUrl || memberState.redirectUrl);
    }
  }, [memberState, router, returnUrl]);

  return (
    <div className="min-h-screen w-full flex flex-col lg:grid lg:grid-cols-12 bg-[#F5F6F4] font-sans text-[#0F172A] antialiased">
      {/* Left Panel: Immersive Dark Navy / Pine Ambient Showcase (Desktop) */}
      <div
        className="hidden lg:flex lg:col-span-5 xl:col-span-6 flex-col justify-between p-10 xl:p-14 text-white relative overflow-hidden bg-[#062E23]"
        style={{
          backgroundImage:
            "radial-gradient(90% 100% at 30% 20%, #0F4A38 0%, #083327 50%, #041E16 100%)",
        }}
      >
        {/* Subtle decorative grid lines */}
        <div className="absolute inset-0 bg-[radial-gradient(#7FD6B2_1px,transparent_1px)] [background-size:24px_24px] opacity-10 pointer-events-none" />

        {/* Ambient breathing orb */}
        <div className="absolute -top-24 -left-24 h-96 w-96 rounded-full bg-[#0B6B4F]/30 blur-3xl breathe pointer-events-none" />
        <div className="absolute bottom-10 right-10 h-80 w-80 rounded-full bg-[#059669]/20 blur-3xl breathe pointer-events-none" />

        {/* Brand Header */}
        <div className="relative z-10">
          <Link href="/" className="inline-flex items-center gap-2.5 group">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#0B6B4F] text-white shadow-lg border border-[#7FD6B2]/30 group-hover:scale-105 transition-transform">
              <span className="text-lg font-black">F</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-heading text-2xl font-bold tracking-tight text-white">FIXIA</span>
              <span className="rounded-md bg-[#0B6B4F]/60 border border-[#7FD6B2]/40 px-2 py-0.5 text-[11px] font-mono font-semibold text-[#7FD6B2] uppercase">
                GymOS
              </span>
            </div>
          </Link>
        </div>

        {/* Center Marketing Pitch */}
        <div className="relative z-10 max-w-lg my-auto py-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-[#7FD6B2] backdrop-blur-xs mb-6">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Commercial Multi-Tenant Operating System</span>
          </div>

          <h2 className="font-heading text-3xl xl:text-4xl font-bold leading-tight tracking-tight text-white">
            The Complete Operating System for Modern Gyms.
          </h2>

          <p className="mt-4 text-sm text-[#E4F2EB]/80 leading-relaxed">
            Unify member management, 60-second dynamic QR attendance, automated invoicing, leads CRM, and WhatsApp notifications in one zero-trust platform.
          </p>

          {/* Operational Highlights Grid */}
          <div className="mt-8 grid grid-cols-2 gap-3">
            <div className="rounded-xl border border-white/10 bg-white/5 p-3.5 backdrop-blur-xs">
              <QrCode className="h-5 w-5 text-[#7FD6B2] mb-2" />
              <p className="text-xs font-semibold text-white">60s Dynamic Pass</p>
              <p className="text-[11px] text-[#94A099] mt-0.5">Anti-passback protection</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/5 p-3.5 backdrop-blur-xs">
              <CreditCard className="h-5 w-5 text-[#7FD6B2] mb-2" />
              <p className="text-xs font-semibold text-white">Automated Invoicing</p>
              <p className="text-[11px] text-[#94A099] mt-0.5">Dual-tax GST & partial dues</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/5 p-3.5 backdrop-blur-xs">
              <ShieldCheck className="h-5 w-5 text-[#7FD6B2] mb-2" />
              <p className="text-xs font-semibold text-white">Strict Tenant Isolation</p>
              <p className="text-[11px] text-[#94A099] mt-0.5">Server-side tenant RLS</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/5 p-3.5 backdrop-blur-xs">
              <MessageCircle className="h-5 w-5 text-[#7FD6B2] mb-2" />
              <p className="text-xs font-semibold text-white">WhatsApp Business</p>
              <p className="text-[11px] text-[#94A099] mt-0.5">Official platform templates</p>
            </div>
          </div>
        </div>

        {/* Footer Subtext */}
        <div className="relative z-10 flex items-center justify-between text-xs text-[#94A099] pt-6 border-t border-white/10">
          <span>Enterprise Cloud • Commercial Release</span>
          <span className="font-mono text-[11px]">gms.fixia.in</span>
        </div>
      </div>

      {/* Right Panel: Authentication Card & Form */}
      <div className="flex-1 lg:col-span-7 xl:col-span-6 flex flex-col justify-center items-center p-4 sm:p-8 lg:p-12 xl:p-16 my-auto">
        <div className="w-full max-w-md">
          {/* Mobile Brand Header */}
          <div className="lg:hidden text-center mb-6">
            <Link href="/" className="inline-flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#0B6B4F] text-white font-bold">
                F
              </div>
              <span className="font-heading text-xl font-bold text-[#0F172A]">FIXIA GymOS</span>
            </Link>
          </div>

          {/* Main Card Surface */}
          <div className="rounded-2xl border border-[#E3E7E4] bg-white p-6 sm:p-8 shadow-sm">
            {/* Header Titles */}
            <div className="mb-6">
              <h1 className="font-heading text-xl sm:text-2xl font-bold tracking-tight text-[#0F172A]">
                Sign In to GymOS
              </h1>
              <p className="mt-1 text-xs sm:text-sm text-[#5F6B65]">
                Select your role to access your authorized workspace
              </p>
            </div>

            {/* Role Switcher Tabs */}
            <div className="grid grid-cols-2 p-1 rounded-xl bg-[#F5F6F4] border border-[#E3E7E4] mb-6">
              <button
                type="button"
                onClick={() => setActiveTab("OWNER")}
                className={`py-2 text-xs font-semibold rounded-lg flex items-center justify-center gap-2 transition-all ${
                  activeTab === "OWNER"
                    ? "bg-white text-[#0B6B4F] shadow-xs"
                    : "text-[#5F6B65] hover:text-[#0F172A]"
                }`}
              >
                <Building2 className="h-3.5 w-3.5" />
                <span>Gym Owner / Staff</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("MEMBER")}
                className={`py-2 text-xs font-semibold rounded-lg flex items-center justify-center gap-2 transition-all ${
                  activeTab === "MEMBER"
                    ? "bg-white text-[#0B6B4F] shadow-xs"
                    : "text-[#5F6B65] hover:text-[#0F172A]"
                }`}
              >
                <Users className="h-3.5 w-3.5" />
                <span>Gym Member</span>
              </button>
            </div>

            {/* Gym Owner / Staff Form */}
            {activeTab === "OWNER" && (
              <form action={ownerAction} className="space-y-4">
                {ownerState?.error && (
                  <div className="rounded-xl bg-[#FEF2F2] border border-[#FECACA] p-3 text-xs text-[#991B1B] flex items-start gap-2.5 animate-in fade-in">
                    <AlertCircle className="h-4 w-4 shrink-0 text-[#DC2626] mt-0.5" />
                    <span>{ownerState.error}</span>
                  </div>
                )}

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[#0F172A] flex justify-between" htmlFor="owner-email">
                    <span>Business Email Address</span>
                    <span className="text-[11px] text-[#94A099] font-normal">Owner Account</span>
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#94A099] pointer-events-none" />
                    <input
                      id="owner-email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      placeholder="owner@yourgym.com"
                      disabled={isOwnerPending}
                      className="w-full rounded-lg border border-[#E3E7E4] bg-white py-2 pl-9 pr-3 text-xs text-[#0F172A] placeholder:text-[#94A099] focus:border-[#0B6B4F] focus:outline-hidden focus:ring-1 focus:ring-[#0B6B4F] disabled:bg-[#F8FAFC]"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-[#0F172A]" htmlFor="owner-password">
                      Password
                    </label>
                    <Link
                      href="/forgot-password"
                      className="text-[11px] font-medium text-[#0B6B4F] hover:underline"
                    >
                      Forgot password?
                    </Link>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#94A099] pointer-events-none" />
                    <input
                      id="owner-password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="current-password"
                      required
                      placeholder="••••••••••••"
                      disabled={isOwnerPending}
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
                  disabled={isOwnerPending}
                  className="w-full mt-2 inline-flex items-center justify-center gap-2 rounded-lg bg-[#0B6B4F] py-2.5 text-xs font-semibold text-white shadow-xs hover:bg-[#09543E] transition-colors disabled:opacity-60 cursor-pointer"
                >
                  {isOwnerPending ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Authenticating Workspace...</span>
                    </>
                  ) : (
                    <>
                      <span>Sign In to Dashboard</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </>
                  )}
                </button>
              </form>
            )}

            {/* Gym Member Form */}
            {activeTab === "MEMBER" && (
              <form action={memberFormAction} className="space-y-4">
                {memberState?.error && (
                  <div className="rounded-xl bg-[#FEF2F2] border border-[#FECACA] p-3 text-xs text-[#991B1B] flex items-start gap-2.5 animate-in fade-in">
                    <AlertCircle className="h-4 w-4 shrink-0 text-[#DC2626] mt-0.5" />
                    <span>{memberState.error}</span>
                  </div>
                )}

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[#0F172A] flex justify-between" htmlFor="gym-slug">
                    <span>Gym Workspace Code / Slug</span>
                    <span className="text-[11px] text-[#94A099] font-normal">e.g. iron-temple</span>
                  </label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#94A099] pointer-events-none" />
                    <input
                      id="gym-slug"
                      name="gymSlug"
                      type="text"
                      required
                      value={gymSlug}
                      onChange={(e) => setGymSlug(e.target.value)}
                      placeholder="gym-code-or-slug"
                      disabled={isMemberPending}
                      className="w-full rounded-lg border border-[#E3E7E4] bg-white py-2 pl-9 pr-3 text-xs text-[#0F172A] placeholder:text-[#94A099] font-mono focus:border-[#0B6B4F] focus:outline-hidden focus:ring-1 focus:ring-[#0B6B4F] disabled:bg-[#F8FAFC]"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[#0F172A]" htmlFor="member-email">
                    Member Email Address
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
                      disabled={isMemberPending}
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
                      disabled={isMemberPending}
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
                  disabled={isMemberPending}
                  className="w-full mt-2 inline-flex items-center justify-center gap-2 rounded-lg bg-[#0B6B4F] py-2.5 text-xs font-semibold text-white shadow-xs hover:bg-[#09543E] transition-colors disabled:opacity-60 cursor-pointer"
                >
                  {isMemberPending ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Verifying Pass...</span>
                    </>
                  ) : (
                    <>
                      <span>Enter Member Portal</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </>
                  )}
                </button>
              </form>
            )}

            {/* Separate Super Admin Callout */}
            <div className="mt-6 pt-5 border-t border-[#E3E7E4] flex items-center justify-between text-xs">
              <span className="text-[#5F6B65]">Platform administrator?</span>
              <Link
                href="/platform-admin/login"
                className="font-semibold text-[#0B6B4F] hover:underline inline-flex items-center gap-1"
              >
                <span>Super Admin Portal</span>
                <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </div>

          {/* Invitation-Only Notice Footer */}
          <div className="mt-5 rounded-xl border border-[#E3E7E4] bg-white p-3.5 text-xs text-[#5F6B65] text-center">
            <span>New fitness business? </span>
            <Link href="/register" className="font-semibold text-[#0B6B4F] hover:underline">
              Onboarding is invitation-only. Learn more &rarr;
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#F5F6F4]">
          <Loader2 className="h-8 w-8 animate-spin text-[#0B6B4F]" />
        </div>
      }
    >
      <LoginFormContent />
    </Suspense>
  );
}

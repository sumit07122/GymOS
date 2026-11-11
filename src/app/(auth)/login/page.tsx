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
  Zap,
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

  const [ownerEmail, setOwnerEmail] = useState("");
  const [ownerPassword, setOwnerPassword] = useState("");

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

  const setDemoCredentials = (email: string, pass: string) => {
    setOwnerEmail(email);
    setOwnerPassword(pass);
  };

  return (
    <div className="min-h-screen w-full overflow-x-hidden flex flex-col lg:grid lg:grid-cols-12 bg-[#F7FAF8] font-sans text-[#171C19] antialiased">
      {/* Left Panel: High-Impact B2B SaaS Showcase (Desktop) */}
      <div className="hidden lg:flex lg:col-span-5 xl:col-span-6 flex-col justify-between p-10 xl:p-14 text-white relative overflow-hidden bg-[#171C19]">
        {/* Subtle decorative grid lines */}
        <div className="absolute inset-0 bg-[radial-gradient(#1BC95A_1px,transparent_1px)] [background-size:28px_28px] opacity-10 pointer-events-none" />

        {/* Brand Header */}
        <div className="relative z-10">
          <Link href="/" className="inline-flex items-center gap-2.5 group">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#1BC95A] text-white shadow-xs group-hover:bg-[#16A34A] transition-colors">
              <span className="font-display text-lg font-bold">G</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="font-display text-2xl font-bold tracking-tight text-white">
                Gym<span className="text-[#1BC95A]">OS</span>
              </span>
              <span className="rounded-full bg-[#1BC95A]/20 border border-[#1BC95A]/40 px-2 py-0.5 text-[10px] font-mono font-medium text-[#1BC95A]">
                v2.4
              </span>
            </div>
          </Link>
        </div>

        {/* Center Marketing Pitch */}
        <div className="relative z-10 max-w-lg my-auto py-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-[#1BC95A] backdrop-blur-xs mb-6">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Commercial Multi-Tenant Operating System</span>
          </div>

          <h2 className="font-display text-3xl xl:text-4xl font-extrabold leading-tight tracking-tight text-white">
            Run your gym. <br />
            <span className="text-[#1BC95A]">Grow your business.</span>
          </h2>

          <p className="mt-4 text-sm text-[#FFFFFF]/70 leading-relaxed">
            Manage members, dynamic 60s QR gate attendance, automated dues recovery, and WhatsApp broadcasts in one ultra-clean platform.
          </p>

          {/* Operational Highlights Grid */}
          <div className="mt-8 grid grid-cols-2 gap-3.5">
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 backdrop-blur-md shadow-xs">
              <QrCode className="h-5 w-5 text-[#1BC95A] mb-2" />
              <p className="text-xs font-bold text-white">Anti-Passback QR</p>
              <p className="text-[11px] text-[#FFFFFF]/60 mt-0.5">60-second rotating signed pass</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 backdrop-blur-md shadow-xs">
              <CreditCard className="h-5 w-5 text-[#1BC95A] mb-2" />
              <p className="text-xs font-bold text-white">Automated Dues</p>
              <p className="text-[11px] text-[#FFFFFF]/60 mt-0.5">Dual-tax GST & partial receipts</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 backdrop-blur-md shadow-xs">
              <ShieldCheck className="h-5 w-5 text-[#1BC95A] mb-2" />
              <p className="text-xs font-bold text-white">Tenant Isolation</p>
              <p className="text-[11px] text-[#FFFFFF]/60 mt-0.5">Server-side database boundaries</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 backdrop-blur-md shadow-xs">
              <MessageCircle className="h-5 w-5 text-[#1BC95A] mb-2" />
              <p className="text-xs font-bold text-white">WhatsApp Engine</p>
              <p className="text-[11px] text-[#FFFFFF]/60 mt-0.5">Daily expiry & dues reminders</p>
            </div>
          </div>
        </div>

        {/* Footer Subtext */}
        <div className="relative z-10 flex items-center justify-between text-xs text-[#FFFFFF]/60 pt-6 border-t border-white/10">
          <span>Enterprise Cloud Architecture &bull; 99.98% SLA</span>
          <span className="font-mono text-[11px] text-[#1BC95A]">gms.fixia.in</span>
        </div>
      </div>

      {/* Right Panel: Authentication Card & Form */}
      <div className="flex-1 w-full min-w-0 lg:col-span-7 xl:col-span-6 flex flex-col justify-center items-center p-4 sm:p-8 lg:p-12 xl:p-16 my-auto">
        <div className="w-full max-w-md min-w-0">
          {/* Mobile Brand Header */}
          <div className="lg:hidden text-center mb-6">
            <Link href="/" className="inline-flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#1BC95A] text-white font-bold shadow-xs">
                G
              </div>
              <span className="font-display text-xl font-extrabold text-[#171C19]">
                Gym<span className="text-[#1BC95A]">OS</span>
              </span>
            </Link>
          </div>

          {/* Main Card Surface */}
          <div className="rounded-3xl border border-[#E7ECE9] bg-white p-6 sm:p-8 shadow-lg">
            {/* Header Titles */}
            <div className="mb-6">
              <h1 className="font-display text-2xl font-extrabold tracking-tight text-[#171C19]">
                Sign in to your workspace
              </h1>
              <p className="mt-1 text-xs sm:text-sm text-[#69736E] leading-relaxed">
                Choose your role to access your authorized GymOS dashboard
              </p>
            </div>

            {/* Role Switcher Tabs */}
            <div className="grid grid-cols-2 p-1 rounded-xl bg-[#F7FAF8] border border-[#E7ECE9] mb-6">
              <button
                type="button"
                onClick={() => setActiveTab("OWNER")}
                className={`py-2 text-xs font-bold rounded-lg flex items-center justify-center gap-2 transition-all ${
                  activeTab === "OWNER"
                    ? "bg-white text-[#16A34A] shadow-xs border border-[#E7ECE9]"
                    : "text-[#69736E] hover:text-[#171C19]"
                }`}
              >
                <Building2 className="h-3.5 w-3.5" />
                <span>Gym Owner / Staff</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("MEMBER")}
                className={`py-2 text-xs font-bold rounded-lg flex items-center justify-center gap-2 transition-all ${
                  activeTab === "MEMBER"
                    ? "bg-white text-[#16A34A] shadow-xs border border-[#E7ECE9]"
                    : "text-[#69736E] hover:text-[#171C19]"
                }`}
              >
                <Users className="h-3.5 w-3.5" />
                <span>Gym Member Pass</span>
              </button>
            </div>

            {/* Gym Owner / Staff Form */}
            {activeTab === "OWNER" && (
              <form action={ownerAction} className="space-y-4">
                {ownerState?.error && (
                  <div className="rounded-xl bg-rose-50 border border-rose-200 p-3.5 text-xs text-rose-800 flex items-start gap-2.5 animate-in fade-in">
                    <AlertCircle className="h-4 w-4 shrink-0 text-rose-600 mt-0.5" />
                    <span>{ownerState.error}</span>
                  </div>
                )}

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#171C19] flex justify-between" htmlFor="owner-email">
                    <span>Business Email Address</span>
                    <span className="text-[11px] text-[#69736E] font-normal">Registered gym owner</span>
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#69736E]/60 pointer-events-none" />
                    <input
                      id="owner-email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      value={ownerEmail}
                      onChange={(e) => setOwnerEmail(e.target.value)}
                      placeholder="owner@yourgym.com"
                      disabled={isOwnerPending}
                      className="w-full rounded-xl border border-[#E7ECE9] bg-white py-2.5 pl-9 pr-3 text-xs text-[#171C19] placeholder:text-[#69736E]/50 focus:border-[#1BC95A] focus:outline-hidden focus:ring-2 focus:ring-[#1BC95A]/20 disabled:bg-[#F7FAF8] transition"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-[#171C19]" htmlFor="owner-password">
                      Password
                    </label>
                    <Link
                      href="/forgot-password"
                      className="text-[11px] font-semibold text-[#16A34A] hover:underline"
                    >
                      Forgot password?
                    </Link>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#69736E]/60 pointer-events-none" />
                    <input
                      id="owner-password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="current-password"
                      required
                      value={ownerPassword}
                      onChange={(e) => setOwnerPassword(e.target.value)}
                      placeholder="••••••••••••"
                      disabled={isOwnerPending}
                      className="w-full rounded-xl border border-[#E7ECE9] bg-white py-2.5 pl-9 pr-9 text-xs text-[#171C19] placeholder:text-[#69736E]/50 focus:border-[#1BC95A] focus:outline-hidden focus:ring-2 focus:ring-[#1BC95A]/20 disabled:bg-[#F7FAF8] transition font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#69736E] hover:text-[#171C19]"
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
                  className="w-full mt-2 inline-flex items-center justify-center gap-2 rounded-xl bg-[#1BC95A] py-3 text-xs font-extrabold text-white shadow-xs hover:bg-[#16A34A] transition-colors disabled:opacity-60 cursor-pointer"
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

                {/* Demo Quick Fill Helper */}
                <div className="pt-3 border-t border-[#E7ECE9]/60">
                  <div className="text-[11px] font-bold text-[#69736E] mb-1.5 flex items-center gap-1">
                    <Zap className="h-3 w-3 text-[#1BC95A]" />
                    <span>Quick Fill Demo Credentials:</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    <button
                      type="button"
                      onClick={() => setDemoCredentials("owner@ironforge.dev", "password")}
                      className="px-2 py-1 rounded-md bg-[#F7FAF8] border border-[#E7ECE9] text-[10px] font-mono font-medium text-[#171C19] hover:bg-[#E8F9EE] hover:border-[#1BC95A]/30 transition"
                    >
                      owner@ironforge.dev
                    </button>
                    <button
                      type="button"
                      onClick={() => setDemoCredentials("admin@fixia.in", "ValidPassword123!")}
                      className="px-2 py-1 rounded-md bg-[#F7FAF8] border border-[#E7ECE9] text-[10px] font-mono font-medium text-[#171C19] hover:bg-[#E8F9EE] hover:border-[#1BC95A]/30 transition"
                    >
                      admin@fixia.in
                    </button>
                  </div>
                </div>
              </form>
            )}

            {/* Gym Member Form */}
            {activeTab === "MEMBER" && (
              <form action={memberFormAction} className="space-y-4">
                {memberState?.error && (
                  <div className="rounded-xl bg-rose-50 border border-rose-200 p-3.5 text-xs text-rose-800 flex items-start gap-2.5 animate-in fade-in">
                    <AlertCircle className="h-4 w-4 shrink-0 text-rose-600 mt-0.5" />
                    <span>{memberState.error}</span>
                  </div>
                )}

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#171C19] flex justify-between" htmlFor="gym-slug">
                    <span>Gym Workspace Code / Slug</span>
                    <span className="text-[11px] text-[#69736E] font-normal">e.g. ironforge-fitness</span>
                  </label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#69736E]/60 pointer-events-none" />
                    <input
                      id="gym-slug"
                      name="gymSlug"
                      type="text"
                      required
                      value={gymSlug}
                      onChange={(e) => setGymSlug(e.target.value)}
                      placeholder="gym-code-or-slug"
                      disabled={isMemberPending}
                      className="w-full rounded-xl border border-[#E7ECE9] bg-white py-2.5 pl-9 pr-3 text-xs text-[#171C19] placeholder:text-[#69736E]/50 font-mono focus:border-[#1BC95A] focus:outline-hidden focus:ring-2 focus:ring-[#1BC95A]/20 disabled:bg-[#F7FAF8] transition"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#171C19]" htmlFor="member-email">
                    Member Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#69736E]/60 pointer-events-none" />
                    <input
                      id="member-email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      placeholder="member@example.com"
                      disabled={isMemberPending}
                      className="w-full rounded-xl border border-[#E7ECE9] bg-white py-2.5 pl-9 pr-3 text-xs text-[#171C19] placeholder:text-[#69736E]/50 focus:border-[#1BC95A] focus:outline-hidden focus:ring-2 focus:ring-[#1BC95A]/20 disabled:bg-[#F7FAF8] transition"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#171C19]" htmlFor="member-password">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#69736E]/60 pointer-events-none" />
                    <input
                      id="member-password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="current-password"
                      required
                      placeholder="••••••••••••"
                      disabled={isMemberPending}
                      className="w-full rounded-xl border border-[#E7ECE9] bg-white py-2.5 pl-9 pr-9 text-xs text-[#171C19] placeholder:text-[#69736E]/50 focus:border-[#1BC95A] focus:outline-hidden focus:ring-2 focus:ring-[#1BC95A]/20 disabled:bg-[#F7FAF8] transition font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#69736E] hover:text-[#171C19]"
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
                  className="w-full mt-2 inline-flex items-center justify-center gap-2 rounded-xl bg-[#1BC95A] py-3 text-xs font-extrabold text-white shadow-xs hover:bg-[#16A34A] transition-colors disabled:opacity-60 cursor-pointer"
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
            <div className="mt-6 pt-5 border-t border-[#E7ECE9] flex items-center justify-between text-xs">
              <span className="text-[#69736E]">Platform administrator?</span>
              <Link
                href="/platform-admin/login"
                className="font-bold text-[#16A34A] hover:underline inline-flex items-center gap-1"
              >
                <span>Super Admin Portal</span>
                <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </div>

          {/* New gym registration footer callout */}
          <div className="mt-5 rounded-2xl border border-[#E7ECE9] bg-white p-4 text-xs text-[#69736E] text-center shadow-xs">
            <span>New fitness business? </span>
            <Link href="/register" className="font-bold text-[#16A34A] hover:underline">
              Start 14-day free trial &rarr;
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
        <div className="min-h-screen flex items-center justify-center bg-[#F7FAF8]">
          <Loader2 className="h-8 w-8 animate-spin text-[#1BC95A]" />
        </div>
      }
    >
      <LoginFormContent />
    </Suspense>
  );
}

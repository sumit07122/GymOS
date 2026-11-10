"use client";

import { useActionState, useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { loginAction, memberLoginAction } from "@/lib/auth/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import {
  Dumbbell,
  User,
  ShieldCheck,
  Loader2,
  AlertCircle,
  ArrowRight,
  Lock,
  Mail,
  Eye,
  EyeOff,
  Sparkles,
} from "lucide-react";

function LoginFormInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnUrl = searchParams.get("returnUrl");
  const prefillGym = searchParams.get("gym") || "";

  const [activeTab, setActiveTab] = useState<"OWNER" | "MEMBER">(
    prefillGym ? "MEMBER" : "OWNER"
  );
  const [gymSlug, setGymSlug] = useState(prefillGym);
  const [showOwnerPassword, setShowOwnerPassword] = useState(false);
  const [showMemberPassword, setShowMemberPassword] = useState(false);

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
    <div className="min-h-[100dvh] w-full bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-4 py-8 sm:p-6 md:p-8 relative overflow-y-auto selection:bg-indigo-500 selection:text-white">
      {/* Ambient Radial Gradient Glows */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-gradient-to-b from-indigo-600/20 via-purple-600/10 to-transparent blur-3xl pointer-events-none" />
      <div className="fixed bottom-0 right-1/4 w-[450px] h-[320px] bg-indigo-900/10 blur-3xl pointer-events-none" />
      <div className="fixed top-1/3 left-1/4 w-[350px] h-[280px] bg-emerald-600/5 blur-3xl pointer-events-none" />

      {/* Centered Container */}
      <div className="w-full max-w-md relative z-10 flex flex-col items-center my-auto">
        {/* Brand Header */}
        <div className="text-center mb-6">
          <Link href="/" className="inline-flex items-center gap-3 group">
            <div className="size-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-indigo-500 text-white flex items-center justify-center font-bold shadow-xl shadow-indigo-600/25 ring-1 ring-white/10 group-hover:scale-105 transition-transform duration-200">
              <Dumbbell className="size-6 text-white" />
            </div>
            <div className="text-left">
              <div className="flex items-center gap-2">
                <span className="font-black text-2xl tracking-tight text-white">FIXIA</span>
                <span className="text-[10px] font-extrabold uppercase tracking-widest bg-indigo-950/90 border border-indigo-700/60 text-indigo-300 px-2.5 py-0.5 rounded-full shadow-inner">
                  GymOS
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium">
                Enterprise Multi-Tenant Cloud Platform
              </p>
            </div>
          </Link>
        </div>

        {/* Glassmorphic Login Card */}
        <Card className="w-full border-slate-800/80 bg-slate-900/85 shadow-2xl shadow-indigo-950/70 backdrop-blur-2xl text-slate-100 rounded-3xl overflow-hidden transition-all duration-300 relative before:absolute before:inset-x-0 before:top-0 before:h-[2px] before:bg-gradient-to-r before:from-transparent before:via-indigo-500/50 before:to-transparent">
          <CardHeader className="space-y-4 pb-4 text-center border-b border-slate-800/60 bg-slate-950/40">
            <div>
              <CardTitle className="text-lg font-bold text-white tracking-tight flex items-center justify-center gap-2">
                <Lock className="size-4 text-indigo-400" />
                <span>Secure Workspace Access</span>
              </CardTitle>
              <CardDescription className="text-xs text-slate-400 mt-1">
                Choose your role to sign into your authenticated environment
              </CardDescription>
            </div>

            {/* Segmented Tab Pill Selector */}
            <div className="grid grid-cols-2 p-1 bg-slate-950/90 rounded-2xl border border-slate-800/90 shadow-inner">
              <button
                type="button"
                onClick={() => setActiveTab("OWNER")}
                className={`py-2.5 text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  activeTab === "OWNER"
                    ? "bg-gradient-to-r from-indigo-600 to-indigo-500 text-white shadow-md shadow-indigo-600/30"
                    : "text-slate-400 hover:text-white hover:bg-slate-900/60"
                }`}
              >
                <Dumbbell className="size-3.5" />
                <span>Gym Owner</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("MEMBER")}
                className={`py-2.5 text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  activeTab === "MEMBER"
                    ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-600/30"
                    : "text-slate-400 hover:text-white hover:bg-slate-900/60"
                }`}
              >
                <User className="size-3.5" />
                <span>Gym Member</span>
              </button>
            </div>
          </CardHeader>

          {activeTab === "OWNER" ? (
            /* Gym Owner Login Form */
            <form action={ownerAction}>
              <CardContent className="space-y-4 pt-6 px-6">
                {ownerState?.error && (
                  <div className="rounded-xl bg-rose-950/40 border border-rose-500/30 p-3.5 text-xs text-rose-300 flex items-start gap-2.5 animate-in fade-in duration-200">
                    <AlertCircle className="size-4 shrink-0 text-rose-400 mt-0.5" />
                    <span className="leading-relaxed">{ownerState.error}</span>
                  </div>
                )}

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-200 flex items-center justify-between" htmlFor="owner-email">
                    <span>Owner Email Address</span>
                    <span className="text-[10px] text-slate-500 font-normal">Registered Account</span>
                  </label>
                  <div className="relative">
                    <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none">
                      <Mail className="size-4" />
                    </div>
                    <Input
                      id="owner-email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      placeholder="owner@yourgym.com"
                      className="pl-10 h-11 text-xs bg-slate-950/70 border-slate-800 text-white placeholder-slate-500 rounded-xl focus-visible:ring-2 focus-visible:ring-indigo-500/50 focus-visible:border-indigo-500 transition-all"
                      disabled={isOwnerPending}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-slate-200" htmlFor="owner-password">
                      Password
                    </label>
                    <Link
                      href="/forgot-password"
                      className="text-[11px] text-indigo-400 hover:text-indigo-300 font-medium transition"
                    >
                      Forgot password?
                    </Link>
                  </div>
                  <div className="relative">
                    <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none">
                      <Lock className="size-4" />
                    </div>
                    <Input
                      id="owner-password"
                      name="password"
                      type={showOwnerPassword ? "text" : "password"}
                      autoComplete="current-password"
                      required
                      placeholder="••••••••••••"
                      className="pl-10 pr-10 h-11 text-xs bg-slate-950/70 border-slate-800 text-white placeholder-slate-500 rounded-xl font-mono focus-visible:ring-2 focus-visible:ring-indigo-500/50 focus-visible:border-indigo-500 transition-all"
                      disabled={isOwnerPending}
                    />
                    <button
                      type="button"
                      onClick={() => setShowOwnerPassword(!showOwnerPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition cursor-pointer"
                      tabIndex={-1}
                      aria-label={showOwnerPassword ? "Hide password" : "Show password"}
                    >
                      {showOwnerPassword ? (
                        <EyeOff className="size-4" />
                      ) : (
                        <Eye className="size-4" />
                      )}
                    </button>
                  </div>
                </div>
              </CardContent>

              <CardFooter className="flex flex-col gap-4 pt-3 pb-6 px-6">
                <Button
                  type="submit"
                  className="w-full h-11 font-bold text-xs cursor-pointer bg-gradient-to-r from-indigo-600 via-indigo-500 to-indigo-600 hover:from-indigo-500 hover:to-indigo-400 text-white shadow-lg shadow-indigo-600/30 rounded-xl transition-all duration-200 active:scale-[0.99]"
                  disabled={isOwnerPending}
                >
                  {isOwnerPending ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="size-4 animate-spin" />
                      <span>Signing into Owner Dashboard...</span>
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-1.5">
                      <span>Sign In as Gym Owner</span>
                      <ArrowRight className="size-3.5" />
                    </span>
                  )}
                </Button>
              </CardFooter>
            </form>
          ) : (
            /* Gym Member Login Form */
            <form action={memberFormAction}>
              <CardContent className="space-y-4 pt-6 px-6">
                {memberState?.error && (
                  <div className="rounded-xl bg-rose-950/40 border border-rose-500/30 p-3.5 text-xs text-rose-300 flex items-start gap-2.5 animate-in fade-in duration-200">
                    <AlertCircle className="size-4 shrink-0 text-rose-400 mt-0.5" />
                    <span className="leading-relaxed">{memberState.error}</span>
                  </div>
                )}

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-200 flex items-center justify-between" htmlFor="gym-slug">
                    <span>Gym Workspace Code or URL Slug</span>
                    <span className="text-[10px] text-slate-500 font-normal">e.g. /g/spartan</span>
                  </label>
                  <div className="flex items-center">
                    <span className="text-xs text-slate-500 bg-slate-950 border border-r-0 border-slate-800 px-3.5 h-11 flex items-center rounded-l-xl font-mono">
                      /g/
                    </span>
                    <div className="relative flex-1">
                      <Input
                        id="gym-slug"
                        name="gymSlug"
                        type="text"
                        required
                        value={gymSlug}
                        onChange={(e) => setGymSlug(e.target.value)}
                        placeholder="spartan-athletics"
                        className="h-11 text-xs bg-slate-950/70 border-slate-800 text-white placeholder-slate-500 rounded-l-none rounded-r-xl font-mono focus-visible:ring-2 focus-visible:ring-emerald-500/50 focus-visible:border-emerald-500 transition-all"
                        disabled={isMemberPending}
                      />
                    </div>
                  </div>
                  <p className="text-[10px] text-slate-400">
                    Found on your digital pass, welcome WhatsApp, or gym public link.
                  </p>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-200" htmlFor="member-email">
                    Registered Member Email
                  </label>
                  <div className="relative">
                    <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none">
                      <Mail className="size-4" />
                    </div>
                    <Input
                      id="member-email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      placeholder="member@example.com"
                      className="pl-10 h-11 text-xs bg-slate-950/70 border-slate-800 text-white placeholder-slate-500 rounded-xl focus-visible:ring-2 focus-visible:ring-emerald-500/50 focus-visible:border-emerald-500 transition-all"
                      disabled={isMemberPending}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-slate-200" htmlFor="member-password">
                      Password
                    </label>
                    <Link
                      href="/forgot-password"
                      className="text-[11px] text-emerald-400 hover:text-emerald-300 font-medium transition"
                    >
                      Forgot password?
                    </Link>
                  </div>
                  <div className="relative">
                    <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none">
                      <Lock className="size-4" />
                    </div>
                    <Input
                      id="member-password"
                      name="password"
                      type={showMemberPassword ? "text" : "password"}
                      autoComplete="current-password"
                      required
                      placeholder="••••••••••••"
                      className="pl-10 pr-10 h-11 text-xs bg-slate-950/70 border-slate-800 text-white placeholder-slate-500 rounded-xl font-mono focus-visible:ring-2 focus-visible:ring-emerald-500/50 focus-visible:border-emerald-500 transition-all"
                      disabled={isMemberPending}
                    />
                    <button
                      type="button"
                      onClick={() => setShowMemberPassword(!showMemberPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition cursor-pointer"
                      tabIndex={-1}
                      aria-label={showMemberPassword ? "Hide password" : "Show password"}
                    >
                      {showMemberPassword ? (
                        <EyeOff className="size-4" />
                      ) : (
                        <Eye className="size-4" />
                      )}
                    </button>
                  </div>
                </div>
              </CardContent>

              <CardFooter className="flex flex-col gap-4 pt-3 pb-6 px-6">
                <Button
                  type="submit"
                  className="w-full h-11 font-bold text-xs cursor-pointer bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-lg shadow-emerald-600/30 rounded-xl transition-all duration-200 active:scale-[0.99]"
                  disabled={isMemberPending}
                >
                  {isMemberPending ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="size-4 animate-spin" />
                      <span>Loading Member Portal...</span>
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-1.5">
                      <span>Access Member Portal & Pass</span>
                      <ArrowRight className="size-3.5" />
                    </span>
                  )}
                </Button>
              </CardFooter>
            </form>
          )}

          {/* Super Admin Gateway Strip */}
          <div className="border-t border-slate-800/80 py-3.5 px-6 bg-slate-950/70 flex items-center justify-between">
            <span className="text-[11px] text-slate-400 flex items-center gap-1.5">
              <ShieldCheck className="size-3.5 text-indigo-400" />
              <span>FIXIA Administration?</span>
            </span>
            <Link
              href="/platform-admin/login"
              className="text-[11px] text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1 hover:underline transition"
            >
              <span>Super Admin Login</span>
              <ArrowRight className="size-3" />
            </Link>
          </div>
        </Card>

        {/* Security / System Footer */}
        <div className="mt-6 text-center text-xs text-slate-500 space-y-1">
          <p className="flex items-center justify-center gap-1.5">
            <Sparkles className="size-3 text-indigo-400" />
            <span>Encrypted Session • HMAC-SHA256 Token Security</span>
          </p>
          <p className="text-[11px] text-slate-600">
            Official Cloud Domain &bull; <strong className="text-slate-400">https://gms.fixia.in</strong>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-8">
          <Loader2 className="size-8 animate-spin text-indigo-500" />
        </div>
      }
    >
      <LoginFormInner />
    </Suspense>
  );
}

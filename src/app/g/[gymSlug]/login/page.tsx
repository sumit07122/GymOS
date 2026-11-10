"use client";

import * as React from "react";
import { useActionState, useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Dumbbell, ArrowLeft, Loader2, AlertCircle, Lock, Sparkles, ArrowRight, Mail, Eye, EyeOff, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
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

  const gymDisplayName = gymSlug ? gymSlug.replace(/-/g, " ") : "Gym";

  return (
    <div className="min-h-[100dvh] w-full bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-4 py-8 sm:p-6 md:p-8 relative overflow-y-auto selection:bg-emerald-500 selection:text-white">
      {/* Background Decorative Ambient Glows */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-gradient-to-b from-emerald-600/15 via-teal-600/10 to-transparent blur-3xl pointer-events-none" />
      <div className="fixed bottom-0 right-1/4 w-[450px] h-[320px] bg-indigo-900/10 blur-3xl pointer-events-none" />

      {/* Main Centered Container */}
      <div className="w-full max-w-md relative z-10 flex flex-col items-center my-auto">
        <Link
          href={`/g/${gymSlug}`}
          className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white mb-6 transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to gym public site</span>
        </Link>

        {/* Centered Member Login Card */}
        <Card className="w-full border-slate-800/80 bg-slate-900/85 shadow-2xl shadow-emerald-950/40 backdrop-blur-2xl text-slate-100 rounded-3xl overflow-hidden relative before:absolute before:inset-x-0 before:top-0 before:h-[2px] before:bg-gradient-to-r before:from-transparent before:via-emerald-500/60 before:to-transparent">
          <CardHeader className="space-y-3 pb-4 text-center border-b border-slate-800/60 bg-slate-950/50">
            <div className="size-13 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center mx-auto mb-1 shadow-lg shadow-emerald-600/25 ring-1 ring-white/10">
              <Dumbbell className="size-7 text-white" />
            </div>
            <div>
              <CardTitle className="text-xl font-black tracking-tight text-white capitalize">
                {gymDisplayName} Member Access
              </CardTitle>
              <CardDescription className="text-xs text-slate-400 mt-1">
                Sign in to access your digital membership pass, training routines, and attendance ledger.
              </CardDescription>
            </div>
          </CardHeader>

          <form action={formAction}>
            <input type="hidden" name="gymSlug" value={gymSlug} />

            <CardContent className="space-y-4 pt-6 px-6">
              {state?.error && (
                <div className="rounded-xl bg-rose-950/40 border border-rose-500/30 p-3.5 text-xs text-rose-300 flex items-start gap-2.5 animate-in fade-in duration-200">
                  <AlertCircle className="size-4 shrink-0 text-rose-400 mt-0.5" />
                  <span className="leading-relaxed">{state.error}</span>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-200 flex items-center justify-between">
                  <span>Gym Workspace</span>
                  <span className="text-[10px] text-emerald-400 font-mono font-medium">Verified Tenant</span>
                </label>
                <div className="relative">
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none">
                    <Building2 className="size-4" />
                  </div>
                  <Input
                    disabled
                    value={`/g/${gymSlug}`}
                    className="pl-10 h-11 text-xs bg-slate-950/70 border-slate-800 text-slate-300 font-mono rounded-xl"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-200" htmlFor="email">
                  Registered Member Email
                </label>
                <div className="relative">
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none">
                    <Mail className="size-4" />
                  </div>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    placeholder="member@example.com"
                    className="pl-10 h-11 text-xs bg-slate-950/70 border-slate-800 text-white placeholder-slate-500 rounded-xl focus-visible:ring-2 focus-visible:ring-emerald-500/50 focus-visible:border-emerald-500 transition-all"
                    disabled={isPending}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-200" htmlFor="password">
                    Password
                  </label>
                </div>
                <div className="relative">
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none">
                    <Lock className="size-4" />
                  </div>
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    required
                    placeholder="••••••••••••"
                    className="pl-10 pr-10 h-11 text-xs bg-slate-950/70 border-slate-800 text-white placeholder-slate-500 rounded-xl font-mono focus-visible:ring-2 focus-visible:ring-emerald-500/50 focus-visible:border-emerald-500 transition-all"
                    disabled={isPending}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition cursor-pointer"
                    tabIndex={-1}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
              </div>
            </CardContent>

            <CardFooter className="flex flex-col gap-3 pt-3 pb-6 px-6">
              <Button
                type="submit"
                disabled={isPending}
                className="w-full h-11 font-bold text-xs cursor-pointer bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-lg shadow-emerald-600/30 rounded-xl transition-all duration-200 active:scale-[0.99]"
              >
                {isPending ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="size-4 animate-spin" />
                    <span>Verifying Member Pass...</span>
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-1.5">
                    <Lock className="size-3.5" />
                    <span>Enter Member Portal</span>
                    <ArrowRight className="size-3.5 ml-1" />
                  </span>
                )}
              </Button>
            </CardFooter>
          </form>
        </Card>

        {/* Security Subtext */}
        <div className="mt-6 text-center text-xs text-slate-500 space-y-1">
          <p className="flex items-center justify-center gap-1.5">
            <Sparkles className="size-3 text-emerald-400" />
            <span>Cryptographic Member Identity • Anti-Passback QR Protection</span>
          </p>
          <p className="text-[11px] text-slate-600">
            Powered by FIXIA GymOS &bull; <strong className="text-slate-400">gms.fixia.in</strong>
          </p>
        </div>
      </div>
    </div>
  );
}

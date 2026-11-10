"use client";

import { useActionState, useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { superAdminLoginAction } from "@/lib/auth/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { ShieldCheck, Loader2, AlertCircle, ArrowLeft, Lock, Mail, Eye, EyeOff, Sparkles } from "lucide-react";

function SuperAdminLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnUrl = searchParams.get("returnUrl");
  const [state, formAction, isPending] = useActionState(superAdminLoginAction, null);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (state?.success && state.redirectUrl) {
      router.push(returnUrl || state.redirectUrl);
    }
  }, [state, router, returnUrl]);

  return (
    <div className="min-h-[100dvh] w-full bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-4 py-8 sm:p-6 md:p-8 relative overflow-y-auto selection:bg-indigo-500 selection:text-white">
      {/* Background Decorative Ambient Glows */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-gradient-to-b from-indigo-600/20 via-purple-600/10 to-transparent blur-3xl pointer-events-none" />
      <div className="fixed bottom-0 right-1/4 w-[450px] h-[320px] bg-indigo-900/10 blur-3xl pointer-events-none" />

      {/* Main Centered Container */}
      <div className="w-full max-w-md relative z-10 flex flex-col items-center my-auto">
        <Link
          href="/login"
          className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white mb-6 transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to standard login</span>
        </Link>

        {/* Centered Admin Card */}
        <Card className="w-full border-indigo-500/30 bg-slate-900/85 shadow-2xl shadow-indigo-950/70 backdrop-blur-2xl text-slate-100 rounded-3xl overflow-hidden relative before:absolute before:inset-x-0 before:top-0 before:h-[2px] before:bg-gradient-to-r before:from-transparent before:via-indigo-500/60 before:to-transparent">
          <CardHeader className="space-y-3 pb-4 text-center border-b border-slate-800/60 bg-slate-950/50">
            <div className="size-13 rounded-2xl bg-gradient-to-tr from-indigo-600 to-indigo-500 text-white flex items-center justify-center mx-auto mb-1 shadow-lg shadow-indigo-600/25 ring-1 ring-white/10">
              <ShieldCheck className="size-7 text-white" />
            </div>
            <div>
              <CardTitle className="text-xl font-black tracking-tight text-white">
                FIXIA Platform Administration
              </CardTitle>
              <CardDescription className="text-xs text-slate-400 mt-1">
                Restricted area. Authorized FIXIA Super Administrators only.
              </CardDescription>
            </div>
          </CardHeader>

          <form action={formAction}>
            <CardContent className="space-y-4 pt-6 px-6">
              {state?.error && (
                <div className="rounded-xl bg-rose-950/40 border border-rose-500/30 p-3.5 text-xs text-rose-300 flex items-start gap-2.5 animate-in fade-in duration-200">
                  <AlertCircle className="size-4 shrink-0 text-rose-400 mt-0.5" />
                  <span className="leading-relaxed">{state.error}</span>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-200 flex items-center justify-between" htmlFor="admin-email">
                  <span>Super Admin Email</span>
                  <span className="text-[10px] text-slate-500">Root Account</span>
                </label>
                <div className="relative">
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none">
                    <Mail className="size-4" />
                  </div>
                  <Input
                    id="admin-email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    placeholder="admin@fixia.in"
                    className="pl-10 h-11 text-xs bg-slate-950/70 border-slate-800 text-white placeholder-slate-500 rounded-xl focus-visible:ring-2 focus-visible:ring-indigo-500/50 focus-visible:border-indigo-500 transition-all"
                    disabled={isPending}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-200" htmlFor="admin-password">
                    Root Password
                  </label>
                </div>
                <div className="relative">
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none">
                    <Lock className="size-4" />
                  </div>
                  <Input
                    id="admin-password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    required
                    placeholder="••••••••••••"
                    className="pl-10 pr-10 h-11 text-xs bg-slate-950/70 border-slate-800 text-white placeholder-slate-500 rounded-xl font-mono focus-visible:ring-2 focus-visible:ring-indigo-500/50 focus-visible:border-indigo-500 transition-all"
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
                className="w-full h-11 font-bold text-xs cursor-pointer bg-gradient-to-r from-indigo-600 via-indigo-500 to-indigo-600 hover:from-indigo-500 hover:to-indigo-400 text-white shadow-lg shadow-indigo-600/30 rounded-xl transition-all duration-200 active:scale-[0.99]"
                disabled={isPending}
              >
                {isPending ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="size-4 animate-spin" />
                    <span>Verifying Platform Authority...</span>
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-1.5">
                    <Lock className="size-3.5" />
                    <span>Authenticate Platform Admin</span>
                  </span>
                )}
              </Button>
            </CardFooter>
          </form>
        </Card>

        {/* Security Subtext */}
        <div className="mt-6 text-center text-xs text-slate-500 space-y-1">
          <p className="flex items-center justify-center gap-1.5">
            <Sparkles className="size-3 text-indigo-400" />
            <span>Strict Hardware Session Isolation • Immutable Audit Logging</span>
          </p>
          <p className="text-[11px] text-slate-600">
            Internal FIXIA Cloud Security Gateway &bull; <strong className="text-slate-400">gms.fixia.in</strong>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function SuperAdminLoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-8">
          <Loader2 className="size-8 animate-spin text-indigo-500" />
        </div>
      }
    >
      <SuperAdminLoginForm />
    </Suspense>
  );
}

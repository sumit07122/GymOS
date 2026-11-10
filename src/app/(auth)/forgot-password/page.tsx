"use client";

import { useActionState } from "react";
import Link from "next/link";
import { forgotPasswordAction } from "@/lib/auth/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Dumbbell, Loader2, AlertCircle, CheckCircle2, Mail, ArrowLeft, ArrowRight, Sparkles, KeyRound } from "lucide-react";

export default function ForgotPasswordPage() {
  const [state, formAction, isPending] = useActionState(forgotPasswordAction, null);

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
          <span>Back to sign in</span>
        </Link>

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

        {/* Centered Glassmorphic Card */}
        <Card className="w-full border-slate-800/80 bg-slate-900/85 shadow-2xl shadow-indigo-950/70 backdrop-blur-2xl text-slate-100 rounded-3xl overflow-hidden relative before:absolute before:inset-x-0 before:top-0 before:h-[2px] before:bg-gradient-to-r before:from-transparent before:via-indigo-500/50 before:to-transparent">
          <CardHeader className="space-y-3 pb-4 text-center border-b border-slate-800/60 bg-slate-950/50">
            <div className="size-13 rounded-2xl bg-gradient-to-tr from-indigo-600/20 to-indigo-500/10 text-indigo-400 border border-indigo-500/30 flex items-center justify-center mx-auto mb-1 shadow-lg shadow-indigo-600/15">
              <KeyRound className="size-7" />
            </div>
            <div>
              <CardTitle className="text-xl font-bold text-white tracking-tight">
                Reset Password
              </CardTitle>
              <CardDescription className="text-xs text-slate-400 mt-1">
                Enter your registered email address and we will dispatch a single-use verification link.
              </CardDescription>
            </div>
          </CardHeader>

          {state?.success ? (
            <CardContent className="space-y-4 pt-6 pb-6 px-6">
              <div className="rounded-2xl bg-emerald-950/40 border border-emerald-500/30 p-4 text-xs text-emerald-300 flex items-start gap-3">
                <CheckCircle2 className="size-5 shrink-0 mt-0.5 text-emerald-400" />
                <div className="space-y-1">
                  <p className="font-bold text-sm text-white">Reset link dispatched</p>
                  <p className="leading-relaxed text-emerald-300/90">{state.message}</p>
                </div>
              </div>
              <Link href="/login" className="w-full inline-block pt-2">
                <Button className="w-full h-11 bg-gradient-to-r from-indigo-600 via-indigo-500 to-indigo-600 hover:from-indigo-500 hover:to-indigo-400 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 rounded-xl transition-all duration-200">
                  <span>Return to Sign In</span>
                  <ArrowRight className="size-3.5 ml-1.5" />
                </Button>
              </Link>
            </CardContent>
          ) : (
            <form action={formAction}>
              <CardContent className="space-y-4 pt-6 px-6">
                {state?.error && (
                  <div className="rounded-xl bg-rose-950/40 border border-rose-500/30 p-3.5 text-xs text-rose-300 flex items-start gap-2.5 animate-in fade-in duration-200">
                    <AlertCircle className="size-4 shrink-0 text-rose-400 mt-0.5" />
                    <span className="leading-relaxed">{state.error}</span>
                  </div>
                )}

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-200" htmlFor="email">
                    Account Email Address
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
                      placeholder="name@gym.com"
                      className="pl-10 h-11 text-xs bg-slate-950/70 border-slate-800 text-white placeholder-slate-500 rounded-xl focus-visible:ring-2 focus-visible:ring-indigo-500/50 focus-visible:border-indigo-500 transition-all"
                      disabled={isPending}
                    />
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
                      <span>Dispatching Reset Link...</span>
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-1.5">
                      <span>Send Secure Reset Link</span>
                      <ArrowRight className="size-3.5" />
                    </span>
                  )}
                </Button>
              </CardFooter>
            </form>
          )}
        </Card>

        {/* Security Subtext */}
        <div className="mt-6 text-center text-xs text-slate-500 space-y-1">
          <p className="flex items-center justify-center gap-1.5">
            <Sparkles className="size-3 text-indigo-400" />
            <span>Cryptographic Single-Use Tokens • 15-Minute Expiry</span>
          </p>
          <p className="text-[11px] text-slate-600">
            Powered by FIXIA GymOS &bull; <strong className="text-slate-400">gms.fixia.in</strong>
          </p>
        </div>
      </div>
    </div>
  );
}

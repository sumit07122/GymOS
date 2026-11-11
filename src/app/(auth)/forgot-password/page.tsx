"use client";

import { useActionState } from "react";
import Link from "next/link";
import { forgotPasswordAction } from "@/lib/auth/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, AlertCircle, CheckCircle2, Mail, ArrowLeft, ArrowRight, KeyRound } from "lucide-react";

export default function ForgotPasswordPage() {
  const [state, formAction, isPending] = useActionState(forgotPasswordAction, null);

  return (
    <div className="min-h-screen w-full bg-[#F7FAF8] text-[#171C19] flex flex-col items-center justify-center p-4 py-12 sm:p-6 md:p-8 font-sans selection:bg-[#E8F9EE] selection:text-[#16A34A]">
      <div className="w-full max-w-md flex flex-col items-center my-auto">
        <Link
          href="/login"
          className="inline-flex items-center gap-1.5 text-xs text-[#69736E] hover:text-[#171C19] mb-6 transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to sign in</span>
        </Link>

        {/* Brand Header */}
        <div className="text-center mb-6">
          <Link href="/" className="inline-flex items-center gap-2.5 group">
            <div className="h-10 w-10 rounded-xl bg-[#1BC95A] text-white flex items-center justify-center font-extrabold font-display shadow-xs group-hover:bg-[#16A34A] transition-colors">
              G
            </div>
            <div className="flex items-center gap-1.5">
              <span className="font-display text-2xl font-extrabold text-[#171C19]">
                Gym<span className="text-[#1BC95A]">OS</span>
              </span>
            </div>
          </Link>
        </div>

        {/* Card */}
        <div className="w-full rounded-3xl border border-[#E7ECE9] bg-white p-6 sm:p-8 shadow-lg">
          <div className="text-center mb-6">
            <div className="h-12 w-12 rounded-2xl bg-[#E8F9EE] border border-[#1BC95A]/30 text-[#16A34A] flex items-center justify-center mx-auto mb-3 shadow-xs">
              <KeyRound className="h-6 w-6" />
            </div>
            <h1 className="font-display text-2xl font-extrabold tracking-tight text-[#171C19]">
              Reset Password
            </h1>
            <p className="mt-1 text-xs text-[#69736E] leading-relaxed">
              Enter your registered business email and we will dispatch a secure recovery token.
            </p>
          </div>

          {state?.success ? (
            <div className="space-y-4">
              <div className="rounded-2xl bg-[#E8F9EE] border border-[#1BC95A]/30 p-4 text-xs text-[#16A34A] flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 shrink-0 mt-0.5 text-[#16A34A]" />
                <div className="space-y-1">
                  <p className="font-bold text-sm text-[#171C19]">Reset instructions dispatched</p>
                  <p className="leading-relaxed text-[#69736E]">{state.message}</p>
                </div>
              </div>
              <Link href="/login" className="w-full inline-block pt-2">
                <Button className="w-full h-11 bg-[#1BC95A] hover:bg-[#16A34A] text-white font-extrabold text-xs rounded-xl shadow-xs transition">
                  <span>Return to Sign In</span>
                  <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
                </Button>
              </Link>
            </div>
          ) : (
            <form action={formAction} className="space-y-4">
              {state?.error && (
                <div className="rounded-xl bg-rose-50 border border-rose-200 p-3.5 text-xs text-rose-800 flex items-start gap-2.5 animate-in fade-in">
                  <AlertCircle className="h-4 w-4 shrink-0 text-rose-600 mt-0.5" />
                  <span className="leading-relaxed">{state.error}</span>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#171C19]" htmlFor="email">
                  Registered Account Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#69736E]/60 pointer-events-none" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    required
                    placeholder="owner@yourgym.com"
                    disabled={isPending}
                    className="w-full rounded-xl border border-[#E7ECE9] bg-white py-2.5 pl-9 pr-3 text-xs text-[#171C19] placeholder:text-[#69736E]/50 focus:border-[#1BC95A] focus:outline-hidden focus:ring-2 focus:ring-[#1BC95A]/20 transition"
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={isPending}
                className="w-full h-11 bg-[#1BC95A] hover:bg-[#16A34A] text-white font-extrabold text-xs rounded-xl shadow-xs transition"
              >
                {isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    <span>Sending Recovery Link...</span>
                  </>
                ) : (
                  <>
                    <span>Send Password Reset Link</span>
                    <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
                  </>
                )}
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

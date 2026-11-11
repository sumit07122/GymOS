"use client";

import { useActionState, useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { resetPasswordAction } from "@/lib/auth/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, AlertCircle, CheckCircle2, Lock, ArrowLeft, ArrowRight, Eye, EyeOff, KeyRound } from "lucide-react";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";
  const [state, formAction, isPending] = useActionState(resetPasswordAction, null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  if (!token) {
    return (
      <div className="space-y-4">
        <div className="rounded-2xl bg-rose-50 border border-rose-200 p-4 text-xs text-rose-800 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 shrink-0 mt-0.5 text-rose-600" />
          <div className="space-y-1">
            <p className="font-bold text-sm text-[#171C19]">Missing Reset Token</p>
            <p className="leading-relaxed text-[#69736E]">
              This password reset link is invalid or incomplete. Please request a new link.
            </p>
          </div>
        </div>
        <Link href="/forgot-password" className="w-full inline-block pt-2">
          <Button className="w-full h-11 bg-[#1BC95A] hover:bg-[#16A34A] text-white font-extrabold text-xs rounded-xl shadow-xs transition">
            <span>Request New Reset Link</span>
            <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <>
      {state?.success ? (
        <div className="space-y-4">
          <div className="rounded-2xl bg-[#E8F9EE] border border-[#1BC95A]/30 p-4 text-xs text-[#16A34A] flex items-start gap-3">
            <CheckCircle2 className="h-5 w-5 shrink-0 mt-0.5 text-[#16A34A]" />
            <div className="space-y-1">
              <p className="font-bold text-sm text-[#171C19]">Password Successfully Reset</p>
              <p className="leading-relaxed text-[#69736E]">{state.message}</p>
            </div>
          </div>
          <Link href="/login" className="w-full inline-block pt-2">
            <Button className="w-full h-11 bg-[#1BC95A] hover:bg-[#16A34A] text-white font-extrabold text-xs rounded-xl shadow-xs transition">
              <span>Proceed to Sign In</span>
              <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
            </Button>
          </Link>
        </div>
      ) : (
        <form action={formAction} className="space-y-4">
          <input type="hidden" name="token" value={token} />

          {state?.error && (
            <div className="rounded-xl bg-rose-50 border border-rose-200 p-3.5 text-xs text-rose-800 flex items-start gap-2.5 animate-in fade-in">
              <AlertCircle className="h-4 w-4 shrink-0 text-rose-600 mt-0.5" />
              <span className="leading-relaxed">{state.error}</span>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[#171C19]" htmlFor="password">
              New Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#69736E]/60 pointer-events-none" />
              <Input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                required
                placeholder="At least 8 characters"
                className="w-full rounded-xl border border-[#E7ECE9] bg-white py-2.5 pl-9 pr-9 text-xs text-[#171C19] placeholder:text-[#69736E]/50 focus:border-[#1BC95A] focus:outline-hidden focus:ring-2 focus:ring-[#1BC95A]/20 transition font-mono"
                disabled={isPending}
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
            {state?.fieldErrors?.password && (
              <p className="text-[11px] text-rose-600 mt-1">{state.fieldErrors.password[0]}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[#171C19]" htmlFor="confirmPassword">
              Confirm New Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#69736E]/60 pointer-events-none" />
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                autoComplete="new-password"
                required
                placeholder="Re-enter password"
                className="w-full rounded-xl border border-[#E7ECE9] bg-white py-2.5 pl-9 pr-9 text-xs text-[#171C19] placeholder:text-[#69736E]/50 focus:border-[#1BC95A] focus:outline-hidden focus:ring-2 focus:ring-[#1BC95A]/20 transition font-mono"
                disabled={isPending}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#69736E] hover:text-[#171C19]"
                tabIndex={-1}
                aria-label={showConfirmPassword ? "Hide password" : "Show password"}
              >
                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {state?.fieldErrors?.confirmPassword && (
              <p className="text-[11px] text-rose-600 mt-1">{state.fieldErrors.confirmPassword[0]}</p>
            )}
          </div>

          <Button
            type="submit"
            disabled={isPending}
            className="w-full h-11 bg-[#1BC95A] hover:bg-[#16A34A] text-white font-extrabold text-xs rounded-xl shadow-xs transition"
          >
            {isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                <span>Updating Password...</span>
              </>
            ) : (
              <>
                <span>Save New Password</span>
                <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
              </>
            )}
          </Button>
        </form>
      )}
    </>
  );
}

export default function ResetPasswordPage() {
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
              Set New Password
            </h1>
            <p className="mt-1 text-xs text-[#69736E] leading-relaxed">
              Create a new secure master password for your GymOS account.
            </p>
          </div>

          <Suspense
            fallback={
              <div className="py-8 flex justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-[#1BC95A]" />
              </div>
            }
          >
            <ResetPasswordForm />
          </Suspense>
        </div>
      </div>
    </div>
  );
}

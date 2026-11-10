"use client";

import { useActionState, useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { superAdminLoginAction } from "@/lib/auth/actions";
import {
  ShieldAlert,
  ShieldCheck,
  Lock,
  Mail,
  Eye,
  EyeOff,
  ArrowLeft,
  Loader2,
  AlertCircle,
  FileText,
} from "lucide-react";

function SuperAdminLoginFormContent() {
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
    <div
      className="min-h-screen w-full bg-[#062E23] text-white flex flex-col items-center justify-center p-4 py-8 sm:p-8 relative overflow-hidden"
      style={{
        backgroundImage:
          "radial-gradient(90% 100% at 50% 20%, #0F4A38 0%, #083327 50%, #041E16 100%)",
      }}
    >
      {/* Decorative ambient subtle lines & glows */}
      <div className="absolute inset-0 bg-[radial-gradient(#7FD6B2_1px,transparent_1px)] [background-size:24px_24px] opacity-10 pointer-events-none" />
      <div className="absolute -top-32 left-1/2 -translate-x-1/2 h-96 w-96 rounded-full bg-[#0B6B4F]/30 blur-3xl breathe pointer-events-none" />

      {/* Main Container */}
      <div className="relative z-10 w-full max-w-md min-w-0 my-auto flex flex-col items-center animate-in zoom-in-95 duration-200">
        <Link
          href="/login"
          className="inline-flex items-center gap-1.5 text-xs text-[#E4F2EB]/70 hover:text-white mb-6 transition"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to standard workspace login</span>
        </Link>

        {/* Card Surface */}
        <div className="w-full rounded-[16px] border border-white/20 bg-white p-5 sm:p-8 text-[#111613] shadow-xl">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-[#ECFDF5] px-3 py-1 text-xs font-semibold text-[#065F46] border border-[#A7F3D0] mb-3 shadow-2xs">
              <ShieldAlert className="h-3.5 w-3.5 text-[#059669]" />
              <span>FIXIA PLATFORM ADMINISTRATION</span>
            </div>

            <h1 className="font-display text-xl sm:text-2xl font-bold tracking-tight text-[#111613]">
              Super Admin Authentication
            </h1>
            <p className="mt-1 text-xs text-[#5F6B65] font-normal leading-relaxed">
              Strictly restricted to authorized FIXIA cloud platform architects
            </p>
          </div>

          <form action={formAction} className="space-y-4">
            {state?.error && (
              <div className="rounded-[10px] bg-[#FEF2F2] border border-[#FECACA] p-3 text-xs text-[#991B1B] flex items-start gap-2.5 animate-in fade-in">
                <AlertCircle className="h-4 w-4 shrink-0 text-[#DC2626] mt-0.5" />
                <span>{state.error}</span>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#111613] flex justify-between" htmlFor="admin-email">
                <span>Super Admin Root Email</span>
                <span className="text-[10px] text-[#0B6B4F] font-mono font-medium">Root access</span>
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#94A099] pointer-events-none" />
                <input
                  id="admin-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  placeholder="admin@fixia.in"
                  disabled={isPending}
                  className="w-full rounded-[10px] border border-[#E3E7E4] bg-white py-2 pl-9 pr-3 text-xs text-[#111613] placeholder:text-[#94A099] focus:border-[#0B6B4F] focus:outline-hidden focus:ring-1 focus:ring-[#0B6B4F] disabled:bg-[#F8FAFC]"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#111613]" htmlFor="admin-password">
                Root Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#94A099] pointer-events-none" />
                <input
                  id="admin-password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  placeholder="••••••••••••"
                  disabled={isPending}
                  className="w-full rounded-[10px] border border-[#E3E7E4] bg-white py-2 pl-9 pr-9 text-xs text-[#111613] placeholder:text-[#94A099] font-mono focus:border-[#0B6B4F] focus:outline-hidden focus:ring-1 focus:ring-[#0B6B4F] disabled:bg-[#F8FAFC]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94A099] hover:text-[#111613]"
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
              className="w-full mt-2 inline-flex items-center justify-center gap-2 rounded-[10px] bg-[#0B6B4F] py-2.5 text-xs font-semibold text-white shadow-xs hover:bg-[#09543E] transition-colors disabled:opacity-60 cursor-pointer"
            >
              {isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Verifying root credentials...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="h-4 w-4" />
                  <span>Access Platform Console</span>
                </>
              )}
            </button>
          </form>

          {/* Audit Notice */}
          <div className="mt-5 rounded-[10px] border border-[#E3E7E4] bg-[#F8FAFC] p-3 text-[11px] text-[#5F6B65] flex items-start gap-2">
            <FileText className="h-3.5 w-3.5 text-[#0B6B4F] shrink-0 mt-0.5" />
            <span>
              All authentication attempts, IP origins, and platform administrative actions are written to immutable audit logs.
            </span>
          </div>
        </div>

        {/* Security Reassurance */}
        <div className="mt-6 text-center text-xs text-[#E4F2EB]/70">
          <span>Official FIXIA Platform Infrastructure &bull; </span>
          <strong className="text-white">gms.fixia.in</strong>
        </div>
      </div>
    </div>
  );
}

export default function SuperAdminLoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#062E23]">
          <Loader2 className="h-8 w-8 animate-spin text-[#7FD6B2]" />
        </div>
      }
    >
      <SuperAdminLoginFormContent />
    </Suspense>
  );
}

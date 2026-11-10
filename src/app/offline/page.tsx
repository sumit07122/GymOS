"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  WifiOff,
  RefreshCw,
  QrCode,
  Dumbbell,
  ArrowRight,
  ShieldCheck,
  ArrowLeft,
} from "lucide-react";

export default function OfflinePage() {
  const router = useRouter();
  const [isChecking, setIsChecking] = React.useState(false);

  const handleRetry = () => {
    setIsChecking(true);
    setTimeout(() => {
      if (typeof window !== "undefined") {
        if (navigator.onLine) {
          router.push("/");
        } else {
          setIsChecking(false);
        }
      }
    }, 1000);
  };

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
          href="/"
          className="inline-flex items-center gap-1.5 text-xs text-[#E4F2EB]/70 hover:text-white mb-6 transition"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to FIXIA GymOS Home</span>
        </Link>

        {/* Card Surface */}
        <div className="w-full rounded-2xl border border-white/10 bg-white p-6 sm:p-8 text-[#0F172A] shadow-2xl backdrop-blur-xs">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#FFFBEB] text-[#D97706] border border-[#FDE68A] mx-auto mb-3">
              <WifiOff className="h-6 w-6" />
            </div>

            <h1 className="font-heading text-xl sm:text-2xl font-bold tracking-tight text-[#0F172A]">
              You&apos;re Currently Offline
            </h1>
            <p className="mt-1.5 text-xs text-[#5F6B65] leading-relaxed">
              FIXIA GymOS is operating in local offline resilience mode. Your cached passes and local records remain ready for use.
            </p>
          </div>

          {/* Cached Features List */}
          <div className="space-y-3 rounded-xl border border-[#E3E7E4] bg-[#F8FAFC] p-4 text-xs">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-[#94A3B8]">
              Available Offline Capabilities
            </div>

            <div className="flex items-center gap-2.5 text-[#0F172A]">
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-[#E4F2EB] text-[#0B6B4F]">
                <QrCode className="h-3.5 w-3.5" />
              </div>
              <span className="font-medium">Cached Member Passes & Attendance QR</span>
            </div>

            <div className="flex items-center gap-2.5 text-[#0F172A]">
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-[#E4F2EB] text-[#0B6B4F]">
                <Dumbbell className="h-3.5 w-3.5" />
              </div>
              <span className="font-medium">Assigned Training Workouts & Routines</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-6 flex flex-col gap-2.5">
            <button
              type="button"
              onClick={handleRetry}
              disabled={isChecking}
              className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-[#0B6B4F] py-2.5 text-xs font-semibold text-white shadow-xs hover:bg-[#09543E] transition-colors disabled:opacity-60 cursor-pointer"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isChecking ? "animate-spin" : ""}`} />
              <span>{isChecking ? "Checking Connection..." : "Check Connection & Retry"}</span>
            </button>

            <Link
              href="/member/home"
              className="w-full inline-flex items-center justify-center gap-1.5 rounded-lg border border-[#E3E7E4] bg-white py-2 text-xs font-semibold text-[#0F172A] hover:bg-[#F8FAFC] transition-colors"
            >
              <span>Open Member Pass</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>

        {/* Security Reassurance */}
        <div className="mt-6 flex items-center gap-2 rounded-full border border-white/10 bg-black/20 px-4 py-1 text-xs text-[#E4F2EB]/80 backdrop-blur-xs">
          <ShieldCheck className="h-3.5 w-3.5 text-[#7FD6B2]" />
          <span>Progressive Web App Shell • Stale-While-Revalidate Engine</span>
        </div>
      </div>
    </div>
  );
}

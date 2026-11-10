"use client";

import Link from "next/link";
import {
  Lock,
  Mail,
  ArrowRight,
  ShieldCheck,
  ArrowLeft,
  Headphones,
} from "lucide-react";

export default function RegisterPage() {
  return (
    <div
      className="min-h-screen w-full bg-[#062E23] text-white flex flex-col items-center justify-center p-4 py-10 sm:p-8 relative overflow-hidden"
      style={{
        backgroundImage:
          "radial-gradient(90% 100% at 50% 20%, #0F4A38 0%, #083327 50%, #041E16 100%)",
      }}
    >
      {/* Decorative ambient subtle lines & glows */}
      <div className="absolute inset-0 bg-[radial-gradient(#7FD6B2_1px,transparent_1px)] [background-size:24px_24px] opacity-10 pointer-events-none" />
      <div className="absolute -top-32 left-1/2 -translate-x-1/2 h-96 w-96 rounded-full bg-[#0B6B4F]/30 blur-3xl breathe pointer-events-none" />

      {/* Main Container */}
      <div className="relative z-10 w-full max-w-lg my-auto flex flex-col items-center animate-in zoom-in-95 duration-200">
        {/* Navigation back */}
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs text-[#E4F2EB]/70 hover:text-white mb-6 transition"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to FIXIA GymOS Home</span>
        </Link>

        {/* Card Surface */}
        <div className="w-full rounded-2xl border border-white/10 bg-white p-6 sm:p-8 text-[#0F172A] shadow-2xl backdrop-blur-xs">
          {/* Top Badge & Header */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-[#FFFBEB] px-3 py-1 text-xs font-semibold text-[#92400E] border border-[#FDE68A] mb-3">
              <Lock className="h-3.5 w-3.5" />
              <span>Register Gym — Invitation-Only Onboarding</span>
            </div>

            <h1 className="font-heading text-xl sm:text-2xl font-bold tracking-tight text-[#0F172A]">
              Manual Tenant Provisioning Policy
            </h1>
            <p className="mt-1.5 text-xs text-[#5F6B65] leading-relaxed max-w-md mx-auto">
              Public self-service gym registration is closed. Every gym tenant workspace, owner credentials, and feature entitlements are directly configured by FIXIA SaaS Platform Administrators.
            </p>
          </div>

          {/* 3-Step Process Explainer */}
          <div className="space-y-3 rounded-xl border border-[#E3E7E4] bg-[#F8FAFC] p-4 text-xs">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-[#94A3B8]">
              Commercial Onboarding Workflow
            </div>

            <div className="flex items-start gap-3">
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#0B6B4F] text-white text-[11px] font-bold">
                1
              </div>
              <div>
                <p className="font-semibold text-[#0F172A]">Consultation & Quota Sizing</p>
                <p className="text-[11px] text-[#5F6B65]">
                  We determine your gym location, member capacity, staff seats, and WhatsApp notification volume.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#0B6B4F] text-white text-[11px] font-bold">
                2
              </div>
              <div>
                <p className="font-semibold text-[#0F172A]">Tenant Provisioning & Database Isolation</p>
                <p className="text-[11px] text-[#5F6B65]">
                  Our platform architects initialize your dedicated tenant workspace, database schema, and security keys.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#0B6B4F] text-white text-[11px] font-bold">
                3
              </div>
              <div>
                <p className="font-semibold text-[#0F172A]">Owner Credentials Handover</p>
                <p className="text-[11px] text-[#5F6B65]">
                  You receive encrypted credentials, front-desk scanner guides, and digital passes ready for your members.
                </p>
              </div>
            </div>
          </div>

          {/* Contact Box */}
          <div className="mt-5 rounded-xl border border-[#E4F2EB] bg-[#ECFDF5] p-4 text-xs flex items-center justify-between gap-3">
            <div>
              <p className="font-semibold text-[#065F46] flex items-center gap-1.5">
                <Headphones className="h-4 w-4" />
                <span>Ready to onboard your gym?</span>
              </p>
              <p className="text-[11px] text-[#065F46]/80 mt-0.5">
                Contact our onboarding desk directly:
              </p>
            </div>
            <a
              href="mailto:onboarding@fixia.in"
              className="inline-flex items-center gap-1 rounded-lg bg-[#0B6B4F] px-3 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-[#09543E] transition-colors shrink-0"
            >
              <Mail className="h-3.5 w-3.5" />
              <span>onboarding@fixia.in</span>
            </a>
          </div>

          {/* Action to Login */}
          <div className="mt-6 pt-5 border-t border-[#E3E7E4] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <span className="text-[#5F6B65]">Already have an active gym account?</span>
            <Link
              href="/login"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 rounded-lg border border-[#E3E7E4] bg-white px-4 py-2 font-semibold text-[#0F172A] hover:bg-[#F8FAFC] transition-colors"
            >
              <span>Sign In</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>

        {/* Zero-Trust Security Reassurance */}
        <div className="mt-6 flex items-center gap-2 rounded-full border border-white/10 bg-black/20 px-4 py-1 text-xs text-[#E4F2EB]/80 backdrop-blur-xs">
          <ShieldCheck className="h-3.5 w-3.5 text-[#7FD6B2]" />
          <span>Strict Tenant Isolation • Controlled Provisioning • 256-Bit Cryptography</span>
        </div>
      </div>
    </div>
  );
}

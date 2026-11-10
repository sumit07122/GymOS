"use client";

import * as React from "react";
import Link from "next/link";
import { ShieldCheck } from "lucide-react";

export interface AuthLayoutProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  showZeroTrustBadge?: boolean;
}

export function AuthLayout({
  title,
  subtitle,
  children,
  footer,
  showZeroTrustBadge = true,
}: AuthLayoutProps) {
  return (
    <div
      className="relative flex min-h-screen flex-col items-center justify-center p-4 sm:p-8 bg-[#062E23] overflow-hidden"
      style={{
        backgroundImage:
          "radial-gradient(80% 90% at 50% 20%, #0F4535 0%, #083327 45%, #041B14 100%)",
      }}
    >
      {/* Decorative ambient subtle lines */}
      <div className="absolute inset-0 bg-[radial-gradient(#7FD6B2_1px,transparent_1px)] [background-size:24px_24px] opacity-10 pointer-events-none" />

      {/* Main Auth Container */}
      <div className="relative w-full max-w-md z-10 flex flex-col items-center animate-in zoom-in-95 duration-200">
        {/* Brand Logo & Title */}
        <Link
          href="/"
          className="mb-6 flex items-center gap-2.5 font-heading text-xl font-bold text-white hover:opacity-90 transition-opacity"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#0B6B4F] text-white shadow-md border border-[#7FD6B2]/30">
            <span className="text-base font-black">F</span>
          </div>
          <span className="tracking-tight text-lg">FIXIA GymOS</span>
        </Link>

        {/* Card Surface */}
        <div className="w-full rounded-2xl border border-white/10 bg-white p-6 sm:p-8 shadow-2xl backdrop-blur-xs">
          <div className="mb-6 text-center">
            <h1 className="font-heading text-xl font-bold text-[#0F172A] sm:text-2xl tracking-tight">
              {title}
            </h1>
            {subtitle && (
              <p className="mt-1.5 text-xs text-[#5F6B65]">{subtitle}</p>
            )}
          </div>

          {/* Form / Actions */}
          <div className="space-y-4">{children}</div>

          {/* Footer inside card */}
          {footer && (
            <div className="mt-6 border-t border-[#E3E7E4] pt-4 text-center text-xs text-[#64748B]">
              {footer}
            </div>
          )}
        </div>

        {/* Zero-Trust Badge */}
        {showZeroTrustBadge && (
          <div className="mt-6 flex items-center gap-2 rounded-full border border-white/10 bg-black/20 px-3.5 py-1 text-[11px] text-white/80 backdrop-blur-xs">
            <ShieldCheck className="h-3.5 w-3.5 text-[#7FD6B2]" />
            <span>Multi-Tenant Zero-Trust Isolation • 256-Bit Encryption</span>
          </div>
        )}

        {/* Legal Links */}
        <div className="mt-4 flex items-center gap-4 text-[11px] text-white/50">
          <Link href="/privacy" className="hover:text-white/80 transition-colors">
            Privacy Policy
          </Link>
          <span>•</span>
          <Link href="/terms" className="hover:text-white/80 transition-colors">
            Terms of Service
          </Link>
          <span>•</span>
          <Link href="/security" className="hover:text-white/80 transition-colors">
            Security Guarantee
          </Link>
        </div>
      </div>
    </div>
  );
}

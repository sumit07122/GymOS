import * as React from "react";
import Link from "next/link";
import { ShieldCheck, Heart, ArrowUpRight, CheckCircle2 } from "lucide-react";

export function MarketingFooter() {
  return (
    <footer className="border-t border-[#E7ECE9] bg-white text-[#171C19] pt-16 pb-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 lg:gap-12 pb-12 border-b border-[#E7ECE9]">
          {/* Brand Column */}
          <div className="col-span-2 space-y-4">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#1BC95A] text-white shadow-xs">
                <span className="font-display text-base font-extrabold tracking-tight">G</span>
              </div>
              <span className="font-display text-xl font-extrabold tracking-tight text-[#171C19]">
                Gym<span className="text-[#1BC95A]">OS</span>
              </span>
            </Link>

            <p className="text-xs text-[#69736E] max-w-sm leading-relaxed">
              The modern operating system for gyms, fitness clubs, and boutique athletic studios. Built with multi-tenant database security, sub-second QR entry gates, and automated WhatsApp retention.
            </p>

            <div className="flex items-center gap-2 text-xs text-[#16A34A] bg-[#E8F9EE] px-3 py-1.5 rounded-full w-fit font-medium border border-[#1BC95A]/20">
              <span className="h-2 w-2 rounded-full bg-[#1BC95A] animate-pulse" />
              <span>All Systems Operational &bull; 99.98% SLA</span>
            </div>
          </div>

          {/* Product Links */}
          <div className="space-y-3">
            <div className="text-xs font-bold uppercase tracking-wider text-[#171C19]">
              Product
            </div>
            <ul className="space-y-2 text-xs text-[#69736E]">
              <li>
                <Link href="/features" className="hover:text-[#16A34A] transition">
                  Features Overview
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="hover:text-[#16A34A] transition">
                  Plans & Pricing
                </Link>
              </li>
              <li>
                <Link href="/features#qr-gate" className="hover:text-[#16A34A] transition">
                  Anti-Passback QR Kiosk
                </Link>
              </li>
              <li>
                <Link href="/features#whatsapp" className="hover:text-[#16A34A] transition">
                  WhatsApp Automation
                </Link>
              </li>
              <li>
                <Link href="/features#member-pwa" className="hover:text-[#16A34A] transition">
                  Branded Member PWA
                </Link>
              </li>
              <li>
                <Link href="/api/health" target="_blank" className="hover:text-[#16A34A] transition flex items-center gap-1">
                  <span>Health Status API</span>
                  <ArrowUpRight className="h-3 w-3" />
                </Link>
              </li>
            </ul>
          </div>

          {/* Solutions Links */}
          <div className="space-y-3">
            <div className="text-xs font-bold uppercase tracking-wider text-[#171C19]">
              Solutions
            </div>
            <ul className="space-y-2 text-xs text-[#69736E]">
              <li>
                <Link href="/features#studios" className="hover:text-[#16A34A] transition">
                  Single Studios
                </Link>
              </li>
              <li>
                <Link href="/features#boutique" className="hover:text-[#16A34A] transition">
                  Boutique Fitness
                </Link>
              </li>
              <li>
                <Link href="/features#strength" className="hover:text-[#16A34A] transition">
                  Strength & Crossfit
                </Link>
              </li>
              <li>
                <Link href="/features#chains" className="hover:text-[#16A34A] transition">
                  Multi-Branch Gyms
                </Link>
              </li>
              <li>
                <Link href="/g/ironforge-fitness" className="hover:text-[#16A34A] transition flex items-center gap-1 text-[#16A34A] font-semibold">
                  <span>Interactive Gym Demo</span>
                  <ArrowUpRight className="h-3 w-3" />
                </Link>
              </li>
            </ul>
          </div>

          {/* Company & Legal */}
          <div className="space-y-3">
            <div className="text-xs font-bold uppercase tracking-wider text-[#171C19]">
              Company & Trust
            </div>
            <ul className="space-y-2 text-xs text-[#69736E]">
              <li>
                <Link href="/about" className="hover:text-[#16A34A] transition">
                  About GymOS
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-[#16A34A] transition">
                  Contact Sales & Demo
                </Link>
              </li>
              <li>
                <Link href="/faq" className="hover:text-[#16A34A] transition">
                  Frequently Asked Questions
                </Link>
              </li>
              <li>
                <Link href="/security" className="hover:text-[#16A34A] transition">
                  Security Architecture
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-[#16A34A] transition">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-[#16A34A] transition">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#69736E]">
          <p>
            &copy; {new Date().getFullYear()} FIXIA GymOS Platform Inc. All rights reserved. GST-compliant B2B SaaS.
          </p>
          <div className="flex items-center gap-4">
            <Link href="/privacy" className="hover:text-[#171C19]">
              Privacy
            </Link>
            <span>&bull;</span>
            <Link href="/terms" className="hover:text-[#171C19]">
              Terms
            </Link>
            <span>&bull;</span>
            <Link href="/security" className="hover:text-[#171C19]">
              Zero-Trust Security
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

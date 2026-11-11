"use client";

import * as React from "react";
import Link from "next/link";
import {
  Sparkles,
  ShieldCheck,
  TrendingUp,
  Heart,
  ArrowRight,
  CheckCircle2,
  Building2,
  Users,
  Lock,
  Zap,
} from "lucide-react";
import { MarketingNav } from "@/components/marketing/navbar";
import { MarketingFooter } from "@/components/marketing/footer";
import { CtaBanner } from "@/components/marketing/cta-banner";

export default function AboutPage() {
  const stats = [
    { label: "Active Partner Gyms", val: "120+" },
    { label: "Verified QR Check-Ins", val: "1.4M+" },
    { label: "Membership Dues Recovered", val: "₹4.2 Cr+" },
    { label: "Platform Uptime SLA", val: "99.98%" },
  ];

  const pillars = [
    {
      icon: Zap,
      title: "Sub-Second Speed",
      description:
        "Every reception interaction, QR check-in, and invoice dispatch is engineered to execute in under 200ms. No waiting around while a line builds up at the front desk.",
    },
    {
      icon: ShieldCheck,
      title: "Zero Revenue Leakage",
      description:
        "We built GymOS to solve the silent revenue killer: expired members slipping past the gate and unpaid dues sitting forgotten in spreadsheets.",
    },
    {
      icon: Heart,
      title: "Relentless Simplicity",
      description:
        "Front-desk staff and trainers can master GymOS in under 10 minutes. Clean typography, obvious buttons, and zero cluttered enterprise bloat.",
    },
    {
      icon: Lock,
      title: "Zero-Trust Data Isolation",
      description:
        "Every gym operates inside a secure PostgreSQL multi-tenant boundary. Your members, financial metrics, and leads are cryptographically isolated.",
    },
  ];

  return (
    <div className="min-h-screen bg-[#F7FAF8] text-[#171C19] flex flex-col font-sans selection:bg-[#E8F9EE] selection:text-[#16A34A]">
      <MarketingNav />

      {/* Hero Header */}
      <section className="pt-16 sm:pt-24 pb-16 bg-white border-b border-[#E7ECE9] relative overflow-hidden">
        <div className="absolute inset-0 gymos-grid-subtle opacity-70 pointer-events-none" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center space-y-4">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-[#E8F9EE] px-3.5 py-1 text-xs font-bold text-[#16A34A] border border-[#1BC95A]/30">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Our Purpose & Vision</span>
          </div>

          <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-[#171C19] max-w-3xl mx-auto">
            The modern operating system <br />
            <span className="text-[#1BC95A]">for high-performance gyms</span>
          </h1>

          <p className="text-sm sm:text-base text-[#69736E] max-w-2xl mx-auto leading-relaxed">
            GymOS was built to replace clunky legacy software and messy spreadsheets with a fast, modern platform that gym owners actually love using.
          </p>
        </div>
      </section>

      {/* Stats Counter Bar */}
      <section className="py-12 bg-white border-b border-[#E7ECE9]">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {stats.map((s, idx) => (
              <div key={idx} className="space-y-1">
                <div className="font-display text-3xl sm:text-4xl font-extrabold text-[#171C19]">
                  {s.val}
                </div>
                <div className="text-xs font-medium text-[#69736E]">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Story Narrative */}
      <section className="py-20 bg-[#F7FAF8]">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="rounded-3xl border border-[#E7ECE9] bg-white p-8 sm:p-12 space-y-6 shadow-sm">
            <div className="text-xs font-bold uppercase tracking-wider text-[#16A34A]">
              Why We Started GymOS
            </div>

            <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-[#171C19] leading-snug">
              Gym software was stuck in 2012. We built the software we wished we had.
            </h2>

            <div className="space-y-4 text-xs sm:text-sm text-[#69736E] leading-relaxed">
              <p>
                As fitness enthusiasts and software engineers, we saw gym owners we respected spending hours every evening reconciling unorganized Excel spreadsheets, tracking who paid cash, and texting members manually to ask for renewals.
              </p>
              <p>
                Meanwhile, members were dealing with crumpled paper registration cards or broken mobile apps that took 20 seconds to load in a basement workout floor.
              </p>
              <p>
                We asked ourselves: <em>What if gym management felt as polished, fast, and effortless as Linear, Stripe, or Apple?</em>
              </p>
              <p>
                That question led to GymOS: a cloud-native, multi-tenant platform featuring sub-second anti-passback QR check-in, official WhatsApp Meta Cloud automation, and a PWA that members can install directly to their home screen without app store friction.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* The 4 Core Principles */}
      <section className="py-20 bg-white border-t border-[#E7ECE9]">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 space-y-14">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <h2 className="font-display text-3xl font-extrabold text-[#171C19]">
              Our Core Product Principles
            </h2>
            <p className="text-xs sm:text-sm text-[#69736E]">
              Every feature we design must satisfy these four non-negotiable standards.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
            {pillars.map((p, idx) => {
              const Icon = p.icon;
              return (
                <div key={idx} className="rounded-2xl border border-[#E7ECE9] bg-[#F7FAF8] p-7 space-y-3">
                  <div className="h-10 w-10 rounded-xl bg-[#E8F9EE] text-[#16A34A] flex items-center justify-center">
                    <Icon className="h-5 w-5 text-[#1BC95A]" />
                  </div>
                  <h3 className="font-display text-lg font-bold text-[#171C19]">
                    {p.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-[#69736E] leading-relaxed">
                    {p.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Banner & Footer */}
      <CtaBanner />
      <MarketingFooter />
    </div>
  );
}

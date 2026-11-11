"use client";

import * as React from "react";
import Link from "next/link";
import {
  Check,
  X,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  HelpCircle,
  Zap,
  Building2,
  Users,
  CheckCircle2,
} from "lucide-react";
import { MarketingNav } from "@/components/marketing/navbar";
import { MarketingFooter } from "@/components/marketing/footer";
import { FaqAccordion } from "@/components/marketing/faq-accordion";
import { CtaBanner } from "@/components/marketing/cta-banner";

interface MatrixRow {
  name: string;
  starter: string | boolean;
  growth: string | boolean;
  pro: string | boolean;
}

interface MatrixCategory {
  title: string;
  rows: MatrixRow[];
}

const COMPARISON_MATRIX: MatrixCategory[] = [
  {
    title: "Capacity & User Seats",
    rows: [
      { name: "Active Member Limit", starter: "Up to 100", growth: "Up to 500", pro: "Unlimited" },
      { name: "Staff & Trainer Accounts", starter: "3 Seats", growth: "10 Seats", pro: "Unlimited" },
      { name: "Group Fitness Classes", starter: "10 Classes", growth: "50 Classes", pro: "Unlimited" },
      { name: "Multi-Branch Support", starter: false, growth: false, pro: "Full Support" },
    ],
  },
  {
    title: "Access Control & Front Desk",
    rows: [
      { name: "Sub-Second QR Gate Scanner", starter: true, growth: true, pro: true },
      { name: "HMAC Rotating Token (Anti-Screenshot)", starter: true, growth: true, pro: true },
      { name: "Anti-Passback Kiosk Cooldown (15 min)", starter: false, growth: true, pro: true },
      { name: "Turnstile / EM-Lock Relay Integration", starter: false, growth: true, pro: true },
      { name: "Manual Reception Desk Overrides", starter: true, growth: true, pro: true },
    ],
  },
  {
    title: "Financials, Billing & Invoicing",
    rows: [
      { name: "Automated Invoice Generation", starter: true, growth: true, pro: true },
      { name: "GST-Compliant Digital Tax Invoices", starter: true, growth: true, pro: true },
      { name: "Direct UPI QR Code Generation", starter: true, growth: true, pro: true },
      { name: "Razorpay Payment Gateway Integration", starter: true, growth: true, pro: true },
      { name: "Expense Logging & Net P&L Reports", starter: false, growth: true, pro: true },
      { name: "Refunds & Credit Notes Ledger", starter: true, growth: true, pro: true },
    ],
  },
  {
    title: "Sales CRM & Growth",
    rows: [
      { name: "Walk-In & Digital Lead Kanban Pipeline", starter: false, growth: true, pro: true },
      { name: "1-Click Lead to Member Conversion", starter: false, growth: true, pro: true },
      { name: "Branded Public Gym Microsite (/g/[gym])", starter: false, growth: true, pro: true },
      { name: "Custom Domain Mapping (gym.com)", starter: "Add-On", growth: "Add-On", pro: true },
    ],
  },
  {
    title: "Member Experience & Retention",
    rows: [
      { name: "Installable Member PWA App", starter: true, growth: true, pro: true },
      { name: "Gamified 14-Day Consistency Streaks", starter: true, growth: true, pro: true },
      { name: "Workout & Exercise Library Builder", starter: false, growth: true, pro: true },
      { name: "Calorie & Nutrition Target Prescriptions", starter: false, growth: true, pro: true },
      { name: "Automated WhatsApp Expiry Sweeps (T-7, T-3, T-0)", starter: false, growth: false, pro: true },
      { name: "AI Member Churn & Ghosting Radar", starter: false, growth: false, pro: true },
    ],
  },
  {
    title: "Security & SLA Support",
    rows: [
      { name: "PostgreSQL Row-Level Security Isolation", starter: true, growth: true, pro: true },
      { name: "Full CSV Data Export Anytime", starter: true, growth: true, pro: true },
      { name: "Support Channels", starter: "Community & Email", growth: "Priority Email & Chat", pro: "24/7 Dedicated Manager" },
      { name: "Uptime Guarantee SLA", starter: "99.9%", growth: "99.95%", pro: "99.98%" },
    ],
  },
];

export default function PricingPage() {
  const [billingPeriod, setBillingPeriod] = React.useState<"MONTHLY" | "ANNUAL">("ANNUAL");

  const plans = [
    {
      id: "starter",
      name: "Starter Studio",
      badge: "Essential",
      isPopular: false,
      tagline: "Ideal for boutique studios, yoga centers, and single-floor fitness facilities.",
      monthlyPrice: 999,
      annualPrice: 799,
      capacity: "Up to 100 Active Members",
      staff: "3 Staff Accounts",
      features: [
        "Sub-Second Dynamic QR Code Gate",
        "Member Self-Service PWA App",
        "Automated Invoicing & GST Receipts",
        "Membership Expiry Tracking",
        "Manual Reception Desk Check-In",
        "Basic Financial Collection Reports",
        "Community Support",
      ],
      ctaText: "Start 14-Day Free Trial",
      ctaLink: "/register?plan=starter",
    },
    {
      id: "growth",
      name: "Growth Athletic",
      badge: "Most Popular",
      isPopular: true,
      tagline: "For scaling gyms looking to systematize leads, group classes, and expenses.",
      monthlyPrice: 1999,
      annualPrice: 1599,
      capacity: "Up to 500 Active Members",
      staff: "10 Staff Accounts",
      features: [
        "Everything in Starter Studio, plus:",
        "Walk-In & Digital Lead Kanban CRM",
        "Class Scheduling & Capacity Limits",
        "Complete Expense & P&L Tracking",
        "POS Inventory & Shake Bar Stock",
        "Workout & Exercise Plan Builder",
        "Branded Public Gym Microsite",
        "Priority Email & Chat Support",
      ],
      ctaText: "Start 14-Day Free Trial",
      ctaLink: "/register?plan=growth",
    },
    {
      id: "pro",
      name: "Pro Enterprise",
      badge: "Full Automation",
      isPopular: false,
      tagline: "For high-performance fitness clubs and multi-location operations.",
      monthlyPrice: 3499,
      annualPrice: 2799,
      capacity: "Unlimited Active Members",
      staff: "Unlimited Staff Seats",
      features: [
        "Everything in Growth Athletic, plus:",
        "Automated WhatsApp Retention (T-7, T-3, T-0)",
        "AI Member Churn & Ghosting Radar",
        "Executive Business P&L Analytics",
        "Anti-Passback Kiosk Cooldown Protection",
        "Custom Domain Mapping (gym.com)",
        "Automated Daily Expiry Sweep Engine",
        "24/7 Dedicated Account Manager",
      ],
      ctaText: "Start 14-Day Free Trial",
      ctaLink: "/register?plan=pro",
    },
  ];

  return (
    <div className="min-h-screen bg-[#F7FAF8] text-[#171C19] flex flex-col font-sans selection:bg-[#E8F9EE] selection:text-[#16A34A]">
      <MarketingNav />

      {/* Hero Pricing Header */}
      <section className="pt-16 sm:pt-24 pb-16 bg-white border-b border-[#E7ECE9] relative overflow-hidden">
        <div className="absolute inset-0 gymos-grid-subtle opacity-70 pointer-events-none" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center space-y-4">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-[#E8F9EE] px-3.5 py-1 text-xs font-bold text-[#16A34A] border border-[#1BC95A]/30">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Commercial SaaS Tiers</span>
          </div>

          <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-[#171C19] max-w-3xl mx-auto">
            Simple, <span className="text-[#1BC95A]">transparent pricing</span> for gyms of all sizes
          </h1>

          <p className="text-sm sm:text-base text-[#69736E] max-w-2xl mx-auto leading-relaxed">
            Choose the package that scales with your member count. Upgrade or switch billing periods anytime with zero lock-in.
          </p>

          {/* Billing Switcher Toggle */}
          <div className="pt-6 flex items-center justify-center">
            <div className="inline-flex items-center gap-1 p-1 rounded-full bg-[#F7FAF8] border border-[#E7ECE9] shadow-xs">
              <button
                type="button"
                onClick={() => setBillingPeriod("MONTHLY")}
                className={`px-5 py-2 rounded-full text-xs font-bold transition-all ${
                  billingPeriod === "MONTHLY"
                    ? "bg-[#171C19] text-white shadow-xs"
                    : "text-[#69736E] hover:text-[#171C19]"
                }`}
              >
                Monthly Billing
              </button>
              <button
                type="button"
                onClick={() => setBillingPeriod("ANNUAL")}
                className={`px-5 py-2 rounded-full text-xs font-bold transition-all flex items-center gap-2 ${
                  billingPeriod === "ANNUAL"
                    ? "bg-[#1BC95A] text-white shadow-xs"
                    : "text-[#69736E] hover:text-[#171C19]"
                }`}
              >
                <span>Annual Billing</span>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                  billingPeriod === "ANNUAL" ? "bg-white text-[#16A34A]" : "bg-[#E8F9EE] text-[#16A34A]"
                }`}>
                  Save 20%
                </span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 3 Pricing Cards */}
      <section className="py-16 sm:py-20 bg-[#F7FAF8]">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
            {plans.map((plan) => {
              const price = billingPeriod === "ANNUAL" ? plan.annualPrice : plan.monthlyPrice;

              return (
                <div
                  key={plan.id}
                  className={`relative flex flex-col justify-between rounded-2xl p-7 sm:p-8 transition-all ${
                    plan.isPopular
                      ? "bg-white border-2 border-[#1BC95A] shadow-xl shadow-[#1BC95A]/10 scale-[1.02] lg:-translate-y-2 z-10"
                      : "bg-white border border-[#E7ECE9] shadow-xs hover:border-[#1BC95A]/40 hover:shadow-md"
                  }`}
                >
                  {/* Popular Pill Badge */}
                  {plan.isPopular && (
                    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full bg-[#1BC95A] px-3.5 py-1 text-[11px] font-extrabold uppercase tracking-wider text-white shadow-xs">
                      {plan.badge}
                    </div>
                  )}

                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="font-display text-xl font-bold text-[#171C19]">
                        {plan.name}
                      </h3>
                      {!plan.isPopular && (
                        <span className="rounded-md bg-[#F7FAF8] border border-[#E7ECE9] px-2 py-0.5 text-[10px] font-semibold text-[#69736E]">
                          {plan.badge}
                        </span>
                      )}
                    </div>

                    <p className="mt-2 text-xs text-[#69736E] leading-relaxed min-h-[36px]">
                      {plan.tagline}
                    </p>

                    {/* Pricing */}
                    <div className="mt-6 pb-6 border-b border-[#E7ECE9]">
                      <div className="flex items-baseline gap-1">
                        <span className="text-sm font-semibold text-[#69736E]">₹</span>
                        <span className="font-display text-4xl sm:text-5xl font-extrabold tracking-tight text-[#171C19]">
                          {price.toLocaleString("en-IN")}
                        </span>
                        <span className="text-xs font-semibold text-[#69736E]">
                          / month
                        </span>
                      </div>

                      <div className="mt-1 flex items-center gap-2 text-[11px] text-[#69736E]">
                        <span>{plan.capacity}</span>
                        <span>&bull;</span>
                        <span>{plan.staff}</span>
                      </div>

                      {billingPeriod === "ANNUAL" && (
                        <p className="mt-2 text-[11px] font-semibold text-[#16A34A] bg-[#E8F9EE] px-2 py-0.5 rounded-md inline-block">
                          Billed annually (₹{(price * 12).toLocaleString("en-IN")}/yr)
                        </p>
                      )}
                    </div>

                    {/* Features List */}
                    <div className="mt-6 space-y-3">
                      <div className="text-[11px] font-bold uppercase tracking-wider text-[#171C19]">
                        Included Features:
                      </div>
                      <ul className="space-y-2.5">
                        {plan.features.map((feat, idx) => (
                          <li key={idx} className="flex items-start gap-2.5 text-xs text-[#171C19]">
                            <div className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[#E8F9EE] text-[#16A34A] mt-0.5">
                              <Check className="h-3 w-3 stroke-[3]" />
                            </div>
                            <span className={idx === 0 && plan.isPopular ? "font-bold text-[#16A34A]" : ""}>
                              {feat}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Card CTA */}
                  <div className="mt-8 pt-4">
                    <Link
                      href={plan.ctaLink}
                      className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-xs transition active:scale-[0.98] shadow-xs ${
                        plan.isPopular
                          ? "bg-[#1BC95A] hover:bg-[#16A34A] text-white"
                          : "bg-[#171C19] hover:bg-[#28322D] text-white"
                      }`}
                    >
                      <span>{plan.ctaText}</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>

                    <p className="mt-2 text-center text-[10px] text-[#69736E]">
                      14 days free &bull; No card required &bull; Instant setup
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Feature Comparison Matrix Table */}
      <section className="py-20 bg-white border-t border-[#E7ECE9]">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <h2 className="font-display text-3xl font-extrabold text-[#171C19]">
              Detailed Feature Comparison Matrix
            </h2>
            <p className="text-xs sm:text-sm text-[#69736E]">
              Compare limits, hardware integrations, and automation features side-by-side.
            </p>
          </div>

          <div className="rounded-2xl border border-[#E7ECE9] bg-white overflow-hidden shadow-xs">
            {/* Table Header */}
            <div className="grid grid-cols-4 bg-[#F7FAF8] p-4 text-xs font-bold text-[#171C19] border-b border-[#E7ECE9]">
              <div>Features & Entitlements</div>
              <div className="text-center">Starter Studio</div>
              <div className="text-center text-[#16A34A]">Growth Athletic</div>
              <div className="text-center">Pro Enterprise</div>
            </div>

            {/* Matrix Categories */}
            <div className="divide-y divide-[#E7ECE9]">
              {COMPARISON_MATRIX.map((cat, catIdx) => (
                <div key={catIdx} className="space-y-0">
                  <div className="bg-[#F7FAF8]/70 px-4 py-2 text-[11px] font-bold uppercase tracking-wider text-[#69736E]">
                    {cat.title}
                  </div>
                  {cat.rows.map((row, rowIdx) => (
                    <div key={rowIdx} className="grid grid-cols-4 p-4 text-xs items-center hover:bg-[#F7FAF8]/40 transition">
                      <div className="font-medium text-[#171C19] pr-2">{row.name}</div>

                      {/* Starter */}
                      <div className="text-center text-[#69736E]">
                        {typeof row.starter === "boolean" ? (
                          row.starter ? (
                            <Check className="h-4 w-4 text-[#16A34A] mx-auto stroke-[2.5]" />
                          ) : (
                            <X className="h-4 w-4 text-[#94A099] mx-auto" />
                          )
                        ) : (
                          <span className="font-semibold text-[#171C19]">{row.starter}</span>
                        )}
                      </div>

                      {/* Growth */}
                      <div className="text-center bg-[#E8F9EE]/30 py-1 rounded">
                        {typeof row.growth === "boolean" ? (
                          row.growth ? (
                            <Check className="h-4 w-4 text-[#16A34A] mx-auto stroke-[2.5]" />
                          ) : (
                            <X className="h-4 w-4 text-[#94A099] mx-auto" />
                          )
                        ) : (
                          <span className="font-bold text-[#16A34A]">{row.growth}</span>
                        )}
                      </div>

                      {/* Pro */}
                      <div className="text-center text-[#69736E]">
                        {typeof row.pro === "boolean" ? (
                          row.pro ? (
                            <Check className="h-4 w-4 text-[#16A34A] mx-auto stroke-[2.5]" />
                          ) : (
                            <X className="h-4 w-4 text-[#94A099] mx-auto" />
                          )
                        ) : (
                          <span className="font-semibold text-[#171C19]">{row.pro}</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Add-On Packs */}
      <section className="py-16 bg-[#F7FAF8] border-t border-[#E7ECE9]">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="text-center max-w-xl mx-auto space-y-2">
            <h3 className="font-display text-2xl font-bold text-[#171C19]">
              Optional Platform Add-Ons
            </h3>
            <p className="text-xs text-[#69736E]">
              Enhance any tier with dedicated API gateways and customized branding.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="rounded-2xl border border-[#E7ECE9] bg-white p-6 space-y-3 shadow-xs">
              <div className="text-[10px] font-bold text-[#16A34A] uppercase bg-[#E8F9EE] px-2 py-0.5 rounded w-fit">
                COMMUNICATION
              </div>
              <h4 className="font-display text-base font-bold text-[#171C19]">
                WhatsApp Pro Gateway
              </h4>
              <p className="text-xs text-[#69736E] leading-relaxed">
                Connect dedicated Meta WABA number for bulk promotional announcements and custom broadcast sequences.
              </p>
              <div className="pt-2 font-display text-lg font-extrabold text-[#171C19]">
                ₹19 <span className="text-xs text-[#69736E] font-normal">/ mo</span>
              </div>
            </div>

            <div className="rounded-2xl border border-[#E7ECE9] bg-white p-6 space-y-3 shadow-xs">
              <div className="text-[10px] font-bold text-[#16A34A] uppercase bg-[#E8F9EE] px-2 py-0.5 rounded w-fit">
                INTELLIGENCE
              </div>
              <h4 className="font-display text-base font-bold text-[#171C19]">
                Advanced Business AI
              </h4>
              <p className="text-xs text-[#69736E] leading-relaxed">
                Predictive revenue churn risk scoring, cohort renewal retention heatmaps, and executive PDF reporting.
              </p>
              <div className="pt-2 font-display text-lg font-extrabold text-[#171C19]">
                ₹25 <span className="text-xs text-[#69736E] font-normal">/ mo</span>
              </div>
            </div>

            <div className="rounded-2xl border border-[#E7ECE9] bg-white p-6 space-y-3 shadow-xs">
              <div className="text-[10px] font-bold text-[#16A34A] uppercase bg-[#E8F9EE] px-2 py-0.5 rounded w-fit">
                CUSTOM DOMAIN
              </div>
              <h4 className="font-display text-base font-bold text-[#171C19]">
                Custom Branded Domain
              </h4>
              <p className="text-xs text-[#69736E] leading-relaxed">
                Host your member portal and public schedule on your own custom domain (e.g. portal.yourgym.com) with SSL.
              </p>
              <div className="pt-2 font-display text-lg font-extrabold text-[#171C19]">
                ₹15 <span className="text-xs text-[#69736E] font-normal">/ mo</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing FAQs */}
      <section className="py-20 bg-white border-t border-[#E7ECE9]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto space-y-3 mb-14">
            <h2 className="font-display text-3xl font-extrabold text-[#171C19]">
              Pricing & Billing FAQ
            </h2>
            <p className="text-xs sm:text-sm text-[#69736E]">
              Everything you need to know about plans, upgrades, taxes, and cancellations.
            </p>
          </div>
          <FaqAccordion />
        </div>
      </section>

      {/* CTA Banner & Footer */}
      <CtaBanner />
      <MarketingFooter />
    </div>
  );
}

"use client";

import * as React from "react";
import Link from "next/link";
import {
  Users,
  CreditCard,
  QrCode,
  MessageSquare,
  TrendingUp,
  Dumbbell,
  Apple,
  Smartphone,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Zap,
  Clock,
  Layers,
  FileSpreadsheet,
  Calendar,
  DollarSign,
  Filter,
} from "lucide-react";
import { MarketingNav } from "@/components/marketing/navbar";
import { MarketingFooter } from "@/components/marketing/footer";
import { CtaBanner } from "@/components/marketing/cta-banner";

interface FeatureDetail {
  id: string;
  category: "Core Operations" | "Access Control" | "Finance & CRM" | "Member Experience";
  title: string;
  tagline: string;
  description: string;
  icon: React.ElementType;
  highlights: string[];
  mockupSnippet: {
    badge: string;
    headline: string;
    items: { label: string; val: string }[];
  };
}

const ALL_FEATURES: FeatureDetail[] = [
  {
    id: "members",
    category: "Core Operations",
    title: "Member Lifecycle Management",
    tagline: "Total visibility from first trial to multi-year loyalists",
    description:
      "Maintain centralized digital profiles with emergency contacts, blood group, medical waivers, active plans, payment history, and photo verification.",
    icon: Users,
    highlights: [
      "Bulk CSV import/export to transfer rosters in under 2 minutes",
      "Automated member status tags (Active, Expiring, Expired, Frozen)",
      "Role-based staff permissions preventing unauthorized data edits",
    ],
    mockupSnippet: {
      badge: "MEMBER PROFILE",
      headline: "Arjun Verma (MEM-1042)",
      items: [
        { label: "Status", val: "ACTIVE" },
        { label: "Plan", val: "Spartan Annual Pro" },
        { label: "Expiry", val: "Dec 31, 2026" },
        { label: "Attendance", val: "48 visits this quarter" },
      ],
    },
  },
  {
    id: "memberships",
    category: "Core Operations",
    title: "Flexible Membership Architect",
    tagline: "Design recurring, session-pack, or seasonal pricing tiers",
    description:
      "Configure custom membership plans with flexible durations (monthly, quarterly, annual), session-pack limits, freeze rules, and registration admission fees.",
    icon: Calendar,
    highlights: [
      "Support for unlimited plans or credit-based session pack cards",
      "Grace period settings for delayed payment without gate lockouts",
      "Freeze & medical pause workflows with automatic end-date extension",
    ],
    mockupSnippet: {
      badge: "MEMBERSHIP ENGINE",
      headline: "Growth Athletic Tier",
      items: [
        { label: "Duration", val: "12 Months" },
        { label: "Price", val: "₹18,000 + 18% GST" },
        { label: "Freeze Allowance", val: "Up to 30 Days" },
        { label: "Auto-Renewal", val: "WhatsApp T-3 Prompt" },
      ],
    },
  },
  {
    id: "qr-gate",
    category: "Access Control",
    title: "Sub-Second Anti-Passback QR Kiosk",
    tagline: "140ms verification that stops pass sharing dead in its tracks",
    description:
      "Transform any iPad, tablet, or reception computer into a high-throughput gate scanner. Rotating HMAC cryptographic passes expire within 60s to prevent screenshot leaks.",
    icon: QrCode,
    highlights: [
      "15-minute anti-passback cooldown stops duplicate entry on the same pass",
      "Instant visual and audio feedback for active vs expired memberships",
      "Compatible with turnstiles, electromagnetic locks, or standalone front-desks",
    ],
    mockupSnippet: {
      badge: "RECEPTION GATE SCANNER",
      headline: "Scan Verified (140ms)",
      items: [
        { label: "Member", val: "Priya Sharma (MEM-1088)" },
        { label: "Gate Status", val: "UNLOCKED" },
        { label: "Security", val: "HMAC-SHA256 Valid" },
        { label: "Passback Guard", val: "Cooldown Active" },
      ],
    },
  },
  {
    id: "payments",
    category: "Finance & CRM",
    title: "Billing, UPI, Invoicing & GST Receipts",
    tagline: "Collect faster with automated digital payment receipts",
    description:
      "Automate invoice creation, log cash/UPI/card payments, track partial dues, issue refunds, and send GST-compliant invoice receipts directly to WhatsApp.",
    icon: CreditCard,
    highlights: [
      "Instant UPI QR generation and Razorpay online checkout integration",
      "Partial payment tracking with remaining dues visibility at check-in",
      "One-click PDF and WhatsApp receipt dispatch",
    ],
    mockupSnippet: {
      badge: "DIGITAL RECEIPT",
      headline: "Receipt #FIXIA-REC-8921",
      items: [
        { label: "Paid Amount", val: "₹5,400 (UPI)" },
        { label: "Remaining Due", val: "₹0.00 (Settled)" },
        { label: "GST Status", val: "18% Verified" },
        { label: "Delivered To", val: "+91 98765 43210 (WhatsApp)" },
      ],
    },
  },
  {
    id: "leads",
    category: "Finance & CRM",
    title: "Walk-In & Digital Lead Kanban CRM",
    tagline: "Never let an interested prospect slip through the cracks",
    description:
      "Drag-and-drop visual sales pipeline tailored for gyms. Track walk-ins, phone enquiries, and website leads from New Prospect to Trial Scheduled and Converted Member.",
    icon: Filter,
    highlights: [
      "1-click conversion: turn any lead into an active member record instantly",
      "Trial class booking calendar with reminder notifications",
      "Lead source attribution (Walk-In, Instagram, Google Maps, Referral)",
    ],
    mockupSnippet: {
      badge: "KANBAN PIPELINE",
      headline: "34 Active Leads (₹1.2L Potential)",
      items: [
        { label: "New Inquiries", val: "12 Leads" },
        { label: "Trial Scheduled", val: "8 Leads" },
        { label: "Trial Completed", val: "6 Leads" },
        { label: "Conversion Rate", val: "38.5% (High)" },
      ],
    },
  },
  {
    id: "workouts",
    category: "Member Experience",
    title: "Workout & Exercise Program Builder",
    tagline: "Prescribe personalized workout splits that keep members hooked",
    description:
      "Build workout routines from a library of 300+ exercises with form cues, sets, reps, and target muscles. Assign plans to individual members or class groups.",
    icon: Dumbbell,
    highlights: [
      "Exercise library covering strength, hypertrophy, cardio, and mobility",
      "Members view prescribed workouts and log personal records in their PWA",
      "Trainers track client adherence and progressive overload milestones",
    ],
    mockupSnippet: {
      badge: "TRAINER WORKOUT SPLIT",
      headline: "Hypertrophy Push Day A",
      items: [
        { label: "Barbell Bench Press", val: "4 Sets &bull; 8-10 Reps" },
        { label: "Incline DB Press", val: "3 Sets &bull; 10-12 Reps" },
        { label: "Overhead Tricep Ext", val: "3 Sets &bull; 12-15 Reps" },
        { label: "Target RPE", val: "8.5 (Heavy)" },
      ],
    },
  },
  {
    id: "diet",
    category: "Member Experience",
    title: "Diet, Macro & Nutrition Guidance",
    tagline: "Help members reach goals outside the gym floor",
    description:
      "Provide daily caloric targets, protein/carb/fat macro distributions, hydration recommendations, and meal timing guides directly inside the member portal.",
    icon: Apple,
    highlights: [
      "Calorie & macro calculator based on body weight and fitness goals",
      "Veg, non-veg, vegan, and intermittent fasting meal templates",
      "Increases member retention and personal training package value",
    ],
    mockupSnippet: {
      badge: "NUTRITION TARGET",
      headline: "Muscle Gain Split (2,450 kcal)",
      items: [
        { label: "Protein", val: "160g (26%)" },
        { label: "Carbohydrates", val: "280g (46%)" },
        { label: "Fats", val: "75g (28%)" },
        { label: "Water Target", val: "3.5 Liters / Day" },
      ],
    },
  },
  {
    id: "analytics",
    category: "Finance & CRM",
    title: "Business Analytics & P&L Intelligence",
    tagline: "Real metrics from real database rows — zero fabricated vanity graphs",
    description:
      "Track Monthly Recurring Revenue (MRR), cash collections, expense breakdowns, net operating profit, peak hour attendance heatmaps, and trainer class capacity.",
    icon: TrendingUp,
    highlights: [
      "Operational expense logging (Rent, Electricity, Maintenance, Salaries)",
      "Daily peak check-in distribution chart for smart trainer staffing",
      "Export full ledger and member activity reports in CSV/Excel anytime",
    ],
    mockupSnippet: {
      badge: "EXECUTIVE P&L",
      headline: "November 2026 Financial Overview",
      items: [
        { label: "Gross Collections", val: "₹4,82,500" },
        { label: "Operating Expenses", val: "₹1,64,000" },
        { label: "Net Profit Margin", val: "66.0% (₹3,18,500)" },
        { label: "Peak Attendance", val: "6:30 PM - 8:30 PM" },
      ],
    },
  },
  {
    id: "member-pwa",
    category: "Member Experience",
    title: "Branded Member PWA Portal",
    tagline: "An installable mobile experience without App Store friction",
    description:
      "Members install your gym's custom web app straight to their iPhone or Android home screen with 1 tap. Dynamic QR entry pass, attendance streaks, class booking, and billing.",
    icon: Smartphone,
    highlights: [
      "Zero app store downloads, updates, or 30% commission fees",
      "Works offline: displays QR code even in basement gyms with zero signal",
      "Gamified 14-day attendance streaks boost long-term consistency",
    ],
    mockupSnippet: {
      badge: "MOBILE PASS",
      headline: "IronForge Athletics PWA",
      items: [
        { label: "Installation", val: "Direct Home Screen (PWA)" },
        { label: "Offline Cache", val: "Service Worker Active" },
        { label: "Digital Pass", val: "HMAC Rotating Token" },
        { label: "Class Booking", val: "1-Tap Reserve" },
      ],
    },
  },
  {
    id: "whatsapp",
    category: "Access Control",
    title: "WhatsApp Automation & Retention Engine",
    tagline: "96.8% open rate alerts that automate 90% of reception follow-ups",
    description:
      "Official Meta Cloud API integration dispatches automated renewal reminders at T-7, T-3, and day of expiry, payment receipts, and absent-member check-in nudges.",
    icon: MessageSquare,
    highlights: [
      "Pre-approved transactional templates that protect your number from bans",
      "Consent management ledger honoring WhatsApp compliance and STOP keywords",
      "Targeted broadcasts for festive offers, new batches, and holiday hours",
    ],
    mockupSnippet: {
      badge: "META CLOUD DISPATCH",
      headline: "Automated Renewal Alert (T-3)",
      items: [
        { label: "Delivery Status", val: "Delivered & Read" },
        { label: "CTA Button", val: "Pay via UPI Link" },
        { label: "Compliance", val: "100% Opt-In Verified" },
        { label: "Recovery Rate", val: "+27% On-Time Renewals" },
      ],
    },
  },
];

export default function FeaturesPage() {
  const [selectedFilter, setSelectedFilter] = React.useState<string>("All");

  const categories = ["All", "Core Operations", "Access Control", "Finance & CRM", "Member Experience"];

  const filteredFeatures =
    selectedFilter === "All"
      ? ALL_FEATURES
      : ALL_FEATURES.filter((f) => f.category === selectedFilter);

  return (
    <div className="min-h-screen bg-[#F7FAF8] text-[#171C19] flex flex-col font-sans selection:bg-[#E8F9EE] selection:text-[#16A34A]">
      <MarketingNav />

      {/* Hero Header */}
      <section className="pt-16 sm:pt-24 pb-12 bg-white border-b border-[#E7ECE9] relative overflow-hidden">
        <div className="absolute inset-0 gymos-grid-subtle opacity-70 pointer-events-none" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center space-y-4">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-[#E8F9EE] px-3.5 py-1 text-xs font-bold text-[#16A34A] border border-[#1BC95A]/30">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Complete Platform Feature Tour</span>
          </div>

          <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-[#171C19] max-w-3xl mx-auto">
            Built for gym owners who demand <br />
            <span className="text-[#1BC95A]">precision, speed & growth</span>
          </h1>

          <p className="text-sm sm:text-base text-[#69736E] max-w-2xl mx-auto leading-relaxed">
            Explore all 10 purpose-built modules engineered to automate gym operations, secure your entrance, recover dues, and delight members.
          </p>

          {/* Filter Pills */}
          <div className="pt-6 flex flex-wrap items-center justify-center gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedFilter(cat)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
                  selectedFilter === cat
                    ? "bg-[#1BC95A] text-white shadow-xs"
                    : "bg-[#F7FAF8] text-[#69736E] border border-[#E7ECE9] hover:text-[#171C19]"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Feature Visual Grid */}
      <section className="py-16 sm:py-24 bg-[#F7FAF8]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {filteredFeatures.map((feat) => {
              const Icon = feat.icon;

              return (
                <div
                  key={feat.id}
                  id={feat.id}
                  className="rounded-2xl border border-[#E7ECE9] bg-white p-7 sm:p-8 flex flex-col justify-between shadow-xs hover:border-[#1BC95A]/50 hover:shadow-md transition"
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between gap-4">
                      <div className="h-12 w-12 rounded-xl bg-[#E8F9EE] text-[#16A34A] flex items-center justify-center">
                        <Icon className="h-6 w-6 text-[#1BC95A]" />
                      </div>
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md bg-[#F7FAF8] border border-[#E7ECE9] text-[#69736E]">
                        {feat.category}
                      </span>
                    </div>

                    <div>
                      <h3 className="font-display text-xl sm:text-2xl font-bold text-[#171C19]">
                        {feat.title}
                      </h3>
                      <p className="text-xs font-semibold text-[#16A34A] mt-0.5">
                        {feat.tagline}
                      </p>
                    </div>

                    <p className="text-xs sm:text-sm text-[#69736E] leading-relaxed">
                      {feat.description}
                    </p>

                    {/* Highlights */}
                    <div className="pt-2 space-y-2">
                      {feat.highlights.map((item, idx) => (
                        <div key={idx} className="flex items-start gap-2 text-xs text-[#171C19]">
                          <CheckCircle2 className="h-3.5 w-3.5 text-[#1BC95A] shrink-0 mt-0.5" />
                          <span>{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Visual Mockup Card Snippet */}
                  <div className="mt-6 pt-4 border-t border-[#E7ECE9]">
                    <div className="rounded-xl bg-[#F7FAF8] p-4 border border-[#E7ECE9] space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono font-bold uppercase text-[#69736E]">
                          {feat.mockupSnippet.badge}
                        </span>
                        <span className="text-[10px] font-bold text-[#16A34A] bg-[#E8F9EE] px-1.5 py-0.5 rounded">
                          Live Data
                        </span>
                      </div>

                      <div className="font-display text-xs font-bold text-[#171C19]">
                        {feat.mockupSnippet.headline}
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
                        {feat.mockupSnippet.items.map((it, i) => (
                          <div key={i} className="bg-white p-2 rounded-lg border border-[#E7ECE9]">
                            <div className="text-[9px] text-[#69736E] uppercase font-semibold">{it.label}</div>
                            <div className="font-bold text-[#171C19] truncate">{it.val}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <CtaBanner />

      {/* Footer */}
      <MarketingFooter />
    </div>
  );
}

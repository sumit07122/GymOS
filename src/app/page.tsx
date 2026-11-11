"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  QrCode,
  MessageSquare,
  Dumbbell,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  Smartphone,
  Building2,
  ShieldCheck,
} from "lucide-react";

type PersonaKey = "owner" | "kiosk" | "member" | "whatsapp";

const SHOWCASE_TABS: Record<
  PersonaKey,
  {
    badge: string;
    title: string;
    subtitle: string;
    metrics: { label: string; value: string; delta: string }[];
    highlights: string[];
  }
> = {
  owner: {
    badge: "Owner ERP & Financial Command",
    title: "Real-Time Revenue, Dues & Retention in One View",
    subtitle:
      "Track MRR, expiring memberships, trainer class occupancy, and net profit after gym expenses without spreadsheets.",
    metrics: [
      { label: "Monthly Collection", value: "₹4,82,500", delta: "+18.4% vs last mo" },
      { label: "Active Members", value: "642 / 750", delta: "85.6% capacity" },
      { label: "Overdue Recovery", value: "94.2%", delta: "Via WhatsApp Auto-Dues" },
    ],
    highlights: [
      "Automated invoice generation, partial payment tracking, and GST-ready receipts",
      "Kanban lead pipeline with walk-in trial follow-ups and 1-click member conversion",
      "Role-based access control for Managers, Trainers, and Front-Desk Receptionists",
    ],
  },
  kiosk: {
    badge: "Anti-Passback QR Reception Kiosk",
    title: "Sub-Second Cryptographic QR Check-Ins",
    subtitle:
      "Prevent screenshot sharing with HMAC-signed rotating QR passes and instant membership status verification at the gate.",
    metrics: [
      { label: "Scan Verification", value: "140 ms", delta: "HMAC-SHA256 Signed" },
      { label: "Peak Hour Throughput", value: "180+ / hr", delta: "Zero queue bottleneck" },
      { label: "Blocked Expired Passes", value: "23 this wk", delta: "₹34,500 dues collected" },
    ],
    highlights: [
      "Instant visual + audio alert if a member scans with unpaid dues or expired plan",
      "Anti-passback cooldown prevents two people from entering on the same pass",
      "Works on any reception tablet, webcam, or dedicated 2D barcode scanner",
    ],
  },
  member: {
    badge: "Installable Member PWA Portal",
    title: "A Branded Fitness App Experience—Zero App Store Friction",
    subtitle:
      "Members install your gym's portal directly to their home screen for QR entry, workout logging, and 1-tap renewal.",
    metrics: [
      { label: "Member Adoption", value: "91%", delta: "Instant PWA install" },
      { label: "Workout Adherence", value: "+32%", delta: "Streak & Challenge badges" },
      { label: "Self-Serve Renewals", value: "68%", delta: "Paid before expiry date" },
    ],
    highlights: [
      "Digital membership card with live attendance streak calendar",
      "Assigned daily workout plans with exercise video/form notes and PR tracking",
      "Body weight, muscle mass, and measurement progress charts",
    ],
  },
  whatsapp: {
    badge: "WhatsApp Retention & Broadcast Engine",
    title: "Put Membership Renewals & Lead Follow-Ups on Autopilot",
    subtitle:
      "Built-in consent management, approved template variables, and delivery tracking for T-7, T-3, and T-0 expiry alerts.",
    metrics: [
      { label: "Message Open Rate", value: "96.8%", delta: "3x higher than email/SMS" },
      { label: "On-Time Renewal Lift", value: "+27%", delta: "Automated T-3 reminders" },
      { label: "Delivery Audit Log", value: "100%", delta: "Full opt-in compliance" },
    ],
    highlights: [
      "Automated payment receipts, renewal reminders, and absent-member nudges",
      "Targeted broadcasts for festive offers, new batch launches, or holiday hours",
      "Built-in opt-in/opt-out ledger so your gym number stays compliant",
    ],
  },
};

export default function LandingShowcasePage() {
  const [activePersona, setActivePersona] = useState<PersonaKey>("owner");
  const [memberCount, setMemberCount] = useState<number>(300);
  const [avgFee, setAvgFee] = useState<number>(2000);

  // Estimated 8% revenue leakage recovered through automated dues & QR gate enforcement
  const estimatedMonthlyRecovery = Math.round(memberCount * avgFee * 0.08);
  const currentTab = SHOWCASE_TABS[activePersona];

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-50 bg-grid-pattern selection:bg-emerald-500/30 selection:text-emerald-200">
      {/* Top Navbar */}
      <header className="sticky top-0 z-50 border-b border-white/10 bg-zinc-950/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-400">
              <Dumbbell className="h-5 w-5" />
            </div>
            <span className="font-display text-xl font-bold tracking-tight">
              Gym<span className="text-emerald-400">OS</span>
            </span>
          </div>
          <nav className="hidden md:flex items-center gap-8 text-sm text-zinc-400">
            <a href="#showcase" className="hover:text-white transition">Product Showcase</a>
            <a href="#roi" className="hover:text-white transition">ROI Calculator</a>
            <Link href="/g/spartan-athletics" className="hover:text-white transition">
              Live Public Gym Demo
            </Link>
          </nav>
          <div className="flex items-center gap-3">
            <Link
              href="/platform-admin/login"
              className="hidden sm:inline-flex items-center gap-1.5 rounded-lg border border-white/10 px-3 py-1.5 text-xs font-medium text-zinc-400 hover:text-white hover:bg-white/5 transition"
            >
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
              <span>Admin</span>
            </Link>
            <Link
              href="/login"
              className="rounded-lg border border-white/10 px-4 py-2 text-sm font-medium text-zinc-200 hover:bg-white/5 transition"
            >
              Sign In
            </Link>
            <Link
              href="/register"
              className="rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-zinc-950 hover:bg-emerald-400 transition"
            >
              Launch Your Gym
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative mx-auto max-w-7xl px-6 pt-20 pb-16 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-1.5 text-xs font-medium text-emerald-300 mb-8">
          <Sparkles className="h-3.5 w-3.5" />
          <span>Multi-Tenant Fitness ERP + Member PWA + WhatsApp Automation</span>
        </div>

        <h1 className="font-display mx-auto max-w-4xl text-4xl font-bold tracking-tight sm:text-6xl lg:text-7xl">
          Run Your Entire Gym on{" "}
          <span className="bg-gradient-to-r from-emerald-400 via-lime-300 to-teal-400 bg-clip-text text-transparent">
            Autopilot.
          </span>
        </h1>

        <p className="mx-auto mt-6 max-w-2xl text-base sm:text-lg text-zinc-400 leading-relaxed">
          Stop losing 15–20% of your gym revenue to missed WhatsApp follow-ups, shared QR screenshots, and messy spreadsheets. Built for single-location studios and multi-branch fitness chains.
        </p>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/register"
            className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-6 py-3.5 text-sm font-semibold text-zinc-950 shadow-lg shadow-emerald-500/20 hover:bg-emerald-400 transition"
          >
            Start 14-Day Free Trial <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/g/spartan-athletics"
            className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-zinc-900/80 px-6 py-3.5 text-sm font-semibold text-white hover:bg-zinc-800 transition"
          >
            Explore Sample Gym Microsite
          </Link>
        </div>
      </section>

      {/* Interactive 4-Persona Workspace Showcase */}
      <section id="showcase" className="mx-auto max-w-7xl px-6 py-12">
        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 mb-8">
          {[
            { id: "owner", label: "1. Owner ERP", icon: Building2 },
            { id: "kiosk", label: "2. QR Gate Kiosk", icon: QrCode },
            { id: "member", label: "3. Member PWA", icon: Smartphone },
            { id: "whatsapp", label: "4. WhatsApp Engine", icon: MessageSquare },
          ].map((tab) => {
            const Icon = tab.icon;
            const active = activePersona === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActivePersona(tab.id as PersonaKey)}
                className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition cursor-pointer ${
                  active
                    ? "bg-emerald-500 text-zinc-950 shadow-md shadow-emerald-500/20 font-semibold"
                    : "border border-white/10 bg-zinc-900/70 text-zinc-400 hover:text-white"
                }`}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        <div className="saas-glass-card rounded-3xl p-8 sm:p-10">
          <div className="grid gap-10 lg:grid-cols-12 items-center">
            <div className="lg:col-span-7 space-y-6">
              <span className="inline-block rounded-md bg-emerald-500/15 px-3 py-1 font-mono text-xs font-medium text-emerald-400">
                {currentTab.badge}
              </span>
              <h2 className="font-display text-2xl sm:text-4xl font-bold text-white">
                {currentTab.title}
              </h2>
              <p className="text-zinc-400 leading-relaxed">{currentTab.subtitle}</p>
              <ul className="space-y-3 pt-2">
                {currentTab.highlights.map((item) => (
                  <li key={item} className="flex items-start gap-3 text-sm text-zinc-200">
                    <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-400 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="lg:col-span-5 grid gap-4">
              {currentTab.metrics.map((m) => (
                <div
                  key={m.label}
                  className="rounded-2xl border border-white/10 bg-zinc-900/90 p-5 flex items-center justify-between"
                >
                  <div>
                    <p className="text-xs uppercase tracking-wider text-zinc-400">{m.label}</p>
                    <p className="font-mono text-2xl sm:text-3xl font-bold text-white mt-1">
                      {m.value}
                    </p>
                  </div>
                  <span className="rounded-full bg-emerald-500/15 border border-emerald-500/30 px-3 py-1 font-mono text-xs text-emerald-300">
                    {m.delta}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Interactive ROI & Revenue Leakage Calculator */}
      <section id="roi" className="mx-auto max-w-5xl px-6 py-16">
        <div className="saas-glass-card rounded-3xl p-8 sm:p-10 border border-emerald-500/20">
          <div className="grid gap-8 md:grid-cols-2 items-center">
            <div>
              <span className="font-mono text-xs uppercase tracking-wider text-emerald-400">
                Revenue Leakage Estimator
              </span>
              <h3 className="font-display text-2xl sm:text-3xl font-bold mt-2 text-white">
                How Much Uncollected Dues Can GymOS Recover?
              </h3>
              <p className="text-sm text-zinc-400 mt-2">
                Adjust your active member count and average monthly fee to estimate revenue recovered from automated WhatsApp reminders and QR gate enforcement.
              </p>

              <div className="mt-6 space-y-5">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-zinc-300">Active Gym Members</span>
                    <span className="font-mono font-bold text-emerald-400">{memberCount} members</span>
                  </div>
                  <input
                    type="range"
                    min={50}
                    max={2000}
                    step={25}
                    value={memberCount}
                    onChange={(e) => setMemberCount(Number(e.target.value))}
                    className="w-full accent-emerald-500 cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-zinc-300">Avg. Monthly Membership Fee</span>
                    <span className="font-mono font-bold text-emerald-400">₹{avgFee.toLocaleString("en-IN")}</span>
                  </div>
                  <input
                    type="range"
                    min={500}
                    max={10000}
                    step={250}
                    value={avgFee}
                    onChange={(e) => setAvgFee(Number(e.target.value))}
                    className="w-full accent-emerald-500 cursor-pointer"
                  />
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-emerald-500/30 bg-emerald-950/20 p-6 text-center space-y-4">
              <p className="text-xs uppercase tracking-widest text-emerald-300 font-medium">
                Estimated Recovered Revenue / Month
              </p>
              <p className="font-mono text-4xl sm:text-5xl font-bold text-white">
                ₹{estimatedMonthlyRecovery.toLocaleString("en-IN")}
              </p>
              <p className="font-mono text-xs text-zinc-400">
                ~₹{(estimatedMonthlyRecovery * 12).toLocaleString("en-IN")} additional annual cashflow
              </p>
              <Link
                href="/register"
                className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-500 px-5 py-3 text-sm font-semibold text-zinc-950 hover:bg-emerald-400 transition"
              >
                Claim Your Gym Workspace <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Production Footer with Legal & Compliance Trust Links */}
      <footer className="border-t border-white/10 py-12 bg-zinc-950 text-zinc-400 text-xs">
        <div className="mx-auto max-w-7xl px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-400 font-bold text-xs">
              G
            </div>
            <span className="text-white font-semibold">GymOS</span>
            <span>&bull;</span>
            <span>Enterprise Multi-Tenant SaaS Platform</span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 text-xs">
            <Link href="/privacy" className="hover:text-emerald-400 transition">Privacy Policy</Link>
            <span>&bull;</span>
            <Link href="/terms" className="hover:text-emerald-400 transition">Terms of Service</Link>
            <span>&bull;</span>
            <Link href="/security" className="hover:text-emerald-400 transition">Security Architecture</Link>
            <span>&bull;</span>
            <Link href="/login" className="hover:text-emerald-400 transition">Sign In</Link>
            <span>&bull;</span>
            <Link href="/platform-admin/login" className="hover:text-emerald-400 transition">Platform Admin</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

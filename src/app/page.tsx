import fs from "fs";
import path from "path";
import Link from "next/link";
import Image from "next/image";
import { LandingNav } from "@/components/home/landing-nav";
import {
  Users,
  QrCode,
  Wallet,
  MessageCircle,
  BarChart3,
  Smartphone,
  ShieldCheck,
  Building2,
  ArrowRight,
  Sparkles,
} from "lucide-react";

const feats = [
  {
    i: Users,
    t: "Member Management",
    d: "Directory, KYC documents, membership assignment, and renewal tracking in one clear view.",
    span: "md:col-span-2",
  },
  {
    i: QrCode,
    t: "QR Attendance",
    d: "Dynamic 60-second HMAC-SHA256 tokens with front-desk camera scanning and replay defense.",
    span: "",
  },
  {
    i: Wallet,
    t: "Billing & Invoicing",
    d: "Sequential GST invoices, partial payment ledgers, automated dues alerts, and receipts.",
    span: "",
  },
  {
    i: MessageCircle,
    t: "Leads & Enquiries CRM",
    d: "Multi-stage trial pipeline, follow-up calendar, and one-click lead-to-member conversion.",
    span: "md:col-span-2",
  },
  {
    i: BarChart3,
    t: "Reports & Analytics",
    d: "Real-time cash flow, attendance peak heatmaps, and financial statements with CSV export.",
    span: "",
  },
  {
    i: ShieldCheck,
    t: "Strict Tenant Isolation",
    d: "PostgreSQL Row-Level Security ensures every gym's database records remain completely sovereign.",
    span: "md:col-span-3",
  },
];

export default function Home() {
  const heroPhotoPath = path.join(process.cwd(), "public", "photos", "hero.jpg");
  const heroPhotoExists = fs.existsSync(heroPhotoPath);

  return (
    <div className="bg-canvas text-ink min-h-screen flex flex-col font-sans selection:bg-pine-soft selection:text-pine">
      {/* Top Navigation */}
      <LandingNav />

      {/* Hero Section */}
      <main className="flex-1">
        <section className="mx-auto grid max-w-6xl items-center gap-10 px-5 pb-16 pt-8 lg:grid-cols-[1.1fr_1fr] lg:pt-16 lg:pb-20">
          <div>
            <div className="rise inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pine-soft text-pine text-[11px] sm:text-xs font-semibold mb-6 border border-pine/20 max-w-full">
              <Sparkles className="size-3.5 text-pine shrink-0" />
              <span className="truncate">The Complete Operating System for Gyms & Fitness Businesses</span>
            </div>

            <h1 className="rise text-3xl sm:text-5xl lg:text-6xl font-extrabold leading-[1.1] tracking-tight text-ink font-display">
              Run your gym without the spreadsheets.
            </h1>

            <p className="rise mt-5 max-w-lg text-base sm:text-lg text-muted leading-relaxed font-normal" style={{ animationDelay: ".12s" }}>
              Members, attendance, payments and renewals in one calm, dense workspace.
              Set up, hosted and supported directly by FIXIA.
            </p>

            <div className="rise mt-7 flex flex-wrap items-center gap-3" style={{ animationDelay: ".24s" }}>
              <Link
                href="/login"
                className="rounded-[10px] bg-pine px-6 py-3 text-sm font-semibold text-white shadow-xs hover:bg-pine-deep transition-colors flex items-center gap-2 active:scale-[0.99]"
              >
                <span>Access your gym</span>
                <ArrowRight className="size-4" />
              </Link>

              <Link
                href="/register"
                className="rounded-[10px] border border-line bg-white px-5 py-3 text-sm font-medium text-ink hover:bg-canvas transition-colors shadow-xs"
              >
                Onboarding Policy
              </Link>
            </div>

            {/* Quick Proof Pills */}
            <div className="rise mt-8 flex flex-wrap items-center gap-3 sm:gap-4 text-xs text-muted" style={{ animationDelay: ".3s" }}>
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="size-4 text-pine shrink-0" />
                <span className="font-medium text-ink">Strict PostgreSQL RLS</span>
              </div>
              <span className="text-line hidden sm:inline">•</span>
              <div className="flex items-center gap-1.5">
                <QrCode className="size-4 text-pine shrink-0" />
                <span className="font-medium text-ink">Anti-Passback QR</span>
              </div>
              <span className="text-line hidden sm:inline">•</span>
              <div className="flex items-center gap-1.5">
                <Building2 className="size-4 text-pine shrink-0" />
                <span className="font-medium text-ink">Zero Public Self-Signup</span>
              </div>
            </div>
          </div>

          {/* Hero Preview Box — Single outer container, thin 1px border, 28px radius, no heavy shadows */}
          <div className="rise mt-4 lg:mt-0" style={{ animationDelay: ".2s" }}>
            <div className="relative rounded-[28px] border border-line bg-white overflow-hidden shadow-xs">
              {/* Photo Slot */}
              <div className="relative aspect-[16/10] sm:aspect-[16/9] w-full bg-gradient-to-br from-[#0B4A38] via-[#083327] to-[#041E16] overflow-hidden">
                {heroPhotoExists ? (
                  <Image
                    src="/photos/hero.jpg"
                    alt="FIXIA GymOS Training Floor"
                    fill
                    priority
                    className="object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-br from-[#0B4A38] via-[#083327] to-[#041E16]" />
                )}

                {/* Dark gradient overlay for legibility */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#111613]/85 via-[#111613]/30 to-black/20 pointer-events-none" />

                {/* Existing Chips on Top */}
                <div className="absolute top-3 sm:top-4 left-3 sm:left-4 inline-flex items-center gap-1.5 sm:gap-2 rounded-[10px] bg-black/45 backdrop-blur-md px-2.5 sm:px-3 py-1 sm:py-1.5 text-[11px] sm:text-xs font-medium text-white border border-white/15">
                  <span className="size-1.5 sm:size-2 rounded-full bg-[#7FD6B2] animate-pulse" />
                  <span>Floor & Turnstile Zone</span>
                </div>

                <div className="absolute top-3 sm:top-4 right-3 sm:right-4 inline-flex items-center gap-1 sm:gap-1.5 rounded-[10px] bg-black/45 backdrop-blur-md px-2.5 sm:px-3 py-1 sm:py-1.5 text-[11px] sm:text-xs font-medium text-white border border-white/15">
                  <QrCode className="size-3 sm:size-3.5 text-[#7FD6B2]" />
                  <span>60s Dynamic Pass</span>
                </div>
              </div>

              {/* Integrated Bottom Info Row (One container, no nested inner card) */}
              <div className="border-t border-line p-5 sm:p-6 bg-white grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                <div>
                  <p className="text-[13px] font-medium text-muted">Check-ins today</p>
                  <div className="mt-1 flex items-baseline gap-2.5">
                    <span className="font-display text-3xl sm:text-4xl font-bold text-ink tracking-tight num">
                      86
                    </span>
                    <span className="inline-flex items-center text-xs font-semibold text-pine bg-pine-soft px-2 py-0.5 rounded-full border border-pine/20">
                      +14% vs avg
                    </span>
                  </div>
                </div>

                <div className="sm:border-l sm:border-line sm:pl-5">
                  <p className="text-[13px] font-medium text-muted">Latest activity</p>
                  <div className="mt-1 flex items-center gap-2 text-sm font-semibold text-ink">
                    <span className="size-2 rounded-full bg-pine shrink-0" />
                    <span className="truncate">Renewal paid · Meera J.</span>
                  </div>
                  <p className="text-xs text-muted mt-0.5">Annual Pro · GST invoice issued</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 4 Portals & Access Realms */}
        <section id="portals" className="border-t border-line bg-canvas py-20">
          <div className="mx-auto max-w-6xl px-5">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
              <div>
                <span className="text-xs font-semibold text-pine">
                  Segregated access realms
                </span>
                <h2 className="text-3xl font-bold tracking-tight text-ink mt-1 font-display">
                  Platform Portals & Workspaces
                </h2>
              </div>
              <p className="text-sm text-muted max-w-md leading-relaxed">
                Three isolated realms ensuring members, gym owners, and platform administrators access strictly authorized datasets.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="rounded-[16px] border border-line bg-white p-5 flex flex-col justify-between shadow-xs hover:border-pine transition-colors">
                <div>
                  <div className="size-10 rounded-[10px] bg-pine-soft text-pine flex items-center justify-center font-bold mb-3.5 border border-pine/20">
                    <Building2 className="size-5" />
                  </div>
                  <h3 className="text-base font-bold text-ink font-display">Gym Owner Portal</h3>
                  <p className="text-xs text-muted mt-1.5 leading-relaxed font-normal">
                    Member KYC, cash ledgers, attendance records, staff controls, and P&L analytics.
                  </p>
                </div>
                <Link href="/login" className="mt-5 text-xs font-bold text-pine hover:text-pine-deep inline-flex items-center gap-1.5">
                  <span>Sign In as Owner</span>
                  <ArrowRight className="size-3" />
                </Link>
              </div>

              <div className="rounded-[16px] border border-line bg-white p-5 flex flex-col justify-between shadow-xs hover:border-pine transition-colors">
                <div>
                  <div className="size-10 rounded-[10px] bg-teal-50 text-teal-700 flex items-center justify-center font-bold mb-3.5 border border-teal-200">
                    <Smartphone className="size-5" />
                  </div>
                  <h3 className="text-base font-bold text-ink font-display">Member Pass App</h3>
                  <p className="text-xs text-muted mt-1.5 leading-relaxed font-normal">
                    Dynamic HMAC-SHA256 QR code, workout routines, progress metrics, and receipts.
                  </p>
                </div>
                <Link href="/login?gym=spartan-athletics" className="mt-5 text-xs font-bold text-pine hover:text-pine-deep inline-flex items-center gap-1.5">
                  <span>Access Member Pass</span>
                  <ArrowRight className="size-3" />
                </Link>
              </div>

              <div className="rounded-[16px] border border-line bg-white p-5 flex flex-col justify-between shadow-xs hover:border-pine transition-colors">
                <div>
                  <div className="size-10 rounded-[10px] bg-sky-50 text-sky-700 flex items-center justify-center font-bold mb-3.5 border border-sky-200">
                    <Building2 className="size-5" />
                  </div>
                  <h3 className="text-base font-bold text-ink font-display">Branded Gym Website</h3>
                  <p className="text-xs text-muted mt-1.5 leading-relaxed font-normal">
                    Public gym microsite with brand accent, facilities, schedules, and WhatsApp enquiry.
                  </p>
                </div>
                <Link href="/g/spartan-athletics" className="mt-5 text-xs font-bold text-pine hover:text-pine-deep inline-flex items-center gap-1.5">
                  <span>View Sample Gym Site</span>
                  <ArrowRight className="size-3" />
                </Link>
              </div>

              <div className="rounded-[16px] border border-line bg-white p-5 flex flex-col justify-between shadow-xs hover:border-pine transition-colors">
                <div>
                  <div className="size-10 rounded-[10px] bg-purple-50 text-purple-700 flex items-center justify-center font-bold mb-3.5 border border-purple-200">
                    <ShieldCheck className="size-5" />
                  </div>
                  <h3 className="text-base font-bold text-ink font-display">Platform Admin</h3>
                  <p className="text-xs text-muted mt-1.5 leading-relaxed font-normal">
                    Restricted super admin suite for tenant onboarding, quota tracking, and audit logs.
                  </p>
                </div>
                <Link href="/platform-admin/login" className="mt-5 text-xs font-bold text-pine hover:text-pine-deep inline-flex items-center gap-1.5">
                  <span>Super Admin Gateway</span>
                  <ArrowRight className="size-3" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* 6 Core Operational Modules (Feature Grid with Varied Card Sizes) */}
        <section id="features" className="py-24 bg-white border-t border-line">
          <div className="mx-auto max-w-6xl px-5">
            <div className="text-center max-w-xl mx-auto mb-14">
              <span className="text-xs font-semibold text-pine">
                Dense professional suite
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-ink mt-1.5 font-display">
                Everything the front desk does, in one tool.
              </h2>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              {feats.map((f) => (
                <div
                  key={f.t}
                  className={`rounded-[16px] border border-line bg-white p-7 transition-colors hover:border-slate-300 shadow-xs ${f.span}`}
                >
                  <span className="grid h-10 w-10 place-items-center rounded-[10px] bg-pine-soft text-pine border border-pine/20">
                    <f.i size={19} />
                  </span>
                  <h3 className="mt-5 text-lg font-bold text-ink font-display">{f.t}</h3>
                  <p className="mt-2 text-[14px] text-muted leading-relaxed font-normal">{f.d}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Mobile Member App Showcase */}
        <section id="members" className="border-t border-line bg-canvas py-24">
          <div className="mx-auto grid max-w-6xl items-center gap-14 px-5 lg:grid-cols-2">
            {/* Elegant Device Phone Mockup */}
            <div className="mx-auto w-68 rounded-[28px] border-[6px] border-ink bg-pine-deep p-5 text-white shadow-md">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[11px] text-white/70 font-medium">Welcome back</p>
                  <p className="font-display text-xl font-bold tracking-tight text-white">Aarav</p>
                </div>
                <div className="size-2 rounded-full bg-[#7FD6B2] animate-pulse" />
              </div>

              <div className="mt-4 rounded-[16px] bg-white/10 backdrop-blur-md p-3.5 border border-white/10">
                <p className="text-[11px] text-white/80 uppercase tracking-wider font-semibold">Quarterly plan</p>
                <p className="num font-display text-2xl font-bold text-[#A7F3D0] mt-0.5">23 days left</p>
              </div>

              {/* Framed QR Box */}
              <div className="mx-auto mt-4 grid h-32 w-32 place-items-center rounded-[16px] bg-white text-ink p-2 shadow-inner border-2 border-dashed border-pine/30">
                <QrCode size={76} />
              </div>
              <p className="mt-3 text-center text-[11px] text-white/70 font-medium">Show at the door · 60s HMAC</p>
            </div>

            <div>
              <span className="grid h-10 w-10 place-items-center rounded-[10px] bg-pine-soft text-pine border border-pine/20">
                <Smartphone size={19} />
              </span>
              <h2 className="mt-4 text-3xl sm:text-4xl font-extrabold tracking-tight text-ink font-display">
                A member app that opens from the home screen.
              </h2>
              <p className="mt-4 max-w-md text-base text-muted leading-relaxed font-normal">
                Members check in with an anti-passback QR code, view their plan and follow customized routines. No app store download needed.
              </p>
              <div className="mt-6">
                <Link
                  href="/login?gym=spartan-athletics"
                  className="inline-flex items-center gap-2 text-sm font-bold text-pine hover:text-pine-deep"
                >
                  <span>Launch Digital Member Demo</span>
                  <ArrowRight className="size-4" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Zero-Trust Security Section (Calm Dark Promotional Surface) */}
        <section id="security" className="mx-auto max-w-6xl px-5 py-20">
          <div className="grid gap-8 rounded-[28px] bg-pine-deep p-10 text-white md:grid-cols-[1fr_1.2fr] md:p-14 shadow-md">
            <div>
              <ShieldCheck className="text-[#7FD6B2] size-8" />
              <h2 className="mt-4 text-3xl sm:text-4xl font-bold font-display">Your gym&apos;s data stays yours.</h2>
              <p className="mt-4 text-sm text-white/70 leading-relaxed max-w-sm">
                Built from the ground up on PostgreSQL Row-Level Security and strict session isolation.
              </p>
            </div>
            <ul className="space-y-4 text-sm text-white/85">
              {[
                "Every gym is isolated with PostgreSQL Row-Level Security policies.",
                "Owners and members see only what their cryptographic role allows.",
                "Payment and member records are never stored for offline use.",
                "Accounts are created and verified by FIXIA. There is no open public sign-up.",
              ].map((x) => (
                <li key={x} className="border-b border-white/10 pb-4 flex items-start gap-3">
                  <span className="size-1.5 rounded-full bg-[#7FD6B2] mt-2 shrink-0" />
                  <span>{x}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Closing CTA Section */}
        <section className="mx-auto max-w-6xl px-5 pb-20">
          <div className="rounded-[28px] border border-line bg-white p-8 sm:p-14 text-center shadow-xs">
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-pine bg-pine-soft px-3 py-1 rounded-full border border-pine/20 mb-4">
              <Sparkles className="size-3.5" />
              <span>Get started with FIXIA GymOS</span>
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-ink font-display max-w-2xl mx-auto">
              Run your facility with zero spreadsheets.
            </h2>
            <p className="mt-4 text-base text-muted max-w-lg mx-auto leading-relaxed">
              Provisioned and supported directly by FIXIA platform architects. Sign in to your authorized gym workspace.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/login"
                className="rounded-[10px] bg-pine px-6 py-3 text-sm font-semibold text-white shadow-xs hover:bg-pine-deep transition-colors flex items-center gap-2"
              >
                <span>Sign in to your gym</span>
                <ArrowRight className="size-4" />
              </Link>
              <Link
                href="/register"
                className="rounded-[10px] border border-line bg-white px-5 py-3 text-sm font-medium text-ink hover:bg-canvas transition-colors shadow-xs"
              >
                Review onboarding policy
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-line py-10 bg-white">
        <div className="mx-auto max-w-6xl px-5 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-ink">FIXIA GymOS</span>
            <span>&bull;</span>
            <span>Enterprise Multi-Tenant SaaS &bull; gms.fixia.in</span>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <Link href="/login" className="hover:text-ink transition-colors">Portal Login</Link>
            <span>&bull;</span>
            <Link href="/register" className="hover:text-ink transition-colors">Onboarding Policy</Link>
            <span>&bull;</span>
            <Link href="/platform-admin/login" className="hover:text-ink transition-colors">Super Admin</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

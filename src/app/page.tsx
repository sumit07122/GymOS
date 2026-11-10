import Link from "next/link";
import {
  Users,
  QrCode,
  Wallet,
  MessageCircle,
  BarChart3,
  Smartphone,
  ShieldCheck,
  Building2,
  Lock,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { Photo } from "@/components/ui";

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
  return (
    <div className="bg-white text-ink min-h-screen flex flex-col font-sans selection:bg-pine-soft selection:text-pine">
      {/* Top Navigation */}
      <header className="sticky top-0 z-50 border-b border-line bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex items-center gap-1.5">
              <span className="font-display text-xl font-bold tracking-tight text-ink">FIXIA</span>
              <span className="font-display text-xl font-semibold text-pine">GymOS</span>
            </div>
          </Link>

          <nav className="hidden gap-8 text-sm text-muted sm:flex font-medium">
            <a href="#features" className="hover:text-ink transition">Features</a>
            <a href="#portals" className="hover:text-ink transition">Portals</a>
            <a href="#members" className="hover:text-ink transition">Member App</a>
            <a href="#security" className="hover:text-ink transition">Zero-Trust</a>
          </nav>

          <div className="flex items-center gap-3">
            <Link
              href="/platform-admin/login"
              className="hidden lg:flex items-center gap-1.5 text-xs text-muted hover:text-ink font-medium px-2.5 py-1.5 rounded-lg transition"
            >
              <ShieldCheck className="size-3.5 text-pine" />
              <span>Platform Admin</span>
            </Link>

            <Link
              href="/register"
              className="text-xs text-muted hover:text-ink font-medium px-3 py-1.5 rounded-lg border border-line hover:bg-canvas transition"
            >
              <span>Register Gym</span>
            </Link>

            <Link
              href="/login"
              className="rounded-xl bg-pine hover:bg-pine-deep text-white px-4 py-2 text-xs font-semibold shadow-xs transition-all active:scale-[0.99] flex items-center gap-1.5"
            >
              <Lock className="size-3.5" />
              <span>Sign In</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1">
        <section className="mx-auto grid max-w-6xl items-center gap-14 px-5 pb-20 pt-12 lg:grid-cols-[1.1fr_1fr] lg:pt-20">
          <div>
            <div className="rise inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pine-soft text-pine text-xs font-semibold mb-6">
              <Sparkles className="size-3.5" />
              <span>The Complete Operating System for Gyms & Fitness Businesses</span>
            </div>

            <h1 className="rise text-4xl sm:text-6xl font-semibold leading-[1.05] tracking-tight">
              Run your gym without the spreadsheets.
            </h1>

            <p className="rise mt-6 max-w-lg text-base sm:text-lg text-muted leading-relaxed" style={{ animationDelay: ".12s" }}>
              Members, attendance, payments and renewals in one calm, dense workspace.
              Set up, hosted and supported directly by FIXIA.
            </p>

            <div className="rise mt-8 flex flex-wrap items-center gap-3" style={{ animationDelay: ".24s" }}>
              <Link
                href="/login"
                className="rounded-xl bg-pine px-6 py-3 text-sm font-semibold text-white shadow-xs hover:bg-pine-deep transition-all active:scale-[0.99] flex items-center gap-2"
              >
                <span>Access your gym</span>
                <ArrowRight className="size-4" />
              </Link>

              <Link
                href="/register"
                className="rounded-xl border border-line bg-white px-5 py-3 text-sm font-medium text-ink hover:bg-canvas transition"
              >
                Onboarding Policy
              </Link>
            </div>
          </div>

          <div className="rise relative" style={{ animationDelay: ".2s" }}>
            <Photo src="/photos/hero.jpg" className="aspect-[4/5] rounded-[24px] sm:aspect-[5/5] shadow-lg" />
            
            {/* Live Stats Floating Cards */}
            <div className="absolute -bottom-6 -left-4 w-[82%] rounded-2xl border border-line bg-white p-4 shadow-xl sm:-left-8">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted font-medium">Check-ins today</span>
                <span className="num font-display text-2xl font-bold text-pine">86</span>
              </div>
              <svg viewBox="0 0 200 50" className="mt-2 w-full" aria-hidden>
                <path
                  className="draw"
                  pathLength={1}
                  d="M0 40 C20 38 30 18 50 22 S80 44 100 30 S130 6 150 14 S185 26 200 8"
                  fill="none"
                  stroke="#0B6B4F"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
              </svg>
            </div>

            <div className="absolute -right-3 top-8 rounded-full bg-white border border-line px-4 py-1.5 text-xs font-semibold shadow-md flex items-center gap-2">
              <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Renewal paid &bull; Meera J.</span>
            </div>
          </div>
        </section>

        {/* 4 Portals & Access Realms */}
        <section id="portals" className="border-t border-line bg-canvas py-20">
          <div className="mx-auto max-w-6xl px-5">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-pine">
                  Segregated Access Realms
                </span>
                <h2 className="text-3xl font-semibold mt-1">Platform Portals & Workspaces</h2>
              </div>
              <p className="text-xs text-muted max-w-md">
                Three isolated realms ensuring members, gym owners, and platform administrators access strictly authorized datasets.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="rounded-xl border border-line bg-white p-5 flex flex-col justify-between shadow-xs hover:border-pine transition">
                <div>
                  <div className="size-9 rounded-lg bg-pine-soft text-pine flex items-center justify-center font-bold mb-3">
                    <Building2 className="size-5" />
                  </div>
                  <h3 className="text-base font-semibold">Gym Owner Portal</h3>
                  <p className="text-xs text-muted mt-1 leading-relaxed">
                    Member KYC, cash ledgers, attendance records, staff controls, and P&L analytics.
                  </p>
                </div>
                <Link href="/login" className="mt-5 text-xs font-semibold text-pine hover:text-pine-deep inline-flex items-center gap-1">
                  <span>Sign In as Owner</span>
                  <ArrowRight className="size-3" />
                </Link>
              </div>

              <div className="rounded-xl border border-line bg-white p-5 flex flex-col justify-between shadow-xs hover:border-pine transition">
                <div>
                  <div className="size-9 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center font-bold mb-3">
                    <Smartphone className="size-5" />
                  </div>
                  <h3 className="text-base font-semibold">Member Pass App</h3>
                  <p className="text-xs text-muted mt-1 leading-relaxed">
                    Dynamic HMAC-SHA256 QR code, workout routines, progress metrics, and receipts.
                  </p>
                </div>
                <Link href="/login?gym=spartan-athletics" className="mt-5 text-xs font-semibold text-pine hover:text-pine-deep inline-flex items-center gap-1">
                  <span>Access Member Pass</span>
                  <ArrowRight className="size-3" />
                </Link>
              </div>

              <div className="rounded-xl border border-line bg-white p-5 flex flex-col justify-between shadow-xs hover:border-pine transition">
                <div>
                  <div className="size-9 rounded-lg bg-sky-50 text-sky-700 flex items-center justify-center font-bold mb-3">
                    <Building2 className="size-5" />
                  </div>
                  <h3 className="text-base font-semibold">Branded Gym Website</h3>
                  <p className="text-xs text-muted mt-1 leading-relaxed">
                    Public gym microsite with brand accent, facilities, schedules, and WhatsApp enquiry.
                  </p>
                </div>
                <Link href="/g/spartan-athletics" className="mt-5 text-xs font-semibold text-pine hover:text-pine-deep inline-flex items-center gap-1">
                  <span>View Sample Gym Site</span>
                  <ArrowRight className="size-3" />
                </Link>
              </div>

              <div className="rounded-xl border border-line bg-white p-5 flex flex-col justify-between shadow-xs hover:border-pine transition">
                <div>
                  <div className="size-9 rounded-lg bg-purple-50 text-purple-700 flex items-center justify-center font-bold mb-3">
                    <ShieldCheck className="size-5" />
                  </div>
                  <h3 className="text-base font-semibold">Platform Admin</h3>
                  <p className="text-xs text-muted mt-1 leading-relaxed">
                    Restricted super admin suite for tenant onboarding, quota tracking, and audit logs.
                  </p>
                </div>
                <Link href="/platform-admin/login" className="mt-5 text-xs font-semibold text-pine hover:text-pine-deep inline-flex items-center gap-1">
                  <span>Super Admin Gateway</span>
                  <ArrowRight className="size-3" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* 6 Core Operational Modules */}
        <section id="features" className="py-24">
          <div className="mx-auto max-w-6xl px-5">
            <div className="text-center max-w-xl mx-auto mb-14">
              <span className="text-xs font-bold uppercase tracking-wider text-pine">
                Dense Professional Suite
              </span>
              <h2 className="text-3xl sm:text-4xl font-semibold mt-1">
                Everything the front desk does, in one tool.
              </h2>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              {feats.map((f) => (
                <div
                  key={f.t}
                  className={`rounded-2xl border border-line bg-white p-7 transition hover:-translate-y-0.5 shadow-xs ${f.span}`}
                >
                  <span className="grid h-10 w-10 place-items-center rounded-xl bg-pine-soft text-pine">
                    <f.i size={19} />
                  </span>
                  <h3 className="mt-5 text-lg font-semibold">{f.t}</h3>
                  <p className="mt-2 text-[14px] text-muted leading-relaxed">{f.d}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Mobile Member App Showcase */}
        <section id="members" className="border-t border-line bg-canvas py-24">
          <div className="mx-auto grid max-w-6xl items-center gap-14 px-5 lg:grid-cols-2">
            <div className="mx-auto w-64 rounded-[36px] border-[6px] border-ink bg-pine-deep p-5 text-white shadow-2xl">
              <p className="text-xs text-white/60">Welcome back</p>
              <p className="font-display text-xl font-bold">Aarav</p>
              <div className="mt-5 rounded-2xl bg-white/10 p-4">
                <p className="text-xs text-white/60">Quarterly plan</p>
                <p className="num font-display text-3xl font-bold">23 days left</p>
              </div>
              <div className="mx-auto mt-5 grid h-28 w-28 place-items-center rounded-2xl bg-white text-ink shadow-inner">
                <QrCode size={64} />
              </div>
              <p className="mt-3 text-center text-xs text-white/60">Show at the door</p>
            </div>

            <div>
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-pine-soft text-pine">
                <Smartphone size={19} />
              </span>
              <h2 className="mt-4 text-3xl sm:text-4xl font-semibold">
                A member app that opens from the home screen.
              </h2>
              <p className="mt-4 max-w-md text-base text-muted leading-relaxed">
                Members check in with an anti-passback QR code, view their plan and follow customized routines. No app store download needed.
              </p>
              <div className="mt-6">
                <Link
                  href="/login?gym=spartan-athletics"
                  className="inline-flex items-center gap-2 text-sm font-semibold text-pine hover:text-pine-deep"
                >
                  <span>Launch Digital Member Demo</span>
                  <ArrowRight className="size-4" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Zero-Trust Security Section (Dark Promotional per Rule 6) */}
        <section id="security" className="mx-auto max-w-6xl px-5 py-24">
          <div className="grid gap-8 rounded-[28px] bg-pine-deep p-10 text-white md:grid-cols-[1fr_1.2fr] md:p-14 shadow-xl">
            <div>
              <ShieldCheck className="text-[#7FD6B2] size-8" />
              <h2 className="mt-4 text-3xl sm:text-4xl font-semibold">Your gym&apos;s data stays yours.</h2>
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
            <Link href="/login" className="hover:text-ink transition">Portal Login</Link>
            <span>&bull;</span>
            <Link href="/register" className="hover:text-ink transition">Onboarding Policy</Link>
            <span>&bull;</span>
            <Link href="/platform-admin/login" className="hover:text-ink transition">Super Admin</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import {
  Dumbbell,
  Users,
  QrCode,
  CreditCard,
  UserPlus,
  Receipt,
  CalendarCheck2,
  Package,
  Globe,
  MessageSquare,
  BarChart3,
  ShieldCheck,
  Building2,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Lock,
  Layers,
  Smartphone,
} from "lucide-react";

export default function Home() {
  const portalCards = [
    {
      title: "Gym Owner Portal",
      description: "Complete operations suite: member records, KYC onboarding, staff permissions, POS inventory, WhatsApp alerts, and P&L analytics.",
      href: "/login",
      icon: Building2,
      badge: "OWNER",
      badgeColor: "bg-indigo-950 text-indigo-300 border-indigo-800",
      cta: "Sign In as Owner",
      accent: "from-indigo-600 to-indigo-500",
    },
    {
      title: "Member Mobile Portal",
      description: "Mobile-first digital membership pass with anti-passback HMAC-SHA256 QR codes, assigned workouts, weight logs, and payment receipts.",
      href: "/login",
      icon: Smartphone,
      badge: "MEMBER",
      badgeColor: "bg-emerald-950 text-emerald-300 border-emerald-800",
      cta: "Access Member Pass",
      accent: "from-emerald-600 to-teal-500",
    },
    {
      title: "Gym-Branded Websites",
      description: "Public-facing microsites with custom brand accents, facilities showcase, membership plans, schedules, and rate-limited lead capture forms.",
      href: "/g/spartan-athletics",
      icon: Globe,
      badge: "PUBLIC",
      badgeColor: "bg-sky-950 text-sky-300 border-sky-800",
      cta: "View Sample Site",
      accent: "from-sky-600 to-blue-500",
    },
    {
      title: "Platform Administration",
      description: "Restricted FIXIA Super Admin suite for manual tenant onboarding, custom tier overrides, quota tracking, SaaS billing, and audit logs.",
      href: "/platform-admin/login",
      icon: ShieldCheck,
      badge: "SUPER ADMIN",
      badgeColor: "bg-purple-950 text-purple-300 border-purple-800",
      cta: "Super Admin Gateway",
      accent: "from-purple-600 to-indigo-500",
    },
  ];

  const modules = [
    {
      icon: Users,
      title: "Member Management",
      description: "Comprehensive member directory, profile documents, medical history, emergency contacts, and active status tracking.",
    },
    {
      icon: QrCode,
      title: "QR Attendance",
      description: "Dynamic 60-second HMAC-SHA256 tokens with replay prevention, front-desk camera scanning, and audit logs.",
    },
    {
      icon: CreditCard,
      title: "Billing & Invoicing",
      description: "Sequential tax invoices, partial payments, automated dues reminders, refunds, and adjustments.",
    },
    {
      icon: UserPlus,
      title: "Leads & Enquiries CRM",
      description: "Multi-stage inquiry pipeline, trial booking calendar, follow-up reminders, and one-click member conversion.",
    },
    {
      icon: CalendarCheck2,
      title: "Class Schedules & Capacity",
      description: "Group fitness scheduling, instructor assignments, waitlist queues, and member self-service bookings.",
    },
    {
      icon: Receipt,
      title: "Operating Expenses & P&L",
      description: "Categorized expense tracking, recurring vendor costs, and net income calculations against payment collections.",
    },
    {
      icon: Package,
      title: "Retail Inventory & POS",
      description: "Supplements, merchandise, retail stock alerts, barcode scanning, and multi-tender point of sale.",
    },
    {
      icon: Globe,
      title: "Public Branded Websites",
      description: "Turnkey public websites for every gym with facilities, trainers, pricing plans, and WhatsApp contact links.",
    },
    {
      icon: MessageSquare,
      title: "WhatsApp Business Alerts",
      description: "Transactional notifications for dues, welcome packets, renewal alerts, and scheduled announcements.",
    },
    {
      icon: BarChart3,
      title: "Business Analytics & Export",
      description: "Accurate financial reports distinguishing invoices from collections, attendance heatmaps, and CSV exports.",
    },
    {
      icon: Building2,
      title: "Strict Tenant Isolation",
      description: "PostgreSQL Row-Level Security database boundaries preventing cross-gym record exposure across all queries and actions.",
    },
    {
      icon: Layers,
      title: "Progressive Web App (PWA)",
      description: "Installable app shell, offline caching with stale-while-revalidate, and zero-cache privacy protection.",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      {/* Top Navigation */}
      <header className="sticky top-0 z-50 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="size-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-500 text-white flex items-center justify-center font-bold shadow-md shadow-indigo-600/30 group-hover:scale-105 transition-transform">
              <Dumbbell className="size-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-lg tracking-tight text-white">FIXIA</span>
                <span className="text-[10px] font-extrabold uppercase tracking-widest bg-indigo-950/80 border border-indigo-700/60 text-indigo-300 px-2 py-0.5 rounded-full">
                  GymOS
                </span>
              </div>
            </div>
          </Link>

          <div className="flex items-center gap-2.5 sm:gap-4">
            <Link
              href="/platform-admin/login"
              className="hidden md:flex items-center gap-1.5 text-xs text-slate-400 hover:text-white font-medium px-3 py-1.5 rounded-lg hover:bg-slate-900 border border-transparent hover:border-slate-800 transition"
            >
              <ShieldCheck className="size-3.5 text-indigo-400" />
              <span>Platform Admin</span>
            </Link>

            <Link
              href="/register"
              className="text-xs text-slate-400 hover:text-white font-medium px-3 py-1.5 rounded-lg border border-slate-800/60 hover:bg-slate-900 transition"
            >
              <span>Register Gym</span>
            </Link>

            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white text-xs font-bold px-4 py-2 rounded-xl shadow-md shadow-indigo-600/25 transition-all"
            >
              <Lock className="size-3.5" />
              <span>Sign In</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20 space-y-20 relative">
        {/* Ambient Top Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-b from-indigo-600/15 via-purple-600/10 to-transparent blur-3xl pointer-events-none -z-10" />

        <div className="text-center space-y-6 max-w-4xl mx-auto pt-4">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/90 border border-slate-800 text-slate-300 text-xs shadow-inner">
            <Sparkles className="size-3.5 text-indigo-400" />
            <span className="font-semibold text-white">The Complete Operating System for Gyms & Fitness Businesses</span>
            <span className="text-slate-600">&bull;</span>
            <span className="text-indigo-400 font-mono text-[11px]">gms.fixia.in</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white leading-tight">
            The Enterprise Operating System for{" "}
            <span className="bg-gradient-to-r from-indigo-400 via-purple-300 to-emerald-400 bg-clip-text text-transparent">
              High-Performance Gyms
            </span>
          </h1>

          <p className="text-slate-400 text-base sm:text-lg leading-relaxed max-w-2xl mx-auto">
            Engineered with strict PostgreSQL Row-Level Security, sub-50ms cryptographic QR attendance,
            deterministic financial ledgers, and automated WhatsApp member notifications.
          </p>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3.5">
            <Link
              href="/login"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-bold text-xs h-11 px-7 rounded-xl shadow-lg shadow-indigo-600/30 transition-all"
            >
              <span>Access Secure Workspace</span>
              <ArrowRight className="size-4" />
            </Link>

            <Link
              href="/login?gym=spartan-athletics"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-slate-900/80 hover:bg-slate-800 border border-slate-800 text-slate-200 hover:text-white font-semibold text-xs h-11 px-6 rounded-xl transition"
            >
              <Smartphone className="size-4 text-emerald-400" />
              <span>Digital Member Pass Demo</span>
            </Link>
          </div>
        </div>

        {/* 4 Primary System Portals */}
        <section className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 border-b border-slate-800 pb-4">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-400">
                Segregated Access Realms
              </span>
              <h2 className="text-2xl font-bold text-white mt-1">Platform Portals & Workspaces</h2>
            </div>
            <p className="text-xs text-slate-400 max-w-md">
              Isolated user realms ensuring members, gym owners, and platform administrators access strictly authorized datasets.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {portalCards.map((portal) => {
              const Icon = portal.icon;
              return (
                <div
                  key={portal.title}
                  className="rounded-2xl border border-slate-800/80 bg-slate-900/60 p-6 flex flex-col justify-between hover:border-slate-700 hover:bg-slate-900/90 transition-all duration-200 group shadow-lg"
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className={`size-11 rounded-xl bg-gradient-to-tr ${portal.accent} text-white flex items-center justify-center shadow-md`}>
                        <Icon className="size-5" />
                      </div>
                      <Badge variant="outline" className={`${portal.badgeColor} text-[10px] font-bold`}>
                        {portal.badge}
                      </Badge>
                    </div>

                    <div>
                      <h3 className="text-base font-bold text-white group-hover:text-indigo-300 transition-colors">
                        {portal.title}
                      </h3>
                      <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                        {portal.description}
                      </p>
                    </div>
                  </div>

                  <div className="pt-6 border-t border-slate-800/60 mt-6">
                    <Link
                      href={portal.href}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-400 group-hover:text-indigo-300 transition-colors"
                    >
                      <span>{portal.cta}</span>
                      <ArrowRight className="size-3.5 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* 12 Enterprise Modules Grid */}
        <section className="space-y-6">
          <div className="text-center space-y-2 max-w-xl mx-auto">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400">
              Complete Feature Spectrum
            </span>
            <h2 className="text-2xl font-bold text-white">Full-Stack Gym Management Modules</h2>
            <p className="text-xs text-slate-400">
              Deterministic, battle-tested capabilities powering all aspects of fitness club operations.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {modules.map((m) => {
              const Icon = m.icon;
              return (
                <div
                  key={m.title}
                  className="rounded-xl border border-slate-800/80 bg-slate-900/40 p-5 hover:border-slate-700 hover:bg-slate-900/70 transition-all flex items-start gap-4"
                >
                  <div className="size-10 rounded-xl bg-slate-800/80 border border-slate-700/60 text-indigo-400 flex items-center justify-center shrink-0">
                    <Icon className="size-5" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-sm font-bold text-white">{m.title}</h3>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      {m.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Enterprise Architecture Standards Card */}
        <section className="rounded-2xl border border-slate-800 bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 p-8 shadow-xl">
          <div className="max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 text-xs font-bold text-indigo-400">
              <ShieldCheck className="size-4" />
              <span>COMMERCIAL SAAS SECURITY BENCHMARKS</span>
            </div>
            <h3 className="text-2xl font-black text-white">
              Zero-Trust Architecture & Data Sovereignty
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              FIXIA GymOS enforces strict isolation where every tenant workspace operates within its own cryptographic context.
              Client-supplied identifiers are never trusted; identities are resolved directly from secure HTTP-only cookies.
              All administrative modifications are logged to an immutable security audit ledger.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3">
              <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 bg-emerald-950/30 border border-emerald-900/50 p-2.5 rounded-xl">
                <CheckCircle2 className="size-4 shrink-0" />
                <span>PostgreSQL RLS Partitioning</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-semibold text-indigo-400 bg-indigo-950/30 border border-indigo-900/50 p-2.5 rounded-xl">
                <CheckCircle2 className="size-4 shrink-0" />
                <span>HMAC-SHA256 Token Pass</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-semibold text-amber-400 bg-amber-950/30 border border-amber-900/50 p-2.5 rounded-xl">
                <CheckCircle2 className="size-4 shrink-0" />
                <span>Deterministic Cash Ledgers</span>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 py-8 bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <div className="size-6 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-xs">
              FG
            </div>
            <span>&copy; {new Date().getFullYear()} FIXIA GymOS &bull; Official SaaS Platform &bull; gms.fixia.in</span>
          </div>

          <div className="flex items-center gap-4 text-[11px] text-slate-400">
            <Link href="/login" className="hover:text-white transition">Portal Login</Link>
            <span>&bull;</span>
            <Link href="/register" className="hover:text-white transition">Onboarding Policy</Link>
            <span>&bull;</span>
            <Link href="/platform-admin/login" className="hover:text-white transition">Super Admin</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

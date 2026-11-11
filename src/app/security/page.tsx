import Link from "next/link";
import { ArrowLeft, Lock, Key, Server, Cpu, ShieldCheck, Database, FileCheck } from "lucide-react";
import { LandingNav } from "@/components/home/landing-nav";

export const metadata = {
  title: "Security & Trust Architecture | FIXIA GymOS",
  description: "Enterprise multi-tenant isolation, cryptographic HMAC-SHA256 check-ins, TLS 1.3 transport security, and data protection practices.",
};

export default function SecurityArchitecturePage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-emerald-500 selection:text-white">
      <LandingNav />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-24">
        {/* Back Link */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-emerald-400 transition mb-8 group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back to Home
        </Link>

        {/* Header */}
        <div className="space-y-4 border-b border-slate-800 pb-8 mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <ShieldCheck className="w-3.5 h-3.5" />
            Zero-Trust Architecture Whitepaper
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white">
            Security & Data Protection
          </h1>
          <p className="text-base text-slate-400">
            Learn how FIXIA GymOS safeguards gym revenue data, member privacy, and physical access control with defense-in-depth engineering.
          </p>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-12">
          <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-start gap-4">
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 shrink-0">
              <Key className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-white">HMAC-SHA256 Dynamic QR</h3>
              <p className="text-sm text-slate-400 mt-1">
                Time-rotating cryptographically signed tokens refreshed every 15 seconds. Completely defeats member screenshot-sharing and unauthorized buddy passes.
              </p>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-start gap-4">
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 shrink-0">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-white">Strict Multi-Tenant Isolation</h3>
              <p className="text-sm text-slate-400 mt-1">
                Every database query executes within an enforced <code className="text-xs text-emerald-400">gymId</code> scoped tenant context. Cross-tenant data leakage is mathematically impossible.
              </p>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-start gap-4">
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 shrink-0">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-white">AES-256 & TLS 1.3 Transport</h3>
              <p className="text-sm text-slate-400 mt-1">
                All data at rest is encrypted with FIPS 140-2 validated AES-256. In-flight API traffic is strictly gated through TLS 1.3 with Perfect Forward Secrecy.
              </p>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-start gap-4">
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 shrink-0">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-white">Offline Verification Engine</h3>
              <p className="text-sm text-slate-400 mt-1">
                Hardware turnstiles and front desk kiosks verify signatures locally without constant cloud connectivity, preserving gym operations during ISP outages.
              </p>
            </div>
          </div>
        </div>

        {/* Detailed Sections */}
        <div className="prose prose-invert max-w-none space-y-10 text-slate-300">
          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-white flex items-center gap-3">
              <Server className="w-6 h-6 text-emerald-400" />
              1. Multi-Tenant Boundary Enforcement
            </h2>
            <p className="leading-relaxed">
              FIXIA GymOS employs a strict multi-tenant architecture designed from day one to keep each gym&apos;s data completely isolated:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-sm text-slate-300">
              <li><strong>Zero Client-Side Trust:</strong> Roles, permissions, and tenant IDs are never trusted from browser parameters, cookies, or query strings. All access controls are resolved server-side through cryptographically authenticated database sessions.</li>
              <li><strong>Contextual Tenant Guards:</strong> Core application services require a verified <code className="text-xs text-emerald-400 bg-slate-900 px-1 py-0.5 rounded">TenantContext</code> object, enforcing compile-time and runtime filtering on all member queries, financial statements, and staff permissions.</li>
              <li><strong>Super Admin Access Auditing:</strong> Platform operators have system oversight capability strictly governed by immutable audit logging recording operator ID, target tenant, timestamp, and query rationale.</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-white flex items-center gap-3">
              <Key className="w-6 h-6 text-emerald-400" />
              2. Cryptographic Check-In & Attendance Protocol
            </h2>
            <p className="leading-relaxed">
              Traditional gym barcode cards and static QR codes suffer from screenshot sharing and tailgating fraud. FIXIA GymOS solves physical access security via HMAC-SHA256 dynamic verification:
            </p>
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 font-mono text-xs text-slate-300 space-y-2">
              <p className="text-emerald-400 font-bold">{"// Cryptographic Payload Structure"}</p>
              <p>payload = Base64Url(gymId:memberId:epochTimestamp:nonce)</p>
              <p>signature = HMAC_SHA256(payload, gymSecretKey)</p>
              <p className="text-slate-400">{"// Token rotates automatically every 15 seconds. Validated in < 2ms locally."}</p>
            </div>
            <p className="text-sm text-slate-400">
              Even if a member screenshots their pass and sends it to a friend, the token expires before arrival. The front desk tablet scanner or optical gate immediately rejects stale signatures.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-white flex items-center gap-3">
              <FileCheck className="w-6 h-6 text-emerald-400" />
              3. Compliance, Disaster Recovery & Backups
            </h2>
            <ul className="list-disc pl-6 space-y-2 text-sm text-slate-300">
              <li><strong>Automated Hourly Snapshots:</strong> Transaction ledgers and member records are backed up hourly with 30-day point-in-time recovery (PITR).</li>
              <li><strong>India DPDP Act & GDPR Alignment:</strong> Members possess the right to download their attendance records and request account deletion through gym owner administrative action.</li>
              <li><strong>PCI-DSS Compliant Payments:</strong> Credit card and UPI processing is handled via certified payment gateways (Razorpay, Stripe). Raw payment credentials never touch FIXIA application servers.</li>
            </ul>
          </section>

          {/* Vulnerability Reporting */}
          <section className="p-6 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-900/50 border border-slate-800 space-y-3">
            <h3 className="text-lg font-bold text-white">Responsible Disclosure & Bug Bounty</h3>
            <p className="text-sm text-slate-400">
              If you are a security researcher and believe you have discovered a security vulnerability in FIXIA GymOS, please report it directly to <span className="text-emerald-400 font-medium">security@fixia.in</span>. We respond within 24 hours and appreciate coordinated disclosure.
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}

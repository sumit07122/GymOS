import Link from "next/link";
import { ArrowLeft, Shield, CheckCircle2, Scale } from "lucide-react";
import { LandingNav } from "@/components/home/landing-nav";

export const metadata = {
  title: "Terms of Service | FIXIA GymOS",
  description: "Commercial SaaS terms of service, subscription billing policies, multi-tenant data ownership, and uptime agreements.",
};

export default function TermsOfServicePage() {
  const lastUpdated = "November 11, 2026";

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
            <Scale className="w-3.5 h-3.5" />
            SaaS Commercial Agreement
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white">
            Terms of Service
          </h1>
          <p className="text-base text-slate-400">
            Last Updated: <span className="text-slate-200 font-medium">{lastUpdated}</span> · Version 2.4 (Production Release)
          </p>
        </div>

        {/* Content */}
        <div className="prose prose-invert max-w-none space-y-12 text-slate-300">
          {/* Section 1: Introduction */}
          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-white flex items-center gap-3">
              <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 text-sm font-bold border border-emerald-500/20">
                1
              </span>
              Acceptance of Terms & SaaS Scope
            </h2>
            <p className="leading-relaxed">
              These Terms of Service (&quot;Terms&quot;) constitute a binding legal agreement between the entity or person operating a fitness business or gym facility (&quot;Customer&quot;, &quot;Gym Owner&quot;, or &quot;You&quot;) and FIXIA GymOS (&quot;FIXIA&quot;, &quot;we&quot;, &quot;our&quot;, or &quot;us&quot;). By creating an account, onboarding a gym workspace, provisioning members, or processing billing transactions on FIXIA GymOS, you acknowledge that you have read, understood, and agreed to be bound by these Terms.
            </p>
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              <p className="text-sm text-slate-300">
                FIXIA provides modern cloud infrastructure, cryptographic check-in verification, automated POS billing, CRM lead pipelines, and member apps for fitness facilities across India and internationally.
              </p>
            </div>
          </section>

          {/* Section 2: Subscription Plans & Transparent Pricing */}
          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-white flex items-center gap-3">
              <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 text-sm font-bold border border-emerald-500/20">
                2
              </span>
              Commercial Subscription Plans & Billing
            </h2>
            <p className="leading-relaxed">
              FIXIA operates on a transparent, predictable SaaS model with zero hidden transaction surcharges:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-6">
              <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
                <span className="text-xs uppercase font-bold text-emerald-400 tracking-wider">Starter Studio</span>
                <p className="text-2xl font-black text-white mt-1">₹999 <span className="text-xs font-normal text-slate-400">/mo</span></p>
                <p className="text-xs text-slate-400 mt-2">Up to 100 active members. Includes dynamic HMAC QR attendance, billing & GST invoicing, and digital passes.</p>
              </div>
              <div className="p-4 rounded-xl bg-slate-900/80 border border-emerald-500/30 ring-1 ring-emerald-500/20">
                <span className="text-xs uppercase font-bold text-emerald-400 tracking-wider">Growth Athletic</span>
                <p className="text-2xl font-black text-white mt-1">₹1,999 <span className="text-xs font-normal text-slate-400">/mo</span></p>
                <p className="text-xs text-slate-400 mt-2">Up to 500 members. Adds CRM lead pipeline, operating expenses, retail POS, and custom public website.</p>
              </div>
              <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
                <span className="text-xs uppercase font-bold text-emerald-400 tracking-wider">Pro Enterprise</span>
                <p className="text-2xl font-black text-white mt-1">₹3,499 <span className="text-xs font-normal text-slate-400">/mo</span></p>
                <p className="text-xs text-slate-400 mt-2">Unlimited members. Adds WhatsApp Cloud automation, multi-branch analytics, and dedicated priority support.</p>
              </div>
            </div>
            <ul className="list-disc pl-6 space-y-2 text-sm text-slate-300">
              <li><strong>Annual Billing Discount:</strong> Annual plans receive 2 months complimentary (pay for 10 months, get 12 months active service).</li>
              <li><strong>Taxes:</strong> Subscriptions in India are subject to applicable GST (18%) itemized transparently on every monthly invoice.</li>
              <li><strong>Grace Period:</strong> Failed recurring renewals enter a 7-day grace period during which front desk check-in remains fully active.</li>
            </ul>
          </section>

          {/* Section 3: Data Ownership & Tenant Isolation */}
          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-white flex items-center gap-3">
              <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 text-sm font-bold border border-emerald-500/20">
                3
              </span>
              Complete Tenant Isolation & Data Ownership
            </h2>
            <p className="leading-relaxed">
              <strong>Your members, records, revenue figures, and lead databases belong strictly to you.</strong> FIXIA will never sell, market to, or contact your members on behalf of third-party advertisers.
            </p>
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
              <h4 className="font-semibold text-white flex items-center gap-2">
                <Shield className="w-4 h-4 text-emerald-400" />
                Zero Vendor Lock-in Guarantee
              </h4>
              <p className="text-sm text-slate-400">
                Gym owners may export 100% of their member directories, attendance logs, and payment ledgers in standard CSV and JSON format at any time with a single click from the Owner Settings panel.
              </p>
            </div>
          </section>

          {/* Section 4: Service Level Agreement (SLA) & Offline Resilience */}
          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-white flex items-center gap-3">
              <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 text-sm font-bold border border-emerald-500/20">
                4
              </span>
              Uptime SLA & Offline Resilience Guarantee
            </h2>
            <p className="leading-relaxed">
              We engineer FIXIA GymOS for mission-critical gym operations:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-sm text-slate-300">
              <li><strong>99.9% Target Uptime:</strong> Deployed across redundant serverless compute regions with autoscaling PostgreSQL read replicas.</li>
              <li><strong>Offline Attendance Verification:</strong> Dynamic HMAC-SHA256 member QR codes can be validated offline without uninterrupted internet access, ensuring gym turnstiles and front desk kiosks never halt check-ins during local ISP disruptions.</li>
              <li><strong>Scheduled Maintenance:</strong> Infrastructure patches are scheduled during low-traffic windows (02:00 - 04:00 IST) with advance notice.</li>
            </ul>
          </section>

          {/* Section 5: Cancellation & Refunds */}
          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-white flex items-center gap-3">
              <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 text-sm font-bold border border-emerald-500/20">
                5
              </span>
              Cancellation & Refund Policy
            </h2>
            <p className="leading-relaxed">
              You may cancel your SaaS subscription at any time directly from the platform billing settings. Upon cancellation, your workspace remains fully operational through the end of the paid billing cycle. If you cancel within the first 14 days of an annual plan, you are entitled to a full refund upon request to support@fixia.in.
            </p>
          </section>

          {/* Section 6: Contact */}
          <section className="p-6 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-900/50 border border-slate-800 space-y-3">
            <h3 className="text-lg font-bold text-white">Questions regarding these terms?</h3>
            <p className="text-sm text-slate-400">
              Our legal and commercial operations team is available at <span className="text-emerald-400">legal@fixia.in</span> or via phone at <span className="text-slate-200">+91 98765 43210</span>.
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}

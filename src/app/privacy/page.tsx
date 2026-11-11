import * as React from "react";
import Link from "next/link";
import { LandingNav } from "@/components/home/landing-nav";
import { Shield, Lock, Eye, FileText, ArrowLeft, CheckCircle2 } from "lucide-react";

export const metadata = {
  title: "Privacy Policy | FIXIA GymOS",
  description: "Learn how FIXIA GymOS protects your gym's sovereign data, member biometric privacy, and operational records.",
};

export default function PrivacyPage() {
  const lastUpdated = "November 2026";

  return (
    <div className="bg-canvas text-ink min-h-screen flex flex-col font-sans selection:bg-pine-soft selection:text-pine">
      <LandingNav />

      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted hover:text-pine transition-colors mb-8"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to Home</span>
        </Link>

        {/* Header */}
        <div className="border-b border-line pb-8 mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pine-soft text-pine text-xs font-semibold mb-4 border border-pine/20">
            <Shield className="h-3.5 w-3.5" />
            <span>Privacy & Data Sovereignty</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight font-display text-ink">
            Privacy Policy
          </h1>
          <p className="mt-2 text-sm text-muted">
            Effective Date: {lastUpdated} &bull; Version 2.4 (Enterprise Multi-Tenant Standard)
          </p>
        </div>

        {/* Content */}
        <div className="space-y-10 text-sm leading-relaxed text-ink/90">
          <section className="space-y-3">
            <h2 className="text-lg font-bold font-display text-ink flex items-center gap-2">
              <Lock className="h-4 w-4 text-pine" />
              <span>1. Our Fundamental Commitment to Data Sovereignty</span>
            </h2>
            <p>
              At FIXIA GymOS (&quot;FIXIA&quot;, &quot;we&quot;, &quot;us&quot;, or &quot;our&quot;), we operate under a strict principle of <strong>tenant data sovereignty</strong>. We provide the operating system for gyms, fitness clubs, and boutique studios. We believe your gym&apos;s data belongs solely to you and your gym members.
            </p>
            <div className="p-4 rounded-xl bg-white border border-line space-y-2">
              <div className="flex items-center gap-2 text-pine font-semibold text-xs">
                <CheckCircle2 className="h-4 w-4 text-pine shrink-0" />
                <span>Zero Data Monetization Guarantee</span>
              </div>
              <p className="text-xs text-muted">
                We do not sell, rent, broker, or monetize your member lists, contact numbers, attendance logs, or financial ledgers to third-party advertisers, supplement brands, or insurance providers.
              </p>
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold font-display text-ink flex items-center gap-2">
              <Eye className="h-4 w-4 text-pine" />
              <span>2. Information We Collect and Process</span>
            </h2>
            <p>
              Depending on whether you are a <strong>Gym Owner (Tenant Administrator)</strong>, a <strong>Staff Member / Trainer</strong>, or a <strong>Gym Member</strong>, we process distinct categories of information:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-xs sm:text-sm">
              <li>
                <strong>Tenant Account Data:</strong> Gym business name, legal registration, GST/Tax identification numbers, business email, phone, location address, and billing contact information.
              </li>
              <li>
                <strong>Member Operational Profiles:</strong> Member full name, phone number, email address, emergency contact details, membership tier, start and expiry dates, and KYC identification documents uploaded by gym staff.
              </li>
              <li>
                <strong>Cryptographic Attendance Logs:</strong> Timestamped check-in and check-out logs verified via HMAC-SHA256 dynamic turnstile QR passes. Raw biometric facial recognition images are never stored on our central database.
              </li>
              <li>
                <strong>Billing & Transaction Records:</strong> Sequential GST invoice records, payment receipt references (UPI transaction IDs, cash ledger notes, bank transfers). We do not store raw credit card numbers or banking passwords.
              </li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold font-display text-ink flex items-center gap-2">
              <Shield className="h-4 w-4 text-pine" />
              <span>3. Cryptographic QR Attendance Security</span>
            </h2>
            <p>
              FIXIA GymOS employs proprietary 60-second rotating cryptographic tokens for member verification. The QR codes generated on the member&apos;s digital pass contain time-bound HMAC signatures signed with your gym&apos;s unique tenant secret. This ensures QR passes cannot be screenshot, forwarded, or shared between individuals.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold font-display text-ink flex items-center gap-2">
              <FileText className="h-4 w-4 text-pine" />
              <span>4. Data Retention, Portability & Deletion</span>
            </h2>
            <p>
              Gym owners have complete rights to export their full member roster, attendance history, and financial statements as standardized CSV exports at any time from <code>/owner/reports</code>. Upon cancellation or termination of a gym subscription, all tenant databases undergo secure cryptographic purging within 30 days of service termination.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold font-display text-ink flex items-center gap-2">
              <Lock className="h-4 w-4 text-pine" />
              <span>5. Regulatory Compliance</span>
            </h2>
            <p>
              Our infrastructure is engineered in compliance with the Digital Personal Data Protection (DPDP) Act of India and international ISO/IEC 27001 data protection principles. All database communication enforces TLS 1.3 encryption in transit and AES-256 encryption at rest.
            </p>
          </section>

          <section className="pt-6 border-t border-line text-xs text-muted">
            <p>
              Questions regarding privacy or compliance requests may be directed to our Data Protection Officer at:{" "}
              <a href="mailto:privacy@fixia.in" className="text-pine underline font-medium">
                privacy@fixia.in
              </a>
            </p>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-line bg-white py-6 text-center text-xs text-muted">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>&copy; {new Date().getFullYear()} FIXIA GymOS. All rights reserved.</div>
          <div className="flex items-center gap-4 text-xs font-medium">
            <Link href="/privacy" className="text-pine font-semibold">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-ink">Terms of Service</Link>
            <Link href="/security" className="hover:text-ink">Security Whitepaper</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}


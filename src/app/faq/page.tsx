"use client";

import * as React from "react";
import Link from "next/link";
import { Search, HelpCircle, MessageSquare, ArrowRight, Sparkles } from "lucide-react";
import { MarketingNav } from "@/components/marketing/navbar";
import { MarketingFooter } from "@/components/marketing/footer";
import { FaqAccordion, DEFAULT_FAQS, FaqItem } from "@/components/marketing/faq-accordion";
import { CtaBanner } from "@/components/marketing/cta-banner";

const EXTENDED_FAQS: FaqItem[] = [
  ...DEFAULT_FAQS,
  {
    category: "Setup",
    question: "How long does it take to get our gym up and running on GymOS?",
    answer:
      "Most gyms are live within 15 to 30 minutes. You can self-register your gym workspace, customize your operating hours, upload your existing member CSV list, and launch the reception kiosk tablet right away.",
  },
  {
    category: "Setup",
    question: "Do we need an IT team or server setup to manage GymOS?",
    answer:
      "Zero IT required. GymOS is 100% cloud-hosted on scalable serverless infrastructure. We manage backups, security patches, database replication, and SSL certificates automatically.",
  },
  {
    category: "Billing",
    question: "Are there any hidden setup fees, cancellation penalties, or transaction cut fees?",
    answer:
      "None. What you see is what you pay: Starter (₹999/mo), Growth (₹1,999/mo), or Pro (₹3,499/mo). We never charge percentage cuts or take commissions on member dues collected at your gym.",
  },
  {
    category: "Attendance",
    question: "What happens if our gym internet goes down temporarily?",
    answer:
      "Our Progressive Web App (PWA) and Reception Kiosk are designed with offline resilience. The PWA caches active member tokens via its service worker, allowing members to display their valid pass even without cellular service.",
  },
  {
    category: "WhatsApp",
    question: "Can we customize the text of automated WhatsApp messages?",
    answer:
      "Yes. You can customize the gym name, offer text, bonus trial days, and greetings. In Growth and Pro tiers, you can also send custom broadcast announcements to active or inactive member segments.",
  },
  {
    category: "Security",
    question: "Can we export all of our gym data if we ever decide to leave?",
    answer:
      "Yes. You have 100% data ownership. You can export complete CSV backups of your members, attendance check-ins, leads, and payment records at any time with a single click.",
  },
];

export default function FaqPage() {
  const [searchQuery, setSearchQuery] = React.useState("");

  const filteredFaqs = EXTENDED_FAQS.filter((f) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return f.question.toLowerCase().includes(q) || f.answer.toLowerCase().includes(q) || f.category.toLowerCase().includes(q);
  });

  return (
    <div className="min-h-screen bg-[#F7FAF8] text-[#171C19] flex flex-col font-sans selection:bg-[#E8F9EE] selection:text-[#16A34A]">
      <MarketingNav />

      {/* Hero Header */}
      <section className="pt-16 sm:pt-24 pb-16 bg-white border-b border-[#E7ECE9] relative overflow-hidden">
        <div className="absolute inset-0 gymos-grid-subtle opacity-70 pointer-events-none" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center space-y-4">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-[#E8F9EE] px-3.5 py-1 text-xs font-bold text-[#16A34A] border border-[#1BC95A]/30">
            <HelpCircle className="h-3.5 w-3.5" />
            <span>Help Center & Knowledge Base</span>
          </div>

          <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-[#171C19] max-w-3xl mx-auto">
            Frequently Asked <span className="text-[#1BC95A]">Questions</span>
          </h1>

          <p className="text-sm sm:text-base text-[#69736E] max-w-2xl mx-auto leading-relaxed">
            Everything you need to know about setting up your workspace, managing attendance, billing, and automated WhatsApp renewals.
          </p>

          {/* Search Box */}
          <div className="pt-6 max-w-xl mx-auto">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#69736E]" />
              <input
                type="text"
                placeholder="Search questions (e.g. QR scanner, trial, WhatsApp, backup, payments)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-3.5 rounded-2xl border border-[#E7ECE9] bg-[#F7FAF8] text-xs sm:text-sm text-[#171C19] focus:outline-hidden focus:ring-2 focus:ring-[#1BC95A]/40 focus:border-[#1BC95A] shadow-xs"
              />
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Accordion Section */}
      <section className="py-16 sm:py-24 bg-[#F7FAF8]">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <FaqAccordion items={filteredFaqs} />
        </div>
      </section>

      {/* CTA Banner & Footer */}
      <CtaBanner />
      <MarketingFooter />
    </div>
  );
}

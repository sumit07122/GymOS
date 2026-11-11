"use client";

import * as React from "react";
import { ChevronDown, HelpCircle, MessageCircle } from "lucide-react";
import Link from "next/link";

export interface FaqItem {
  question: string;
  answer: string;
  category: "Setup" | "Attendance" | "Billing" | "WhatsApp" | "Security";
}

export const DEFAULT_FAQS: FaqItem[] = [
  {
    category: "Setup",
    question: "How does the 14-day free trial work?",
    answer:
      "When you register your gym on GymOS, your dedicated workspace is provisioned immediately with full access to all features on your chosen plan. You don't need to enter credit card details to start. If you love the software, you can activate your subscription before day 14 to keep running without interruption.",
  },
  {
    category: "Setup",
    question: "Can I import our existing member records from Excel or another software?",
    answer:
      "Yes! GymOS includes a built-in CSV bulk import wizard. You can upload your active member roster with names, phone numbers, email, membership start/end dates, and plan details in under 2 minutes. Our system automatically validates rows and reports any duplicate phone numbers.",
  },
  {
    category: "Attendance",
    question: "Do we need expensive proprietary hardware for QR code check-ins?",
    answer:
      "No expensive turnstile controllers required. GymOS runs an Anti-Passback Reception Kiosk on any device: an iPad, Android tablet, front-desk computer webcam, or handheld 2D USB/Bluetooth barcode scanner. Members scan their dynamic rotating QR pass on their phone screen for sub-second verification.",
  },
  {
    category: "Attendance",
    question: "How does GymOS prevent members from sharing screenshots of their QR pass?",
    answer:
      "Every member pass uses cryptographic HMAC-SHA256 signatures with 60-second time-based rotation (TOTP style). Screenshots expire within seconds. Additionally, our server enforces an anti-passback cooldown that blocks the same member ID from scanning multiple times within 15 minutes.",
  },
  {
    category: "WhatsApp",
    question: "How do automated WhatsApp reminders work? Can our number get flagged?",
    answer:
      "GymOS connects directly to the official Meta WhatsApp Cloud API and Twilio Business Messaging using pre-approved transactional utility templates. Because all messages are utility alerts (payment receipts, T-7 and T-3 renewal reminders, and absent-member check-ins) and honor built-in consent opt-ins with STOP keyword processing, your number remains 100% compliant and protected from spam bans.",
  },
  {
    category: "Billing",
    question: "What payment gateways and collection methods are supported?",
    answer:
      "GymOS supports direct UPI QR codes, Razorpay online links, credit/debit cards, and manual reception cash/bank transfer logging. When cash or UPI is received, staff can record the transaction in 1 click to auto-issue a GST-compliant digital receipt sent directly to the member's WhatsApp.",
  },
  {
    category: "Billing",
    question: "Can we upgrade, downgrade, or cancel our SaaS plan anytime?",
    answer:
      "Absolutely. You can change your SaaS plan tier at any time from your platform subscription settings. If you upgrade, the price difference is prorated. There are no cancellation penalties or hidden lock-ins, and you can export your entire database of members, invoices, and attendance logs to CSV anytime.",
  },
  {
    category: "Security",
    question: "How is my gym's financial and member data isolated from other gyms?",
    answer:
      "GymOS is engineered with multi-tenant PostgreSQL Row-Level Security (RLS). Every query executes inside an isolated transaction bound to your unique tenant gym ID. No member data, financial numbers, or leads can ever be queried or viewed by another gym.",
  },
];

export function FaqAccordion({ items = DEFAULT_FAQS }: { items?: FaqItem[] }) {
  const [openIndex, setOpenIndex] = React.useState<number | null>(0);
  const [selectedCategory, setSelectedCategory] = React.useState<string>("All");

  const categories = ["All", "Setup", "Attendance", "Billing", "WhatsApp", "Security"];

  const filteredItems =
    selectedCategory === "All"
      ? items
      : items.filter((item) => item.category === selectedCategory);

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Category Pills */}
      <div className="flex flex-wrap items-center justify-center gap-2">
        {categories.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => {
              setSelectedCategory(cat);
              setOpenIndex(null);
            }}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition ${
              selectedCategory === cat
                ? "bg-[#171C19] text-white shadow-xs"
                : "bg-white text-[#69736E] border border-[#E7ECE9] hover:text-[#171C19] hover:bg-[#F7FAF8]"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Accordion List */}
      <div className="space-y-3">
        {filteredItems.map((item, index) => {
          const isOpen = openIndex === index;

          return (
            <div
              key={index}
              className={`rounded-2xl border transition-all ${
                isOpen
                  ? "bg-white border-[#1BC95A]/50 shadow-md shadow-[#1BC95A]/5"
                  : "bg-white border-[#E7ECE9] hover:border-[#E7ECE9] shadow-xs"
              }`}
            >
              <button
                type="button"
                onClick={() => setOpenIndex(isOpen ? null : index)}
                className="w-full flex items-center justify-between p-5 sm:p-6 text-left gap-4"
                aria-expanded={isOpen}
              >
                <div className="flex items-center gap-3">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-[#E8F9EE] text-[#16A34A] border border-[#1BC95A]/20 shrink-0">
                    {item.category}
                  </span>
                  <span className="font-display font-bold text-sm sm:text-base text-[#171C19]">
                    {item.question}
                  </span>
                </div>

                <div
                  className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full transition-transform ${
                    isOpen ? "rotate-180 bg-[#1BC95A] text-white" : "bg-[#F7FAF8] text-[#69736E]"
                  }`}
                >
                  <ChevronDown className="h-4 w-4" />
                </div>
              </button>

              {isOpen && (
                <div className="px-5 pb-5 sm:px-6 sm:pb-6 pt-0 text-xs sm:text-sm text-[#69736E] leading-relaxed border-t border-[#F7FAF8] mt-1 animate-in fade-in-50 duration-200">
                  <p>{item.answer}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Still Have Questions Box */}
      <div className="rounded-2xl border border-[#E7ECE9] bg-white p-6 sm:p-8 text-center space-y-3">
        <div className="h-10 w-10 rounded-xl bg-[#E8F9EE] text-[#16A34A] flex items-center justify-center mx-auto">
          <MessageCircle className="h-5 w-5" />
        </div>
        <h4 className="font-display text-base font-bold text-[#171C19]">
          Have a question not listed here?
        </h4>
        <p className="text-xs text-[#69736E] max-w-md mx-auto leading-relaxed">
          Our team is available 7 days a week to answer architecture, pricing, or custom hardware integration questions.
        </p>
        <div className="pt-2 flex flex-wrap justify-center gap-3">
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 rounded-xl bg-[#171C19] hover:bg-[#28322D] text-white text-xs font-bold px-4 py-2 transition"
          >
            <span>Talk to Our Team</span>
          </Link>
          <a
            href="https://wa.me/917017936338?text=Hi%20GymOS%20team,%20I%20have%20a%20question%20about%20your%20software."
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-xl bg-[#E8F9EE] hover:bg-[#d6f4e1] text-[#16A34A] text-xs font-bold px-4 py-2 transition border border-[#1BC95A]/30"
          >
            <span>WhatsApp Quick Chat</span>
          </a>
        </div>
      </div>
    </div>
  );
}

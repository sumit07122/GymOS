"use client";

import * as React from "react";
import Link from "next/link";
import {
  QrCode,
  Users,
  CreditCard,
  MessageSquare,
  TrendingUp,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  Smartphone,
  Sparkles,
  ChevronRight,
  Clock,
  Flame,
} from "lucide-react";

type ShowcaseTab = "dashboard" | "kiosk" | "member" | "whatsapp";

export function ProductShowcase() {
  const [activeTab, setActiveTab] = React.useState<ShowcaseTab>("dashboard");

  return (
    <div className="w-full space-y-6">
      {/* Tab Switcher Pills */}
      <div className="flex flex-wrap items-center justify-center gap-2">
        <button
          type="button"
          onClick={() => setActiveTab("dashboard")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
            activeTab === "dashboard"
              ? "bg-[#1BC95A] text-white shadow-xs"
              : "bg-white text-[#69736E] border border-[#E7ECE9] hover:text-[#171C19]"
          }`}
        >
          <TrendingUp className="h-4 w-4" />
          <span>Owner ERP Command</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("kiosk")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
            activeTab === "kiosk"
              ? "bg-[#1BC95A] text-white shadow-xs"
              : "bg-white text-[#69736E] border border-[#E7ECE9] hover:text-[#171C19]"
          }`}
        >
          <QrCode className="h-4 w-4" />
          <span>Anti-Passback QR Kiosk</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("member")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
            activeTab === "member"
              ? "bg-[#1BC95A] text-white shadow-xs"
              : "bg-white text-[#69736E] border border-[#E7ECE9] hover:text-[#171C19]"
          }`}
        >
          <Smartphone className="h-4 w-4" />
          <span>Digital Member PWA</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("whatsapp")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
            activeTab === "whatsapp"
              ? "bg-[#1BC95A] text-white shadow-xs"
              : "bg-white text-[#69736E] border border-[#E7ECE9] hover:text-[#171C19]"
          }`}
        >
          <MessageSquare className="h-4 w-4" />
          <span>WhatsApp Auto-Dues Engine</span>
        </button>
      </div>

      {/* Browser Mockup Window */}
      <div className="rounded-2xl border border-[#E7ECE9] bg-white shadow-xl overflow-hidden transition-all">
        {/* Browser Top Window Bar */}
        <div className="bg-[#F7FAF8] border-b border-[#E7ECE9] px-4 py-2.5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-[#E7ECE9]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#E7ECE9]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#E7ECE9]" />
          </div>

          <div className="flex-1 max-w-md mx-auto rounded-lg bg-white border border-[#E7ECE9] px-3 py-1 text-[11px] font-mono text-[#69736E] flex items-center justify-center gap-1.5 truncate">
            <span className="text-[#16A34A] font-bold">https://</span>
            <span>
              {activeTab === "dashboard" && "app.gymos.in/owner/dashboard"}
              {activeTab === "kiosk" && "app.gymos.in/owner/attendance/kiosk"}
              {activeTab === "member" && "app.gymos.in/portal/ironforge"}
              {activeTab === "whatsapp" && "app.gymos.in/owner/whatsapp/logs"}
            </span>
          </div>

          <div className="flex items-center gap-2 text-[10px] text-[#16A34A] font-bold bg-[#E8F9EE] px-2 py-0.5 rounded-md">
            <span>LIVE PREVIEW</span>
          </div>
        </div>

        {/* Viewport Content */}
        <div className="p-6 sm:p-8 bg-[#F7FAF8]/50 min-h-[440px]">
          {/* 1. Dashboard View */}
          {activeTab === "dashboard" && (
            <div className="space-y-6 animate-in fade-in-50 duration-200">
              {/* Metric Row */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="rounded-xl border border-[#E7ECE9] bg-white p-4 shadow-xs">
                  <div className="text-[11px] font-bold text-[#69736E] uppercase tracking-wider">
                    Monthly Revenue Collection
                  </div>
                  <div className="mt-1 flex items-baseline justify-between">
                    <span className="font-display text-2xl font-extrabold text-[#171C19]">
                      ₹4,82,500
                    </span>
                    <span className="text-[11px] font-bold text-[#16A34A] bg-[#E8F9EE] px-1.5 py-0.5 rounded">
                      +18.4%
                    </span>
                  </div>
                  <p className="mt-1 text-[11px] text-[#69736E]">98.2% on-time collection</p>
                </div>

                <div className="rounded-xl border border-[#E7ECE9] bg-white p-4 shadow-xs">
                  <div className="text-[11px] font-bold text-[#69736E] uppercase tracking-wider">
                    Active Gym Members
                  </div>
                  <div className="mt-1 flex items-baseline justify-between">
                    <span className="font-display text-2xl font-extrabold text-[#171C19]">
                      642 / 750
                    </span>
                    <span className="text-[11px] font-bold text-[#16A34A] bg-[#E8F9EE] px-1.5 py-0.5 rounded">
                      85.6% Cap
                    </span>
                  </div>
                  <p className="mt-1 text-[11px] text-[#69736E]">28 new signups this month</p>
                </div>

                <div className="rounded-xl border border-[#E7ECE9] bg-white p-4 shadow-xs">
                  <div className="text-[11px] font-bold text-[#69736E] uppercase tracking-wider">
                    WhatsApp Dues Recovery
                  </div>
                  <div className="mt-1 flex items-baseline justify-between">
                    <span className="font-display text-2xl font-extrabold text-[#16A34A]">
                      94.2%
                    </span>
                    <span className="text-[11px] font-bold text-[#16A34A] bg-[#E8F9EE] px-1.5 py-0.5 rounded">
                      Auto-Reminded
                    </span>
                  </div>
                  <p className="mt-1 text-[11px] text-[#69736E]">₹54,200 recovered at T-3</p>
                </div>
              </div>

              {/* Table Preview */}
              <div className="rounded-xl border border-[#E7ECE9] bg-white overflow-hidden shadow-xs">
                <div className="px-4 py-3 border-b border-[#E7ECE9] bg-[#F7FAF8] flex items-center justify-between">
                  <span className="text-xs font-bold text-[#171C19]">
                    Memberships Expiring in Next 3 Days (Auto-Notified via WhatsApp)
                  </span>
                  <span className="text-[10px] font-semibold text-[#16A34A] bg-[#E8F9EE] px-2 py-0.5 rounded">
                    4 Queued
                  </span>
                </div>
                <div className="divide-y divide-[#E7ECE9] text-xs">
                  {[
                    { name: "Arjun Verma", code: "MEM-1042", plan: "Spartan Annual", expiry: "Tomorrow", dues: "₹18,000", status: "Delivered T-3" },
                    { name: "Priya Sharma", code: "MEM-1088", plan: "Quarterly Strength", expiry: "2 Days", dues: "₹5,400", status: "Delivered T-3" },
                    { name: "Rahul Deshmukh", code: "MEM-1094", plan: "Monthly Basic", expiry: "3 Days", dues: "₹2,000", status: "Queued" },
                  ].map((row, idx) => (
                    <div key={idx} className="p-3 sm:px-4 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="h-7 w-7 rounded-full bg-[#E8F9EE] text-[#16A34A] font-bold flex items-center justify-center text-xs">
                          {row.name.charAt(0)}
                        </div>
                        <div>
                          <div className="font-bold text-[#171C19]">{row.name}</div>
                          <div className="text-[10px] text-[#69736E] font-mono">{row.code} &bull; {row.plan}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-[#171C19]">{row.dues}</div>
                        <div className="text-[10px] text-[#16A34A] font-medium">{row.status}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* 2. Anti-Passback Kiosk */}
          {activeTab === "kiosk" && (
            <div className="max-w-xl mx-auto space-y-4 animate-in fade-in-50 duration-200">
              <div className="rounded-2xl border-2 border-[#1BC95A] bg-white p-6 shadow-md text-center space-y-4">
                <div className="h-14 w-14 rounded-2xl bg-[#E8F9EE] text-[#16A34A] flex items-center justify-center mx-auto">
                  <CheckCircle2 className="h-8 w-8 text-[#1BC95A]" />
                </div>

                <div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E8F9EE] text-[11px] font-bold text-[#16A34A] mb-2">
                    <ShieldCheck className="h-3.5 w-3.5" />
                    <span>ACCESS GRANTED &bull; SUB-SECOND 140MS</span>
                  </div>
                  <h4 className="font-display text-2xl font-extrabold text-[#171C19]">
                    Karan Johar
                  </h4>
                  <p className="text-xs text-[#69736E] font-mono mt-0.5">
                    Member Code: IF-1049 &bull; Plan: Annual Unlimited Pro
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-3 border-t border-[#E7ECE9] text-left text-xs">
                  <div className="bg-[#F7FAF8] p-3 rounded-xl border border-[#E7ECE9]">
                    <span className="text-[10px] text-[#69736E] font-bold uppercase">Membership Status</span>
                    <p className="text-xs font-bold text-[#16A34A] mt-0.5">ACTIVE (Valid till Dec 2026)</p>
                  </div>
                  <div className="bg-[#F7FAF8] p-3 rounded-xl border border-[#E7ECE9]">
                    <span className="text-[10px] text-[#69736E] font-bold uppercase">Anti-Passback Guard</span>
                    <p className="text-xs font-bold text-[#171C19] mt-0.5">15-min cooldown locked</p>
                  </div>
                </div>

                <p className="text-[11px] text-[#69736E]">
                  Gate open &bull; Turnstile pulse triggered &bull; Attendance recorded to PostgreSQL
                </p>
              </div>
            </div>
          )}

          {/* 3. Member PWA */}
          {activeTab === "member" && (
            <div className="max-w-md mx-auto space-y-4 animate-in fade-in-50 duration-200">
              <div className="rounded-2xl border border-[#E7ECE9] bg-white p-5 shadow-sm space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-[#E7ECE9]">
                  <div className="flex items-center gap-2">
                    <div className="h-7 w-7 rounded-lg bg-[#1BC95A] text-white flex items-center justify-center font-bold text-xs">
                      G
                    </div>
                    <div>
                      <div className="text-xs font-bold text-[#171C19]">Spartan Athletic Club</div>
                      <div className="text-[10px] text-[#69736E]">Digital Member Pass</div>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-[#16A34A] bg-[#E8F9EE] px-2 py-0.5 rounded-full">
                    PWA Installed
                  </span>
                </div>

                {/* Rotating QR Box */}
                <div className="rounded-xl bg-[#F7FAF8] p-5 border border-[#E7ECE9] text-center space-y-2">
                  <div className="h-32 w-32 bg-white p-2 rounded-xl border border-[#E7ECE9] mx-auto flex items-center justify-center shadow-xs">
                    <QrCode className="h-28 w-28 text-[#171C19]" />
                  </div>
                  <div className="text-[11px] font-bold text-[#171C19] flex items-center justify-center gap-1.5">
                    <Clock className="h-3.5 w-3.5 text-[#1BC95A]" />
                    <span>Dynamic pass rotates in 38s (Anti-Screenshot)</span>
                  </div>
                </div>

                {/* Attendance Streak */}
                <div className="flex items-center justify-between p-3 rounded-xl bg-[#E8F9EE] text-[#16A34A] text-xs font-semibold">
                  <div className="flex items-center gap-2">
                    <Flame className="h-4 w-4 fill-[#1BC95A] text-[#1BC95A]" />
                    <span>14-Day Consistency Streak!</span>
                  </div>
                  <span className="text-[11px] font-bold">Top 5% in Gym</span>
                </div>
              </div>
            </div>
          )}

          {/* 4. WhatsApp Automation */}
          {activeTab === "whatsapp" && (
            <div className="max-w-md mx-auto space-y-3 animate-in fade-in-50 duration-200">
              <div className="rounded-2xl border border-[#E7ECE9] bg-[#ECE5DD] p-4 shadow-sm space-y-3 font-sans">
                {/* Meta Verified Business Tag */}
                <div className="text-center">
                  <span className="text-[10px] bg-white/80 px-2 py-0.5 rounded text-[#69736E] font-medium shadow-xs">
                    Official Meta WhatsApp Cloud API &bull; 100% Opt-In Verified
                  </span>
                </div>

                {/* Automated Message Bubble */}
                <div className="bg-white p-3.5 rounded-xl rounded-tl-none shadow-xs text-xs space-y-2 max-w-sm">
                  <div className="flex items-center justify-between border-b border-[#F7FAF8] pb-1.5">
                    <span className="font-bold text-[#171C19]">Spartan Athletics</span>
                    <span className="text-[10px] text-[#69736E]">10:32 AM</span>
                  </div>

                  <p className="text-[#171C19] leading-relaxed text-xs">
                    Hi <strong>Sarah</strong>, your Spartan Annual Membership expires in <strong>3 days</strong> (Nov 14).
                  </p>

                  <div className="bg-[#F7FAF8] p-2.5 rounded-lg border border-[#E7ECE9] text-[11px] space-y-1">
                    <div className="flex justify-between text-[#69736E]">
                      <span>Renewal Amount:</span>
                      <strong className="text-[#171C19]">₹14,999</strong>
                    </div>
                    <div className="flex justify-between text-[#69736E]">
                      <span>Early Renewal Bonus:</span>
                      <strong className="text-[#16A34A]">+30 Days Free Added</strong>
                    </div>
                  </div>

                  <div className="pt-1">
                    <button
                      type="button"
                      className="w-full py-2 bg-[#1BC95A] text-white rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs"
                    >
                      <CreditCard className="h-3.5 w-3.5" />
                      <span>Tap to Pay via UPI / Card</span>
                    </button>
                  </div>

                  <p className="text-[9px] text-[#69736E] text-center pt-1">
                    Reply STOP to opt out anytime.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

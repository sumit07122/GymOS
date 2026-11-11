"use client";

import * as React from "react";
import Link from "next/link";
import {
  Mail,
  Phone,
  MessageSquare,
  Building2,
  Clock,
  Send,
  CheckCircle2,
  Sparkles,
  ShieldCheck,
  ArrowRight,
} from "lucide-react";
import { MarketingNav } from "@/components/marketing/navbar";
import { MarketingFooter } from "@/components/marketing/footer";

export default function ContactPage() {
  const [submitted, setSubmitted] = React.useState(false);
  const [formData, setFormData] = React.useState({
    fullName: "",
    gymName: "",
    email: "",
    phone: "",
    memberSize: "100-300",
    inquiryType: "Book a 15-Minute Live Demo",
    message: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-[#F7FAF8] text-[#171C19] flex flex-col font-sans selection:bg-[#E8F9EE] selection:text-[#16A34A]">
      <MarketingNav />

      {/* Header */}
      <section className="pt-16 sm:pt-24 pb-12 bg-white border-b border-[#E7ECE9] relative overflow-hidden">
        <div className="absolute inset-0 gymos-grid-subtle opacity-70 pointer-events-none" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center space-y-4">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-[#E8F9EE] px-3.5 py-1 text-xs font-bold text-[#16A34A] border border-[#1BC95A]/30">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Sales, Demos & Support</span>
          </div>

          <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-[#171C19] max-w-3xl mx-auto">
            Get in touch with the <br />
            <span className="text-[#1BC95A]">GymOS engineering team</span>
          </h1>

          <p className="text-sm sm:text-base text-[#69736E] max-w-2xl mx-auto leading-relaxed">
            Have questions about custom hardware turnstiles, multi-branch setups, or want a personalized 1-on-1 walkthrough? We&apos;re here to help.
          </p>
        </div>
      </section>

      {/* Contact Content Grid */}
      <section className="py-16 sm:py-24 bg-[#F7FAF8]">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            {/* Left Info Column */}
            <div className="lg:col-span-5 space-y-8">
              <div className="space-y-3">
                <h3 className="font-display text-2xl font-bold text-[#171C19]">
                  Let&apos;s talk about your gym
                </h3>
                <p className="text-xs sm:text-sm text-[#69736E] leading-relaxed">
                  Whether you run a 50-member functional fitness studio or a multi-location commercial chain, our engineers can tailor the onboarding to your current setup.
                </p>
              </div>

              {/* Direct Channels */}
              <div className="space-y-4">
                <a
                  href="https://wa.me/917017936338?text=Hi%20GymOS%20team,%20I%20would%20like%20to%20learn%20more."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-start gap-4 p-4 rounded-2xl bg-white border border-[#E7ECE9] shadow-xs hover:border-[#1BC95A]/50 transition group"
                >
                  <div className="h-10 w-10 rounded-xl bg-[#E8F9EE] text-[#16A34A] flex items-center justify-center shrink-0 group-hover:bg-[#1BC95A] group-hover:text-white transition">
                    <MessageSquare className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-[#171C19]">WhatsApp Fast Response</div>
                    <div className="text-xs text-[#16A34A] font-semibold mt-0.5">+91 70179 36338</div>
                    <p className="text-[11px] text-[#69736E] mt-1">Average response &lt; 15 mins (Mon - Sat)</p>
                  </div>
                </a>

                <div className="flex items-start gap-4 p-4 rounded-2xl bg-white border border-[#E7ECE9] shadow-xs">
                  <div className="h-10 w-10 rounded-xl bg-[#E8F9EE] text-[#16A34A] flex items-center justify-center shrink-0">
                    <Mail className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-[#171C19]">Direct Sales & Partnerships</div>
                    <div className="text-xs font-mono text-[#171C19] mt-0.5">sales@gymos.app</div>
                    <p className="text-[11px] text-[#69736E] mt-1">For custom enterprise SLAs and franchises</p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 rounded-2xl bg-white border border-[#E7ECE9] shadow-xs">
                  <div className="h-10 w-10 rounded-xl bg-[#E8F9EE] text-[#16A34A] flex items-center justify-center shrink-0">
                    <Clock className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-[#171C19]">Operating Hours</div>
                    <p className="text-xs text-[#171C19] mt-0.5 font-medium">Monday to Saturday: 8:00 AM – 9:00 PM IST</p>
                    <p className="text-[11px] text-[#69736E] mt-1">Emergency 24/7 gate support for active subscribers</p>
                  </div>
                </div>
              </div>

              {/* Security Callout */}
              <div className="p-4 rounded-2xl bg-[#E8F9EE]/50 border border-[#1BC95A]/20 flex items-center gap-3">
                <ShieldCheck className="h-5 w-5 text-[#16A34A] shrink-0" />
                <p className="text-xs text-[#16A34A] font-medium leading-relaxed">
                  Your business data and member information are protected under strict multi-tenant isolation. We never sell or share gym records.
                </p>
              </div>
            </div>

            {/* Right Form Column */}
            <div className="lg:col-span-7">
              <div className="rounded-3xl border border-[#E7ECE9] bg-white p-7 sm:p-10 shadow-lg">
                {submitted ? (
                  <div className="text-center py-12 space-y-4 animate-in zoom-in-95 duration-200">
                    <div className="h-14 w-14 rounded-2xl bg-[#E8F9EE] text-[#16A34A] flex items-center justify-center mx-auto">
                      <CheckCircle2 className="h-8 w-8 text-[#1BC95A]" />
                    </div>
                    <h3 className="font-display text-2xl font-bold text-[#171C19]">
                      Message Received!
                    </h3>
                    <p className="text-xs sm:text-sm text-[#69736E] max-w-md mx-auto leading-relaxed">
                      Thank you for reaching out, <strong>{formData.fullName}</strong>. One of our solution engineers will contact you via WhatsApp and email within 2 hours.
                    </p>
                    <div className="pt-4">
                      <button
                        type="button"
                        onClick={() => setSubmitted(false)}
                        className="text-xs font-bold text-[#16A34A] hover:underline"
                      >
                        Send another message
                      </button>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                      <h3 className="font-display text-xl font-bold text-[#171C19]">
                        Send an Enquiry or Book a Demo
                      </h3>
                      <p className="text-xs text-[#69736E] mt-1">
                        Fill in your details below and we&apos;ll set up a live screen-share walkthrough.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-[#171C19]">Your Full Name *</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Rahul Sharma"
                          value={formData.fullName}
                          onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-[#E7ECE9] bg-[#F7FAF8] text-xs text-[#171C19] focus:outline-hidden focus:ring-2 focus:ring-[#1BC95A]/30 focus:border-[#1BC95A]"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-[#171C19]">Gym / Studio Name *</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. IronForge Athletics"
                          value={formData.gymName}
                          onChange={(e) => setFormData({ ...formData, gymName: e.target.value })}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-[#E7ECE9] bg-[#F7FAF8] text-xs text-[#171C19] focus:outline-hidden focus:ring-2 focus:ring-[#1BC95A]/30 focus:border-[#1BC95A]"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-[#171C19]">Business Email *</label>
                        <input
                          type="email"
                          required
                          placeholder="owner@yourgym.com"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-[#E7ECE9] bg-[#F7FAF8] text-xs text-[#171C19] focus:outline-hidden focus:ring-2 focus:ring-[#1BC95A]/30 focus:border-[#1BC95A]"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-[#171C19]">WhatsApp Number *</label>
                        <input
                          type="tel"
                          required
                          placeholder="+91 98765 43210"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-[#E7ECE9] bg-[#F7FAF8] text-xs text-[#171C19] focus:outline-hidden focus:ring-2 focus:ring-[#1BC95A]/30 focus:border-[#1BC95A]"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-[#171C19]">Current Active Members</label>
                        <select
                          value={formData.memberSize}
                          onChange={(e) => setFormData({ ...formData, memberSize: e.target.value })}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-[#E7ECE9] bg-[#F7FAF8] text-xs text-[#171C19] focus:outline-hidden focus:ring-2 focus:ring-[#1BC95A]/30 focus:border-[#1BC95A]"
                        >
                          <option value="under-100">Under 100 members</option>
                          <option value="100-300">100 - 300 members</option>
                          <option value="300-800">300 - 800 members</option>
                          <option value="800+">800+ members (Multi-chain)</option>
                        </select>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-[#171C19]">Primary Interest</label>
                        <select
                          value={formData.inquiryType}
                          onChange={(e) => setFormData({ ...formData, inquiryType: e.target.value })}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-[#E7ECE9] bg-[#F7FAF8] text-xs text-[#171C19] focus:outline-hidden focus:ring-2 focus:ring-[#1BC95A]/30 focus:border-[#1BC95A]"
                        >
                          <option value="Book a 15-Minute Live Demo">Book a 15-Minute Live Demo</option>
                          <option value="Pricing & Custom Plan Consultation">Pricing & Custom Plan Consultation</option>
                          <option value="Turnstile & Hardware Integration">Turnstile & Hardware Integration</option>
                          <option value="Data Migration from Excel">Data Migration from Excel</option>
                        </select>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-[#171C19]">Tell us about your setup (Optional)</label>
                      <textarea
                        rows={3}
                        placeholder="Tell us about your gym location, current software challenges, or any specific requirements..."
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-[#E7ECE9] bg-[#F7FAF8] text-xs text-[#171C19] focus:outline-hidden focus:ring-2 focus:ring-[#1BC95A]/30 focus:border-[#1BC95A]"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-[#1BC95A] hover:bg-[#16A34A] text-white font-bold text-xs shadow-xs transition active:scale-[0.98]"
                    >
                      <Send className="h-3.5 w-3.5" />
                      <span>Submit Request & Schedule Demo</span>
                    </button>

                    <p className="text-[11px] text-[#69736E] text-center">
                      We respond in &lt; 2 hours during business hours &bull; No spam guaranteed
                    </p>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      <MarketingFooter />
    </div>
  );
}

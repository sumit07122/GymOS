"use client";

import * as React from "react";
import Link from "next/link";
import {
  Building2,
  Phone,
  MessageCircle,
  MapPin,
  Clock,
  ExternalLink,
  Menu,
  X,
} from "lucide-react";

export interface PublicWebsiteLayoutProps {
  gym: {
    name: string;
    slug: string;
    phone?: string | null;
    whatsapp?: string | null;
    email?: string | null;
    address?: string | null;
    city?: string | null;
    hours?: string | null;
    primaryColor?: string;
  };
  children: React.ReactNode;
}

export function PublicWebsiteLayout({ gym, children }: PublicWebsiteLayoutProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const brandColor = gym.primaryColor || "#0B6B4F";

  const navLinks = [
    { href: `#facilities`, label: "Facilities" },
    { href: `#plans`, label: "Plans & Pricing" },
    { href: `#classes`, label: "Classes" },
    { href: `#trainers`, label: "Trainers" },
    { href: `#contact`, label: "Contact" },
  ];

  return (
    <div className="min-h-screen bg-[#F5F6F4] font-sans text-[#0F172A] antialiased flex flex-col">
      {/* Sticky Header */}
      <header className="sticky top-0 z-40 border-b border-[#E3E7E4] bg-white/95 px-4 sm:px-8 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between">
          {/* Gym Brand */}
          <Link
            href={`/g/${gym.slug}`}
            className="flex items-center gap-2.5 font-heading text-lg font-bold text-[#0F172A]"
          >
            <div
              className="flex h-9 w-9 items-center justify-center rounded-xl text-white font-bold"
              style={{ backgroundColor: brandColor }}
            >
              <Building2 className="h-5 w-5" />
            </div>
            <span>{gym.name}</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6 text-xs font-medium text-[#5F6B65]">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="hover:text-[#0F172A] transition-colors"
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* Actions */}
          <div className="hidden sm:flex items-center gap-3">
            {gym.whatsapp && (
              <a
                href={`https://wa.me/${gym.whatsapp.replace(/\D/g, "")}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 rounded-lg border border-[#E3E7E4] bg-white px-3 py-1.5 text-xs font-semibold text-[#0B6B4F] hover:bg-[#F8FAFC] transition-colors"
              >
                <MessageCircle className="h-3.5 w-3.5" />
                <span>WhatsApp</span>
              </a>
            )}

            <Link
              href={`/g/${gym.slug}/login`}
              className="inline-flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs transition-opacity hover:opacity-90"
              style={{ backgroundColor: brandColor }}
            >
              <span>Member Portal</span>
              <ExternalLink className="h-3 w-3" />
            </Link>
          </div>

          {/* Mobile Menu Trigger */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="rounded-lg p-1.5 text-[#64748B] hover:text-[#0F172A] md:hidden"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Dropdown */}
        {mobileMenuOpen && (
          <div className="border-t border-[#E3E7E4] py-4 md:hidden animate-in slide-in-from-top-2 duration-150">
            <nav className="flex flex-col gap-2">
              {navLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="rounded-lg px-3 py-2 text-xs font-medium text-[#5F6B65] hover:bg-[#F8FAFC] hover:text-[#0F172A]"
                >
                  {link.label}
                </a>
              ))}
              <div className="mt-2 pt-2 border-t border-[#E3E7E4] flex flex-col gap-2">
                <Link
                  href={`/g/${gym.slug}/login`}
                  className="w-full text-center rounded-lg py-2 text-xs font-semibold text-white"
                  style={{ backgroundColor: brandColor }}
                >
                  Member Portal Login
                </Link>
              </div>
            </nav>
          </div>
        )}
      </header>

      {/* Main Public Website Content */}
      <main className="flex-1">{children}</main>

      {/* Public Footer */}
      <footer className="border-t border-[#E3E7E4] bg-white px-4 sm:px-8 py-12 text-xs text-[#5F6B65]">
        <div className="mx-auto max-w-7xl grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 font-heading text-base font-bold text-[#0F172A]">
              <div
                className="flex h-7 w-7 items-center justify-center rounded-lg text-white font-bold"
                style={{ backgroundColor: brandColor }}
              >
                <Building2 className="h-4 w-4" />
              </div>
              <span>{gym.name}</span>
            </div>
            <p className="mt-2 text-xs text-[#5F6B65]">
              Empowering members with world-class fitness equipment, expert training, and an active community.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-[#0F172A] uppercase tracking-wider text-[11px] mb-3">
              Location & Hours
            </h4>
            {gym.address && (
              <p className="flex items-start gap-2 mb-2">
                <MapPin className="h-4 w-4 shrink-0 text-[#0B6B4F] mt-0.5" />
                <span>
                  {gym.address}
                  {gym.city ? `, ${gym.city}` : ""}
                </span>
              </p>
            )}
            {gym.hours && (
              <p className="flex items-start gap-2">
                <Clock className="h-4 w-4 shrink-0 text-[#0B6B4F] mt-0.5" />
                <span>{gym.hours}</span>
              </p>
            )}
          </div>

          <div>
            <h4 className="font-semibold text-[#0F172A] uppercase tracking-wider text-[11px] mb-3">
              Contact Us
            </h4>
            {gym.phone && (
              <p className="flex items-center gap-2 mb-2">
                <Phone className="h-4 w-4 text-[#0B6B4F]" />
                <a href={`tel:${gym.phone}`} className="hover:text-[#0F172A]">
                  {gym.phone}
                </a>
              </p>
            )}
            {gym.whatsapp && (
              <p className="flex items-center gap-2">
                <MessageCircle className="h-4 w-4 text-[#0B6B4F]" />
                <a
                  href={`https://wa.me/${gym.whatsapp.replace(/\D/g, "")}`}
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-[#0F172A]"
                >
                  WhatsApp Support
                </a>
              </p>
            )}
          </div>

          <div>
            <h4 className="font-semibold text-[#0F172A] uppercase tracking-wider text-[11px] mb-3">
              Powered by
            </h4>
            <div className="flex items-center gap-2 font-heading font-semibold text-[#0F172A]">
              <div className="flex h-5 w-5 items-center justify-center rounded bg-[#0B6B4F] text-white text-[10px] font-black">
                F
              </div>
              <span>FIXIA GymOS</span>
            </div>
            <p className="mt-1 text-[11px] text-[#94A3B8]">
              The commercial operating system for fitness clubs & gyms.
            </p>
          </div>
        </div>

        <div className="mx-auto max-w-7xl mt-8 pt-6 border-t border-[#E3E7E4] flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-[#94A3B8]">
          <p>© {new Date().getFullYear()} {gym.name}. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <Link href={`/g/${gym.slug}/login`} className="hover:text-[#0F172A]">
              Member Portal
            </Link>
            <span>•</span>
            <Link href="/" className="hover:text-[#0F172A]">
              FIXIA GymOS Platform
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

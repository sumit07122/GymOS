/* eslint-disable @next/next/no-img-element */
"use client";

import * as React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Dumbbell, Menu, X, MessageCircle } from "lucide-react";

interface WebsiteNavbarProps {
  gym: {
    name: string;
    slug: string;
    logoUrl?: string | null;
  };
  primaryColor: string;
  whatsAppNumber?: string | null;
}

export function WebsiteNavbar({
  gym,
  primaryColor,
  whatsAppNumber,
}: WebsiteNavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const cleanWaNumber = whatsAppNumber?.replace(/[^0-9]/g, "") || "";
  const waUrl = cleanWaNumber
    ? `https://wa.me/${cleanWaNumber}?text=${encodeURIComponent(
        `Hi ${gym.name}, I'm interested in joining the gym!`
      )}`
    : null;

  const navLinks = [
    { label: "About", href: "#about" },
    { label: "Facilities", href: "#facilities" },
    { label: "Plans & Pricing", href: "#plans" },
    { label: "Trainers", href: "#trainers" },
    { label: "Gallery", href: "#gallery" },
    { label: "Location", href: "#location" },
    { label: "Contact", href: "#enquire" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-800 bg-slate-950/90 backdrop-blur-md text-white">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand / Logo */}
        <Link href={`/gym/${gym.slug}`} className="flex items-center gap-3 group">
          <div
            className="flex h-11 w-11 items-center justify-center rounded-xl text-white shadow-md transition-transform group-hover:scale-105"
            style={{ backgroundColor: primaryColor }}
          >
            {gym.logoUrl ? (
              <img
                src={gym.logoUrl}
                alt={gym.name}
                className="h-8 w-8 object-contain rounded"
              />
            ) : (
              <Dumbbell className="h-6 w-6" />
            )}
          </div>
          <div>
            <span className="font-extrabold text-lg sm:text-xl tracking-tight text-white block uppercase">
              {gym.name}
            </span>
            <span className="text-[10px] uppercase tracking-widest text-slate-400 font-semibold block">
              Performance Fitness
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-300">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="hover:text-white transition-colors"
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* Action Buttons */}
        <div className="hidden md:flex items-center gap-3">
          {waUrl && (
            <a
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 transition-all"
            >
              <MessageCircle className="h-4 w-4" />
              <span>WhatsApp</span>
            </a>
          )}

          <a href="#enquire">
            <Button
              className="text-xs font-bold px-4 py-2 rounded-xl text-white shadow-lg transition-transform hover:scale-105"
              style={{ backgroundColor: primaryColor }}
            >
              Claim Free Pass
            </Button>
          </a>
        </div>

        {/* Mobile Hamburger Toggle */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden text-slate-300 hover:text-white p-2 rounded-lg"
          aria-label="Toggle navigation menu"
        >
          {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-800 bg-slate-950 px-4 pt-2 pb-6 space-y-3">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-sm font-medium text-slate-300 hover:text-white border-b border-slate-900"
            >
              {link.label}
            </a>
          ))}

          <div className="pt-2 flex flex-col gap-2">
            {waUrl && (
              <a
                href={waUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-semibold"
              >
                <MessageCircle className="h-4 w-4" />
                <span>Chat on WhatsApp</span>
              </a>
            )}

            <a
              href="#enquire"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-center py-2.5 rounded-xl text-xs font-bold text-white shadow-md"
              style={{ backgroundColor: primaryColor }}
            >
              Claim Free Pass
            </a>
          </div>
        </div>
      )}
    </header>
  );
}

"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Menu,
  X,
  ArrowRight,
  ShieldCheck,
  Building2,
  ExternalLink,
  ChevronRight,
  Sparkles,
} from "lucide-react";

export function MarketingNav() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const navLinks = [
    { label: "Features", href: "/features" },
    { label: "Pricing", href: "/pricing" },
    { label: "About", href: "/about" },
    { label: "FAQ", href: "/faq" },
    { label: "Contact", href: "/contact" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[#E7ECE9] bg-white/95 backdrop-blur-md transition-all">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#1BC95A] text-white shadow-xs group-hover:bg-[#16A34A] transition-colors">
            <span className="font-display text-base font-extrabold tracking-tight">G</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="font-display text-xl font-extrabold tracking-tight text-[#171C19]">
              Gym<span className="text-[#1BC95A]">OS</span>
            </span>
            <span className="hidden sm:inline-flex rounded-full bg-[#E8F9EE] px-2 py-0.5 text-[10px] font-semibold text-[#16A34A] border border-[#1BC95A]/20">
              v2.4
            </span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                  isActive
                    ? "bg-[#E8F9EE] text-[#16A34A]"
                    : "text-[#69736E] hover:text-[#171C19] hover:bg-[#F7FAF8]"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
          <Link
            href="/g/ironforge-fitness"
            className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-[#16A34A] hover:bg-[#E8F9EE] rounded-lg transition-colors ml-1"
          >
            <span>Live Demo</span>
            <ExternalLink className="h-3 w-3" />
          </Link>
        </nav>

        {/* Desktop Action CTAs */}
        <div className="hidden sm:flex items-center gap-3">
          <Link
            href="/platform-admin/login"
            className="hidden lg:flex items-center gap-1.5 text-xs font-medium text-[#69736E] hover:text-[#171C19] px-2.5 py-1.5 transition"
          >
            <ShieldCheck className="h-3.5 w-3.5 text-[#1BC95A]" />
            <span>Platform Admin</span>
          </Link>

          <Link
            href="/login"
            className="text-xs font-semibold text-[#171C19] hover:text-[#16A34A] px-3 py-2 transition"
          >
            Sign In
          </Link>

          <Link
            href="/register"
            className="inline-flex items-center gap-1.5 rounded-xl bg-[#1BC95A] hover:bg-[#16A34A] px-4 py-2 text-xs font-bold text-white shadow-xs transition active:scale-[0.98]"
          >
            <span>Get Started</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {/* Mobile menu trigger */}
        <div className="flex items-center gap-2 sm:hidden">
          <Link
            href="/register"
            className="rounded-lg bg-[#1BC95A] px-3 py-1.5 text-xs font-bold text-white shadow-xs"
          >
            Start Free
          </Link>
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-[#171C19] hover:bg-[#F7FAF8] rounded-lg border border-[#E7ECE9]"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-[#E7ECE9] bg-white px-4 py-4 space-y-3 shadow-lg animate-in slide-in-from-top-2 duration-150">
          <div className="space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between px-3 py-2.5 text-xs font-semibold text-[#171C19] hover:bg-[#F7FAF8] rounded-lg"
              >
                <span>{link.label}</span>
                <ChevronRight className="h-4 w-4 text-[#69736E]" />
              </Link>
            ))}
            <Link
              href="/g/ironforge-fitness"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-between px-3 py-2.5 text-xs font-bold text-[#16A34A] bg-[#E8F9EE] rounded-lg"
            >
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4 text-[#16A34A]" />
                <span>Explore Live Gym Demo</span>
              </div>
              <ExternalLink className="h-4 w-4" />
            </Link>
          </div>

          <div className="pt-3 border-t border-[#E7ECE9] space-y-2">
            <Link
              href="/register"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#1BC95A] text-white font-bold text-xs shadow-xs"
            >
              <span>Start 14-Day Free Trial</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
            <div className="grid grid-cols-2 gap-2">
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-center py-2 rounded-xl border border-[#E7ECE9] bg-[#F7FAF8] text-xs font-semibold text-[#171C19]"
              >
                Sign In
              </Link>
              <Link
                href="/platform-admin/login"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-center gap-1.5 py-2 rounded-xl border border-[#E7ECE9] bg-white text-xs font-semibold text-[#69736E]"
              >
                <ShieldCheck className="h-3.5 w-3.5 text-[#1BC95A]" />
                <span>Super Admin</span>
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

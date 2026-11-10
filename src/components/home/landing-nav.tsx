"use client";

import * as React from "react";
import Link from "next/link";
import {
  ShieldCheck,
  Lock,
  Menu,
  X,
  ExternalLink,
  Building2,
  Smartphone,
  ChevronRight,
} from "lucide-react";

export function LandingNav() {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-white/95 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-2">
          <div className="flex items-center gap-1.5">
            <span className="font-display text-xl font-bold tracking-tight text-ink">FIXIA</span>
            <span className="font-display text-xl font-semibold text-pine">GymOS</span>
          </div>
        </Link>

        {/* Desktop Nav links with readable contrast (WCAG AA >= 4.5:1) */}
        <nav className="hidden md:flex gap-1 text-xs lg:text-sm text-[#475569] font-medium items-center">
          <a
            href="#features"
            className="px-3 py-1.5 rounded-[10px] hover:text-ink hover:bg-black/[0.04] transition-colors"
          >
            Features
          </a>
          <a
            href="#portals"
            className="px-3 py-1.5 rounded-[10px] hover:text-ink hover:bg-black/[0.04] transition-colors"
          >
            Portals
          </a>
          <a
            href="#members"
            className="px-3 py-1.5 rounded-[10px] hover:text-ink hover:bg-black/[0.04] transition-colors"
          >
            Member App
          </a>
          <a
            href="#security"
            className="px-3 py-1.5 rounded-[10px] hover:text-ink hover:bg-black/[0.04] transition-colors"
          >
            Zero-Trust
          </a>
          <Link
            href="/g/spartan-athletics"
            className="px-3 py-1.5 rounded-[10px] text-pine hover:bg-pine-soft transition-colors font-semibold flex items-center gap-1"
          >
            <span>Live Demo</span>
            <ExternalLink className="size-3" />
          </Link>
        </nav>

        {/* Right CTAs */}
        <div className="flex items-center gap-2">
          <Link
            href="/platform-admin/login"
            className="hidden lg:flex items-center gap-1.5 text-xs text-[#334155] hover:text-ink hover:bg-black/[0.04] font-medium px-3 py-1.5 rounded-[10px] border border-line transition-colors"
          >
            <ShieldCheck className="size-3.5 text-pine" />
            <span>Platform Admin</span>
          </Link>

          <Link
            href="/register"
            className="hidden sm:inline-flex text-xs text-ink hover:bg-black/[0.04] font-semibold px-3.5 py-1.5 rounded-[10px] border border-line bg-white transition-colors"
          >
            <span>Register Gym</span>
          </Link>

          <Link
            href="/login"
            className="rounded-[10px] bg-pine hover:bg-pine-deep text-white px-3.5 py-1.5 text-xs font-semibold shadow-xs transition-colors flex items-center gap-1.5 active:scale-[0.99]"
          >
            <Lock className="size-3.5" />
            <span>Sign In</span>
          </Link>

          {/* Mobile Menu Toggle Button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg text-muted hover:text-ink border border-line bg-canvas/60 ml-1"
            aria-label="Toggle navigation menu"
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X className="size-5 text-ink" /> : <Menu className="size-5 text-ink" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-line bg-white px-4 py-4 space-y-3 animate-in slide-in-from-top-2 duration-150 shadow-xl">
          <div className="space-y-1">
            <a
              href="#features"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium text-ink hover:bg-black/[0.04]"
            >
              <span>Features & Modules</span>
              <ChevronRight className="size-3.5 text-muted" />
            </a>
            <a
              href="#portals"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium text-ink hover:bg-black/[0.04]"
            >
              <span>Workspace Portals</span>
              <ChevronRight className="size-3.5 text-muted" />
            </a>
            <a
              href="#members"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium text-ink hover:bg-black/[0.04]"
            >
              <span>Digital Member App</span>
              <ChevronRight className="size-3.5 text-muted" />
            </a>
            <a
              href="#security"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium text-ink hover:bg-black/[0.04]"
            >
              <span>Security & Zero-Trust</span>
              <ChevronRight className="size-3.5 text-muted" />
            </a>
            <Link
              href="/g/spartan-athletics"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold text-pine bg-pine-soft"
            >
              <div className="flex items-center gap-2">
                <Building2 className="size-3.5 text-pine" />
                <span>Live Demo: Spartan Athletics</span>
              </div>
              <ExternalLink className="size-3.5 text-pine" />
            </Link>
          </div>

          <div className="pt-2 border-t border-line space-y-2">
            <Link
              href="/register"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full flex items-center justify-center py-2.5 rounded-lg border border-line bg-canvas font-semibold text-xs text-ink hover:bg-black/[0.04]"
            >
              Register New Gym
            </Link>
            <div className="grid grid-cols-2 gap-2">
              <Link
                href="/platform-admin/login"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-center gap-1.5 py-2 rounded-lg border border-line bg-white text-xs font-medium text-muted hover:text-ink"
              >
                <ShieldCheck className="size-3.5 text-pine" />
                <span>Super Admin</span>
              </Link>
              <Link
                href="/member/home"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-center gap-1.5 py-2 rounded-lg border border-line bg-white text-xs font-medium text-muted hover:text-ink"
              >
                <Smartphone className="size-3.5 text-pine" />
                <span>Member Pass</span>
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

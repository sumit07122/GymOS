"use client";

import * as React from "react";
import { OwnerSidebar } from "./owner-sidebar";
import { Menu, X, Building2, Search, Bell } from "lucide-react";

interface OwnerShellProps {
  currentGym: {
    id: string;
    name: string;
    slug: string;
    currency: string;
    status: string;
  };
  user: {
    id: string;
    name: string | null;
    email: string | null;
  };
  children: React.ReactNode;
}

export function OwnerShell({
  currentGym,
  user,
  children,
}: OwnerShellProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  return (
    <div className="flex min-h-screen bg-canvas text-ink font-sans antialiased">
      {/* Desktop Fixed Sidebar */}
      <div className="hidden md:fixed md:inset-y-0 md:flex md:w-64 md:flex-col z-30">
        <OwnerSidebar currentGym={currentGym} user={user} />
      </div>

      {/* Mobile Slide-Over Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
          />

          <div className="fixed inset-y-0 left-0 flex w-72 max-w-full flex-col bg-white">
            <div className="absolute right-3 top-3">
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-muted hover:text-ink hover:bg-canvas"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <OwnerSidebar
              currentGym={currentGym}
              user={user}
              onItemClick={() => setMobileMenuOpen(false)}
            />
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col md:pl-64 min-w-0">
        {/* Sticky Topbar */}
        <header className="sticky top-0 z-20 flex h-16 shrink-0 items-center justify-between border-b border-line bg-white/85 px-4 sm:px-8 backdrop-blur">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-line bg-white text-muted hover:text-ink md:hidden"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-pine-soft text-pine font-bold">
                <Building2 className="h-4 w-4" />
              </div>
              <div>
                <span className="font-bold text-sm text-ink">{currentGym.name}</span>
                <span className="ml-2 font-mono text-[10px] text-muted hidden sm:inline">
                  /g/{currentGym.slug}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 rounded-[10px] border border-line bg-canvas px-3 py-1.5 text-xs text-muted w-56">
              <Search className="size-3.5" />
              <span>Search workspace...</span>
            </div>

            <button
              type="button"
              className="p-2 text-muted hover:text-ink rounded-lg hover:bg-canvas transition"
              title="Notifications"
            >
              <Bell className="size-4" />
            </button>

            <div
              className="size-8 rounded-full bg-pine text-white text-xs font-semibold flex items-center justify-center shadow-xs"
              title={user.name || user.email || "Owner"}
            >
              {(user.name || user.email || "O")[0].toUpperCase()}
            </div>
          </div>
        </header>

        {/* Content Body */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-[1400px] w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}

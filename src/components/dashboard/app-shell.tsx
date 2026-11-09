"use client";

import * as React from "react";
import { Sidebar, GymSummary } from "./sidebar";
import { TopNav } from "./top-nav";
import { X } from "lucide-react";

interface AppShellProps {
  currentGym: {
    id: string;
    name: string;
    slug: string;
    currency: string;
  };
  userGyms: GymSummary[];
  user: {
    id: string;
    name: string | null;
    email: string | null;
    role: string;
  };
  children: React.ReactNode;
}

export function AppShell({
  currentGym,
  userGyms,
  user,
  children,
}: AppShellProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900 font-sans antialiased">
      {/* Desktop Fixed Sidebar */}
      <div className="hidden md:fixed md:inset-y-0 md:flex md:w-64 md:flex-col z-30">
        <Sidebar
          currentGym={currentGym}
          userGyms={userGyms}
          userRole={user.role}
        />
      </div>

      {/* Mobile Slide-Over Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
          />

          <div className="fixed inset-y-0 left-0 flex w-72 max-w-full flex-col bg-[#0B132B]">
            <div className="absolute right-2 top-2">
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <Sidebar
              currentGym={currentGym}
              userGyms={userGyms}
              userRole={user.role}
              onItemClick={() => setMobileMenuOpen(false)}
            />
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col md:pl-64 min-w-0">
        <TopNav
          gym={currentGym}
          user={user}
          onOpenMobileMenu={() => setMobileMenuOpen(true)}
        />
        <main className="flex-1 p-4 md:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}


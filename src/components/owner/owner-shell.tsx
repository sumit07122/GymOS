"use client";

import * as React from "react";
import { OwnerSidebar } from "./owner-sidebar";
import { Menu, X, Building2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

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
    <div className="flex min-h-screen bg-slate-900 text-slate-100 font-sans antialiased">
      {/* Desktop Fixed Sidebar */}
      <div className="hidden md:fixed md:inset-y-0 md:flex md:w-64 md:flex-col z-30">
        <OwnerSidebar currentGym={currentGym} user={user} />
      </div>

      {/* Mobile Slide-Over Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
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
        {/* Mobile Header Bar */}
        <div className="sticky top-0 z-20 flex h-14 shrink-0 items-center justify-between border-b border-slate-800 bg-slate-950 px-4 md:hidden">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-800 bg-slate-900 text-slate-400 hover:text-white"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div className="flex items-center gap-1.5">
              <div className="flex h-7 w-7 items-center justify-center rounded-md bg-indigo-600 text-white">
                <Building2 className="h-4 w-4" />
              </div>
              <span className="font-extrabold text-sm text-white">{currentGym.name}</span>
            </div>
          </div>
          <Badge
            variant="outline"
            className="text-[10px] bg-indigo-950 text-indigo-300 border-indigo-800"
          >
            OWNER
          </Badge>
        </div>

        {/* Content Body */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}

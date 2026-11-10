"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { OwnerSidebar } from "./owner-sidebar";
import {
  Menu,
  X,
  Building2,
  Search,
  Bell,
  ChevronRight,
  LogOut,
  Settings,
  Globe,
  Smartphone,
  CheckCircle2,
  Clock,
  Sparkles,
  LayoutDashboard,
  Users,
  QrCode,
  Receipt,
} from "lucide-react";

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

const routeTitles: Record<string, string> = {
  "/owner/dashboard": "Dashboard",
  "/owner/members": "Members & KYC",
  "/owner/attendance": "QR Attendance",
  "/owner/memberships": "Memberships",
  "/owner/payments": "Payments & Dues",
  "/owner/expenses": "Operating Expenses",
  "/owner/leads": "Leads CRM",
  "/owner/fitness": "Workouts & Fitness",
  "/owner/motivation": "Challenges & Motivation",
  "/owner/inventory": "Retail & Inventory",
  "/owner/whatsapp": "WhatsApp Alerts",
  "/owner/reports": "Business Analytics",
  "/owner/settings": "Gym Settings",
  "/owner/subscription": "SaaS Subscription",
};

export function OwnerShell({
  currentGym,
  user,
  children,
}: OwnerShellProps) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [searchOpen, setSearchOpen] = React.useState(false);
  const [notificationsOpen, setNotificationsOpen] = React.useState(false);
  const [profileOpen, setProfileOpen] = React.useState(false);

  const notificationsRef = React.useRef<HTMLDivElement>(null);
  const profileRef = React.useRef<HTMLDivElement>(null);

  // Close menus when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        notificationsRef.current &&
        !notificationsRef.current.contains(e.target as Node)
      ) {
        setNotificationsOpen(false);
      }
      if (
        profileRef.current &&
        !profileRef.current.contains(e.target as Node)
      ) {
        setProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Keyboard shortcut Ctrl+K / Cmd+K for search
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen((prev) => !prev);
      }
      if (e.key === "Escape") {
        setSearchOpen(false);
        setNotificationsOpen(false);
        setProfileOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const currentSection = routeTitles[pathname] || "Workspace";

  return (
    <div className="flex min-h-screen bg-canvas text-ink font-sans antialiased">
      {/* Desktop Fixed Sidebar */}
      <div className="hidden md:fixed md:inset-y-0 md:flex md:w-64 md:flex-col z-30">
        <OwnerSidebar currentGym={currentGym} user={user} />
      </div>

      {/* Mobile Slide-Over Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden animate-in fade-in duration-200">
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
            aria-hidden="true"
          />

          <div className="fixed inset-y-0 left-0 flex w-72 max-w-full flex-col bg-white shadow-2xl animate-in slide-in-from-left duration-200">
            <div className="absolute right-3 top-3 z-10">
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-muted hover:text-ink hover:bg-canvas transition"
                aria-label="Close menu"
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
        <header className="sticky top-0 z-20 flex h-16 shrink-0 items-center justify-between border-b border-line bg-white/85 px-4 sm:px-8 backdrop-blur transition-all">
          {/* Left: Mobile Toggle & Breadcrumbs */}
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-line bg-white text-muted hover:text-ink md:hidden"
              aria-label="Open navigation menu"
            >
              <Menu className="h-5 w-5" />
            </button>

            {/* Breadcrumb Navigation */}
            <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs min-w-0">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-pine-soft text-pine font-bold shrink-0">
                  <Building2 className="h-3.5 w-3.5" />
                </div>
                <span className="font-semibold text-ink truncate max-w-[140px] sm:max-w-[200px]">
                  {currentGym.name}
                </span>
              </div>
              <ChevronRight className="h-3.5 w-3.5 text-muted shrink-0" />
              <span className="font-medium text-pine bg-pine-soft px-2 py-0.5 rounded-md truncate">
                {currentSection}
              </span>
            </nav>
          </div>

          {/* Right: Quick Search, Notifications, Profile Menu */}
          <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
            {/* Quick Search Trigger */}
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              className="hidden sm:flex items-center gap-2 rounded-lg border border-line bg-canvas px-3 py-1.5 text-xs text-muted hover:border-pine/40 hover:text-ink transition w-48 lg:w-60"
            >
              <Search className="size-3.5 text-muted" />
              <span className="flex-1 text-left truncate">Search workspace...</span>
              <kbd className="hidden lg:inline rounded border border-line bg-white px-1.5 py-0.5 text-[10px] font-mono text-muted">
                Ctrl K
              </kbd>
            </button>

            {/* Notifications Popover */}
            <div ref={notificationsRef} className="relative">
              <button
                type="button"
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className="relative p-2 text-muted hover:text-ink rounded-lg hover:bg-canvas transition"
                title="Notifications"
                aria-label="View notifications"
              >
                <Bell className="size-4" />
                <span className="absolute top-1.5 right-1.5 flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600" />
                </span>
              </button>

              {notificationsOpen && (
                <div className="absolute right-0 mt-2 w-80 rounded-xl border border-line bg-white p-3 shadow-xl ring-1 ring-black/5 z-50 animate-in fade-in-50 zoom-in-95 duration-150">
                  <div className="flex items-center justify-between pb-2 border-b border-line">
                    <span className="text-xs font-bold text-ink">Notifications</span>
                    <span className="text-[10px] text-pine font-semibold bg-pine-soft px-1.5 py-0.2 rounded-full">
                      3 New
                    </span>
                  </div>

                  <div className="divide-y divide-line text-xs py-1">
                    <div className="py-2.5 flex items-start gap-2.5">
                      <div className="h-6 w-6 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                      </div>
                      <div>
                        <p className="font-semibold text-ink leading-tight">Payment Received</p>
                        <p className="text-[11px] text-muted mt-0.5">Invoice #1048 settled via UPI.</p>
                        <span className="text-[10px] text-muted flex items-center gap-1 mt-1">
                          <Clock className="h-2.5 w-2.5" /> 12m ago
                        </span>
                      </div>
                    </div>

                    <div className="py-2.5 flex items-start gap-2.5">
                      <div className="h-6 w-6 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 mt-0.5">
                        <Clock className="h-3.5 w-3.5" />
                      </div>
                      <div>
                        <p className="font-semibold text-ink leading-tight">Expiry Reminder</p>
                        <p className="text-[11px] text-muted mt-0.5">5 member plans expire in 3 days.</p>
                        <span className="text-[10px] text-muted flex items-center gap-1 mt-1">
                          <Clock className="h-2.5 w-2.5" /> 1h ago
                        </span>
                      </div>
                    </div>

                    <div className="py-2.5 flex items-start gap-2.5">
                      <div className="h-6 w-6 rounded-full bg-sky-50 text-sky-600 flex items-center justify-center shrink-0 mt-0.5">
                        <Sparkles className="h-3.5 w-3.5" />
                      </div>
                      <div>
                        <p className="font-semibold text-ink leading-tight">New Website Lead</p>
                        <p className="text-[11px] text-muted mt-0.5">Trial enquiry submitted for CrossFit.</p>
                        <span className="text-[10px] text-muted flex items-center gap-1 mt-1">
                          <Clock className="h-2.5 w-2.5" /> 3h ago
                        </span>
                      </div>
                    </div>
                  </div>

                  <Link
                    href="/owner/reports"
                    onClick={() => setNotificationsOpen(false)}
                    className="block text-center text-[11px] font-semibold text-pine hover:underline pt-2 border-t border-line"
                  >
                    View All Activity Logs &rarr;
                  </Link>
                </div>
              )}
            </div>

            {/* Profile Dropdown Menu */}
            <div ref={profileRef} className="relative">
              <button
                type="button"
                onClick={() => setProfileOpen(!profileOpen)}
                className="size-8 rounded-full bg-pine text-white text-xs font-semibold flex items-center justify-center shadow-xs cursor-pointer select-none hover:opacity-90 transition"
                title={user.name || user.email || "Owner Account"}
                aria-label="User account menu"
              >
                {(user.name || user.email || "O")[0].toUpperCase()}
              </button>

              {profileOpen && (
                <div className="absolute right-0 mt-2 w-56 rounded-xl border border-line bg-white p-1.5 shadow-xl ring-1 ring-black/5 z-50 animate-in fade-in-50 zoom-in-95 duration-150">
                  <div className="p-2 border-b border-line">
                    <p className="text-xs font-bold text-ink truncate">{user.name || "Gym Owner"}</p>
                    <p className="text-[11px] text-muted truncate">{user.email}</p>
                    <span className="inline-block mt-1 text-[10px] font-semibold uppercase tracking-wider text-pine bg-pine-soft px-1.5 py-0.2 rounded">
                      Commercial Owner
                    </span>
                  </div>

                  <div className="py-1">
                    <Link
                      href="/owner/settings"
                      onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs text-ink hover:bg-canvas transition"
                    >
                      <Settings className="h-3.5 w-3.5 text-muted" />
                      <span>Gym Settings</span>
                    </Link>

                    <Link
                      href={`/g/${currentGym.slug}`}
                      target="_blank"
                      onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs text-ink hover:bg-canvas transition"
                    >
                      <Globe className="h-3.5 w-3.5 text-muted" />
                      <span>Public Website</span>
                    </Link>

                    <Link
                      href="/member/home"
                      onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs text-ink hover:bg-canvas transition"
                    >
                      <Smartphone className="h-3.5 w-3.5 text-muted" />
                      <span>Member Portal View</span>
                    </Link>
                  </div>

                  <div className="pt-1 border-t border-line">
                    <Link
                      href="/login"
                      onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 transition"
                    >
                      <LogOut className="h-3.5 w-3.5" />
                      <span>Sign Out</span>
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Global Quick Search Modal Palette (Ctrl+K) */}
        {searchOpen && (
          <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4">
            <div
              className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
              onClick={() => setSearchOpen(false)}
              aria-hidden="true"
            />
            <div className="relative w-full max-w-lg rounded-2xl border border-line bg-white shadow-2xl p-4 z-10 animate-in zoom-in-95 duration-150">
              <div className="flex items-center gap-2.5 border-b border-line pb-3">
                <Search className="h-4 w-4 text-muted" />
                <input
                  type="text"
                  autoFocus
                  placeholder="Quick search members, invoices, plans, or routes..."
                  className="w-full text-xs text-ink placeholder:text-muted focus:outline-hidden bg-transparent"
                />
                <button
                  type="button"
                  onClick={() => setSearchOpen(false)}
                  className="rounded p-1 text-muted hover:text-ink"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="py-2 text-xs space-y-1">
                <p className="px-2 pt-1 text-[10px] font-semibold uppercase tracking-wider text-muted">
                  Quick Navigation
                </p>
                {Object.entries(routeTitles).slice(0, 6).map(([href, title]) => (
                  <Link
                    key={href}
                    href={href}
                    onClick={() => setSearchOpen(false)}
                    className="flex items-center justify-between rounded-lg px-2.5 py-1.5 hover:bg-canvas text-ink transition"
                  >
                    <span>{title}</span>
                    <span className="font-mono text-[10px] text-muted">{href}</span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Content Body */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 pb-20 md:pb-8 max-w-[1400px] w-full mx-auto">
          {children}
        </main>

        {/* Mobile Bottom Navigation Bar (md:hidden) */}
        <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-md border-t border-line flex items-center justify-around h-14 px-2 shadow-lg">
          <Link
            href="/owner/dashboard"
            className={`flex flex-col items-center justify-center flex-1 h-full py-1 text-[10px] font-medium transition ${
              pathname === "/owner/dashboard" ? "text-pine font-bold" : "text-muted hover:text-ink"
            }`}
          >
            <LayoutDashboard className="h-4 w-4 shrink-0 mb-0.5" />
            <span>Overview</span>
          </Link>
          <Link
            href="/owner/members"
            className={`flex flex-col items-center justify-center flex-1 h-full py-1 text-[10px] font-medium transition ${
              pathname === "/owner/members" ? "text-pine font-bold" : "text-muted hover:text-ink"
            }`}
          >
            <Users className="h-4 w-4 shrink-0 mb-0.5" />
            <span>Members</span>
          </Link>
          <Link
            href="/owner/attendance"
            className={`flex flex-col items-center justify-center flex-1 h-full py-1 text-[10px] font-medium transition ${
              pathname === "/owner/attendance" ? "text-pine font-bold" : "text-muted hover:text-ink"
            }`}
          >
            <QrCode className="h-4 w-4 shrink-0 mb-0.5" />
            <span>Attendance</span>
          </Link>
          <Link
            href="/owner/payments"
            className={`flex flex-col items-center justify-center flex-1 h-full py-1 text-[10px] font-medium transition ${
              pathname === "/owner/payments" ? "text-pine font-bold" : "text-muted hover:text-ink"
            }`}
          >
            <Receipt className="h-4 w-4 shrink-0 mb-0.5" />
            <span>Billing</span>
          </Link>
          <button
            type="button"
            onClick={() => setMobileMenuOpen(true)}
            className="flex flex-col items-center justify-center flex-1 h-full py-1 text-[10px] font-medium text-muted hover:text-ink transition"
          >
            <Menu className="h-4 w-4 shrink-0 mb-0.5" />
            <span>More</span>
          </button>
        </nav>
      </div>
    </div>
  );
}

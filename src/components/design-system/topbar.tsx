"use client";

import * as React from "react";
import Link from "next/link";
import {
  Menu,
  PanelLeftClose,
  PanelLeft,
  Search,
  Bell,
  Building2,
  CheckCircle2,
  Clock,
  Sparkles,
  X,
  Users,
  CreditCard,
  QrCode,
  Dumbbell,
  Settings,
} from "lucide-react";

export interface TopbarProps {
  currentGym?: {
    name: string;
    slug?: string;
    status?: string;
  };
  user?: {
    name?: string | null;
    email?: string | null;
  };
  breadcrumbs?: React.ReactNode;
  actions?: React.ReactNode;
  onMobileMenuToggle?: () => void;
  onSidebarCollapseToggle?: () => void;
  isSidebarCollapsed?: boolean;
  onSearchClick?: () => void;
  unreadNotificationsCount?: number;
  className?: string;
}

const QUICK_SEARCH_ROUTES = [
  { href: "/owner/dashboard", label: "Dashboard Overview", category: "Core", icon: Building2 },
  { href: "/owner/members", label: "Member Directory & KYC", category: "Members", icon: Users },
  { href: "/owner/attendance", label: "QR Scan & Terminal", category: "Attendance", icon: QrCode },
  { href: "/owner/payments", label: "Payments, Invoices & POS", category: "Finance", icon: CreditCard },
  { href: "/owner/fitness", label: "Workout & Exercise Plans", category: "Fitness", icon: Dumbbell },
  { href: "/owner/settings", label: "Gym & Workspace Settings", category: "System", icon: Settings },
];

export function Topbar({
  currentGym,
  user,
  breadcrumbs,
  actions,
  onMobileMenuToggle,
  onSidebarCollapseToggle,
  isSidebarCollapsed,
  onSearchClick,
  unreadNotificationsCount = 3,
  className = "",
}: TopbarProps) {
  const [internalSearchOpen, setInternalSearchOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [notificationsOpen, setNotificationsOpen] = React.useState(false);

  const notificationsRef = React.useRef<HTMLDivElement>(null);

  // Close notifications on outside click
  React.useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        notificationsRef.current &&
        !notificationsRef.current.contains(e.target as Node)
      ) {
        setNotificationsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Keyboard shortcut Ctrl+K / Cmd+K
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        if (onSearchClick) {
          onSearchClick();
        } else {
          setInternalSearchOpen((prev) => !prev);
        }
      }
      if (e.key === "Escape") {
        setInternalSearchOpen(false);
        setNotificationsOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onSearchClick]);

  const handleOpenSearch = () => {
    if (onSearchClick) {
      onSearchClick();
    } else {
      setInternalSearchOpen(true);
    }
  };

  const filteredRoutes = QUICK_SEARCH_ROUTES.filter((r) =>
    r.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <header
      className={`sticky top-0 z-20 flex h-16 shrink-0 items-center justify-between border-b border-[#E3E7E4] bg-white/85 px-4 sm:px-8 backdrop-blur transition-all ${className}`}
    >
      {/* Left side: Navigation toggles & Workspace/Breadcrumb info */}
      <div className="flex items-center gap-3 min-w-0">
        {onMobileMenuToggle && (
          <button
            type="button"
            onClick={onMobileMenuToggle}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#E3E7E4] bg-white text-[#64748B] hover:text-[#0F172A] md:hidden cursor-pointer"
            aria-label="Open mobile menu"
          >
            <Menu className="h-5 w-5" />
          </button>
        )}

        {onSidebarCollapseToggle && (
          <button
            type="button"
            onClick={onSidebarCollapseToggle}
            className="hidden md:flex h-9 w-9 items-center justify-center rounded-lg text-[#64748B] hover:bg-[#F8FAFC] hover:text-[#0F172A] transition-colors cursor-pointer"
            aria-label="Toggle sidebar collapse"
          >
            {isSidebarCollapsed ? (
              <PanelLeft className="h-4 w-4" />
            ) : (
              <PanelLeftClose className="h-4 w-4" />
            )}
          </button>
        )}

        {breadcrumbs ? (
          <div className="hidden sm:block min-w-0">{breadcrumbs}</div>
        ) : currentGym ? (
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#E4F2EB] text-[#0B6B4F] shrink-0 font-bold">
              <Building2 className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-bold text-xs sm:text-sm text-[#0F172A] truncate">
                  {currentGym.name}
                </span>
                {currentGym.status && (
                  <span className="hidden sm:inline-block rounded-full bg-[#ECFDF5] px-2 py-0.2 text-[10px] font-semibold text-[#065F46] border border-[#A7F3D0]/60">
                    {currentGym.status}
                  </span>
                )}
              </div>
              {currentGym.slug && (
                <span className="font-mono text-[10px] text-[#64748B] hidden md:inline truncate">
                  /g/{currentGym.slug}
                </span>
              )}
            </div>
          </div>
        ) : null}
      </div>

      {/* Right side: Search, Actions, Notifications, User */}
      <div className="flex items-center gap-3 shrink-0">
        {/* Search trigger */}
        <button
          type="button"
          onClick={handleOpenSearch}
          className="hidden sm:flex items-center gap-2 rounded-lg border border-[#E3E7E4] bg-[#F8FAFC] px-3 py-1.5 text-xs text-[#64748B] hover:border-[#CBD5E1] transition-colors w-48 lg:w-64 cursor-pointer"
        >
          <Search className="h-3.5 w-3.5 text-[#94A3B8]" />
          <span className="flex-1 text-left truncate">Search workspace...</span>
          <kbd className="hidden lg:inline rounded border border-[#E3E7E4] bg-white px-1.5 py-0.5 text-[10px] font-mono text-[#94A3B8]">
            Ctrl K
          </kbd>
        </button>

        {/* Custom Actions Slot */}
        {actions}

        {/* Notification Bell */}
        <div ref={notificationsRef} className="relative">
          <button
            type="button"
            onClick={() => setNotificationsOpen(!notificationsOpen)}
            className="relative flex h-9 w-9 items-center justify-center rounded-lg text-[#64748B] hover:bg-[#F8FAFC] hover:text-[#0F172A] transition-colors cursor-pointer"
            title="Notifications"
            aria-label="View notifications"
          >
            <Bell className="h-4 w-4" />
            {unreadNotificationsCount > 0 && (
              <span className="absolute top-1.5 right-1.5 flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#059669] opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#059669]" />
              </span>
            )}
          </button>

          {/* Interactive Notifications Popover */}
          {notificationsOpen && (
            <div className="absolute right-0 mt-2 w-80 rounded-xl border border-slate-200 bg-white p-3 shadow-xl ring-1 ring-black/5 z-50 animate-in fade-in-50 zoom-in-95 duration-150">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <span className="text-xs font-bold text-slate-900">Notifications</span>
                <span className="text-[10px] text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  {unreadNotificationsCount} Active
                </span>
              </div>

              <div className="divide-y divide-slate-100 text-xs py-1">
                <div className="py-2.5 flex items-start gap-2.5">
                  <div className="h-6 w-6 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900 leading-tight">Payment Settled</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">Invoice #1048 cleared via UPI.</p>
                    <span className="text-[10px] text-slate-400 flex items-center gap-1 mt-1">
                      <Clock className="h-2.5 w-2.5" /> 10m ago
                    </span>
                  </div>
                </div>

                <div className="py-2.5 flex items-start gap-2.5">
                  <div className="h-6 w-6 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 mt-0.5">
                    <Clock className="h-3.5 w-3.5" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900 leading-tight">Plan Renewal Alert</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">4 members expire within 48 hours.</p>
                    <span className="text-[10px] text-slate-400 flex items-center gap-1 mt-1">
                      <Clock className="h-2.5 w-2.5" /> 1h ago
                    </span>
                  </div>
                </div>

                <div className="py-2.5 flex items-start gap-2.5">
                  <div className="h-6 w-6 rounded-full bg-sky-50 text-sky-600 flex items-center justify-center shrink-0 mt-0.5">
                    <Sparkles className="h-3.5 w-3.5" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900 leading-tight">Cryptographic Pass Sync</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">Turnstile QR verification keys synced.</p>
                    <span className="text-[10px] text-slate-400 flex items-center gap-1 mt-1">
                      <Clock className="h-2.5 w-2.5" /> 2h ago
                    </span>
                  </div>
                </div>
              </div>

              <Link
                href="/owner/reports"
                onClick={() => setNotificationsOpen(false)}
                className="block text-center text-[11px] font-semibold text-emerald-700 hover:underline pt-2 border-t border-slate-100"
              >
                View Complete Activity Log &rarr;
              </Link>
            </div>
          )}
        </div>

        {/* User Avatar */}
        {user && (
          <div
            className="flex h-8 w-8 items-center justify-center rounded-full bg-[#0B6B4F] text-white text-xs font-bold shadow-xs select-none"
            title={user.name || user.email || "Account"}
          >
            {user.name ? user.name[0].toUpperCase() : "U"}
          </div>
        )}
      </div>

      {/* Global Quick Search Modal Palette (Ctrl+K) */}
      {internalSearchOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4">
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
            onClick={() => setInternalSearchOpen(false)}
            aria-hidden="true"
          />
          <div className="relative w-full max-w-lg rounded-2xl border border-slate-200 bg-white shadow-2xl p-4 z-10 animate-in zoom-in-95 duration-150">
            <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
              <Search className="h-4 w-4 text-slate-400 shrink-0" />
              <input
                type="text"
                autoFocus
                placeholder="Jump to any module or action... (e.g. Members, Billing, QR)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-transparent text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setInternalSearchOpen(false)}
                className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="py-2 max-h-72 overflow-y-auto space-y-1">
              {filteredRoutes.length === 0 ? (
                <div className="p-4 text-center text-xs text-slate-400">
                  No matching module found for &quot;{searchQuery}&quot;
                </div>
              ) : (
                filteredRoutes.map((r) => {
                  const Icon = r.icon;
                  return (
                    <Link
                      key={r.href}
                      href={r.href}
                      onClick={() => setInternalSearchOpen(false)}
                      className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 transition group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-emerald-50 text-emerald-700 group-hover:bg-emerald-100 transition">
                          <Icon className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-800">{r.label}</p>
                          <p className="text-[10px] text-slate-400">{r.category}</p>
                        </div>
                      </div>
                      <span className="text-[11px] text-slate-400 group-hover:text-emerald-700 transition">
                        Jump &rarr;
                      </span>
                    </Link>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}



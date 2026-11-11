"use client";
import Link from "next/link"; import { usePathname } from "next/navigation"; import { useState } from "react";
import { LayoutDashboard, Building2, PlusCircle, Receipt, Gauge, ScrollText, Users, CalendarCheck, Wallet, Menu, PanelLeftClose, PanelLeft, X, Dumbbell, Home, TrendingUp, User, Search, Bell } from "lucide-react";
import { Logo } from "./ui";
const I = { LayoutDashboard, Building2, PlusCircle, Receipt, Gauge, ScrollText, Users, CalendarCheck, Wallet };
export type Group = { label?: string; items: { href: string; label: string; icon: keyof typeof I }[] };
export function Shell({ tag, groups, who, children }: { tag: string; groups: Group[]; who: string; children: React.ReactNode }) {
  const path = usePathname();
  const [small, setSmall] = useState(false);
  const [open, setOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [notifOpen, setNotifOpen] = useState(false);

  const nav = (c: boolean) => <nav aria-label="Main" className="flex-1 space-y-6 overflow-y-auto px-3 py-4">{groups.map((g, i) => <div key={i}>
    {g.label && !c && <p className="mb-1.5 px-3 text-xs text-faint">{g.label}</p>}
    <ul className="space-y-0.5">{g.items.map((it) => { const Ic = I[it.icon]; const on = path === it.href;
      return <li key={it.href}><Link href={it.href} title={it.label} onClick={() => setOpen(false)} aria-current={on ? "page" : undefined}
        className={`flex items-center gap-3 rounded-[10px] px-3 py-2 text-[14px] transition-colors ${on ? "bg-pine-soft font-medium text-pine" : "text-muted hover:bg-black/[.04] hover:text-ink"}`}><Ic size={17} aria-hidden />{!c && it.label}</Link></li>; })}</ul></div>)}</nav>;
  const head = (c: boolean) => <div className="flex h-16 items-center gap-3 px-5">{c ? <Logo /> : <><Logo /><span className="rounded-md bg-black/[.05] px-1.5 py-0.5 text-[11px] text-muted">{tag}</span></>}</div>;

  const allItems = groups.flatMap((g) => g.items);
  const filtered = allItems.filter((it) => it.label.toLowerCase().includes(searchQuery.toLowerCase()));

  return <div className="min-h-screen">
    <aside className={`fixed inset-y-0 left-0 z-30 hidden flex-col border-r border-line bg-white transition-[width] duration-300 lg:flex ${small ? "w-[76px]" : "w-64"}`}>{head(small)}{nav(small)}</aside>
    {open && <div className="fixed inset-0 z-40 lg:hidden"><div className="absolute inset-0 bg-black/30" onClick={() => setOpen(false)} /><aside className="page-in absolute inset-y-0 left-0 flex w-72 flex-col bg-white">
      <button aria-label="Close menu" onClick={() => setOpen(false)} className="absolute right-4 top-5 text-muted"><X size={20} /></button>{head(false)}{nav(false)}</aside></div>}
    <div className={`transition-[padding] duration-300 ${small ? "lg:pl-[76px]" : "lg:pl-64"}`}>
      <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-line bg-canvas/85 px-4 backdrop-blur sm:px-8">
        <button aria-label="Open menu" onClick={() => setOpen(true)} className="lg:hidden cursor-pointer"><Menu size={20} /></button>
        <button aria-label="Toggle sidebar" onClick={() => setSmall(!small)} className="hidden text-muted hover:text-ink lg:block cursor-pointer">{small ? <PanelLeft size={19} /> : <PanelLeftClose size={19} />}</button>
        <button onClick={() => setSearchOpen(true)} className="ml-2 hidden w-72 items-center gap-2 rounded-[10px] border border-line bg-white px-3 py-2 text-sm text-faint sm:flex cursor-pointer hover:border-slate-300"><Search size={15} />Search workspace...<kbd className="ml-auto rounded border border-line px-1.5 text-[11px]">Ctrl K</kbd></button>
        
        <div className="ml-auto flex items-center gap-4 relative">
          <button aria-label="Notifications" onClick={() => setNotifOpen(!notifOpen)} className="text-muted hover:text-ink cursor-pointer relative">
            <Bell size={19} />
            <span className="absolute -top-1 -right-1 flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600" />
            </span>
          </button>

          {notifOpen && (
            <div className="absolute right-10 top-10 w-72 rounded-xl border border-line bg-white p-3 shadow-xl z-50 animate-in fade-in zoom-in-95">
              <div className="flex items-center justify-between pb-2 border-b border-line text-xs font-bold text-ink">
                <span>Workspace Alerts</span>
                <span className="text-[10px] text-pine bg-pine-soft px-1.5 py-0.5 rounded">Live</span>
              </div>
              <div className="py-2 space-y-2 text-xs">
                <p className="text-ink font-semibold">System Operational</p>
                <p className="text-[11px] text-muted">All micro-services & turnstiles active.</p>
              </div>
            </div>
          )}

          <span className="grid h-8 w-8 place-items-center rounded-full bg-pine text-sm font-medium text-white select-none" title={who}>{who[0]}</span>
        </div>
      </header>

      {/* Quick Search Modal */}
      {searchOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4">
          <div className="fixed inset-0 bg-black/40 backdrop-blur-xs" onClick={() => setSearchOpen(false)} />
          <div className="relative w-full max-w-lg rounded-2xl border border-line bg-white shadow-2xl p-4 z-10 animate-in zoom-in-95">
            <div className="flex items-center gap-2 border-b border-line pb-3">
              <Search size={16} className="text-muted" />
              <input
                type="text"
                autoFocus
                placeholder="Jump to page..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full text-sm text-ink focus:outline-none"
              />
              <button onClick={() => setSearchOpen(false)} className="text-muted hover:text-ink"><X size={16} /></button>
            </div>
            <div className="py-2 max-h-60 overflow-y-auto space-y-1">
              {filtered.map((it) => {
                const Ic = I[it.icon];
                return (
                  <Link
                    key={it.href}
                    href={it.href}
                    onClick={() => setSearchOpen(false)}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-canvas text-xs font-semibold text-ink"
                  >
                    <Ic size={16} className="text-pine" />
                    <span>{it.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      )}

      <main key={path} className="page-in mx-auto max-w-[1280px] px-4 py-8 sm:px-8">{children}</main></div></div>;
}
export function MemberShell({ gym, who, children }: { gym: string; who: string; children: React.ReactNode }) {
  const path = usePathname(); const tabs = [{ href: "/member/home", l: "Home", i: Home }, { href: "/member/workouts", l: "Workouts", i: Dumbbell }, { href: "/member/progress", l: "Progress", i: TrendingUp }, { href: "/member/profile", l: "Profile", i: User }];
  return <div className="min-h-screen pb-24 sm:pb-0"><header className="flex h-14 items-center justify-between px-5"><span className="font-display font-semibold">{gym}</span><span className="grid h-8 w-8 place-items-center rounded-full bg-pine text-sm text-white">{who[0]}</span></header>
    <main key={path} className="page-in mx-auto max-w-2xl px-4 pb-8">{children}</main>
    <nav aria-label="Member" className="fixed inset-x-3 bottom-3 z-20 grid grid-cols-4 rounded-2xl border border-line bg-white/90 pb-[env(safe-area-inset-bottom)] backdrop-blur">
      {tabs.map((t) => <Link key={t.href} href={t.href} aria-current={path === t.href ? "page" : undefined} className={`flex flex-col items-center gap-1 py-3 text-xs ${path === t.href ? "font-medium text-pine" : "text-muted"}`}><t.i size={21} aria-hidden />{t.l}</Link>)}</nav></div>;
}

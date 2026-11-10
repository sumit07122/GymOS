"use client";
import Link from "next/link"; import { usePathname } from "next/navigation"; import { useState } from "react";
import { LayoutDashboard, Building2, PlusCircle, Receipt, Gauge, ScrollText, Users, CalendarCheck, Wallet, Menu, PanelLeftClose, PanelLeft, X, Dumbbell, Home, TrendingUp, User, Search, Bell } from "lucide-react";
import { Logo } from "./ui";
const I = { LayoutDashboard, Building2, PlusCircle, Receipt, Gauge, ScrollText, Users, CalendarCheck, Wallet };
export type Group = { label?: string; items: { href: string; label: string; icon: keyof typeof I }[] };
export function Shell({ tag, groups, who, children }: { tag: string; groups: Group[]; who: string; children: React.ReactNode }) {
  const path = usePathname(); const [small, setSmall] = useState(false); const [open, setOpen] = useState(false);
  const nav = (c: boolean) => <nav aria-label="Main" className="flex-1 space-y-6 overflow-y-auto px-3 py-4">{groups.map((g, i) => <div key={i}>
    {g.label && !c && <p className="mb-1.5 px-3 text-xs text-faint">{g.label}</p>}
    <ul className="space-y-0.5">{g.items.map((it) => { const Ic = I[it.icon]; const on = path === it.href;
      return <li key={it.href}><Link href={it.href} title={it.label} onClick={() => setOpen(false)} aria-current={on ? "page" : undefined}
        className={`flex items-center gap-3 rounded-[10px] px-3 py-2 text-[14px] transition-colors ${on ? "bg-pine-soft font-medium text-pine" : "text-muted hover:bg-black/[.04] hover:text-ink"}`}><Ic size={17} aria-hidden />{!c && it.label}</Link></li>; })}</ul></div>)}</nav>;
  const head = (c: boolean) => <div className="flex h-16 items-center gap-3 px-5">{c ? <Logo /> : <><Logo /><span className="rounded-md bg-black/[.05] px-1.5 py-0.5 text-[11px] text-muted">{tag}</span></>}</div>;
  return <div className="min-h-screen">
    <aside className={`fixed inset-y-0 left-0 z-30 hidden flex-col border-r border-line bg-white transition-[width] duration-300 lg:flex ${small ? "w-[76px]" : "w-64"}`}>{head(small)}{nav(small)}</aside>
    {open && <div className="fixed inset-0 z-40 lg:hidden"><div className="absolute inset-0 bg-black/30" onClick={() => setOpen(false)} /><aside className="page-in absolute inset-y-0 left-0 flex w-72 flex-col bg-white">
      <button aria-label="Close menu" onClick={() => setOpen(false)} className="absolute right-4 top-5 text-muted"><X size={20} /></button>{head(false)}{nav(false)}</aside></div>}
    <div className={`transition-[padding] duration-300 ${small ? "lg:pl-[76px]" : "lg:pl-64"}`}>
      <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-line bg-canvas/85 px-4 backdrop-blur sm:px-8">
        <button aria-label="Open menu" onClick={() => setOpen(true)} className="lg:hidden"><Menu size={20} /></button>
        <button aria-label="Toggle sidebar" onClick={() => setSmall(!small)} className="hidden text-muted hover:text-ink lg:block">{small ? <PanelLeft size={19} /> : <PanelLeftClose size={19} />}</button>
        <button className="ml-2 hidden w-72 items-center gap-2 rounded-[10px] border border-line bg-white px-3 py-2 text-sm text-faint sm:flex"><Search size={15} />Search<kbd className="ml-auto rounded border border-line px-1.5 text-[11px]">Ctrl K</kbd></button>
        <div className="ml-auto flex items-center gap-4"><button aria-label="Notifications" className="text-muted hover:text-ink"><Bell size={19} /></button>
          <span className="grid h-8 w-8 place-items-center rounded-full bg-pine text-sm font-medium text-white" title={who}>{who[0]}</span></div></header>
      <main key={path} className="page-in mx-auto max-w-[1280px] px-4 py-8 sm:px-8">{children}</main></div></div>;
}
export function MemberShell({ gym, who, children }: { gym: string; who: string; children: React.ReactNode }) {
  const path = usePathname(); const tabs = [{ href: "/member/home", l: "Home", i: Home }, { href: "/member/workouts", l: "Workouts", i: Dumbbell }, { href: "/member/progress", l: "Progress", i: TrendingUp }, { href: "/member/profile", l: "Profile", i: User }];
  return <div className="min-h-screen pb-24 sm:pb-0"><header className="flex h-14 items-center justify-between px-5"><span className="font-display font-semibold">{gym}</span><span className="grid h-8 w-8 place-items-center rounded-full bg-pine text-sm text-white">{who[0]}</span></header>
    <main key={path} className="page-in mx-auto max-w-2xl px-4 pb-8">{children}</main>
    <nav aria-label="Member" className="fixed inset-x-3 bottom-3 z-20 grid grid-cols-4 rounded-2xl border border-line bg-white/90 pb-[env(safe-area-inset-bottom)] backdrop-blur">
      {tabs.map((t) => <Link key={t.href} href={t.href} aria-current={path === t.href ? "page" : undefined} className={`flex flex-col items-center gap-1 py-3 text-xs ${path === t.href ? "font-medium text-pine" : "text-muted"}`}><t.i size={21} aria-hidden />{t.l}</Link>)}</nav></div>;
}

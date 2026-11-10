import { ReactNode } from "react"; import { Count } from "./Count";
export const Logo = ({ light = false }: { light?: boolean }) => <span className={`inline-flex items-center gap-2 font-display text-[17px] font-semibold ${light ? "text-white" : "text-ink"}`}>
  <svg width="26" height="26" viewBox="0 0 26 26" aria-hidden><circle cx="13" cy="13" r="10" fill="none" stroke={light ? "#7FD6B2" : "#0B6B4F"} strokeWidth="3" strokeDasharray="52 12" strokeLinecap="round" /><circle cx="13" cy="13" r="3" fill={light ? "#fff" : "#0B6B4F"} /></svg>GymOS</span>;
export const Card = ({ children, className = "" }: { children: ReactNode; className?: string }) => <section className={`rounded-2xl border border-line bg-white ${className}`}>{children}</section>;
export const PageHeader = ({ title, sub, action }: { title: string; sub?: string; action?: ReactNode }) => <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
  <div><h1 className="text-[28px] font-semibold leading-tight">{title}</h1>{sub && <p className="mt-1 text-[15px] text-muted">{sub}</p>}</div>{action}</div>;
export const PreviewBanner = () => <p role="note" className="mb-6 text-xs text-faint">Showing preview data until this page is connected to your backend.</p>;
export const Stat = ({ label, value, hint }: { label: string; value: string; hint?: string }) => <Card className="p-5"><p className="text-sm text-muted">{label}</p>
  <p className="num mt-2 font-display text-[32px] font-semibold leading-none"><Count value={value} /></p>{hint && <p className="mt-2 text-xs text-muted">{hint}</p>}</Card>;
const tone: Record<string, string> = { Active: "bg-pine-soft text-pine", Trial: "bg-sky-50 text-sky-700", Expired: "bg-red-50 text-red-700", Warning: "bg-amber-50 text-amber-800" };
export const Badge = ({ s }: { s: string }) => <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${tone[s] ?? tone.Active}`}><span className="h-1.5 w-1.5 rounded-full bg-current" />{s}</span>;
export const Meter = ({ used, cap }: { used: number; cap: number }) => { const p = Math.min(100, Math.round((used / cap) * 100)); const c = p >= 90 ? "bg-red-500" : p >= 75 ? "bg-amber-500" : "bg-pine";
  return <div role="progressbar" aria-valuenow={p} aria-valuemin={0} aria-valuemax={100} className="h-1.5 w-full rounded-full bg-black/[.06]"><div className={`h-full rounded-full ${c} transition-[width] duration-700`} style={{ width: `${p}%` }} /></div>; };
export const Photo = ({ src, className = "", children }: { src: string; className?: string; children?: ReactNode }) => <div className={`relative overflow-hidden bg-pine-deep ${className}`}
  style={{ backgroundImage: `url(${src}), radial-gradient(80% 90% at 75% 20%, #1F8A68 0%, #0B4A38 45%, #062E23 100%)`, backgroundSize: "cover", backgroundPosition: "center" }}>{children}</div>;
export const Ring = ({ value, size = 120, label }: { value: number; size?: number; label?: ReactNode }) => { const r = 44, c = 2 * Math.PI * r;
  return <div className="relative" style={{ width: size, height: size }}><svg viewBox="0 0 100 100" className="-rotate-90"><circle cx="50" cy="50" r={r} fill="none" stroke="rgba(255,255,255,.14)" strokeWidth="8" />
    <circle className="ringfill" cx="50" cy="50" r={r} fill="none" stroke="#7FD6B2" strokeWidth="8" strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c * (1 - value)} style={{ ["--c" as string]: c }} /></svg>
    <div className="absolute inset-0 grid place-items-center text-center text-white">{label}</div></div>; };

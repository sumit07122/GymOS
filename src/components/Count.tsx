"use client";
import { useEffect, useState } from "react";
export function Count({ value }: { value: string }) {
  const m = value.match(/^(\D*)([\d,]*\.?\d+)(.*)$/); const [n, setN] = useState<number | null>(null);
  useEffect(() => {
    if (!m || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const to = parseFloat(m[2].replace(/,/g, "")); const t0 = performance.now(); let id = 0;
    const tick = (t: number) => { const p = Math.min((t - t0) / 900, 1); setN(to * (1 - Math.pow(1 - p, 3))); if (p < 1) id = requestAnimationFrame(tick); };
    id = requestAnimationFrame(tick); return () => cancelAnimationFrame(id);
  }, [value]); // eslint-disable-line
  if (!m || n === null) return <>{value}</>;
  const d = (m[2].split(".")[1] || "").length;
  return <>{m[1]}{m[2].includes(",") ? n.toLocaleString("en-IN", { minimumFractionDigits: d, maximumFractionDigits: d }) : n.toFixed(d)}{m[3]}</>;
}

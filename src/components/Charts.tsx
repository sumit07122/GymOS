"use client";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
type P = { data: { m: string; v: number }[]; money?: boolean };
const fmt = (n: number, money?: boolean) => money ? `₹${(n / 1000).toFixed(0)}k` : String(n);
const tip = { contentStyle: { borderRadius: 10, border: "1px solid #E3E7E4", boxShadow: "none", fontSize: 12 }, cursor: { stroke: "#E3E7E4" } };
export function AreaCard({ data, money }: P) {
  return <div className="h-60 w-full"><ResponsiveContainer><AreaChart data={data} margin={{ left: -10, right: 6, top: 8 }}>
    <defs><linearGradient id="pg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#0B6B4F" stopOpacity=".16" /><stop offset="1" stopColor="#0B6B4F" stopOpacity="0" /></linearGradient></defs>
    <CartesianGrid stroke="#EEF0EE" vertical={false} /><XAxis dataKey="m" tickLine={false} axisLine={false} fontSize={12} stroke="#94A099" /><YAxis tickLine={false} axisLine={false} fontSize={12} stroke="#94A099" tickFormatter={(n) => fmt(n, money)} />
    <Tooltip {...tip} formatter={(n: unknown) => fmt(Number(n) || 0, money)} /><Area type="monotone" dataKey="v" stroke="#0B6B4F" strokeWidth={2} fill="url(#pg)" animationDuration={1100} /></AreaChart></ResponsiveContainer></div>;
}
export function BarCard({ data }: P) {
  return <div className="h-60 w-full"><ResponsiveContainer><BarChart data={data} margin={{ left: -18, right: 6, top: 8 }}>
    <CartesianGrid stroke="#EEF0EE" vertical={false} /><XAxis dataKey="m" tickLine={false} axisLine={false} fontSize={12} stroke="#94A099" /><YAxis tickLine={false} axisLine={false} fontSize={12} stroke="#94A099" />
    <Tooltip {...tip} cursor={{ fill: "#F5F6F4" }} /><Bar dataKey="v" fill="#0B6B4F" radius={[6, 6, 0, 0]} maxBarSize={28} animationDuration={900} /></BarChart></ResponsiveContainer></div>;
}

"use client";

import * as React from "react";
import { Badge } from "@/components/ui/badge";
import {
  CalendarDays,
  CheckCircle2,
  XCircle,
  TrendingUp,
  Package,
  AlertTriangle,
  ArrowRightLeft,
  Check,
} from "lucide-react";

interface OperationsReportSectionProps {
  data: {
    totalBookings: number;
    attendedBookings: number;
    cancelledBookings: number;
    totalClassCapacity: number;
    totalClassBooked: number;
    bookingUtilization: number;
    stockMovements: Array<{
      type: string;
      quantity: number;
      transactions: number;
    }>;
    lowStockCount: number;
    lowStockItems: Array<{
      id: string;
      name: string;
      sku: string;
      currentStock: number;
      reorderPoint: number | null;
    }>;
  };
}

export function OperationsReportSection({ data }: OperationsReportSectionProps) {
  const movementLabels: Record<string, string> = {
    PURCHASE: "Restock / Inbound Purchase",
    SALE: "Retail Pos / Outbound Sale",
    ADJUSTMENT: "Audit Stock Adjustment",
    RETURN: "Customer Return",
    DAMAGE: "Damaged / Expired Write-off",
    INTERNAL_USE: "Internal Gym Consumption",
  };

  const movementBadge: Record<string, string> = {
    PURCHASE: "bg-emerald-50 text-emerald-700 border-emerald-200",
    SALE: "bg-blue-50 text-blue-700 border-blue-200",
    ADJUSTMENT: "bg-indigo-50 text-indigo-700 border-indigo-200",
    RETURN: "bg-amber-50 text-amber-700 border-amber-200",
    DAMAGE: "bg-rose-50 text-rose-700 border-rose-200",
    INTERNAL_USE: "bg-slate-100 text-slate-700 border-slate-200",
  };

  return (
    <div className="space-y-6">
      {/* Top Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Class Bookings */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Total Class Bookings
            </span>
            <div className="h-8 w-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
              <CalendarDays className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900 tracking-tight">
              {data.totalBookings}
            </span>
            <span className="text-xs text-slate-500 font-medium">seats reserved</span>
          </div>
          <p className="mt-1 text-[11px] text-slate-400">
            Member reservations across all group fitness sessions
          </p>
        </div>

        {/* Capacity Utilization */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Schedule Utilization
            </span>
            <div className="h-8 w-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
              <TrendingUp className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-black text-emerald-700 tracking-tight">
              {data.bookingUtilization}%
            </span>
            <span className="text-xs text-emerald-600 font-medium">capacity filled</span>
          </div>
          <p className="mt-1 text-[11px] text-slate-400">
            {data.totalClassBooked} booked of {data.totalClassCapacity} total seats offered
          </p>
        </div>

        {/* Attended vs Cancelled */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Booking Attendance
            </span>
            <div className="h-8 w-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
              <CheckCircle2 className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900 tracking-tight">
              {data.attendedBookings}
            </span>
            <span className="text-xs text-slate-500 font-medium">
              / {data.cancelledBookings} cancelled
            </span>
          </div>
          <p className="mt-1 text-[11px] text-slate-400">
            Confirmed attended reservations vs dropouts
          </p>
        </div>

        {/* Low-Stock Warning Alert */}
        <div
          className={`rounded-2xl border p-5 shadow-xs ${
            data.lowStockCount > 0
              ? "border-amber-300 bg-amber-50/40"
              : "border-slate-200 bg-white"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Low-Stock Alerts
            </span>
            <div
              className={`h-8 w-8 rounded-lg flex items-center justify-center ${
                data.lowStockCount > 0
                  ? "bg-amber-100 text-amber-700"
                  : "bg-emerald-50 text-emerald-600"
              }`}
            >
              {data.lowStockCount > 0 ? (
                <AlertTriangle className="h-4 w-4" />
              ) : (
                <Package className="h-4 w-4" />
              )}
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span
              className={`text-2xl font-black tracking-tight ${
                data.lowStockCount > 0 ? "text-amber-800" : "text-slate-900"
              }`}
            >
              {data.lowStockCount}
            </span>
            <span className="text-xs text-slate-500 font-medium">items below threshold</span>
          </div>
          <p className="mt-1 text-[11px] text-slate-400">
            {data.lowStockCount > 0
              ? "Items requiring purchase order / restock"
              : "All inventory products above safety stock"}
          </p>
        </div>
      </div>

      {/* Main Section Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Class Booking Breakdown */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <CalendarDays className="h-4 w-4 text-indigo-600" />
                  <span>Class Schedule Utilization & Retention</span>
                </h3>
                <p className="text-xs text-slate-500">
                  Capacity management and cancellation metrics.
                </p>
              </div>
              <Badge
                variant="outline"
                className="bg-indigo-50 text-indigo-700 border-indigo-200 font-bold text-xs"
              >
                {data.bookingUtilization}% Booked
              </Badge>
            </div>

            <div className="mt-5 space-y-4">
              <div>
                <div className="flex items-center justify-between text-xs text-slate-600 font-medium mb-1.5">
                  <span>Class Seat Fill Rate</span>
                  <span>
                    {data.totalClassBooked} / {data.totalClassCapacity} seats
                  </span>
                </div>
                <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                  <div
                    className="bg-indigo-600 h-full rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(100, data.bookingUtilization)}%` }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 pt-2">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-center">
                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                    Total Bookings
                  </span>
                  <span className="text-lg font-black text-slate-800 block mt-0.5">
                    {data.totalBookings}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-emerald-50/60 border border-emerald-100 text-center">
                  <span className="text-[10px] font-semibold text-emerald-700 uppercase tracking-wider block flex items-center justify-center gap-1">
                    <Check className="h-3 w-3" /> Attended
                  </span>
                  <span className="text-lg font-black text-emerald-800 block mt-0.5">
                    {data.attendedBookings}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-rose-50/60 border border-rose-100 text-center">
                  <span className="text-[10px] font-semibold text-rose-700 uppercase tracking-wider block flex items-center justify-center gap-1">
                    <XCircle className="h-3 w-3" /> Cancelled
                  </span>
                  <span className="text-lg font-black text-rose-800 block mt-0.5">
                    {data.cancelledBookings}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-5 pt-3 border-t border-slate-100 text-[11px] text-slate-400">
            Attendance Rate:{" "}
            <strong className="text-slate-700">
              {data.totalBookings > 0
                ? `${Math.round((data.attendedBookings / data.totalBookings) * 100)}%`
                : "0%"}
            </strong>{" "}
            of registered bookings attended session
          </div>
        </div>

        {/* Stock Movements */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <ArrowRightLeft className="h-4 w-4 text-emerald-600" />
                  <span>Inventory Movement Activity</span>
                </h3>
                <p className="text-xs text-slate-500">
                  Stock additions, sales, and audit adjustments during period.
                </p>
              </div>
            </div>

            {data.stockMovements.length === 0 ? (
              <div className="py-10 text-center text-slate-400 text-xs">
                No inventory stock adjustments or transactions during this period.
              </div>
            ) : (
              <div className="divide-y divide-slate-100 mt-2">
                {data.stockMovements.map((m) => {
                  const label = movementLabels[m.type] || m.type;
                  const style =
                    movementBadge[m.type] || "bg-slate-100 text-slate-700 border-slate-200";

                  return (
                    <div
                      key={m.type}
                      className="py-3 flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className={`${style} text-[11px]`}>
                          {label}
                        </Badge>
                      </div>

                      <div className="flex items-center gap-4 text-right">
                        <div>
                          <span className="font-bold text-slate-900">{m.quantity}</span>{" "}
                          <span className="text-[11px] text-slate-400">units</span>
                        </div>
                        <span className="text-[11px] text-slate-400">
                          ({m.transactions} txns)
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Low Stock Items Preview if any */}
          {data.lowStockCount > 0 && (
            <div className="mt-4 pt-3 border-t border-amber-200/80 bg-amber-50/50 -mx-5 -mb-5 sm:-mx-6 sm:-mb-6 p-4 rounded-b-2xl">
              <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900 mb-2">
                <AlertTriangle className="h-3.5 w-3.5 text-amber-600" />
                <span>Restock Required ({data.lowStockCount} items below safety limit):</span>
              </div>
              <div className="space-y-1.5">
                {data.lowStockItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between text-xs bg-white px-3 py-1.5 rounded-lg border border-amber-200"
                  >
                    <span className="font-medium text-slate-800 truncate max-w-[200px]">
                      {item.name} ({item.sku})
                    </span>
                    <span className="text-amber-800 font-bold text-[11px]">
                      {item.currentStock} left (Min: {item.reorderPoint ?? 5})
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

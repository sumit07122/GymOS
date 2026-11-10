"use client";

import * as React from "react";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

export interface StatTrend {
  value: string | number;
  label?: string;
  isPositive?: boolean;
  isNeutral?: boolean;
}

export interface StatCardProps {
  label: string;
  value: string | number;
  icon?: React.ComponentType<{ className?: string }>;
  trend?: StatTrend;
  subtext?: string;
  progress?: {
    current: number;
    total: number;
    label?: string;
  };
  onClick?: () => void;
  className?: string;
}

export function StatCard({
  label,
  value,
  icon: Icon,
  trend,
  subtext,
  progress,
  onClick,
  className = "",
}: StatCardProps) {
  const isClickable = Boolean(onClick);

  return (
    <div
      onClick={onClick}
      role={isClickable ? "button" : undefined}
      tabIndex={isClickable ? 0 : undefined}
      className={`relative overflow-hidden rounded-xl border border-[#E3E7E4] bg-white p-4 sm:p-5 shadow-xs transition-all ${
        isClickable
          ? "cursor-pointer hover:border-[#0B6B4F]/40 hover:shadow-sm"
          : ""
      } ${className}`}
    >
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs sm:text-sm font-medium text-[#5F6B65] truncate">
          {label}
        </p>
        {Icon && (
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#E4F2EB] text-[#0B6B4F]">
            <Icon className="h-4 w-4" />
          </div>
        )}
      </div>

      <div className="mt-2.5 flex items-baseline gap-2">
        <span className="font-heading text-2xl sm:text-3xl font-bold tracking-tight text-[#0F172A] num">
          {value}
        </span>
      </div>

      {trend && (
        <div className="mt-2.5 flex items-center gap-1.5 text-xs font-medium">
          <span
            className={`inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[11px] ${
              trend.isNeutral
                ? "bg-slate-100 text-slate-700"
                : trend.isPositive
                ? "bg-[#ECFDF5] text-[#065F46]"
                : "bg-[#FEF2F2] text-[#991B1B]"
            }`}
          >
            {trend.isNeutral ? (
              <Minus className="h-3 w-3" />
            ) : trend.isPositive ? (
              <TrendingUp className="h-3 w-3" />
            ) : (
              <TrendingDown className="h-3 w-3" />
            )}
            <span>{trend.value}</span>
          </span>
          {trend.label && (
            <span className="text-[#64748B] text-[11px] truncate">
              {trend.label}
            </span>
          )}
        </div>
      )}

      {subtext && !trend && (
        <p className="mt-2 text-xs text-[#64748B] truncate">{subtext}</p>
      )}

      {progress && (
        <div className="mt-3">
          <div className="flex items-center justify-between text-[11px] text-[#64748B] mb-1">
            <span>{progress.label || "Utilization"}</span>
            <span className="font-medium text-[#0F172A]">
              {Math.min(
                100,
                Math.round((progress.current / (progress.total || 1)) * 100)
              )}
              %
            </span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-[#E2E8F0]">
            <div
              className="h-full rounded-full bg-[#0B6B4F] transition-all duration-500"
              style={{
                width: `${Math.min(
                  100,
                  Math.round((progress.current / (progress.total || 1)) * 100)
                )}%`,
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}


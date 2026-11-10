"use client";

import * as React from "react";

export interface PeriodOption {
  label: string;
  value: string;
}

export interface MetricSummary {
  label: string;
  value: string | number;
  change?: string;
  isPositive?: boolean;
}

export interface ChartCardProps {
  title: string;
  description?: string;
  periods?: PeriodOption[];
  selectedPeriod?: string;
  onPeriodChange?: (period: string) => void;
  metrics?: MetricSummary[];
  actions?: React.ReactNode;
  children: React.ReactNode;
  isLoading?: boolean;
  className?: string;
}

export function ChartCard({
  title,
  description,
  periods,
  selectedPeriod,
  onPeriodChange,
  metrics,
  actions,
  children,
  isLoading = false,
  className = "",
}: ChartCardProps) {
  return (
    <div
      className={`rounded-xl border border-[#E3E7E4] bg-white p-4 sm:p-5 shadow-xs ${className}`}
    >
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-[#E3E7E4]/80 pb-4">
        <div>
          <h3 className="font-heading text-sm sm:text-base font-bold text-[#0F172A]">
            {title}
          </h3>
          {description && (
            <p className="mt-0.5 text-xs text-[#5F6B65]">{description}</p>
          )}
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {periods && periods.length > 0 && (
            <div className="inline-flex rounded-lg border border-[#E3E7E4] bg-[#F8FAFC] p-0.5">
              {periods.map((p) => {
                const isActive = p.value === selectedPeriod;
                return (
                  <button
                    key={p.value}
                    type="button"
                    onClick={() => onPeriodChange && onPeriodChange(p.value)}
                    className={`rounded-md px-2.5 py-1 text-[11px] font-medium transition-all ${
                      isActive
                        ? "bg-white text-[#0B6B4F] shadow-xs font-semibold"
                        : "text-[#64748B] hover:text-[#0F172A]"
                    }`}
                  >
                    {p.label}
                  </button>
                );
              })}
            </div>
          )}
          {actions}
        </div>
      </div>

      {/* Optional Top Metrics Row */}
      {metrics && metrics.length > 0 && (
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4 border-b border-[#E3E7E4]/60 pb-3">
          {metrics.map((m, idx) => (
            <div key={idx} className="flex flex-col">
              <span className="text-[11px] text-[#64748B] font-medium">
                {m.label}
              </span>
              <div className="mt-0.5 flex items-baseline gap-1.5">
                <span className="font-heading text-base sm:text-lg font-bold text-[#0F172A] num">
                  {m.value}
                </span>
                {m.change && (
                  <span
                    className={`text-[10px] font-medium ${
                      m.isPositive ? "text-[#059669]" : "text-[#DC2626]"
                    }`}
                  >
                    {m.change}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Chart Canvas Area */}
      <div className="mt-4 relative min-h-[220px]">
        {isLoading ? (
          <div className="flex h-56 w-full items-center justify-center animate-pulse">
            <div className="h-full w-full rounded-lg bg-slate-100" />
          </div>
        ) : (
          children
        )}
      </div>
    </div>
  );
}

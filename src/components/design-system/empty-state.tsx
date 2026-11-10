"use client";

import * as React from "react";
import { FolderOpen } from "lucide-react";

export interface EmptyStateProps {
  icon?: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  primaryAction?: {
    label: string;
    onClick?: () => void;
    href?: string;
  };
  secondaryAction?: {
    label: string;
    onClick?: () => void;
    href?: string;
  };
  className?: string;
}

export function EmptyState({
  icon: Icon = FolderOpen,
  title,
  description,
  primaryAction,
  secondaryAction,
  className = "",
}: EmptyStateProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center rounded-xl border border-dashed border-[#E3E7E4] bg-[#F8FAFC]/60 p-8 sm:p-12 text-center ${className}`}
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#E4F2EB] text-[#0B6B4F]">
        <Icon className="h-6 w-6" />
      </div>

      <h3 className="mt-4 font-heading text-base font-bold text-[#0F172A]">
        {title}
      </h3>

      <p className="mt-1 text-xs text-[#5F6B65] max-w-sm mx-auto">
        {description}
      </p>

      {(primaryAction || secondaryAction) && (
        <div className="mt-5 flex items-center gap-3">
          {primaryAction && (
            primaryAction.href ? (
              <a
                href={primaryAction.href}
                className="inline-flex items-center justify-center rounded-lg bg-[#0B6B4F] px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-[#09543E] transition-colors"
              >
                {primaryAction.label}
              </a>
            ) : (
              <button
                type="button"
                onClick={primaryAction.onClick}
                className="inline-flex items-center justify-center rounded-lg bg-[#0B6B4F] px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-[#09543E] transition-colors"
              >
                {primaryAction.label}
              </button>
            )
          )}

          {secondaryAction && (
            secondaryAction.href ? (
              <a
                href={secondaryAction.href}
                className="inline-flex items-center justify-center rounded-lg border border-[#E3E7E4] bg-white px-3.5 py-2 text-xs font-medium text-[#0F172A] hover:bg-[#F8FAFC] transition-colors"
              >
                {secondaryAction.label}
              </a>
            ) : (
              <button
                type="button"
                onClick={secondaryAction.onClick}
                className="inline-flex items-center justify-center rounded-lg border border-[#E3E7E4] bg-white px-3.5 py-2 text-xs font-medium text-[#0F172A] hover:bg-[#F8FAFC] transition-colors"
              >
                {secondaryAction.label}
              </button>
            )
          )}
        </div>
      )}
    </div>
  );
}

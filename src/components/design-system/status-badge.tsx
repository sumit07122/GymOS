"use client";

import * as React from "react";

export type StatusVariant = "success" | "warning" | "danger" | "info" | "neutral";

export type KnownStatus =
  | "ACTIVE"
  | "TRIAL"
  | "PENDING"
  | "EXPIRED"
  | "SUSPENDED"
  | "CANCELLED"
  | "OVERDUE"
  | "PAID"
  | "PARTIAL"
  | "REFUNDED"
  | "DRAFT"
  | "INACTIVE"
  | "COMPLETED"
  | "WARNING";

const statusVariantMap: Record<string, StatusVariant> = {
  ACTIVE: "success",
  PAID: "success",
  COMPLETED: "success",
  VERIFIED: "success",
  TRIAL: "info",
  PENDING: "info",
  IN_PROGRESS: "info",
  WARNING: "warning",
  PARTIAL: "warning",
  GRACE_PERIOD: "warning",
  EXPIRED: "danger",
  OVERDUE: "danger",
  SUSPENDED: "danger",
  CANCELLED: "danger",
  REFUNDED: "danger",
  FAILED: "danger",
  DRAFT: "neutral",
  INACTIVE: "neutral",
  ARCHIVED: "neutral",
};

const variantStyles: Record<
  StatusVariant,
  { badge: string; dot: string }
> = {
  success: {
    badge: "bg-[#ECFDF5] text-[#065F46] border-[#A7F3D0]/60",
    dot: "bg-[#059669]",
  },
  info: {
    badge: "bg-[#F0F9FF] text-[#075985] border-[#BAE6FD]/60",
    dot: "bg-[#0284C7]",
  },
  warning: {
    badge: "bg-[#FFFBEB] text-[#92400E] border-[#FDE68A]/60",
    dot: "bg-[#D97706]",
  },
  danger: {
    badge: "bg-[#FEF2F2] text-[#991B1B] border-[#FECACA]/60",
    dot: "bg-[#DC2626]",
  },
  neutral: {
    badge: "bg-[#F1F5F9] text-[#334155] border-[#E2E8F0]",
    dot: "bg-[#64748B]",
  },
};

export interface StatusBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  status?: KnownStatus | string;
  variant?: StatusVariant;
  label?: string;
  showDot?: boolean;
  size?: "sm" | "md" | "lg";
}

export function StatusBadge({
  status,
  variant,
  label,
  showDot = true,
  size = "md",
  className = "",
  ...props
}: StatusBadgeProps) {
  const normalizedKey = (status || "").toUpperCase().replace(/[\s-]/g, "_");
  const resolvedVariant: StatusVariant =
    variant || statusVariantMap[normalizedKey] || "neutral";

  const styles = variantStyles[resolvedVariant];

  const sizeStyles = {
    sm: "px-2 py-0.5 text-[11px] gap-1",
    md: "px-2.5 py-0.5 text-xs gap-1.5",
    lg: "px-3 py-1 text-sm gap-2",
  }[size];

  const dotSizes = {
    sm: "h-1 w-1",
    md: "h-1.5 w-1.5",
    lg: "h-2 w-2",
  }[size];

  const displayLabel =
    label ||
    (status
      ? status
          .replace(/[_-]/g, " ")
          .replace(/\b\w/g, (c) => c.toUpperCase())
      : resolvedVariant);

  return (
    <span
      className={`inline-flex items-center font-medium rounded-full border transition-colors ${styles.badge} ${sizeStyles} ${className}`}
      {...props}
    >
      {showDot && (
        <span
          className={`shrink-0 rounded-full animate-pulse ${dotSizes} ${styles.dot}`}
          aria-hidden="true"
        />
      )}
      <span>{displayLabel}</span>
    </span>
  );
}

"use client";

import * as React from "react";
import Link from "next/link";
import { ChevronRight, ArrowLeft } from "lucide-react";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export interface PageHeaderProps {
  title: string;
  description?: string | React.ReactNode;
  badge?: React.ReactNode;
  actions?: React.ReactNode;
  breadcrumbs?: BreadcrumbItem[];
  backHref?: string;
  backLabel?: string;
  className?: string;
}

export function PageHeader({
  title,
  description,
  badge,
  actions,
  breadcrumbs,
  backHref,
  backLabel,
  className = "",
}: PageHeaderProps) {
  return (
    <div className={`mb-6 flex flex-col gap-3 ${className}`}>
      {/* Back button or Breadcrumbs */}
      {backHref && (
        <div className="mb-1">
          <Link
            href={backHref}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-[#64748B] hover:text-[#0B6B4F] transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>{backLabel || "Back"}</span>
          </Link>
        </div>
      )}

      {breadcrumbs && breadcrumbs.length > 0 && !backHref && (
        <nav aria-label="Breadcrumbs" className="flex items-center gap-1.5 text-xs text-[#64748B]">
          {breadcrumbs.map((crumb, idx) => {
            const isLast = idx === breadcrumbs.length - 1;
            return (
              <React.Fragment key={idx}>
                {idx > 0 && <ChevronRight className="h-3 w-3 text-[#94A3B8]" />}
                {crumb.href && !isLast ? (
                  <Link
                    href={crumb.href}
                    className="hover:text-[#0B6B4F] transition-colors"
                  >
                    {crumb.label}
                  </Link>
                ) : (
                  <span className={isLast ? "font-medium text-[#0F172A]" : ""}>
                    {crumb.label}
                  </span>
                )}
              </React.Fragment>
            );
          })}
        </nav>
      )}

      {/* Main Header Row */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-1 min-w-0">
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="font-heading text-xl sm:text-2xl font-bold tracking-tight text-[#0F172A] truncate">
              {title}
            </h1>
            {badge && <div className="shrink-0">{badge}</div>}
          </div>
          {description && (
            <div className="text-xs sm:text-sm text-[#5F6B65]">
              {description}
            </div>
          )}
        </div>

        {actions && (
          <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
}


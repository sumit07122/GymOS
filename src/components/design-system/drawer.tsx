"use client";

import * as React from "react";
import { X } from "lucide-react";

export interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  position?: "right" | "left";
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

export function Drawer({
  isOpen,
  onClose,
  title,
  description,
  children,
  footer,
  position = "right",
  size = "md",
  className = "",
}: DrawerProps) {
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sizeClasses = {
    sm: "w-80",
    md: "w-[440px]",
    lg: "w-[600px]",
    xl: "w-[760px]",
  }[size];

  const positionClasses =
    position === "right"
      ? "right-0 border-l border-[#E3E7E4] animate-in slide-in-from-right duration-300"
      : "left-0 border-r border-[#E3E7E4] animate-in slide-in-from-left duration-300";

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-[#0F172A]/40 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer Surface */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="drawer-title"
        className={`fixed inset-y-0 ${positionClasses} flex max-w-full flex-col bg-white shadow-2xl ${sizeClasses} ${className}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#E3E7E4] px-6 py-4 shrink-0">
          <div>
            <h2
              id="drawer-title"
              className="font-heading text-base font-bold text-[#0F172A]"
            >
              {title}
            </h2>
            {description && (
              <p className="mt-0.5 text-xs text-[#5F6B65]">{description}</p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-[#94A3B8] hover:bg-[#F1F5F9] hover:text-[#0F172A] transition-colors -mr-1"
            aria-label="Close drawer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-4 text-xs text-[#0F172A]">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="flex items-center justify-end gap-2.5 border-t border-[#E3E7E4] bg-[#F8FAFC] px-6 py-3.5 shrink-0">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

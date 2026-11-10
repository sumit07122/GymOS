"use client";

import * as React from "react";
import { X } from "lucide-react";

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: "sm" | "md" | "lg" | "xl" | "full";
  closeOnOutsideClick?: boolean;
  className?: string;
}

export function Modal({
  isOpen,
  onClose,
  title,
  description,
  children,
  footer,
  size = "md",
  closeOnOutsideClick = true,
  className = "",
}: ModalProps) {
  // Handle ESC key
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
    sm: "max-w-sm",
    md: "max-w-lg",
    lg: "max-w-2xl",
    xl: "max-w-4xl",
    full: "max-w-[calc(100vw-2rem)] h-[calc(100vh-2rem)]",
  }[size];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-[#0F172A]/40 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
        onClick={() => closeOnOutsideClick && onClose()}
        aria-hidden="true"
      />

      {/* Dialog Surface */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        aria-describedby={description ? "modal-description" : undefined}
        className={`relative w-full ${sizeClasses} rounded-xl border border-[#E3E7E4] bg-white shadow-xl transition-all animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh] z-10 ${className}`}
      >
        {/* Header */}
        <div className="flex items-start justify-between border-b border-[#E3E7E4] px-5 py-4 shrink-0">
          <div>
            <h2
              id="modal-title"
              className="font-heading text-base sm:text-lg font-bold text-[#0F172A]"
            >
              {title}
            </h2>
            {description && (
              <p
                id="modal-description"
                className="mt-0.5 text-xs text-[#5F6B65]"
              >
                {description}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-[#94A3B8] hover:bg-[#F1F5F9] hover:text-[#0F172A] transition-colors -mr-1"
            aria-label="Close dialog"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="overflow-y-auto px-5 py-4 flex-1 text-xs text-[#0F172A]">
          {children}
        </div>

        {/* Optional Footer */}
        {footer && (
          <div className="flex items-center justify-end gap-2.5 border-t border-[#E3E7E4] bg-[#F8FAFC] px-5 py-3.5 rounded-b-xl shrink-0">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}


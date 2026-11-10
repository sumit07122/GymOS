"use client";

import * as React from "react";
import { AlertCircle } from "lucide-react";

export interface FormFieldProps {
  label: string;
  name?: string;
  required?: boolean;
  hint?: string;
  error?: string;
  children: React.ReactNode;
  className?: string;
}

export function FormField({
  label,
  name,
  required,
  hint,
  error,
  children,
  className = "",
}: FormFieldProps) {
  const fieldId = name || label.toLowerCase().replace(/\s+/g, "-");

  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      <div className="flex items-center justify-between">
        <label
          htmlFor={fieldId}
          className="text-xs font-semibold text-[#0F172A] select-none"
        >
          {label}
          {required && <span className="ml-0.5 text-[#DC2626]">*</span>}
        </label>
        {hint && !error && (
          <span className="text-[11px] text-[#64748B]">{hint}</span>
        )}
      </div>

      <div className="relative">{children}</div>

      {error && (
        <div
          role="alert"
          className="flex items-center gap-1 text-[11px] font-medium text-[#DC2626]"
        >
          <AlertCircle className="h-3 w-3 shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className = "", error, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={`w-full rounded-lg border bg-white px-3 py-2 text-xs text-[#0F172A] placeholder:text-[#94A3B8] transition-colors focus:outline-hidden ${
          error
            ? "border-[#DC2626] focus:border-[#DC2626] focus:ring-1 focus:ring-[#DC2626]"
            : "border-[#E3E7E4] focus:border-[#0B6B4F] focus:ring-1 focus:ring-[#0B6B4F]"
        } disabled:bg-[#F8FAFC] disabled:text-[#94A3B8] disabled:cursor-not-allowed ${className}`}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export interface SelectProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {
  error?: boolean;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className = "", error, children, ...props }, ref) => {
    return (
      <select
        ref={ref}
        className={`w-full rounded-lg border bg-white px-3 py-2 text-xs text-[#0F172A] transition-colors focus:outline-hidden ${
          error
            ? "border-[#DC2626] focus:border-[#DC2626] focus:ring-1 focus:ring-[#DC2626]"
            : "border-[#E3E7E4] focus:border-[#0B6B4F] focus:ring-1 focus:ring-[#0B6B4F]"
        } disabled:bg-[#F8FAFC] disabled:text-[#94A3B8] disabled:cursor-not-allowed ${className}`}
        {...props}
      >
        {children}
      </select>
    );
  }
);
Select.displayName = "Select";

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className = "", error, ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        className={`w-full rounded-lg border bg-white px-3 py-2 text-xs text-[#0F172A] placeholder:text-[#94A3B8] transition-colors focus:outline-hidden ${
          error
            ? "border-[#DC2626] focus:border-[#DC2626] focus:ring-1 focus:ring-[#DC2626]"
            : "border-[#E3E7E4] focus:border-[#0B6B4F] focus:ring-1 focus:ring-[#0B6B4F]"
        } disabled:bg-[#F8FAFC] disabled:text-[#94A3B8] disabled:cursor-not-allowed ${className}`}
        {...props}
      />
    );
  }
);
Textarea.displayName = "Textarea";


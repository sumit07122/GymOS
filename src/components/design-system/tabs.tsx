"use client";

import * as React from "react";

export interface TabItem {
  id: string;
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  count?: number | string;
  disabled?: boolean;
}

export interface TabsProps {
  tabs: TabItem[];
  activeTab: string;
  onChange: (tabId: string) => void;
  variant?: "pills" | "underline";
  size?: "sm" | "md";
  className?: string;
}

export function Tabs({
  tabs,
  activeTab,
  onChange,
  variant = "pills",
  size = "md",
  className = "",
}: TabsProps) {
  if (variant === "underline") {
    return (
      <div className={`border-b border-[#E3E7E4] ${className}`}>
        <nav
          aria-label="Tabs"
          className="-mb-px flex space-x-6 overflow-x-auto scrollbar-none"
        >
          {tabs.map((tab) => {
            const isActive = tab.id === activeTab;
            const Icon = tab.icon;

            return (
              <button
                key={tab.id}
                type="button"
                disabled={tab.disabled}
                onClick={() => !tab.disabled && onChange(tab.id)}
                className={`inline-flex items-center gap-2 border-b-2 py-3 px-1 text-xs sm:text-sm font-medium transition-colors whitespace-nowrap ${
                  isActive
                    ? "border-[#0B6B4F] text-[#0B6B4F] font-semibold"
                    : "border-transparent text-[#64748B] hover:border-[#CBD5E1] hover:text-[#0F172A]"
                } ${tab.disabled ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                {Icon && <Icon className="h-4 w-4" />}
                <span>{tab.label}</span>
                {tab.count !== undefined && (
                  <span
                    className={`rounded-full px-1.5 py-0.2 text-[10px] font-semibold ${
                      isActive
                        ? "bg-[#E4F2EB] text-[#0B6B4F]"
                        : "bg-[#F1F5F9] text-[#64748B]"
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>
    );
  }

  // Pills variant
  const sizeClasses = {
    sm: "p-0.5 text-xs",
    md: "p-1 text-xs sm:text-sm",
  }[size];

  const itemSizeClasses = {
    sm: "px-2.5 py-1 text-xs",
    md: "px-3 py-1.5 text-xs sm:text-sm",
  }[size];

  return (
    <div
      className={`inline-flex rounded-xl border border-[#E3E7E4] bg-[#F8FAFC] ${sizeClasses} ${className}`}
    >
      {tabs.map((tab) => {
        const isActive = tab.id === activeTab;
        const Icon = tab.icon;

        return (
          <button
            key={tab.id}
            type="button"
            disabled={tab.disabled}
            onClick={() => !tab.disabled && onChange(tab.id)}
            className={`inline-flex items-center gap-1.5 rounded-lg font-medium transition-all ${itemSizeClasses} ${
              isActive
                ? "bg-white text-[#0B6B4F] shadow-xs font-semibold"
                : "text-[#64748B] hover:text-[#0F172A]"
            } ${tab.disabled ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            {Icon && <Icon className="h-3.5 w-3.5" />}
            <span>{tab.label}</span>
            {tab.count !== undefined && (
              <span
                className={`rounded-full px-1.5 py-0.2 text-[10px] font-semibold ${
                  isActive
                    ? "bg-[#E4F2EB] text-[#0B6B4F]"
                    : "bg-[#E2E8F0] text-[#64748B]"
                }`}
              >
                {tab.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}


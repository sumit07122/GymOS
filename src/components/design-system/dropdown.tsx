"use client";

import * as React from "react";
import { MoreHorizontal } from "lucide-react";

export interface DropdownItem {
  id: string;
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  onClick?: () => void;
  variant?: "default" | "danger" | "teal";
  disabled?: boolean;
  divider?: boolean;
  shortcut?: string;
}

export interface DropdownProps {
  items: DropdownItem[];
  trigger?: React.ReactNode;
  align?: "left" | "right";
  className?: string;
}

export function Dropdown({
  items,
  trigger,
  align = "right",
  className = "",
}: DropdownProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  // Close when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const handleItemClick = (item: DropdownItem) => {
    if (item.disabled) return;
    setIsOpen(false);
    item.onClick?.();
  };

  return (
    <div ref={dropdownRef} className={`relative inline-block text-left ${className}`}>
      {/* Trigger */}
      <div onClick={() => setIsOpen(!isOpen)}>
        {trigger || (
          <button
            type="button"
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#E3E7E4] bg-white text-[#64748B] hover:bg-[#F8FAFC] hover:text-[#0F172A] transition-colors"
            aria-label="Open menu"
            aria-expanded={isOpen}
          >
            <MoreHorizontal className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Popover Menu */}
      {isOpen && (
        <div
          role="menu"
          aria-orientation="vertical"
          className={`absolute ${
            align === "right" ? "right-0" : "left-0"
          } mt-1.5 w-52 origin-top-right rounded-xl border border-[#E3E7E4] bg-white p-1 shadow-lg ring-1 ring-black/5 focus:outline-hidden z-50 animate-in fade-in-50 zoom-in-95 duration-150`}
        >
          {items.map((item, index) => {
            const Icon = item.icon;
            const isDanger = item.variant === "danger";
            const isTeal = item.variant === "teal";

            return (
              <React.Fragment key={item.id || index}>
                {item.divider && (
                  <div className="my-1 border-t border-[#E3E7E4]" />
                )}
                <button
                  type="button"
                  role="menuitem"
                  disabled={item.disabled}
                  onClick={() => handleItemClick(item)}
                  className={`flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors ${
                    item.disabled
                      ? "opacity-50 cursor-not-allowed text-[#94A3B8]"
                      : isDanger
                      ? "text-[#DC2626] hover:bg-[#FEF2F2]"
                      : isTeal
                      ? "text-[#0B6B4F] hover:bg-[#E4F2EB]"
                      : "text-[#0F172A] hover:bg-[#F8FAFC]"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {Icon && (
                      <Icon
                        className={`h-3.5 w-3.5 ${
                          isDanger
                            ? "text-[#DC2626]"
                            : isTeal
                            ? "text-[#0B6B4F]"
                            : "text-[#64748B]"
                        }`}
                      />
                    )}
                    <span>{item.label}</span>
                  </div>
                  {item.shortcut && (
                    <span className="text-[10px] text-[#94A3B8] font-mono">
                      {item.shortcut}
                    </span>
                  )}
                </button>
              </React.Fragment>
            );
          })}
        </div>
      )}
    </div>
  );
}


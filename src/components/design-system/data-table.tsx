"use client";

import * as React from "react";
import {
  ChevronDown,
  ChevronUp,
  ChevronsUpDown,
  Search,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

export interface Column<T> {
  key: string;
  header: string;
  sortable?: boolean;
  align?: "left" | "center" | "right";
  width?: string;
  render?: (row: T, index: number) => React.ReactNode;
}

export interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyExtractor: (item: T, index: number) => string;
  searchable?: boolean;
  searchPlaceholder?: string;
  searchFields?: (keyof T)[];
  pageSize?: number;
  emptyState?: React.ReactNode;
  isLoading?: boolean;
  onRowClick?: (item: T) => void;
  className?: string;
}

export function DataTable<T extends Record<string, unknown>>({
  columns,
  data,
  keyExtractor,
  searchable = true,
  searchPlaceholder = "Search records...",
  searchFields,
  pageSize = 10,
  emptyState,
  isLoading = false,
  onRowClick,
  className = "",
}: DataTableProps<T>) {
  const [searchQuery, setSearchQuery] = React.useState("");
  const [sortKey, setSortKey] = React.useState<string | null>(null);
  const [sortOrder, setSortOrder] = React.useState<"asc" | "desc">("asc");
  const [currentPage, setCurrentPage] = React.useState(1);

  // Filter Data
  const filteredData = React.useMemo(() => {
    if (!searchQuery.trim()) return data;
    const q = searchQuery.toLowerCase();

    return data.filter((row) => {
      if (searchFields && searchFields.length > 0) {
        return searchFields.some((field) => {
          const val = row[field];
          return val !== null && val !== undefined && String(val).toLowerCase().includes(q);
        });
      }
      return Object.values(row).some((val) => {
        if (typeof val === "string" || typeof val === "number") {
          return String(val).toLowerCase().includes(q);
        }
        return false;
      });
    });
  }, [data, searchQuery, searchFields]);

  // Sort Data
  const sortedData = React.useMemo(() => {
    if (!sortKey) return filteredData;

    return [...filteredData].sort((a, b) => {
      const aVal = a[sortKey];
      const bVal = b[sortKey];

      if (aVal === bVal) return 0;
      if (aVal === null || aVal === undefined) return 1;
      if (bVal === null || bVal === undefined) return -1;

      if (typeof aVal === "number" && typeof bVal === "number") {
        return sortOrder === "asc" ? aVal - bVal : bVal - aVal;
      }

      return sortOrder === "asc"
        ? String(aVal).localeCompare(String(bVal))
        : String(bVal).localeCompare(String(aVal));
    });
  }, [filteredData, sortKey, sortOrder]);

  // Pagination
  const totalPages = Math.ceil(sortedData.length / pageSize) || 1;
  const paginatedData = React.useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedData.slice(start, start + pageSize);
  }, [sortedData, currentPage, pageSize]);

  const handleSort = (key: string) => {
    if (sortKey === key) {
      if (sortOrder === "asc") {
        setSortOrder("desc");
      } else {
        setSortKey(null);
        setSortOrder("asc");
      }
    } else {
      setSortKey(key);
      setSortOrder("asc");
    }
    setCurrentPage(1);
  };

  const clearSearch = () => {
    setSearchQuery("");
    setCurrentPage(1);
  };

  return (
    <div className={`flex flex-col gap-3 ${className}`}>
      {/* Search and Filter Bar */}
      {searchable && (
        <div className="flex items-center justify-between gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#94A3B8]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder={searchPlaceholder}
              className="w-full rounded-lg border border-[#E3E7E4] bg-white py-1.5 pl-8 pr-8 text-xs text-[#0F172A] placeholder:text-[#94A3B8] focus:border-[#0B6B4F] focus:outline-hidden focus:ring-1 focus:ring-[#0B6B4F]"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={clearSearch}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-[#0F172A]"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
          <div className="text-xs text-[#64748B] num">
            Showing <span className="font-medium text-[#0F172A]">{sortedData.length}</span> results
          </div>
        </div>
      )}

      {/* Table Container */}
      <div className="overflow-hidden rounded-xl border border-[#E3E7E4] bg-white shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-[#0F172A]">
            <thead className="border-b border-[#E3E7E4] bg-[#F8FAFC]">
              <tr>
                {columns.map((col) => {
                  const isSorted = sortKey === col.key;
                  return (
                    <th
                      key={col.key}
                      style={{ width: col.width }}
                      className={`px-4 py-3 font-semibold uppercase tracking-wider text-[11px] text-[#64748B] select-none ${
                        col.align === "center"
                          ? "text-center"
                          : col.align === "right"
                          ? "text-right"
                          : "text-left"
                      }`}
                    >
                      {col.sortable ? (
                        <button
                          type="button"
                          onClick={() => handleSort(col.key)}
                          className="inline-flex items-center gap-1 hover:text-[#0F172A] transition-colors"
                        >
                          <span>{col.header}</span>
                          {isSorted ? (
                            sortOrder === "asc" ? (
                              <ChevronUp className="h-3.5 w-3.5 text-[#0B6B4F]" />
                            ) : (
                              <ChevronDown className="h-3.5 w-3.5 text-[#0B6B4F]" />
                            )
                          ) : (
                            <ChevronsUpDown className="h-3 w-3 text-[#94A3B8]" />
                          )}
                        </button>
                      ) : (
                        col.header
                      )}
                    </th>
                  );
                })}
              </tr>
            </thead>

            <tbody className="divide-y divide-[#E3E7E4]">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, rIdx) => (
                  <tr key={rIdx} className="animate-pulse">
                    {columns.map((col, cIdx) => (
                      <td key={cIdx} className="px-4 py-3.5">
                        <div className="h-3.5 rounded bg-slate-100" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : paginatedData.length === 0 ? (
                <tr>
                  <td colSpan={columns.length} className="px-4 py-12 text-center">
                    {emptyState || (
                      <div className="flex flex-col items-center justify-center text-center">
                        <p className="text-sm font-medium text-[#0F172A]">No records found</p>
                        <p className="mt-1 text-xs text-[#64748B]">
                          {searchQuery
                            ? "Try adjusting your search criteria"
                            : "There is no data to display yet"}
                        </p>
                      </div>
                    )}
                  </td>
                </tr>
              ) : (
                paginatedData.map((row, index) => (
                  <tr
                    key={keyExtractor(row, index)}
                    onClick={() => onRowClick && onRowClick(row)}
                    className={`transition-colors ${
                      onRowClick ? "cursor-pointer hover:bg-[#F8FAFC]" : "hover:bg-[#F8FAFC]/60"
                    }`}
                  >
                    {columns.map((col) => (
                      <td
                        key={col.key}
                        className={`px-4 py-3 align-middle ${
                          col.align === "center"
                            ? "text-center"
                            : col.align === "right"
                            ? "text-right"
                            : "text-left"
                        }`}
                      >
                        {col.render
                          ? col.render(row, index)
                          : String(row[col.key] ?? "-")}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-[#E3E7E4] px-4 py-2.5 bg-[#F8FAFC] text-xs text-[#64748B]">
            <div>
              Page <span className="font-medium text-[#0F172A]">{currentPage}</span> of{" "}
              <span className="font-medium text-[#0F172A]">{totalPages}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                disabled={currentPage <= 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-[#E3E7E4] bg-white text-[#64748B] hover:text-[#0F172A] disabled:opacity-40 disabled:cursor-not-allowed"
                title="Previous page"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                type="button"
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-[#E3E7E4] bg-white text-[#64748B] hover:text-[#0F172A] disabled:opacity-40 disabled:cursor-not-allowed"
                title="Next page"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}


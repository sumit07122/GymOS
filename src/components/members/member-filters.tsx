"use client";

import * as React from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Search, Filter, RotateCcw, Download, Upload, Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface MemberFiltersProps {
  gymSlug: string;
  plans: { id: string; name: string }[];
  onOpenImportModal: () => void;
}

export function MemberFilters({
  gymSlug,
  plans,
  onOpenImportModal,
}: MemberFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const currentSearch = searchParams.get("search") || "";
  const currentStatus = searchParams.get("status") || "ALL";
  const currentPlan = searchParams.get("planId") || "ALL";
  const currentSort = searchParams.get("sortBy") || "joiningDate";

  const [searchTerm, setSearchTerm] = React.useState(currentSearch);

  const applyFilters = (updates: Record<string, string>) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", "1"); // Reset to page 1 on filter change

    Object.entries(updates).forEach(([key, val]) => {
      if (val && val !== "ALL") {
        params.set(key, val);
      } else {
        params.delete(key);
      }
    });

    router.push(`${pathname}?${params.toString()}`);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    applyFilters({ search: searchTerm });
  };

  const handleReset = () => {
    setSearchTerm("");
    router.push(pathname);
  };

  const exportUrl = `/api/gym/${gymSlug}/members/export?${searchParams.toString()}`;

  return (
    <div className="space-y-3">
      {/* Top action row */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Member Management
          </h1>
          <p className="text-xs text-slate-500">
            Manage your gym roster, membership assignments, profiles, and attendance passes.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* CSV Export */}
          <a
            href={exportUrl}
            download
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 shadow-xs hover:bg-slate-50 transition"
          >
            <Download className="h-3.5 w-3.5 text-slate-500" />
            <span>Export CSV</span>
          </a>

          {/* CSV Import */}
          <Button
            type="button"
            variant="outline"
            onClick={onOpenImportModal}
            className="text-xs h-9 gap-1.5"
          >
            <Upload className="h-3.5 w-3.5 text-slate-500" />
            <span>Import CSV</span>
          </Button>

          {/* Add Member button */}
          <Link
            href={`/${gymSlug}/members/new`}
            className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3.5 py-2 text-xs font-semibold text-white shadow-xs hover:bg-emerald-700 transition"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Add Member</span>
          </Link>
        </div>
      </div>

      {/* Filter bar */}
      <div className="flex flex-col gap-2 rounded-xl border border-slate-200 bg-white p-3 shadow-xs md:flex-row md:items-center md:justify-between">
        <form onSubmit={handleSearchSubmit} className="flex-1 min-w-[240px]">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name, phone, email, or member code..."
              className="pl-9 text-xs h-9 bg-slate-50 border-slate-200"
            />
          </div>
        </form>

        <div className="flex flex-wrap items-center gap-2">
          {/* Status filter */}
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <Filter className="h-3.5 w-3.5 text-slate-400" />
            <select
              value={currentStatus}
              onChange={(e) => applyFilters({ status: e.target.value })}
              className="rounded-md border border-slate-200 bg-slate-50 h-9 px-2 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            >
              <option value="ALL">All Statuses</option>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
              <option value="EXPIRED">Expired</option>
              <option value="FROZEN">Frozen</option>
              <option value="CANCELLED">Cancelled</option>
              <option value="ARCHIVED">Archived</option>
            </select>
          </div>

          {/* Plan filter */}
          {plans.length > 0 && (
            <select
              value={currentPlan}
              onChange={(e) => applyFilters({ planId: e.target.value })}
              className="rounded-md border border-slate-200 bg-slate-50 h-9 px-2 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500 max-w-[160px] truncate"
            >
              <option value="ALL">All Plans</option>
              {plans.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          )}

          {/* Sort selector */}
          <select
            value={currentSort}
            onChange={(e) => applyFilters({ sortBy: e.target.value })}
            className="rounded-md border border-slate-200 bg-slate-50 h-9 px-2 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          >
            <option value="joiningDate">Sort: Joining Date</option>
            <option value="name">Sort: Name (A-Z)</option>
            <option value="code">Sort: Member Code</option>
            <option value="status">Sort: Status</option>
          </select>

          {/* Reset Filters */}
          {(currentSearch || currentStatus !== "ALL" || currentPlan !== "ALL" || currentSort !== "joiningDate") && (
            <Button
              type="button"
              variant="ghost"
              onClick={handleReset}
              className="text-xs h-9 px-2 text-slate-500 hover:text-slate-900"
            >
              <RotateCcw className="h-3.5 w-3.5 mr-1" />
              Reset
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}


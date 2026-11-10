"use client";

import * as React from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { updateGymAccountStatusAction } from "@/lib/actions/platform-admin";
import { GymStatus } from "@prisma/client";
import {
  Building2,
  Search,
  CheckCircle2,
  ExternalLink,
  ShieldAlert,
  Loader2,
} from "lucide-react";

interface GymItem {
  id: string;
  name: string;
  slug: string;
  email: string | null;
  phone: string | null;
  city: string | null;
  country: string;
  currency: string;
  timezone: string;
  status: GymStatus;
  createdAt: string;
  memberCount: number;
  staffCount: number;
  classesCount: number;
  owner: {
    id: string;
    name: string | null;
    email: string | null;
  } | null;
  subscription: {
    id: string;
    status: string;
    billingPeriod: string;
    planName: string;
    planCode: string;
    currentPeriodEnd: string;
    trialEndsAt: string | null;
  } | null;
}

interface GymsManagementProps {
  initialGyms: GymItem[];
  totalCount: number;
}

export function GymsManagement({ initialGyms }: GymsManagementProps) {
  const [gyms, setGyms] = React.useState<GymItem[]>(initialGyms);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<string>("ALL");

  // Modal State for Suspend / Reactivate
  const [selectedGym, setSelectedGym] = React.useState<GymItem | null>(null);
  const [newStatus, setNewStatus] = React.useState<GymStatus>(GymStatus.SUSPENDED);
  const [reason, setReason] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [modalError, setModalError] = React.useState<string | null>(null);

  const statusBadgeStyle: Record<string, string> = {
    ACTIVE: "bg-emerald-50 text-emerald-700 border-emerald-200",
    TRIAL: "bg-blue-50 text-blue-700 border-blue-200",
    SUSPENDED: "bg-rose-50 text-rose-700 border-rose-200",
    INACTIVE: "bg-slate-100 text-slate-700 border-slate-200",
  };

  const filteredGyms = gyms.filter((g) => {
    const matchesStatus = statusFilter === "ALL" || g.status === statusFilter;
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      g.name.toLowerCase().includes(q) ||
      g.slug.toLowerCase().includes(q) ||
      (g.email && g.email.toLowerCase().includes(q)) ||
      (g.owner?.email && g.owner.email.toLowerCase().includes(q));

    return matchesStatus && matchesSearch;
  });

  const handleOpenStatusModal = (gym: GymItem, targetStatus: GymStatus) => {
    setSelectedGym(gym);
    setNewStatus(targetStatus);
    setReason("");
    setModalError(null);
  };

  const handleConfirmStatusChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGym) return;

    if (!reason.trim() || reason.trim().length < 3) {
      setModalError("Please provide an audit reason of at least 3 characters.");
      return;
    }

    setIsSubmitting(true);
    setModalError(null);

    try {
      const res = await updateGymAccountStatusAction(selectedGym.id, {
        status: newStatus,
        reason: reason.trim(),
      });

      if (res.success && res.status) {
        setGyms((prev) =>
          prev.map((g) => (g.id === selectedGym.id ? { ...g, status: res.status } : g))
        );
        setSelectedGym(null);
      } else {
        setModalError(res.error || "Failed to update gym status.");
      }
    } catch {
      setModalError("Unexpected error occurred while updating status.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Building2 className="h-6 w-6 text-slate-800" />
            <span>Registered Gym Workspaces</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Manage multi-tenant gym accounts, SaaS subscriptions, and account security.
          </p>
        </div>
      </div>

      {/* Search and Filters Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by gym name, slug, or owner email..."
            className="pl-9 text-xs h-9"
          />
        </div>

        {/* Status Filter Pills */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-100 border border-slate-200 self-start sm:self-auto">
          {["ALL", "ACTIVE", "TRIAL", "SUSPENDED", "INACTIVE"].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                statusFilter === st
                  ? "bg-white text-slate-900 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Gyms Table */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[10px] font-bold">
              <tr>
                <th className="px-5 py-3">Gym Workspace</th>
                <th className="px-5 py-3">Owner / Contact</th>
                <th className="px-5 py-3">SaaS Tier & Status</th>
                <th className="px-5 py-3">Members</th>
                <th className="px-5 py-3">Account Status</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredGyms.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-slate-400">
                    No gyms match the selected search or status criteria.
                  </td>
                </tr>
              ) : (
                filteredGyms.map((gym) => {
                  const badgeClass =
                    statusBadgeStyle[gym.status] || "bg-slate-100 text-slate-700 border-slate-200";

                  return (
                    <tr key={gym.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-5 py-3.5">
                        <Link
                          href={`/admin/gyms/${gym.id}`}
                          className="font-bold text-slate-900 hover:text-indigo-600 transition-colors block"
                        >
                          {gym.name}
                        </Link>
                        <span className="text-[11px] text-slate-400 font-mono">
                          /{gym.slug} • {gym.currency}
                        </span>
                      </td>

                      <td className="px-5 py-3.5">
                        {gym.owner ? (
                          <div>
                            <span className="font-semibold text-slate-800 block">
                              {gym.owner.name || "Owner"}
                            </span>
                            <span className="text-[11px] text-slate-400">
                              {gym.owner.email}
                            </span>
                          </div>
                        ) : (
                          <span className="text-slate-400 text-[11px]">Unassigned</span>
                        )}
                      </td>

                      <td className="px-5 py-3.5">
                        {gym.subscription ? (
                          <div>
                            <span className="font-bold text-slate-900 block">
                              {gym.subscription.planName}
                            </span>
                            <span className="text-[10px] uppercase font-semibold text-slate-500">
                              {gym.subscription.billingPeriod} • {gym.subscription.status}
                            </span>
                          </div>
                        ) : (
                          <Badge variant="outline" className="text-[10px] text-slate-400 border-dashed">
                            No SaaS Plan
                          </Badge>
                        )}
                      </td>

                      <td className="px-5 py-3.5">
                        <span className="font-bold text-slate-900">{gym.memberCount}</span>
                        <span className="text-slate-400 text-[11px] block">
                          {gym.staffCount} staff
                        </span>
                      </td>

                      <td className="px-5 py-3.5">
                        <Badge variant="outline" className={`${badgeClass} text-[10px] font-bold`}>
                          {gym.status}
                        </Badge>
                      </td>

                      <td className="px-5 py-3.5 text-right space-x-2">
                        <Link
                          href={`/admin/gyms/${gym.id}`}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
                        >
                          <span>Manage</span>
                          <ExternalLink className="h-3 w-3" />
                        </Link>

                        {gym.status === GymStatus.SUSPENDED ? (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleOpenStatusModal(gym, GymStatus.ACTIVE)}
                            className="h-7 text-xs border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                          >
                            Reactivate
                          </Button>
                        ) : (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleOpenStatusModal(gym, GymStatus.SUSPENDED)}
                            className="h-7 text-xs border-rose-200 text-rose-700 hover:bg-rose-50"
                          >
                            Suspend
                          </Button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Suspend / Reactivate Audit Modal */}
      {selectedGym && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200 space-y-4">
            <div className="flex items-center gap-3">
              <div
                className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 ${
                  newStatus === GymStatus.SUSPENDED
                    ? "bg-rose-100 text-rose-700"
                    : "bg-emerald-100 text-emerald-700"
                }`}
              >
                {newStatus === GymStatus.SUSPENDED ? (
                  <ShieldAlert className="h-5 w-5" />
                ) : (
                  <CheckCircle2 className="h-5 w-5" />
                )}
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  {newStatus === GymStatus.SUSPENDED ? "Suspend Gym Workspace" : "Reactivate Gym Workspace"}
                </h3>
                <p className="text-xs text-slate-500">
                  Target: <strong>{selectedGym.name}</strong> (/{selectedGym.slug})
                </p>
              </div>
            </div>

            {newStatus === GymStatus.SUSPENDED && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs">
                Suspending this gym will immediately block owner, staff, and member login. All SaaS feature entitlements and public website pages will be deactivated.
              </div>
            )}

            {modalError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
                {modalError}
              </div>
            )}

            <form onSubmit={handleConfirmStatusChange} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Mandatory Audit Reason
                </label>
                <textarea
                  rows={3}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="e.g. Terms of Service violation, non-payment, owner requested reactivation..."
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-900"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setSelectedGym(null)}
                  className="text-xs"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className={`text-xs ${
                    newStatus === GymStatus.SUSPENDED
                      ? "bg-rose-600 hover:bg-rose-700 text-white"
                      : "bg-emerald-600 hover:bg-emerald-700 text-white"
                  }`}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
                      <span>Updating...</span>
                    </>
                  ) : (
                    <span>Confirm {newStatus === GymStatus.SUSPENDED ? "Suspension" : "Reactivation"}</span>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

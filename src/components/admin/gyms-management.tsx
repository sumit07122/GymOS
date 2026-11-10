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
  PlusCircle,
  Clock,
  AlertTriangle,
} from "lucide-react";
import { PageHeader } from "@/components/design-system/page-header";
import { StatCard } from "@/components/design-system/stat-card";
import { StatusBadge } from "@/components/design-system/status-badge";

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

export function GymsManagement({ initialGyms, totalCount }: GymsManagementProps) {
  const [gyms, setGyms] = React.useState<GymItem[]>(initialGyms);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<string>("ALL");

  // Modal State for Suspend / Reactivate
  const [selectedGym, setSelectedGym] = React.useState<GymItem | null>(null);
  const [newStatus, setNewStatus] = React.useState<GymStatus>(GymStatus.SUSPENDED);
  const [reason, setReason] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [modalError, setModalError] = React.useState<string | null>(null);

  const activeCount = gyms.filter((g) => g.status === "ACTIVE").length;
  const trialCount = gyms.filter((g) => g.status === "TRIAL").length;
  const suspendedCount = gyms.filter((g) => g.status === "SUSPENDED").length;

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
      <PageHeader
        title="Registered Gym Workspaces"
        description="Oversee multi-tenant gym instances, subscription lifecycle, owner assignments, and access enforcement."
        actions={
          <Link href="/platform-admin/gyms/new">
            <Button className="bg-pine hover:bg-pine/90 text-white font-semibold text-xs h-9 rounded-lg shadow-xs transition">
              <PlusCircle className="mr-1.5 h-3.5 w-3.5" />
              <span>Onboard Gym Workspace</span>
            </Button>
          </Link>
        }
      />

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          label="Total Workspaces"
          value={totalCount}
          icon={Building2}
          subtext="Configured tenants"
        />
        <StatCard
          label="Active Tenants"
          value={activeCount}
          icon={CheckCircle2}
          trend={{ value: `${Math.round((activeCount / (totalCount || 1)) * 100)}% active`, isPositive: true }}
          subtext="Operational"
        />
        <StatCard
          label="In Evaluation Trial"
          value={trialCount}
          icon={Clock}
          subtext="Evaluation window"
        />
        <StatCard
          label="Suspended Workspaces"
          value={suspendedCount}
          icon={AlertTriangle}
          trend={suspendedCount > 0 ? { value: "Action required", isPositive: false } : undefined}
          subtext="Restricted access"
        />
      </div>

      {/* Search and Filters Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3 rounded-xl border border-line shadow-xs">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by gym name, slug, or owner email..."
            className="pl-9 text-xs h-9 border-line focus:ring-pine/30 focus:border-pine"
          />
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1 p-1 rounded-lg bg-canvas border border-line self-start sm:self-auto text-xs">
          {["ALL", "ACTIVE", "TRIAL", "SUSPENDED", "INACTIVE"].map((st) => (
            <button
              type="button"
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1 rounded-md text-xs font-semibold transition ${
                statusFilter === st
                  ? "bg-white text-pine shadow-xs border border-line/60"
                  : "text-muted hover:text-ink"
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Gyms Table */}
      <div className="rounded-xl border border-line bg-white shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-canvas border-b border-line text-muted uppercase tracking-wider text-[10px] font-semibold">
              <tr>
                <th className="px-5 py-3">Gym Workspace</th>
                <th className="px-5 py-3">Owner / Contact</th>
                <th className="px-5 py-3">SaaS Tier & Billing</th>
                <th className="px-5 py-3">Capacity</th>
                <th className="px-5 py-3">Account Status</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line/60 text-ink">
              {filteredGyms.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-muted">
                    No gyms match the selected search or status criteria.
                  </td>
                </tr>
              ) : (
                filteredGyms.map((gym) => (
                  <tr key={gym.id} className="hover:bg-canvas/60 transition-colors">
                    <td className="px-5 py-3.5">
                      <Link
                        href={`/platform-admin/gyms/${gym.id}`}
                        className="font-bold text-ink hover:text-pine transition-colors block"
                      >
                        {gym.name}
                      </Link>
                      <span className="text-[11px] text-muted font-mono">
                        /{gym.slug} • {gym.currency}
                      </span>
                    </td>

                    <td className="px-5 py-3.5">
                      {gym.owner ? (
                        <div>
                          <span className="font-semibold text-ink block">
                            {gym.owner.name || "Owner"}
                          </span>
                          <span className="text-[11px] text-muted">
                            {gym.owner.email}
                          </span>
                        </div>
                      ) : (
                        <span className="text-muted text-[11px]">Unassigned</span>
                      )}
                    </td>

                    <td className="px-5 py-3.5">
                      {gym.subscription ? (
                        <div>
                          <span className="font-bold text-ink block">
                            {gym.subscription.planName}
                          </span>
                          <span className="text-[10px] uppercase font-semibold text-muted">
                            {gym.subscription.billingPeriod} • {gym.subscription.status}
                          </span>
                        </div>
                      ) : (
                        <Badge variant="outline" className="text-[10px] text-muted border-dashed">
                          No SaaS Plan
                        </Badge>
                      )}
                    </td>

                    <td className="px-5 py-3.5">
                      <span className="font-bold text-ink">{gym.memberCount}</span>
                      <span className="text-muted text-[11px] block">
                        {gym.staffCount} staff • {gym.classesCount} classes
                      </span>
                    </td>

                    <td className="px-5 py-3.5">
                      <StatusBadge status={gym.status} />
                    </td>

                    <td className="px-5 py-3.5 text-right space-x-2">
                      <Link
                        href={`/platform-admin/gyms/${gym.id}`}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold text-ink bg-canvas border border-line hover:bg-white hover:text-pine transition-colors"
                      >
                        <span>Workspace</span>
                        <ExternalLink className="h-3 w-3" />
                      </Link>

                      {gym.status === GymStatus.SUSPENDED ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleOpenStatusModal(gym, GymStatus.ACTIVE)}
                          className="h-7 text-xs border-pine/30 text-pine hover:bg-pine-soft"
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
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Suspend / Reactivate Audit Modal */}
      {selectedGym && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl border border-line space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center gap-3">
              <div
                className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 ${
                  newStatus === GymStatus.SUSPENDED
                    ? "bg-rose-100 text-rose-700"
                    : "bg-pine-soft text-pine"
                }`}
              >
                {newStatus === GymStatus.SUSPENDED ? (
                  <ShieldAlert className="h-5 w-5" />
                ) : (
                  <CheckCircle2 className="h-5 w-5" />
                )}
              </div>
              <div>
                <h3 className="text-sm font-bold text-ink">
                  {newStatus === GymStatus.SUSPENDED ? "Suspend Gym Workspace" : "Reactivate Gym Workspace"}
                </h3>
                <p className="text-xs text-muted">
                  Target: <strong>{selectedGym.name}</strong> (/{selectedGym.slug})
                </p>
              </div>
            </div>

            {newStatus === GymStatus.SUSPENDED && (
              <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs leading-relaxed">
                Suspending this gym will immediately block owner, staff, and member login. All SaaS feature entitlements and public website pages will be deactivated.
              </div>
            )}

            {modalError && (
              <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs">
                {modalError}
              </div>
            )}

            <form onSubmit={handleConfirmStatusChange} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-ink block mb-1">
                  Mandatory Audit Reason *
                </label>
                <textarea
                  rows={3}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="e.g. Terms of Service violation, non-payment, owner requested reactivation..."
                  className="w-full text-xs p-2.5 rounded-lg border border-line focus:outline-hidden focus:ring-2 focus:ring-pine/30 focus:border-pine transition"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setSelectedGym(null)}
                  className="text-xs h-9 border-line hover:bg-canvas"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className={`text-xs h-9 font-semibold ${
                    newStatus === GymStatus.SUSPENDED
                      ? "bg-rose-600 hover:bg-rose-700 text-white"
                      : "bg-pine hover:bg-pine/90 text-white"
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

"use client";

import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { PageHeader } from "@/components/design-system/page-header";

interface AuditLogItem {
  id: string;
  action: string;
  targetType: string;
  targetId: string | null;
  details: string | null;
  ipAddress: string | null;
  createdAt: string;
  admin: {
    id: string;
    name: string | null;
    email: string | null;
  };
  gym: {
    id: string;
    name: string;
    slug: string;
  } | null;
}

interface PlatformAuditTableProps {
  initialLogs: AuditLogItem[];
}

export function PlatformAuditTable({ initialLogs }: PlatformAuditTableProps) {
  const [logs] = React.useState<AuditLogItem[]>(initialLogs);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [actionFilter, setActionFilter] = React.useState("ALL");

  const actionBadgeColors: Record<string, string> = {
    GYM_SUSPENDED: "bg-rose-50 text-rose-700 border-rose-200",
    GYM_REACTIVATED: "bg-pine-soft text-pine border-pine/30",
    SAAS_PLAN_CREATED: "bg-blue-50 text-blue-700 border-blue-200",
    SAAS_PLAN_UPDATED: "bg-blue-50 text-blue-700 border-blue-200",
    SUBSCRIPTION_ASSIGNED: "bg-purple-50 text-purple-700 border-purple-200",
    SUPPORT_NOTES_UPDATED: "bg-amber-50 text-amber-700 border-amber-200",
    WORKSPACE_ONBOARDED: "bg-pine-soft text-pine border-pine/30",
    SUBSCRIPTION_PAYMENT_RECORDED: "bg-pine-soft text-pine border-pine/30",
  };

  const filteredLogs = logs.filter((log) => {
    const matchesAction = actionFilter === "ALL" || log.action === actionFilter;
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      log.action.toLowerCase().includes(q) ||
      (log.gym?.name && log.gym.name.toLowerCase().includes(q)) ||
      (log.admin.email && log.admin.email.toLowerCase().includes(q)) ||
      (log.details && log.details.toLowerCase().includes(q));

    return matchesAction && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        title="Platform Administrative Audit Trail"
        description="Immutable compliance and security log recording all administrative modifications, plan assignments, suspensions, and manual overrides across the FIXIA cloud."
        breadcrumbs={[
          { label: "Overview", href: "/platform-admin" },
          { label: "Audit Logs" },
        ]}
      />

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3 rounded-xl border border-line shadow-xs">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by action, gym name, or admin email..."
            className="pl-9 text-xs h-9 border-line focus:ring-pine/30 focus:border-pine"
          />
        </div>

        <div className="flex items-center gap-1 p-1 rounded-lg bg-canvas border border-line self-start sm:self-auto overflow-x-auto max-w-full text-xs">
          {["ALL", "GYM_SUSPENDED", "GYM_REACTIVATED", "SUBSCRIPTION_ASSIGNED", "SAAS_PLAN_CREATED"].map(
            (act) => (
              <button
                type="button"
                key={act}
                onClick={() => setActionFilter(act)}
                className={`px-3 py-1 rounded-md text-xs font-semibold whitespace-nowrap transition ${
                  actionFilter === act
                    ? "bg-white text-pine shadow-xs border border-line/60"
                    : "text-muted hover:text-ink"
                }`}
              >
                {act.replace(/_/g, " ")}
              </button>
            )
          )}
        </div>
      </div>

      {/* Audit Logs Table */}
      <div className="rounded-xl border border-line bg-white shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-canvas border-b border-line text-muted uppercase tracking-wider text-[10px] font-semibold">
              <tr>
                <th className="px-5 py-3">Timestamp</th>
                <th className="px-5 py-3">Action</th>
                <th className="px-5 py-3">Super Admin</th>
                <th className="px-5 py-3">Target Workspace</th>
                <th className="px-5 py-3">Details & Audit Payload</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line/60 text-ink">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-12 text-center text-muted">
                    No administrative audit logs found.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => {
                  const badgeClass =
                    actionBadgeColors[log.action] || "bg-canvas text-ink border-line";

                  return (
                    <tr key={log.id} className="hover:bg-canvas/50 transition-colors">
                      <td className="px-5 py-3.5 whitespace-nowrap font-mono text-[11px] text-muted">
                        {new Date(log.createdAt).toLocaleString()}
                      </td>

                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <Badge variant="outline" className={`${badgeClass} font-mono text-[10px] font-bold`}>
                          {log.action}
                        </Badge>
                      </td>

                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <span className="font-semibold text-ink block">
                          {log.admin.name || "Super Admin"}
                        </span>
                        <span className="text-[10px] text-muted">{log.admin.email}</span>
                      </td>

                      <td className="px-5 py-3.5 whitespace-nowrap">
                        {log.gym ? (
                          <div>
                            <span className="font-semibold text-ink block">{log.gym.name}</span>
                            <span className="text-[10px] font-mono text-muted">/{log.gym.slug}</span>
                          </div>
                        ) : (
                          <span className="text-muted text-[11px] uppercase font-mono">
                            {log.targetType}
                          </span>
                        )}
                      </td>

                      <td className="px-5 py-3.5 max-w-md">
                        <span className="font-mono text-[11px] text-ink break-words block">
                          {log.details || "—"}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

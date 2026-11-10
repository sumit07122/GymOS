"use client";

import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ShieldAlert, Search } from "lucide-react";

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
    GYM_REACTIVATED: "bg-emerald-50 text-emerald-700 border-emerald-200",
    SAAS_PLAN_CREATED: "bg-indigo-50 text-indigo-700 border-indigo-200",
    SAAS_PLAN_UPDATED: "bg-blue-50 text-blue-700 border-blue-200",
    SUBSCRIPTION_ASSIGNED: "bg-purple-50 text-purple-700 border-purple-200",
    SUPPORT_NOTES_UPDATED: "bg-amber-50 text-amber-700 border-amber-200",
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <ShieldAlert className="h-6 w-6 text-slate-800" />
            <span>Platform Administrative Audit Trail</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Immutable security log recording all administrative modifications across the FIXIA cloud.
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by action, gym name, or admin email..."
            className="pl-9 text-xs h-9"
          />
        </div>

        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-100 border border-slate-200 self-start sm:self-auto overflow-x-auto max-w-full">
          {["ALL", "GYM_SUSPENDED", "GYM_REACTIVATED", "SUBSCRIPTION_ASSIGNED", "SAAS_PLAN_CREATED"].map(
            (act) => (
              <button
                key={act}
                onClick={() => setActionFilter(act)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                  actionFilter === act
                    ? "bg-white text-slate-900 shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {act.replace(/_/g, " ")}
              </button>
            )
          )}
        </div>
      </div>

      {/* Audit Logs Table */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[10px] font-bold">
              <tr>
                <th className="px-5 py-3">Timestamp</th>
                <th className="px-5 py-3">Action</th>
                <th className="px-5 py-3">Super Admin</th>
                <th className="px-5 py-3">Target Workspace</th>
                <th className="px-5 py-3">Details & Audit Payload</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-12 text-center text-slate-400">
                    No administrative audit logs found.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => {
                  const badgeClass =
                    actionBadgeColors[log.action] || "bg-slate-100 text-slate-700 border-slate-200";

                  return (
                    <tr key={log.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-5 py-3.5 whitespace-nowrap font-mono text-[11px] text-slate-500">
                        {new Date(log.createdAt).toLocaleString()}
                      </td>

                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <Badge variant="outline" className={`${badgeClass} font-mono text-[10px] font-bold`}>
                          {log.action}
                        </Badge>
                      </td>

                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <span className="font-semibold text-slate-800 block">
                          {log.admin.name || "Super Admin"}
                        </span>
                        <span className="text-[10px] text-slate-400">{log.admin.email}</span>
                      </td>

                      <td className="px-5 py-3.5 whitespace-nowrap">
                        {log.gym ? (
                          <div>
                            <span className="font-semibold text-slate-900 block">{log.gym.name}</span>
                            <span className="text-[10px] font-mono text-slate-400">/{log.gym.slug}</span>
                          </div>
                        ) : (
                          <span className="text-slate-400 text-[11px] uppercase font-mono">
                            {log.targetType}
                          </span>
                        )}
                      </td>

                      <td className="px-5 py-3.5 max-w-md">
                        <span className="font-mono text-[11px] text-slate-600 break-words block">
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

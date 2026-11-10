import * as React from "react";
import Link from "next/link";
import { db } from "@/lib/db";
import { requireSuperAdmin } from "@/lib/auth/guards";
import { Sliders, CheckCircle2, XCircle, ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { SaasFeature, isFeatureIncludedInPlan } from "@/lib/saas/entitlements";

const trackedFeatures = [
  { key: SaasFeature.ATTENDANCE_QR, label: "Attendance QR" },
  { key: SaasFeature.BILLING_INVOICING, label: "Payments" },
  { key: SaasFeature.CRM_LEADS, label: "CRM Leads" },
  { key: SaasFeature.EXPENSE_TRACKING, label: "Expenses" },
  { key: SaasFeature.WORKOUT_PLANS, label: "Workouts" },
  { key: SaasFeature.INVENTORY_MANAGEMENT, label: "Inventory" },
  { key: SaasFeature.WHATSAPP_NOTIFICATIONS, label: "WhatsApp" },
  { key: SaasFeature.PUBLIC_WEBSITE, label: "Website" },
  { key: SaasFeature.BUSINESS_ANALYTICS, label: "Reports" },
];

export default async function PlatformAdminEntitlementsPage() {
  await requireSuperAdmin("/platform-admin/entitlements");

  const gyms = await db.gym.findMany({
    include: {
      subscription: {
        include: {
          plan: true,
          addons: {
            include: {
              addon: true,
            },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2.5">
            <Sliders className="h-6 w-6 text-amber-400" />
            <span>Tenant Entitlement Matrix</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Global view of enabled and restricted platform modules across all active tenant workspaces.
          </p>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-800 bg-slate-950/70 shadow-lg overflow-x-auto">
        <Table>
          <TableHeader className="bg-slate-900/80 border-b border-slate-800">
            <TableRow className="border-slate-800 hover:bg-transparent">
              <TableHead className="text-slate-400 text-xs font-semibold min-w-[160px]">Gym Tenant</TableHead>
              <TableHead className="text-slate-400 text-xs font-semibold">Tier Plan</TableHead>
              {trackedFeatures.map((f) => (
                <TableHead key={f.key} className="text-slate-400 text-[11px] font-semibold text-center whitespace-nowrap">
                  {f.label}
                </TableHead>
              ))}
              <TableHead className="text-slate-400 text-xs font-semibold text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {gyms.length === 0 ? (
              <TableRow>
                <TableCell colSpan={trackedFeatures.length + 3} className="h-32 text-center text-xs text-slate-500">
                  No gyms registered yet.
                </TableCell>
              </TableRow>
            ) : (
              gyms.map((g) => {
                const sub = g.subscription;
                let overrides: Record<string, boolean> = {};
                try {
                  overrides = sub?.customFeatureOverrides ? JSON.parse(sub.customFeatureOverrides) : {};
                } catch {
                  overrides = {};
                }

                return (
                  <TableRow key={g.id} className="border-slate-800/60 hover:bg-slate-900/40">
                    <TableCell className="font-medium text-xs text-white">
                      <div className="font-bold">{g.name}</div>
                      <div className="text-[10px] text-slate-400 font-mono">/{g.slug}</div>
                    </TableCell>
                    <TableCell>
                      {sub?.plan ? (
                        <Badge variant="outline" className="bg-indigo-950 text-indigo-300 border-indigo-800 text-[10px]">
                          {sub.plan.name}
                        </Badge>
                      ) : (
                        <span className="text-xs text-slate-500">No Plan</span>
                      )}
                    </TableCell>

                    {trackedFeatures.map((f) => {
                      // Check if enabled by plan, override, or addon
                      const planHasFeature = sub?.plan ? isFeatureIncludedInPlan(sub.plan, f.key) : false;
                      const hasOverride = typeof overrides[f.key] === "boolean";
                      const isEnabled = hasOverride ? overrides[f.key] : planHasFeature;

                      return (
                        <TableCell key={f.key} className="text-center">
                          {isEnabled ? (
                            <span className="inline-flex items-center justify-center text-emerald-400">
                              <CheckCircle2 className="h-4 w-4" />
                            </span>
                          ) : (
                            <span className="inline-flex items-center justify-center text-slate-600">
                              <XCircle className="h-4 w-4" />
                            </span>
                          )}
                        </TableCell>
                      );
                    })}

                    <TableCell className="text-right">
                      <Link
                        href={`/platform-admin/gyms/${g.id}`}
                        className="inline-flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300 font-semibold"
                      >
                        <span>Configure</span>
                        <ExternalLink className="h-3 w-3" />
                      </Link>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

import * as React from "react";
import Link from "next/link";
import { db } from "@/lib/db";
import { requireSuperAdmin } from "@/lib/auth/guards";
import { Sliders, CheckCircle2, Lock, ExternalLink, ShieldCheck, Layers } from "lucide-react";
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
import { PageHeader } from "@/components/design-system/page-header";
import { StatCard } from "@/components/design-system/stat-card";

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

  const fullSuiteCount = gyms.filter((g) => {
    if (!g.subscription?.plan) return false;
    return trackedFeatures.every((f) =>
      isFeatureIncludedInPlan(g.subscription!.plan, f.key)
    );
  }).length;

  const overridesCount = gyms.filter((g) => {
    return Boolean(g.subscription?.customFeatureOverrides);
  }).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        title="Tenant Entitlement Matrix"
        description="Comprehensive audit of enabled platform capabilities, base plan entitlements, add-on licenses, and administrative overrides across all gym workspaces."
        breadcrumbs={[
          { label: "Overview", href: "/platform-admin" },
          { label: "Entitlements" },
        ]}
      />

      {/* KPI Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <StatCard
          label="Tracked Modules"
          value={trackedFeatures.length}
          icon={Layers}
          subtext="Modular feature gates"
        />
        <StatCard
          label="Full-Suite Workspaces"
          value={fullSuiteCount}
          icon={ShieldCheck}
          trend={{ value: `${gyms.length} total`, isPositive: true }}
          subtext="All 9 modules active"
        />
        <StatCard
          label="Custom Overrides"
          value={overridesCount}
          icon={Sliders}
          subtext="Admin tailored access"
        />
      </div>

      {/* Matrix Table */}
      <div className="rounded-2xl border border-line bg-white shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-canvas border-b border-line">
              <TableRow className="border-line hover:bg-transparent">
                <TableHead className="text-slate-700 text-xs font-bold uppercase tracking-wider min-w-[200px]">
                  Gym Workspace
                </TableHead>
                <TableHead className="text-slate-700 text-xs font-bold uppercase tracking-wider">Tier Plan</TableHead>
                {trackedFeatures.map((f) => (
                  <TableHead key={f.key} className="text-slate-600 text-[11px] font-bold text-center whitespace-nowrap px-2">
                    {f.label}
                  </TableHead>
                ))}
                <TableHead className="text-slate-700 text-xs font-bold uppercase tracking-wider text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {gyms.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={trackedFeatures.length + 3} className="h-32 text-center text-xs text-slate-500">
                    No gym workspaces provisioned on the platform yet.
                  </TableCell>
                </TableRow>
              ) : (
                gyms.map((gym) => {
                  const sub = gym.subscription;

                  let customOverrides: Record<string, boolean> = {};
                  try {
                    if (sub?.customFeatureOverrides) {
                      customOverrides = JSON.parse(sub.customFeatureOverrides);
                    }
                  } catch {
                    // fallback
                  }

                  return (
                    <TableRow key={gym.id} className="border-line/60 hover:bg-canvas/50">
                      <TableCell className="font-medium text-xs">
                        <div className="font-bold text-[#0F172A]">{gym.name}</div>
                        <div className="text-[11px] text-slate-500 font-mono">/{gym.slug}</div>
                      </TableCell>

                      <TableCell>
                        {sub?.plan ? (
                          <Badge variant="outline" className="bg-[#E4F2EB] text-[#0B6B4F] border-[#A7F3D0] text-[11px] font-bold px-2.5 py-0.5">
                            {sub.plan.name}
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-[11px] text-slate-500 border-dashed">
                            No Plan
                          </Badge>
                        )}
                      </TableCell>

                      {trackedFeatures.map((feat) => {
                        let isEnabled = sub?.plan ? isFeatureIncludedInPlan(sub.plan, feat.key) : false;

                        // Check add-ons
                        if (sub?.addons?.some((a) => a.addon.featureKey === feat.key)) {
                          isEnabled = true;
                        }

                        // Check explicit overrides
                        if (customOverrides[feat.key] !== undefined) {
                          isEnabled = customOverrides[feat.key];
                        }

                        return (
                          <TableCell key={feat.key} className="text-center py-3">
                            {isEnabled ? (
                              <div className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-[#E4F2EB] text-[#0B6B4F] border border-[#A7F3D0]/60 shadow-2xs">
                                <CheckCircle2 className="h-3.5 w-3.5" />
                              </div>
                            ) : (
                              <div className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-slate-100 text-slate-400 border border-slate-200/60">
                                <Lock className="h-3 w-3" />
                              </div>
                            )}
                          </TableCell>
                        );
                      })}

                      <TableCell className="text-right">
                        <Link
                          href={`/platform-admin/gyms/${gym.id}`}
                          className="inline-flex items-center gap-1 text-xs text-[#0B6B4F] hover:text-[#062E23] font-bold hover:underline"
                        >
                          <span>Overrides</span>
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
    </div>
  );
}

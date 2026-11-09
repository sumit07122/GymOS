"use client";

import * as React from "react";
import { useState, useTransition } from "react";
import { PlanData, PlanModal } from "./plan-modal";
import { archivePlanAction } from "@/lib/actions/membership";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Edit,
  Archive,
  CheckCircle2,
  Sparkles,
  Users,
  Clock,
} from "lucide-react";

interface PlanListProps {
  gymId: string;
  gymSlug: string;
  currency: string;
  plans: (PlanData & {
    _count?: {
      memberships: number;
    };
  })[];
  userRole?: string;
}

export function PlanListTable({
  gymId,
  gymSlug,
  currency,
  plans,
  userRole,
}: PlanListProps) {
  const isOwner = userRole === "OWNER" || userRole === "SUPER_ADMIN";
  const [editingPlan, setEditingPlan] = useState<PlanData | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleEdit = (plan: PlanData) => {
    setEditingPlan(plan);
    setIsModalOpen(true);
  };

  const handleArchive = (plan: PlanData) => {
    if (!plan.id) return;
    if (
      !confirm(
        `Archive plan "${plan.name}"? New members will no longer be able to purchase it, but existing members will be unaffected.`
      )
    ) {
      return;
    }

    setErrorMsg(null);
    startTransition(async () => {
      const res = await archivePlanAction(gymId, plan.id!, gymSlug);
      if (!res.success) {
        setErrorMsg(res.error || "Failed to archive plan.");
      }
    });
  };

  const formatMoney = (val: number | string) => {
    return `${currency} ${Number(val).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  return (
    <div className="space-y-4">
      {errorMsg && (
        <div className="rounded-lg bg-rose-50 p-3 text-xs text-rose-700 border border-rose-200">
          {errorMsg}
        </div>
      )}

      {plans.length === 0 ? (
        <Card className="border-slate-200 shadow-xs">
          <CardContent className="py-12 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 mb-3">
              <Sparkles className="h-6 w-6" />
            </div>
            <h3 className="text-sm font-semibold text-slate-900">No Membership Plans Yet</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Create your first subscription tier (e.g. Monthly, Quarterly, Annual) to start enrolling members.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-xs">
          <Table>
            <TableHeader className="bg-slate-50/70">
              <TableRow>
                <TableHead className="text-xs font-semibold text-slate-700">Plan Name</TableHead>
                <TableHead className="text-xs font-semibold text-slate-700">Duration</TableHead>
                <TableHead className="text-xs font-semibold text-slate-700">Price</TableHead>
                <TableHead className="text-xs font-semibold text-slate-700">Admission Fee</TableHead>
                <TableHead className="text-xs font-semibold text-slate-700">Included Perks & Restrictions</TableHead>
                <TableHead className="text-xs font-semibold text-slate-700">Subscribers</TableHead>
                <TableHead className="text-xs font-semibold text-slate-700">Status</TableHead>
                {isOwner && (
                  <TableHead className="text-xs font-semibold text-slate-700 text-right">
                    Actions
                  </TableHead>
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {plans.map((plan) => {
                const benefitsList = plan.benefits
                  ? plan.benefits
                      .split(/[\n,]/)
                      .map((b) => b.trim())
                      .filter(Boolean)
                  : [];

                return (
                  <TableRow key={plan.id} className="hover:bg-slate-50/50">
                    <TableCell className="align-top py-3">
                      <div className="font-semibold text-xs text-slate-900">{plan.name}</div>
                      {plan.description && (
                        <div className="text-[11px] text-slate-500 line-clamp-2 max-w-xs pt-0.5">
                          {plan.description}
                        </div>
                      )}
                    </TableCell>

                    <TableCell className="align-top py-3">
                      <div className="flex items-center gap-1.5 text-xs font-medium text-slate-800">
                        <Clock className="h-3.5 w-3.5 text-slate-400" />
                        <span>{plan.durationDays} days</span>
                      </div>
                      <span className="text-[10px] text-slate-400">
                        {plan.durationDays === 30
                          ? "1 Month"
                          : plan.durationDays === 90
                          ? "3 Months"
                          : plan.durationDays === 180
                          ? "6 Months"
                          : plan.durationDays === 365
                          ? "1 Year"
                          : `Approx ${(plan.durationDays / 30).toFixed(1)} mos`}
                      </span>
                    </TableCell>

                    <TableCell className="align-top py-3 font-mono font-bold text-xs text-slate-900">
                      {formatMoney(plan.price)}
                    </TableCell>

                    <TableCell className="align-top py-3 font-mono text-xs text-slate-600">
                      {Number(plan.admissionFee) > 0 ? formatMoney(plan.admissionFee) : "—"}
                    </TableCell>

                    <TableCell className="align-top py-3 max-w-xs">
                      {plan.accessRestrictions && (
                        <div className="text-[10px] font-semibold text-amber-800 bg-amber-50 rounded px-1.5 py-0.5 inline-block mb-1 border border-amber-200">
                          {plan.accessRestrictions}
                        </div>
                      )}
                      {benefitsList.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {benefitsList.slice(0, 3).map((benefit, idx) => (
                            <span
                              key={idx}
                              className="inline-flex items-center gap-1 text-[10px] bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded"
                            >
                              <CheckCircle2 className="h-2.5 w-2.5 text-emerald-600" />
                              {benefit.replace(/^[•\-\*]\s*/, "")}
                            </span>
                          ))}
                          {benefitsList.length > 3 && (
                            <span className="text-[10px] text-slate-400 self-center">
                              +{benefitsList.length - 3} more
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-[11px] text-slate-400">Standard access</span>
                      )}
                    </TableCell>

                    <TableCell className="align-top py-3">
                      <div className="flex items-center gap-1 text-xs text-slate-700">
                        <Users className="h-3 w-3 text-slate-400" />
                        <span>{plan._count?.memberships ?? 0}</span>
                      </div>
                    </TableCell>

                    <TableCell className="align-top py-3">
                      {plan.isActive ? (
                        <Badge
                          variant="outline"
                          className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px]"
                        >
                          Active
                        </Badge>
                      ) : (
                        <Badge
                          variant="outline"
                          className="bg-slate-100 text-slate-600 border-slate-200 text-[10px]"
                        >
                          Inactive
                        </Badge>
                      )}
                    </TableCell>

                    {isOwner && (
                      <TableCell className="align-top py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(plan)}
                            className="h-7 w-7 p-0 text-slate-600 hover:text-slate-900"
                            title="Edit Plan"
                          >
                            <Edit className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            disabled={isPending}
                            onClick={() => handleArchive(plan)}
                            className="h-7 w-7 p-0 text-amber-600 hover:text-amber-800 hover:bg-amber-50"
                            title="Archive Plan"
                          >
                            <Archive className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </TableCell>
                    )}
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Edit Modal */}
      {isModalOpen && (
        <PlanModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setEditingPlan(null);
          }}
          gymId={gymId}
          gymSlug={gymSlug}
          currency={currency}
          plan={editingPlan}
        />
      )}
    </div>
  );
}

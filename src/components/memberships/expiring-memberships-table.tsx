"use client";

import * as React from "react";
import { useState } from "react";
import Link from "next/link";
import { PlanOption, RenewMembershipModal } from "./membership-lifecycle-modals";
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
  Calendar,
  Clock,
  Phone,
  Mail,
  RotateCw,
  CheckCircle,
} from "lucide-react";

export interface ExpiringMembershipItem {
  id: string;
  startDate: Date | string;
  endDate: Date | string;
  member: {
    id: string;
    firstName: string;
    lastName: string;
    memberCode: string;
    phone: string | null;
    email: string | null;
  };
  plan: {
    id: string;
    name: string;
    durationDays: number;
    price: number | string;
  };
}

interface ExpiringMembershipsProps {
  gymId: string;
  gymSlug: string;
  currency: string;
  items: ExpiringMembershipItem[];
  plans: PlanOption[];
}

export function ExpiringMembershipsTable({
  gymId,
  gymSlug,
  currency,
  items,
  plans,
}: ExpiringMembershipsProps) {
  const [selectedForRenew, setSelectedForRenew] =
    useState<ExpiringMembershipItem | null>(null);

  const getDaysLeft = (endDateStr: Date | string) => {
    const end = new Date(endDateStr);
    const now = new Date();
    const diffMs = end.getTime() - now.getTime();
    return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  };

  return (
    <div className="space-y-4">
      {items.length === 0 ? (
        <Card className="border-slate-200 shadow-xs">
          <CardContent className="py-12 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 mb-3">
              <CheckCircle className="h-6 w-6" />
            </div>
            <h3 className="text-sm font-semibold text-slate-900">
              No Memberships Expiring Soon
            </h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              All active members have healthy subscription terms beyond the upcoming period.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-xs">
          <Table>
            <TableHeader className="bg-slate-50/70">
              <TableRow>
                <TableHead className="text-xs font-semibold text-slate-700">Member</TableHead>
                <TableHead className="text-xs font-semibold text-slate-700">Contact</TableHead>
                <TableHead className="text-xs font-semibold text-slate-700">Current Plan</TableHead>
                <TableHead className="text-xs font-semibold text-slate-700">Expiry Date</TableHead>
                <TableHead className="text-xs font-semibold text-slate-700">Urgency</TableHead>
                <TableHead className="text-xs font-semibold text-slate-700 text-right">
                  Action
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item) => {
                const daysLeft = getDaysLeft(item.endDate);
                const isVeryUrgent = daysLeft <= 3;

                return (
                  <TableRow key={item.id} className="hover:bg-slate-50/50">
                    <TableCell className="py-3">
                      <Link
                        href={`/${gymSlug}/members/${item.member.id}`}
                        className="font-semibold text-xs text-slate-900 hover:text-emerald-700 transition"
                      >
                        {item.member.firstName} {item.member.lastName}
                      </Link>
                      <div className="font-mono text-[11px] text-slate-500">
                        {item.member.memberCode}
                      </div>
                    </TableCell>

                    <TableCell className="py-3 text-xs text-slate-600">
                      <div className="space-y-0.5">
                        {item.member.phone && (
                          <div className="flex items-center gap-1.5">
                            <Phone className="h-3 w-3 text-slate-400" />
                            <span>{item.member.phone}</span>
                          </div>
                        )}
                        {item.member.email && (
                          <div className="flex items-center gap-1.5 text-slate-500">
                            <Mail className="h-3 w-3 text-slate-400" />
                            <span className="truncate max-w-[150px]">{item.member.email}</span>
                          </div>
                        )}
                      </div>
                    </TableCell>

                    <TableCell className="py-3">
                      <div className="text-xs font-medium text-slate-900">{item.plan.name}</div>
                      <div className="text-[11px] font-mono text-slate-500">
                        {currency} {Number(item.plan.price).toFixed(2)}
                      </div>
                    </TableCell>

                    <TableCell className="py-3 text-xs text-slate-700">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5 text-slate-400" />
                        <span>{new Date(item.endDate).toLocaleDateString()}</span>
                      </div>
                    </TableCell>

                    <TableCell className="py-3">
                      <Badge
                        variant="outline"
                        className={
                          isVeryUrgent
                            ? "bg-rose-50 text-rose-700 border-rose-200 text-[10px] gap-1 font-semibold"
                            : "bg-amber-50 text-amber-700 border-amber-200 text-[10px] gap-1"
                        }
                      >
                        <Clock className="h-2.5 w-2.5" />
                        {daysLeft <= 0
                          ? "Expires today"
                          : daysLeft === 1
                          ? "1 day left"
                          : `${daysLeft} days left`}
                      </Badge>
                    </TableCell>

                    <TableCell className="py-3 text-right">
                      <Button
                        type="button"
                        size="sm"
                        onClick={() => setSelectedForRenew(item)}
                        className="h-8 text-xs bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5"
                      >
                        <RotateCw className="h-3 w-3" />
                        <span>Renew</span>
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Renew Modal */}
      {selectedForRenew && (
        <RenewMembershipModal
          isOpen={Boolean(selectedForRenew)}
          onClose={() => setSelectedForRenew(null)}
          gymId={gymId}
          gymSlug={gymSlug}
          currency={currency}
          membershipId={selectedForRenew.id}
          memberName={`${selectedForRenew.member.firstName} ${selectedForRenew.member.lastName}`}
          currentPlanName={selectedForRenew.plan.name}
          currentEndDate={selectedForRenew.endDate}
          isCurrentlyActive={true}
          plans={plans}
        />
      )}
    </div>
  );
}

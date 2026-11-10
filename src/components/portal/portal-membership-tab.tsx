"use client";

import * as React from "react";
import { Badge } from "@/components/ui/badge";
import {
  CreditCard,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Calendar,
  ShieldCheck,
  Ban,
  FileText,
} from "lucide-react";

interface PortalMembershipTabProps {
  gym: {
    currency: string;
    phone?: string | null;
    email?: string | null;
  };
  membership: {
    active: {
      id: string;
      planName: string;
      startDate: string;
      endDate: string;
      status: string;
      sessionsRemaining?: number | null;
      pricePaid: number;
      admissionFeePaid: number;
      durationMonths: number;
      benefits?: string[] | null;
      accessRestrictions?: string[] | null;
      daysRemaining: number | null;
      expiryStatus: "ACTIVE" | "EXPIRING_SOON" | "EXPIRED" | "NONE";
    } | null;
    history: Array<{
      id: string;
      planName: string;
      startDate: string;
      endDate: string;
      status: string;
      pricePaid: number;
    }>;
  };
}

export function PortalMembershipTab({
  gym,
  membership,
}: PortalMembershipTabProps) {
  const active = membership.active;

  return (
    <div className="space-y-6 pb-6">
      {/* 1. Active Membership Card */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
              <CreditCard className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Active Membership
              </h2>
              <p className="text-xs text-slate-500">
                Current subscription tier and lifecycle
              </p>
            </div>
          </div>

          {active ? (
            active.expiryStatus === "ACTIVE" ? (
              <Badge className="bg-emerald-500/15 text-emerald-700 border-emerald-500/30 text-xs">
                Active
              </Badge>
            ) : active.expiryStatus === "EXPIRING_SOON" ? (
              <Badge className="bg-amber-500/15 text-amber-700 border-amber-500/30 text-xs">
                Expiring in {active.daysRemaining}d
              </Badge>
            ) : (
              <Badge className="bg-rose-500/15 text-rose-700 border-rose-500/30 text-xs">
                Expired
              </Badge>
            )
          ) : (
            <Badge variant="outline" className="text-xs">
              No Active Plan
            </Badge>
          )}
        </div>

        {active ? (
          <div className="mt-4 space-y-5">
            {/* Plan Header & Dates */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-slate-50 rounded-xl p-4 border border-slate-100">
              <div>
                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  Plan Tier
                </span>
                <h3 className="text-xl font-bold text-slate-900">
                  {active.planName}
                </h3>
                <span className="text-xs text-slate-500">
                  {active.durationMonths} Months Duration • {gym.currency}{" "}
                  {active.pricePaid.toFixed(2)}
                </span>
              </div>

              <div className="flex items-center gap-4 text-xs text-slate-600 border-t sm:border-t-0 sm:border-l border-slate-200 pt-2 sm:pt-0 sm:pl-4">
                <div>
                  <span className="text-[10px] uppercase text-slate-400 block font-medium">
                    Start Date
                  </span>
                  <span className="font-semibold text-slate-800">
                    {new Date(active.startDate).toLocaleDateString()}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] uppercase text-slate-400 block font-medium">
                    Expiry Date
                  </span>
                  <span className="font-semibold text-slate-800">
                    {new Date(active.endDate).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Renewal Guidance Banner */}
            <div className="rounded-xl bg-indigo-50/60 border border-indigo-100 p-4">
              <div className="flex items-start gap-3">
                <Clock className="h-5 w-5 text-indigo-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-indigo-950">
                    Renewal Information
                  </h4>
                  <p className="text-xs text-indigo-800 mt-0.5 leading-relaxed">
                    {active.daysRemaining !== null && active.daysRemaining > 0
                      ? `Your membership has ${active.daysRemaining} days remaining. Memberships are preserved historically, and extensions maintain your continuous loyalty status.`
                      : "Your membership has reached its expiry date. Contact your gym front desk to renew your plan."}
                  </p>
                  {(gym.phone || gym.email) && (
                    <div className="mt-2 flex flex-wrap gap-3 text-xs text-indigo-700">
                      {gym.phone && <span>📞 Front Desk: {gym.phone}</span>}
                      {gym.email && <span>✉️ Email: {gym.email}</span>}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Included Benefits */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2.5 flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-emerald-600" />
                <span>Included Plan Benefits</span>
              </h4>
              {active.benefits && active.benefits.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {active.benefits.map((benefit, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-2 rounded-lg bg-emerald-50/50 border border-emerald-100/80 px-3 py-2 text-xs text-emerald-900"
                    >
                      <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                      <span>{benefit}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-500 italic">
                  Full gym floor access, locker facilities, and cardio equipment included.
                </p>
              )}
            </div>

            {/* Access Restrictions if any */}
            {active.accessRestrictions && active.accessRestrictions.length > 0 && (
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2.5 flex items-center gap-1.5">
                  <Ban className="h-4 w-4 text-slate-400" />
                  <span>Access Restrictions</span>
                </h4>
                <div className="space-y-1.5">
                  {active.accessRestrictions.map((res, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-2 rounded-lg bg-slate-50 border border-slate-200 px-3 py-1.5 text-xs text-slate-700"
                    >
                      <AlertTriangle className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                      <span>{res}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="py-8 text-center text-xs text-slate-500">
            No active membership record. Please contact the front desk to enroll in a plan.
          </div>
        )}
      </div>

      {/* 2. Membership History Table */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <FileText className="h-4 w-4 text-indigo-600" />
            <span>Membership History</span>
          </h3>
          <span className="text-xs text-slate-500">
            {membership.history.length} records
          </span>
        </div>

        {membership.history.length > 0 ? (
          <div className="mt-3 divide-y divide-slate-100">
            {membership.history.map((m) => (
              <div
                key={m.id}
                className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-3 gap-2"
              >
                <div>
                  <h4 className="text-xs font-bold text-slate-900">
                    {m.planName}
                  </h4>
                  <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                    <Calendar className="h-3 w-3" />
                    <span>
                      {new Date(m.startDate).toLocaleDateString()} –{" "}
                      {new Date(m.endDate).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-xs font-semibold text-slate-700">
                    {gym.currency} {m.pricePaid.toFixed(2)}
                  </span>
                  <Badge
                    variant="outline"
                    className={`text-[10px] ${
                      m.status === "ACTIVE"
                        ? "border-emerald-300 text-emerald-700 bg-emerald-50"
                        : "border-slate-200 text-slate-500"
                    }`}
                  >
                    {m.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-6 text-center text-xs text-slate-500">
            No historical memberships recorded.
          </div>
        )}
      </div>
    </div>
  );
}

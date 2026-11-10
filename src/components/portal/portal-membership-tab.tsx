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
  QrCode,
} from "lucide-react";
import { DigitalMembershipCard } from "./digital-membership-card";

interface PortalMembershipTabProps {
  gym: {
    name?: string;
    slug?: string;
    logoUrl?: string | null;
    currency: string;
    phone?: string | null;
    email?: string | null;
  };
  member?: {
    fullName: string;
    memberCode: string;
    status: string;
  } | null;
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
  qrCard?: {
    token: string;
    qrDataUrl: string;
    expiresInSeconds: number;
  } | null;
}

export function PortalMembershipTab({
  gym,
  member,
  membership,
  qrCard,
}: PortalMembershipTabProps) {
  const active = membership.active;
  const [showQrCard, setShowQrCard] = React.useState(true);

  return (
    <div className="space-y-4 pb-6">
      {/* 1. Digital Membership Pass Box (if member & qrCard provided) */}
      {member && qrCard && gym.name && gym.slug && (
        <div className="rounded-2xl border border-[#E2E8F0] bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3 mb-3">
            <div className="flex items-center gap-2">
              <QrCode className="h-4 w-4 text-[#0B6B4F]" />
              <h2 className="text-sm font-bold text-[#0F172A]">
                Digital Attendance Pass
              </h2>
            </div>
            <button
              type="button"
              onClick={() => setShowQrCard(!showQrCard)}
              className="text-xs font-semibold text-[#0B6B4F] hover:underline"
            >
              {showQrCard ? "Hide Pass" : "Show Pass"}
            </button>
          </div>

          {showQrCard && (
            <div className="pt-1">
              <DigitalMembershipCard
                gym={{ name: gym.name, slug: gym.slug, logoUrl: gym.logoUrl }}
                member={member}
                membership={active}
                initialQr={qrCard}
              />
            </div>
          )}
        </div>
      )}

      {/* 2. Active Membership Details Card */}
      <div className="rounded-xl border border-[#E2E8F0] bg-white p-5 shadow-xs">
        <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#E4F2EB] text-[#0B6B4F]">
              <CreditCard className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#0F172A]">
                Active Membership Plan
              </h2>
              <p className="text-xs text-[#64748B]">
                Current subscription tier and validity
              </p>
            </div>
          </div>

          {active ? (
            active.expiryStatus === "ACTIVE" ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-[#E4F2EB] px-2.5 py-0.5 text-xs font-semibold text-[#0B6B4F] border border-[#A7F3D0]">
                <span className="h-1.5 w-1.5 rounded-full bg-[#0B6B4F] animate-pulse" />
                Active
              </span>
            ) : active.expiryStatus === "EXPIRING_SOON" ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-semibold text-amber-700 border border-amber-200">
                <Clock className="h-3 w-3" />
                {active.daysRemaining}d Left
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2.5 py-0.5 text-xs font-semibold text-rose-700 border border-rose-200">
                Expired
              </span>
            )
          ) : (
            <Badge variant="outline" className="text-xs text-[#64748B] border-[#E2E8F0]">
              No Active Plan
            </Badge>
          )}
        </div>

        {active ? (
          <div className="mt-4 space-y-4">
            {/* Plan Header & Dates */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-[#F8FAFC] rounded-xl p-4 border border-[#E2E8F0]">
              <div>
                <span className="text-[10px] font-semibold uppercase tracking-wider text-[#64748B]">
                  Plan Tier
                </span>
                <h3 className="text-xl font-bold text-[#0F172A]">
                  {active.planName}
                </h3>
                <span className="text-xs text-[#64748B]">
                  {active.durationMonths} Months Duration • {gym.currency}{" "}
                  {active.pricePaid.toFixed(2)}
                </span>
              </div>

              <div className="flex items-center gap-4 text-xs text-[#475569] border-t sm:border-t-0 sm:border-l border-[#E2E8F0] pt-2 sm:pt-0 sm:pl-4">
                <div>
                  <span className="text-[10px] uppercase text-[#64748B] block font-medium">
                    Start Date
                  </span>
                  <span className="font-semibold text-[#0F172A]">
                    {new Date(active.startDate).toLocaleDateString()}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] uppercase text-[#64748B] block font-medium">
                    Expiry Date
                  </span>
                  <span className="font-semibold text-[#0F172A]">
                    {new Date(active.endDate).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Renewal Guidance Banner */}
            <div className="rounded-xl bg-[#E4F2EB]/50 border border-[#A7F3D0] p-4">
              <div className="flex items-start gap-3">
                <Clock className="h-5 w-5 text-[#0B6B4F] shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-[#0B6B4F]">
                    Membership Renewal & Policy
                  </h4>
                  <p className="text-xs text-[#064E3B] mt-0.5 leading-relaxed">
                    {active.daysRemaining !== null && active.daysRemaining > 0
                      ? `Your membership pass has ${active.daysRemaining} days of unlimited facility access remaining. Renewing preserves your continuous loyalty tier.`
                      : "Your membership has reached its expiry date. Contact your gym front desk to renew your pass."}
                  </p>
                  {(gym.phone || gym.email) && (
                    <div className="mt-2 flex flex-wrap gap-3 text-xs text-[#0B6B4F] font-semibold">
                      {gym.phone && <span>📞 Front Desk: {gym.phone}</span>}
                      {gym.email && <span>✉️ Email: {gym.email}</span>}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Included Benefits */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#64748B] mb-2.5 flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-[#0B6B4F]" />
                <span>Included Plan Benefits</span>
              </h4>
              {active.benefits && active.benefits.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {active.benefits.map((benefit, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-2 rounded-lg bg-[#E4F2EB]/40 border border-[#A7F3D0]/60 px-3 py-2 text-xs text-[#064E3B]"
                    >
                      <CheckCircle2 className="h-4 w-4 text-[#0B6B4F] shrink-0" />
                      <span>{benefit}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-[#64748B] italic">
                  Full gym floor access, locker facilities, and cardio equipment included.
                </p>
              )}
            </div>

            {/* Access Restrictions if any */}
            {active.accessRestrictions && active.accessRestrictions.length > 0 && (
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#64748B] mb-2.5 flex items-center gap-1.5">
                  <Ban className="h-4 w-4 text-[#94A3B8]" />
                  <span>Access Restrictions</span>
                </h4>
                <div className="space-y-1.5">
                  {active.accessRestrictions.map((res, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-2 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] px-3 py-1.5 text-xs text-[#475569]"
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
          <div className="py-8 text-center text-xs text-[#64748B]">
            No active membership record. Please contact the front desk to enroll in a plan.
          </div>
        )}
      </div>

      {/* 3. Membership History Table */}
      <div className="rounded-xl border border-[#E2E8F0] bg-white p-5 shadow-xs">
        <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
          <h3 className="text-sm font-bold text-[#0F172A] flex items-center gap-2">
            <FileText className="h-4 w-4 text-[#0B6B4F]" />
            <span>Membership History</span>
          </h3>
          <span className="text-xs text-[#64748B]">
            {membership.history.length} records
          </span>
        </div>

        {membership.history.length > 0 ? (
          <div className="mt-3 divide-y divide-[#F1F5F9]">
            {membership.history.map((m) => (
              <div
                key={m.id}
                className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-3 gap-2"
              >
                <div>
                  <h4 className="text-xs font-bold text-[#0F172A]">
                    {m.planName}
                  </h4>
                  <div className="flex items-center gap-2 text-[11px] text-[#64748B] mt-0.5">
                    <Calendar className="h-3 w-3 text-[#0B6B4F]" />
                    <span>
                      {new Date(m.startDate).toLocaleDateString()} –{" "}
                      {new Date(m.endDate).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-xs font-semibold text-[#0F172A]">
                    {gym.currency} {m.pricePaid.toFixed(2)}
                  </span>
                  <Badge
                    variant="outline"
                    className={`text-[10px] ${
                      m.status === "ACTIVE"
                        ? "border-[#A7F3D0] text-[#0B6B4F] bg-[#E4F2EB]"
                        : "border-[#E2E8F0] text-[#64748B]"
                    }`}
                  >
                    {m.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-6 text-center text-xs text-[#64748B]">
            No historical memberships recorded.
          </div>
        )}
      </div>
    </div>
  );
}

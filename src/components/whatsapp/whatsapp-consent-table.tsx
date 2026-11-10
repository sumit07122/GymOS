"use client";

import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { updateMemberConsentAction } from "@/lib/actions/whatsapp";
import {
  CheckCircle2,
  XCircle,
  Search,
  Loader2,
  ShieldAlert,
  Phone,
} from "lucide-react";

interface MemberConsentRow {
  id: string;
  memberCode: string;
  firstName: string;
  lastName: string;
  phone?: string | null;
  whatsappConsent: boolean;
  whatsappConsentAt?: string | Date | null;
  whatsappConsentSource?: string | null;
}

interface WhatsAppConsentTableProps {
  gymSlug: string;
  members: MemberConsentRow[];
  pagination: {
    page: number;
    limit: number;
    totalPages: number;
    totalCount: number;
    consentedCount: number;
    optInRate: number;
  };
}

export function WhatsAppConsentTable({
  gymSlug,
  members: initialMembers,
  pagination,
}: WhatsAppConsentTableProps) {
  const [members, setMembers] = React.useState(initialMembers);
  const [searchTerm, setSearchTerm] = React.useState("");
  const [pendingId, setPendingId] = React.useState<string | null>(null);

  const toggleConsent = async (memberId: string, currentConsent: boolean) => {
    try {
      setPendingId(memberId);
      const res = await updateMemberConsentAction(
        gymSlug,
        memberId,
        !currentConsent,
        "DASHBOARD_TOGGLE"
      );
      if (res.success && res.data) {
        setMembers((prev) =>
          prev.map((m) =>
            m.id === memberId
              ? {
                  ...m,
                  whatsappConsent: res.data.whatsappConsent,
                  whatsappConsentAt: res.data.whatsappConsentAt,
                  whatsappConsentSource: res.data.whatsappConsentSource,
                }
              : m
          )
        );
      }
    } finally {
      setPendingId(null);
    }
  };

  const filteredMembers = members.filter((m) => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    return (
      m.firstName.toLowerCase().includes(term) ||
      m.lastName.toLowerCase().includes(term) ||
      m.memberCode.toLowerCase().includes(term) ||
      (m.phone && m.phone.includes(term))
    );
  });

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-5 border-b border-slate-100">
        <div>
          <h2 className="text-base font-bold text-slate-900">
            Member Opt-In & Messaging Consent Manager
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Strict WhatsApp Anti-Spam Compliance: Messages are never sent to members without recorded consent.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge className="bg-emerald-600 text-white text-xs">
            {pagination.consentedCount} / {pagination.totalCount} Opted In ({pagination.optInRate}%)
          </Badge>
        </div>
      </div>

      <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
          <Input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search member or phone..."
            className="pl-8 text-xs h-9"
          />
        </div>

        <div className="flex items-center gap-1.5 text-slate-400 text-[11px] self-start sm:self-auto">
          <ShieldAlert className="h-3.5 w-3.5 text-amber-500 shrink-0" />
          <span>Members can also opt in/out directly via Member Portal settings.</span>
        </div>
      </div>

      {/* Table */}
      <div className="mt-4 overflow-x-auto rounded-xl border border-slate-200">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-semibold">
              <th className="py-2.5 px-3">Member</th>
              <th className="py-2.5 px-3">Phone</th>
              <th className="py-2.5 px-3">Consent Status</th>
              <th className="py-2.5 px-3">Consented Date</th>
              <th className="py-2.5 px-3">Source</th>
              <th className="py-2.5 px-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredMembers.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-slate-400 text-xs">
                  No members matching search query.
                </td>
              </tr>
            ) : (
              filteredMembers.map((m) => (
                <tr key={m.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="py-2.5 px-3 font-medium text-slate-900">
                    <div>
                      {m.firstName} {m.lastName}
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono">
                      {m.memberCode}
                    </div>
                  </td>

                  <td className="py-2.5 px-3 text-slate-600 font-mono">
                    {m.phone ? (
                      <span className="flex items-center gap-1">
                        <Phone className="h-3 w-3 text-slate-400" />
                        <span>{m.phone}</span>
                      </span>
                    ) : (
                      <span className="text-rose-500 text-[10px]">No phone on file</span>
                    )}
                  </td>

                  <td className="py-2.5 px-3">
                    {m.whatsappConsent ? (
                      <Badge className="bg-emerald-50 text-emerald-700 border border-emerald-200 gap-1 text-[10px]">
                        <CheckCircle2 className="h-2.5 w-2.5 text-emerald-600" />
                        Opted In
                      </Badge>
                    ) : (
                      <Badge
                        variant="outline"
                        className="bg-slate-100 text-slate-500 border-slate-200 gap-1 text-[10px]"
                      >
                        <XCircle className="h-2.5 w-2.5 text-slate-400" />
                        No Consent
                      </Badge>
                    )}
                  </td>

                  <td className="py-2.5 px-3 text-slate-500 text-[11px]">
                    {m.whatsappConsentAt
                      ? new Date(m.whatsappConsentAt).toLocaleDateString()
                      : "—"}
                  </td>

                  <td className="py-2.5 px-3 text-slate-500 text-[11px] font-mono">
                    {m.whatsappConsentSource || "—"}
                  </td>

                  <td className="py-2.5 px-3 text-right">
                    <Button
                      variant={m.whatsappConsent ? "outline" : "default"}
                      size="sm"
                      disabled={pendingId === m.id || !m.phone}
                      onClick={() => toggleConsent(m.id, m.whatsappConsent)}
                      className={`h-7 text-[11px] px-2.5 ${
                        m.whatsappConsent
                          ? "border-slate-300 text-slate-700 hover:bg-rose-50 hover:text-rose-700"
                          : "bg-emerald-600 text-white hover:bg-emerald-700"
                      }`}
                    >
                      {pendingId === m.id ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : m.whatsappConsent ? (
                        "Revoke"
                      ) : (
                        "Grant Opt-In"
                      )}
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}


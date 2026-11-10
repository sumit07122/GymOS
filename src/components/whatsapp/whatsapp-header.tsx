"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  MessageSquareText,
  Send,
  Zap,
  ShieldCheck,
  AlertTriangle,
} from "lucide-react";

interface WhatsAppHeaderProps {
  gymName: string;
  isLiveDelivery: boolean;
  provider: string;
  isEnabled: boolean;
  optInRate: number;
  totalSent: number;
  onOpenTestModal: () => void;
  onOpenAnnouncementModal: () => void;
}

export function WhatsAppHeader({
  gymName,
  isLiveDelivery,
  provider,
  isEnabled,
  optInRate,
  totalSent,
  onOpenTestModal,
  onOpenAnnouncementModal,
}: WhatsAppHeaderProps) {
  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              WhatsApp Business Notifications
            </h1>
            <Badge
              variant="outline"
              className={
                isEnabled
                  ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                  : "bg-slate-100 text-slate-600 border-slate-200"
              }
            >
              {isEnabled ? "Active" : "Disabled"}
            </Badge>

            {isLiveDelivery ? (
              <Badge className="bg-emerald-600 text-white gap-1 text-[10px]">
                <ShieldCheck className="h-3 w-3" />
                Live Meta/Twilio
              </Badge>
            ) : (
              <Badge
                variant="outline"
                className="bg-amber-50 text-amber-700 border-amber-300 gap-1 text-[10px]"
              >
                <AlertTriangle className="h-3 w-3 text-amber-600" />
                Sandbox Mode (Simulated)
              </Badge>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Automated member welcome cards, renewal notices, payment receipts, booking confirmations, and announcements for {gymName}.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onOpenTestModal}
            className="text-xs border-slate-300 text-slate-700 hover:bg-slate-100 gap-1.5"
          >
            <Zap className="h-3.5 w-3.5 text-amber-600" />
            <span>Test Connection</span>
          </Button>

          <Button
            size="sm"
            onClick={onOpenAnnouncementModal}
            className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5"
          >
            <Send className="h-3.5 w-3.5" />
            <span>Broadcast Announcement</span>
          </Button>
        </div>
      </div>

      {/* Metrics Banner */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
        <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-xs">
          <div className="text-[11px] font-medium text-slate-500">Provider</div>
          <div className="text-sm font-bold text-slate-900 mt-0.5 truncate">
            {provider}
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-xs">
          <div className="text-[11px] font-medium text-slate-500">Member Opt-In Rate</div>
          <div className="text-sm font-bold text-emerald-600 mt-0.5">
            {optInRate}% Opted In
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-xs">
          <div className="text-[11px] font-medium text-slate-500">Messages Dispatched</div>
          <div className="text-sm font-bold text-slate-900 mt-0.5">
            {totalSent.toLocaleString()} sent
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-xs">
          <div className="text-[11px] font-medium text-slate-500">Compliance & Consent</div>
          <div className="text-sm font-bold text-slate-900 mt-0.5 flex items-center gap-1">
            <MessageSquareText className="h-3.5 w-3.5 text-emerald-600" />
            <span>Opt-In Enforced</span>
          </div>
        </div>
      </div>
    </div>
  );
}


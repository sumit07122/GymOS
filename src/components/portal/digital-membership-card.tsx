/* eslint-disable @next/next/no-img-element */
"use client";

import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  RotateCw,
  ShieldCheck,
  Calendar,
  Sparkles,
  QrCode,
  Info,
  Dumbbell,
} from "lucide-react";
import { refreshDynamicQrAction } from "@/lib/actions/portal";

interface DigitalMembershipCardProps {
  gym: {
    name: string;
    slug: string;
    logoUrl?: string | null;
  };
  member: {
    fullName: string;
    memberCode: string;
    status: string;
  };
  membership: {
    planName: string;
    endDate: string;
    expiryStatus: "ACTIVE" | "EXPIRING_SOON" | "EXPIRED" | "NONE";
    daysRemaining: number | null;
  } | null;
  initialQr: {
    token: string;
    qrDataUrl: string;
    expiresInSeconds: number;
  };
}

export function DigitalMembershipCard({
  gym,
  member,
  membership,
  initialQr,
}: DigitalMembershipCardProps) {
  const [qrDataUrl, setQrDataUrl] = React.useState(initialQr.qrDataUrl);
  const [secondsRemaining, setSecondsRemaining] = React.useState(
    initialQr.expiresInSeconds || 60
  );
  const [isRefreshing, setIsRefreshing] = React.useState(false);
  const [refreshError, setRefreshError] = React.useState<string | null>(null);

  const handleRefresh = React.useCallback(async () => {
    try {
      setIsRefreshing(true);
      setRefreshError(null);
      const res = await refreshDynamicQrAction(gym.slug);
      if (res.success && res.data?.qrDataUrl) {
        setQrDataUrl(res.data.qrDataUrl);
        setSecondsRemaining(60);
      } else {
        setRefreshError(res.error || "Failed to refresh QR.");
      }
    } catch {
      setRefreshError("Connection error while refreshing QR pass.");
    } finally {
      setIsRefreshing(false);
    }
  }, [gym.slug]);

  // Dynamic 60-second countdown timer
  React.useEffect(() => {
    const timer = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          handleRefresh();
          return 60;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [handleRefresh]);

  const formattedExpiry = membership
    ? new Date(membership.endDate).toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "No active plan";

  const getStatusBadge = () => {
    if (!membership || membership.expiryStatus === "NONE") {
      return (
        <Badge variant="outline" className="text-white border-white/30 text-xs">
          No Plan
        </Badge>
      );
    }
    if (membership.expiryStatus === "EXPIRED") {
      return (
        <Badge className="bg-rose-500 text-white border-none text-xs gap-1">
          Expired
        </Badge>
      );
    }
    if (membership.expiryStatus === "EXPIRING_SOON") {
      return (
        <Badge className="bg-amber-500 text-white border-none text-xs gap-1">
          {membership.daysRemaining}d Left
        </Badge>
      );
    }
    return (
      <Badge className="bg-emerald-500 text-white border-none text-xs gap-1">
        <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
        Active
      </Badge>
    );
  };

  return (
    <div className="w-full max-w-sm mx-auto">
      {/* Wallet-Style Digital Membership Card */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 p-6 text-white shadow-2xl border border-slate-800">
        {/* Holographic glowing background effect */}
        <div className="absolute -right-20 -top-20 h-52 w-52 rounded-full bg-indigo-500/20 blur-3xl" />
        <div className="absolute -left-20 -bottom-20 h-52 w-52 rounded-full bg-emerald-500/10 blur-3xl" />

        {/* Card Header: Gym Logo & Status */}
        <div className="relative z-10 flex items-start justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 backdrop-blur-md border border-white/15">
              {gym.logoUrl ? (
                <img
                  src={gym.logoUrl}
                  alt={gym.name}
                  className="h-7 w-7 object-contain rounded"
                />
              ) : (
                <Dumbbell className="h-5 w-5 text-indigo-300" />
              )}
            </div>
            <div>
              <h2 className="text-sm font-semibold tracking-wide text-white uppercase">
                {gym.name}
              </h2>
              <span className="text-[10px] uppercase tracking-wider text-indigo-300 font-medium flex items-center gap-1">
                <Sparkles className="h-2.5 w-2.5" /> Digital Pass
              </span>
            </div>
          </div>
          {getStatusBadge()}
        </div>

        {/* Member Name & Code */}
        <div className="relative z-10 mt-5">
          <span className="text-[11px] font-medium uppercase tracking-wider text-slate-400">
            Member Name
          </span>
          <h3 className="text-xl font-bold tracking-tight text-white capitalize">
            {member.fullName}
          </h3>
          <div className="mt-1 flex items-center gap-2">
            <span className="font-mono text-xs font-semibold text-indigo-300 bg-white/5 border border-white/10 px-2.5 py-0.5 rounded-full">
              ID: {member.memberCode}
            </span>
            <span className="text-xs text-slate-400">
              {membership?.planName || "General Membership"}
            </span>
          </div>
        </div>

        {/* Dynamic High-Contrast QR Code Display Box */}
        <div className="relative z-10 mt-5 flex flex-col items-center justify-center rounded-2xl bg-white p-4 shadow-inner text-slate-900">
          {qrDataUrl ? (
            <div className="relative">
              <img
                src={qrDataUrl}
                alt="Attendance Dynamic QR Pass"
                className="h-48 w-48 object-contain rounded-lg"
              />
              {/* Scan overlay guide border */}
              <div className="pointer-events-none absolute inset-0 rounded-lg border-2 border-dashed border-indigo-200/50" />
            </div>
          ) : (
            <div className="flex h-48 w-48 flex-col items-center justify-center gap-2 text-slate-400">
              <QrCode className="h-10 w-10" />
              <span className="text-xs font-medium">Generating QR...</span>
            </div>
          )}

          {/* QR Refresh / Timer Indicator */}
          <div className="mt-2.5 flex w-full items-center justify-between text-xs text-slate-600 px-1">
            <div className="flex items-center gap-1.5 font-mono text-[11px]">
              <span
                className={`inline-block h-2 w-2 rounded-full ${
                  secondsRemaining > 15
                    ? "bg-emerald-500 animate-pulse"
                    : "bg-amber-500 animate-ping"
                }`}
              />
              <span>Refreshes in {secondsRemaining}s</span>
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="h-6 text-[11px] font-medium text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 p-1 gap-1"
            >
              <RotateCw
                className={`h-3 w-3 ${isRefreshing ? "animate-spin" : ""}`}
              />
              <span>Refresh</span>
            </Button>
          </div>

          {refreshError && (
            <span className="mt-1 text-[10px] text-rose-600 font-medium">
              {refreshError}
            </span>
          )}
        </div>

        {/* Card Footer: Expiry & Security Token Note */}
        <div className="relative z-10 mt-4 flex items-center justify-between text-xs text-slate-400 border-t border-white/10 pt-3">
          <div className="flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5 text-slate-400" />
            <span>Valid through:</span>
            <span className="font-semibold text-slate-200">{formattedExpiry}</span>
          </div>
          <div className="flex items-center gap-1 text-[10px] text-slate-400">
            <ShieldCheck className="h-3 w-3 text-emerald-400" />
            <span>HMAC-SHA256</span>
          </div>
        </div>
      </div>

      {/* Helpful Kiosk Instructions Card */}
      <div className="mt-3 flex items-start gap-2 rounded-xl bg-slate-50 p-3 text-xs text-slate-600 border border-slate-200/80">
        <Info className="h-4 w-4 shrink-0 text-indigo-500 mt-0.5" />
        <p>
          Hold this QR code directly against the gym turnstile or front desk
          scanner to check in. For security, the QR regenerates every 60 seconds
          and does not store private data.
        </p>
      </div>
    </div>
  );
}

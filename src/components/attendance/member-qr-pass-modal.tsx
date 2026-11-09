"use client";

import * as React from "react";
import { useEffect, useState, useRef, useCallback, startTransition } from "react";
import QRCode from "qrcode";
import { getMemberDynamicQrPassAction } from "@/lib/actions/attendance";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { QrCode, ShieldCheck, RefreshCw, AlertCircle, Loader2, Clock } from "lucide-react";

interface MemberQrPassModalProps {
  isOpen: boolean;
  onClose: () => void;
  gymId: string;
  memberId: string;
  memberName: string;
  memberCode: string;
}

export function MemberQrPassModal({
  isOpen,
  onClose,
  gymId,
  memberId,
  memberName,
  memberCode,
}: MemberQrPassModalProps) {
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [secondsRemaining, setSecondsRemaining] = useState<number>(60);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [activePlan, setActivePlan] = useState<string | null>(null);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const fetchToken = useCallback(async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const res = await getMemberDynamicQrPassAction(gymId, memberId);
      if (!res.success || !res.data) {
        throw new Error(res.error || "Failed to generate attendance QR pass.");
      }

      const { qrData, member } = res.data;
      setActivePlan(member.activePlan);

      // Render QR code to high-resolution data URI
      const url = await QRCode.toDataURL(qrData, {
        width: 260,
        margin: 2,
        color: {
          dark: "#0B132B",
          light: "#FFFFFF",
        },
      });

      setQrDataUrl(url);
      setSecondsRemaining(60);
    } catch (err: unknown) {
      setErrorMsg((err as Error).message || "Failed to generate QR pass.");
    } finally {
      setIsLoading(false);
    }
  }, [gymId, memberId]);

  useEffect(() => {
    if (!isOpen) return;
    startTransition(() => {
      fetchToken();
    });

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isOpen, fetchToken]);

  // Countdown timer: refresh when expired
  useEffect(() => {
    if (!isOpen || isLoading) return;

    timerRef.current = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          fetchToken();
          return 60;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isOpen, isLoading, fetchToken]);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-sm text-center">
        <DialogHeader className="items-center text-center">
          <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 mb-1">
            <QrCode className="h-5 w-5" />
          </div>
          <DialogTitle className="text-base font-bold text-slate-900">
            Dynamic Attendance Pass
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-500">
            Scan at gym turnstile or front desk scanner for verified check-in.
          </DialogDescription>
        </DialogHeader>

        <div className="py-2 flex flex-col items-center">
          {/* Member Card Header */}
          <div className="mb-3 w-full rounded-xl bg-slate-50 p-3 border border-slate-200/80 text-left">
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs text-slate-900">{memberName}</span>
              <span className="font-mono text-[11px] font-semibold text-slate-700 bg-white px-2 py-0.5 rounded border border-slate-200">
                {memberCode}
              </span>
            </div>
            {activePlan && (
              <div className="mt-1 flex items-center gap-1.5 text-[11px] text-emerald-700 font-medium">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                <span>{activePlan}</span>
              </div>
            )}
          </div>

          {/* QR Code Container */}
          <div className="relative flex h-[260px] w-[260px] items-center justify-center rounded-2xl border-2 border-slate-200 bg-white p-2 shadow-xs">
            {isLoading ? (
              <div className="flex flex-col items-center gap-2 text-slate-400 text-xs">
                <Loader2 className="h-7 w-7 animate-spin text-emerald-600" />
                <span>Generating secure token...</span>
              </div>
            ) : errorMsg ? (
              <div className="p-4 text-center">
                <AlertCircle className="mx-auto h-7 w-7 text-rose-500 mb-2" />
                <p className="text-xs text-rose-700 font-medium">{errorMsg}</p>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={fetchToken}
                  className="mt-3 text-xs"
                >
                  Retry
                </Button>
              </div>
            ) : qrDataUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={qrDataUrl}
                alt="Member Attendance QR Pass"
                className="h-full w-full object-contain"
              />
            ) : null}
          </div>

          {/* Security & Countdown Banner */}
          {!errorMsg && (
            <div className="mt-4 flex items-center justify-between w-full px-2 text-xs">
              <div className="flex items-center gap-1.5 text-slate-500">
                <Clock className="h-3.5 w-3.5 text-slate-400" />
                <span>Refreshes in:</span>
                <Badge
                  variant="outline"
                  className={`font-mono text-[11px] font-bold ${
                    secondsRemaining <= 10
                      ? "text-rose-600 border-rose-200 bg-rose-50"
                      : "text-emerald-700 border-emerald-200 bg-emerald-50"
                  }`}
                >
                  {secondsRemaining}s
                </Badge>
              </div>

              <button
                type="button"
                onClick={fetchToken}
                disabled={isLoading}
                className="inline-flex items-center gap-1 text-[11px] text-slate-600 hover:text-emerald-700 transition"
              >
                <RefreshCw className={`h-3 w-3 ${isLoading ? "animate-spin" : ""}`} />
                <span>Refresh now</span>
              </button>
            </div>
          )}

          <p className="mt-3 text-[11px] text-slate-400 max-w-xs text-center">
            🔒 Dynamic HMAC-SHA256 encrypted credential. Screenshots expire after 60s to prevent unauthorized sharing.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}

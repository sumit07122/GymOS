"use client";

import * as React from "react";
import { useEffect, useRef, useState, useTransition } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { scanQrCodeAction } from "@/lib/actions/attendance";
import { ScanResult } from "@/lib/services/attendance.service";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Camera,
  CameraOff,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Loader2,
  ShieldCheck,
  User,
  Clock,
} from "lucide-react";

interface QrScannerCardProps {
  gymId: string;
  gymSlug: string;
  onScanSuccess?: (result: ScanResult) => void;
}

export function QrScannerCard({
  gymId,
  gymSlug,
  onScanSuccess,
}: QrScannerCardProps) {
  const [mode, setMode] = useState<"CHECK_IN" | "CHECK_OUT">("CHECK_IN");
  const [isScanning, setIsScanning] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isProcessing, startTransition] = useTransition();

  const [lastScanResult, setLastScanResult] = useState<{
    success: boolean;
    mode: "CHECK_IN" | "CHECK_OUT";
    message: string;
    member?: {
      fullName: string;
      memberCode: string;
      activePlan?: string | null;
      validUntil?: Date | string | null;
    };
  } | null>(null);

  const scannerRef = useRef<Html5Qrcode | null>(null);
  const isCooldownRef = useRef(false);

  const elementId = "attendance-qr-reader";

  const stopScanner = async () => {
    if (scannerRef.current) {
      try {
        if (scannerRef.current.isScanning) {
          await scannerRef.current.stop();
        }
        await scannerRef.current.clear();
      } catch {
        // Ignore stop errors on unmount
      } finally {
        scannerRef.current = null;
        setIsScanning(false);
      }
    }
  };

  const startScanner = async () => {
    setCameraError(null);
    setLastScanResult(null);

    // Check if browser supports mediaDevices
    if (
      typeof navigator === "undefined" ||
      !navigator.mediaDevices ||
      !navigator.mediaDevices.getUserMedia
    ) {
      setCameraError(
        "Camera hardware or MediaDevices API is unavailable in this browser environment. Please use HTTPS or access via localhost, or use the manual search below."
      );
      return;
    }

    try {
      const html5Qrcode = new Html5Qrcode(elementId);
      scannerRef.current = html5Qrcode;

      const cameras = await Html5Qrcode.getCameras();
      if (!cameras || cameras.length === 0) {
        setCameraError("No connected camera devices detected on this system.");
        return;
      }

      // Prefer rear/environment camera for handheld scanners, fallback to first camera
      const cameraId = cameras[cameras.length - 1].id;

      await html5Qrcode.start(
        cameraId,
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0,
        },
        (decodedText) => {
          handleDetectedCode(decodedText);
        },
        () => {
          // Frame scan error / no QR in frame - safe to ignore
        }
      );

      setIsScanning(true);
    } catch (err: unknown) {
      setCameraError(
        (err as Error)?.message ||
          "Camera access permission was denied or failed to initialize. Please grant camera permissions in your browser address bar."
      );
      setIsScanning(false);
    }
  };

  const handleDetectedCode = (decodedText: string) => {
    if (isCooldownRef.current || isProcessing) return;

    // Trigger cooldown to prevent frame spam
    isCooldownRef.current = true;

    startTransition(async () => {
      const formData = new FormData();
      formData.set("gymId", gymId);
      formData.set("gymSlug", gymSlug);
      formData.set("qrData", decodedText);
      formData.set("mode", mode);
      formData.set("deviceInfo", "Kiosk Front-Desk Scanner");

      const res = await scanQrCodeAction(null, formData);

      if (res.success && res.scanResult) {
        setLastScanResult({
          success: true,
          mode: res.scanResult.mode,
          message: res.scanResult.message,
          member: res.scanResult.member,
        });
        onScanSuccess?.(res.scanResult);
      } else {
        setLastScanResult({
          success: false,
          mode,
          message: res.error || "Attendance verification failed.",
          member: res.scanResult?.member,
        });
      }

      // Resume scanning after 2.5 seconds
      setTimeout(() => {
        isCooldownRef.current = false;
      }, 2500);
    });
  };

  useEffect(() => {
    return () => {
      stopScanner();
    };
  }, []);

  return (
    <Card className="border-slate-200 shadow-xs overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between pb-3 bg-slate-50/70 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <Camera className="h-5 w-5 text-emerald-600" />
          <CardTitle className="text-sm font-bold text-slate-900">
            Secure QR Camera Scanner
          </CardTitle>
        </div>

        {/* Mode Switcher */}
        <div className="flex items-center gap-1 bg-white p-1 rounded-lg border border-slate-200">
          <button
            type="button"
            onClick={() => setMode("CHECK_IN")}
            className={`px-3 py-1 text-xs font-semibold rounded-md transition ${
              mode === "CHECK_IN"
                ? "bg-emerald-600 text-white"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Check-In
          </button>
          <button
            type="button"
            onClick={() => setMode("CHECK_OUT")}
            className={`px-3 py-1 text-xs font-semibold rounded-md transition ${
              mode === "CHECK_OUT"
                ? "bg-emerald-600 text-white"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Check-Out
          </button>
        </div>
      </CardHeader>

      <CardContent className="p-4 sm:p-6 space-y-4">
        {/* Scanner Viewport */}
        <div className="relative mx-auto flex flex-col items-center justify-center max-w-md">
          <div
            id={elementId}
            className="w-full h-[280px] bg-slate-900 rounded-2xl overflow-hidden flex items-center justify-center relative border-2 border-slate-800"
          >
            {!isScanning && (
              <div className="text-center p-6 text-slate-400 space-y-3">
                <CameraOff className="mx-auto h-10 w-10 text-slate-600" />
                <div className="text-xs font-medium">Camera scanner is idle.</div>
                <Button
                  type="button"
                  size="sm"
                  onClick={startScanner}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs h-9 gap-1.5"
                >
                  <Camera className="h-4 w-4" />
                  <span>Start Camera Scanner</span>
                </Button>
              </div>
            )}
          </div>

          {/* Scanner Controls Bar */}
          {isScanning && (
            <div className="flex items-center justify-between w-full mt-3 px-1 text-xs">
              <span className="flex items-center gap-1.5 text-emerald-700 font-medium">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span>Camera live in {mode === "CHECK_IN" ? "Check-In" : "Check-Out"} mode</span>
              </span>

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={stopScanner}
                className="h-8 text-xs text-rose-600 border-rose-200 hover:bg-rose-50"
              >
                Stop Camera
              </Button>
            </div>
          )}

          {/* Camera Access Limitation Notice */}
          {cameraError && (
            <div className="mt-3 w-full rounded-xl bg-amber-50 p-3 border border-amber-200 text-xs text-amber-900 space-y-1">
              <div className="flex items-center gap-1.5 font-semibold">
                <AlertTriangle className="h-4 w-4 text-amber-600" />
                <span>Camera Device Limitation</span>
              </div>
              <p className="text-[11px] text-amber-800 leading-relaxed">
                {cameraError}
              </p>
            </div>
          )}
        </div>

        {/* Processing Indicator */}
        {isProcessing && (
          <div className="rounded-xl bg-slate-50 p-3 text-center flex items-center justify-center gap-2 text-xs text-slate-600 border border-slate-200 animate-pulse">
            <Loader2 className="h-4 w-4 animate-spin text-emerald-600" />
            <span>Verifying cryptographic signature and membership status...</span>
          </div>
        )}

        {/* Feedback Scan Result Banner */}
        {lastScanResult && !isProcessing && (
          <div
            className={`rounded-2xl p-4 border transition-all ${
              lastScanResult.success
                ? "bg-emerald-50/80 border-emerald-200 text-emerald-950"
                : "bg-rose-50/80 border-rose-200 text-rose-950"
            }`}
          >
            <div className="flex items-start gap-3">
              <div className="mt-0.5">
                {lastScanResult.success ? (
                  <CheckCircle2 className="h-6 w-6 text-emerald-600" />
                ) : (
                  <XCircle className="h-6 w-6 text-rose-600" />
                )}
              </div>

              <div className="space-y-1 flex-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm">
                    {lastScanResult.success ? "Verified Attendance Granted" : "Entry Access Rejected"}
                  </span>
                  <Badge
                    variant="outline"
                    className={`text-[10px] font-bold ${
                      lastScanResult.success
                        ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                        : "bg-rose-100 text-rose-800 border-rose-300"
                    }`}
                  >
                    {lastScanResult.mode}
                  </Badge>
                </div>

                <p className="text-xs font-medium leading-snug">
                  {lastScanResult.message}
                </p>

                {lastScanResult.member && (
                  <div className="mt-2 pt-2 border-t border-slate-200/60 flex flex-wrap items-center gap-4 text-xs">
                    <span className="flex items-center gap-1 font-semibold text-slate-800">
                      <User className="h-3.5 w-3.5 text-slate-500" />
                      <span>{lastScanResult.member.fullName}</span>
                      <span className="font-mono text-slate-500 font-normal">
                        ({lastScanResult.member.memberCode})
                      </span>
                    </span>

                    {lastScanResult.member.activePlan && (
                      <span className="flex items-center gap-1 text-slate-600">
                        <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                        <span>{lastScanResult.member.activePlan}</span>
                      </span>
                    )}

                    {lastScanResult.member.validUntil && (
                      <span className="flex items-center gap-1 text-slate-500">
                        <Clock className="h-3.5 w-3.5 text-slate-400" />
                        <span>Valid to: {new Date(lastScanResult.member.validUntil).toLocaleDateString()}</span>
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

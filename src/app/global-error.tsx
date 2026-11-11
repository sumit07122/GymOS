"use client";

import * as React from "react";
import Link from "next/link";
import { AlertTriangle, RefreshCw, Home, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  React.useEffect(() => {
    console.error("Critical Global Application Error:", error);
  }, [error]);

  return (
    <html lang="en">
      <body className="min-h-screen bg-[#F7FAF8] text-[#171C19] flex items-center justify-center p-4 font-sans antialiased">
        <div className="w-full max-w-md bg-white border border-[#E7ECE9] rounded-2xl p-6 sm:p-8 text-center shadow-lg relative overflow-hidden">
          {/* Subtle brand glow */}
          <div className="absolute -top-12 -right-12 w-36 h-36 bg-[#E8F9EE] rounded-full blur-2xl pointer-events-none" />
          <div className="absolute -bottom-12 -left-12 w-36 h-36 bg-[#1BC95A]/10 rounded-full blur-2xl pointer-events-none" />

          <div className="relative">
            <div className="h-14 w-14 rounded-2xl bg-[#E8F9EE] border border-[#1BC95A]/30 text-[#16A34A] flex items-center justify-center mx-auto mb-5 shadow-xs">
              <AlertTriangle className="h-7 w-7" />
            </div>

            <h1 className="text-xl font-bold tracking-tight text-[#171C19] font-display">
              Something Went Wrong
            </h1>

            <p className="mt-2 text-xs text-[#69736E] leading-relaxed">
              A temporary connection or server anomaly interrupted your request. Your gym data and tenant boundaries remain fully protected.
            </p>

            {error.digest && (
              <div className="mt-4 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#F7FAF8] border border-[#E7ECE9] text-[11px] font-mono text-[#69736E]">
                <ShieldCheck className="h-3.5 w-3.5 text-[#1BC95A]" />
                <span>Error Digest: {error.digest}</span>
              </div>
            )}

            <div className="mt-6 flex flex-col sm:flex-row gap-2.5 justify-center">
              <Button
                onClick={() => reset()}
                className="bg-[#1BC95A] hover:bg-[#16A34A] text-white font-semibold text-xs h-9 rounded-lg gap-2 shadow-xs transition"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                <span>Try Again</span>
              </Button>

              <Link href="/" className="inline-flex">
                <Button
                  variant="outline"
                  className="w-full border-[#E7ECE9] bg-white hover:bg-[#F7FAF8] text-[#171C19] text-xs h-9 rounded-lg gap-2 font-medium"
                >
                  <Home className="h-3.5 w-3.5" />
                  <span>Return to Home</span>
                </Button>
              </Link>
            </div>

            <p className="mt-6 text-[10px] text-[#69736E]/70 font-mono">
              FIXIA GymOS Cloud Platform &bull; Multi-Tenant Resilient Architecture
            </p>
          </div>
        </div>
      </body>
    </html>
  );
}

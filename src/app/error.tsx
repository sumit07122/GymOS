"use client";

import * as React from "react";
import Link from "next/link";
import { AlertTriangle, RefreshCw, Home, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function GlobalErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  React.useEffect(() => {
    // Log exception to client monitoring if configured
    console.error("Global application runtime error:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-2xl p-6 sm:p-8 text-center shadow-2xl relative overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute -top-12 -right-12 w-36 h-36 bg-rose-500/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-12 -left-12 w-36 h-36 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative">
          <div className="h-14 w-14 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center mx-auto mb-5">
            <AlertTriangle className="h-7 w-7" />
          </div>

          <h1 className="text-xl font-bold tracking-tight text-white font-display">
            Application Encountered an Error
          </h1>

          <p className="mt-2 text-xs text-zinc-400 leading-relaxed">
            A temporary system or connection anomaly interrupted your request. Your data and tenant boundaries remain fully protected.
          </p>

          {error.digest && (
            <div className="mt-4 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-zinc-950 border border-zinc-800 text-[11px] font-mono text-zinc-400">
              <ShieldAlert className="h-3 w-3 text-rose-400" />
              <span>Reference Digest: {error.digest}</span>
            </div>
          )}

          <div className="mt-6 flex flex-col sm:flex-row gap-2.5 justify-center">
            <Button
              onClick={() => reset()}
              className="bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-semibold text-xs h-9 rounded-lg gap-2"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              <span>Reload Workspace</span>
            </Button>

            <Link href="/" className="inline-flex">
              <Button
                variant="outline"
                className="w-full border-zinc-800 bg-zinc-950 hover:bg-zinc-800 text-zinc-300 text-xs h-9 rounded-lg gap-2"
              >
                <Home className="h-3.5 w-3.5" />
                <span>Return to Home</span>
              </Button>
            </Link>
          </div>

          <p className="mt-6 text-[10px] text-zinc-500">
            FIXIA GymOS Cloud Platform &bull; Multi-Tenant Resilient Architecture
          </p>
        </div>
      </div>
    </div>
  );
}


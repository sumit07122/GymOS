"use client";

import * as React from "react";
import Link from "next/link";
import { AlertCircle, RefreshCw, LayoutDashboard, KeyRound } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function PlatformAdminErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  React.useEffect(() => {
    console.error("Platform Admin Workspace Error:", error);
  }, [error]);

  return (
    <div className="max-w-xl mx-auto my-12 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm text-center">
      <div className="h-12 w-12 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto mb-4">
        <AlertCircle className="h-6 w-6" />
      </div>

      <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 font-display">
        Platform Administration Exception
      </h2>

      <p className="mt-2 text-xs text-zinc-600 dark:text-zinc-400 max-w-md mx-auto leading-relaxed">
        {error.message ||
          "An error occurred while loading platform metrics or SaaS tier entitlements. Check database connection string in Vercel environment variables."}
      </p>

      {error.digest && (
        <p className="mt-3 text-[11px] font-mono text-zinc-500">
          Digest: {error.digest}
        </p>
      )}

      <div className="mt-6 flex flex-wrap gap-2.5 justify-center">
        <Button
          onClick={() => reset()}
          className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs h-9 rounded-lg gap-2"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          <span>Retry Operation</span>
        </Button>

        <Link href="/platform-admin">
          <Button
            variant="outline"
            className="border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-200 text-xs h-9 rounded-lg gap-2"
          >
            <LayoutDashboard className="h-3.5 w-3.5" />
            <span>Platform Overview</span>
          </Button>
        </Link>

        <Link href="/platform-admin/login">
          <Button
            variant="ghost"
            className="text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 text-xs h-9 gap-1.5"
          >
            <KeyRound className="h-3.5 w-3.5" />
            <span>Re-authenticate</span>
          </Button>
        </Link>
      </div>
    </div>
  );
}


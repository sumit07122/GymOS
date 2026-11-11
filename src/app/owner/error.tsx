"use client";

import * as React from "react";
import Link from "next/link";
import { AlertTriangle, RefreshCw, LayoutDashboard, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function OwnerWorkspaceErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  React.useEffect(() => {
    console.error("Gym Owner Workspace Error:", error);
  }, [error]);

  return (
    <div className="max-w-xl mx-auto my-12 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm text-center">
      <div className="h-12 w-12 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 flex items-center justify-center mx-auto mb-4">
        <AlertTriangle className="h-6 w-6" />
      </div>

      <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 font-display">
        Gym Workspace Exception
      </h2>

      <p className="mt-2 text-xs text-zinc-600 dark:text-zinc-400 max-w-md mx-auto leading-relaxed">
        {error.message ||
          "An error occurred loading the gym operations module. Ensure your gym session is active and database connection is online."}
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
          <span>Reload View</span>
        </Button>

        <Link href="/owner/dashboard">
          <Button
            variant="outline"
            className="border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-200 text-xs h-9 rounded-lg gap-2"
          >
            <LayoutDashboard className="h-3.5 w-3.5" />
            <span>Dashboard Home</span>
          </Button>
        </Link>

        <Link href="/login">
          <Button
            variant="ghost"
            className="text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 text-xs h-9 gap-1.5"
          >
            <LogIn className="h-3.5 w-3.5" />
            <span>Switch Account</span>
          </Button>
        </Link>
      </div>
    </div>
  );
}

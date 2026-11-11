import * as React from "react";
import Link from "next/link";
import { Dumbbell, Home, LayoutDashboard, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-2xl p-6 sm:p-8 text-center shadow-2xl relative overflow-hidden">
        {/* Glow */}
        <div className="absolute -top-12 -left-12 w-36 h-36 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative">
          <div className="h-14 w-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto mb-5">
            <Dumbbell className="h-7 w-7" />
          </div>

          <div className="text-4xl font-extrabold tracking-tight text-white font-display mb-1">
            404
          </div>

          <h1 className="text-base font-bold text-zinc-200">
            Page or Workspace Not Found
          </h1>

          <p className="mt-2 text-xs text-zinc-400 leading-relaxed">
            The route or tenant resource you requested does not exist, has been moved to a canonical URL, or requires privileged authorization.
          </p>

          <div className="mt-6 flex flex-col gap-2">
            <Link href="/" className="w-full">
              <Button className="w-full bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-semibold text-xs h-9 rounded-lg gap-2">
                <Home className="h-3.5 w-3.5" />
                <span>Return to Flagship Home</span>
              </Button>
            </Link>

            <div className="grid grid-cols-2 gap-2 mt-1">
              <Link href="/owner/dashboard">
                <Button
                  variant="outline"
                  className="w-full border-zinc-800 bg-zinc-950 hover:bg-zinc-800 text-zinc-300 text-xs h-8 rounded-lg gap-1.5"
                >
                  <LayoutDashboard className="h-3 w-3 text-emerald-400" />
                  <span>Owner ERP</span>
                </Button>
              </Link>
              <Link href="/platform-admin">
                <Button
                  variant="outline"
                  className="w-full border-zinc-800 bg-zinc-950 hover:bg-zinc-800 text-zinc-300 text-xs h-8 rounded-lg gap-1.5"
                >
                  <ShieldCheck className="h-3 w-3 text-emerald-400" />
                  <span>Platform Admin</span>
                </Button>
              </Link>
            </div>
          </div>

          <p className="mt-6 text-[10px] text-zinc-500">
            FIXIA GymOS &bull; Operating System for High-Performance Gyms
          </p>
        </div>
      </div>
    </div>
  );
}

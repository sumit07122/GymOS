"use client";

import * as React from "react";
import { useActionState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Dumbbell, ArrowLeft, Loader2, AlertCircle, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { memberLoginAction } from "@/lib/auth/actions";

export default function GymBrandedLoginPage() {
  const params = useParams();
  const router = useRouter();
  const gymSlug = (params?.gymSlug as string) || "";

  const [state, formAction, isPending] = useActionState(memberLoginAction, null);

  useEffect(() => {
    if (state?.success && state.redirectUrl) {
      router.push(state.redirectUrl);
    }
  }, [state, router]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link
          href={`/g/${gymSlug}`}
          className="inline-flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300 font-semibold mb-4"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to Gym Website</span>
        </Link>

        <div className="flex items-center justify-center gap-2 mb-2">
          <div className="size-11 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-bold shadow-lg shadow-indigo-600/30">
            <Dumbbell className="size-6" />
          </div>
        </div>

        <h1 className="text-xl sm:text-2xl font-black text-white capitalize">
          {gymSlug.replace(/-/g, " ")} Member Portal
        </h1>
        <p className="mt-1 text-xs text-slate-400">
          Sign in to access your digital membership pass, workouts, and attendance.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <Card className="border-slate-800 bg-slate-900/90 shadow-2xl backdrop-blur-md text-slate-100">
          <CardHeader className="pb-4">
            <CardTitle className="text-base font-bold text-white">Member Sign In</CardTitle>
            <CardDescription className="text-xs text-slate-400">
              Enter your registered member email and password.
            </CardDescription>
          </CardHeader>

          <form action={formAction}>
            <input type="hidden" name="gymSlug" value={gymSlug} />

            <CardContent className="space-y-4">
              {state?.error && (
                <div className="rounded-xl border border-rose-500/30 bg-rose-950/40 p-3 text-xs text-rose-300 flex items-start gap-2.5">
                  <AlertCircle className="h-4 w-4 shrink-0 text-rose-400 mt-0.5" />
                  <span>{state.error}</span>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">
                  Gym Workspace
                </label>
                <Input
                  disabled
                  value={`/g/${gymSlug}`}
                  className="bg-slate-950 border-slate-700 text-slate-400 text-xs h-9 font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300" htmlFor="email">
                  Member Email Address
                </label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  required
                  placeholder="member@gmail.com"
                  className="bg-slate-950 border-slate-700 text-white text-xs h-9"
                  disabled={isPending}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300" htmlFor="password">
                  Password
                </label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  required
                  placeholder="••••••••"
                  className="bg-slate-950 border-slate-700 text-white text-xs h-9"
                  disabled={isPending}
                />
              </div>
            </CardContent>

            <CardFooter className="flex flex-col gap-3 pt-2">
              <Button
                type="submit"
                disabled={isPending}
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs h-10 cursor-pointer shadow-md shadow-indigo-600/30"
              >
                {isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Authenticating...
                  </>
                ) : (
                  "Access Member Portal"
                )}
              </Button>

              <div className="text-center text-[11px] text-slate-500 flex items-center justify-center gap-1.5 pt-2">
                <ShieldCheck className="h-3.5 w-3.5 text-indigo-400" />
                <span>Secured by FIXIA GymOS &bull; gms.fixia.in</span>
              </div>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}

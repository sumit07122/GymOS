"use client";

import { useActionState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { superAdminLoginAction } from "@/lib/auth/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { ShieldCheck, Loader2, AlertCircle, ArrowLeft } from "lucide-react";

function SuperAdminLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnUrl = searchParams.get("returnUrl");
  const [state, formAction, isPending] = useActionState(superAdminLoginAction, null);

  useEffect(() => {
    if (state?.success && state.redirectUrl) {
      router.push(returnUrl || state.redirectUrl);
    }
  }, [state, router, returnUrl]);

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md">
        <Link
          href="/login"
          className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white mb-6 transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to standard login
        </Link>

        <Card className="border-indigo-500/30 bg-slate-900/90 shadow-2xl backdrop-blur-md">
          <CardHeader className="space-y-1 pb-4 text-center">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 flex items-center justify-center mx-auto mb-2">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <CardTitle className="text-xl font-bold tracking-tight text-white">
              FIXIA Platform Administration
            </CardTitle>
            <CardDescription className="text-xs text-slate-400">
              Restricted area. Authorized FIXIA Super Administrators only.
            </CardDescription>
          </CardHeader>

          <form action={formAction}>
            <CardContent className="space-y-4 pt-2">
              {state?.error && (
                <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-3 text-xs text-red-400 flex items-start gap-2">
                  <AlertCircle className="size-4 shrink-0 mt-0.5" />
                  <span>{state.error}</span>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-200" htmlFor="admin-email">
                  Administrator Email
                </label>
                <Input
                  id="admin-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  placeholder="admin@fixia.in"
                  className="h-10 text-sm bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 focus-visible:ring-indigo-500"
                  disabled={isPending}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-200" htmlFor="admin-password">
                  Master Password
                </label>
                <Input
                  id="admin-password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  placeholder="••••••••"
                  className="h-10 text-sm bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 focus-visible:ring-indigo-500"
                  disabled={isPending}
                />
              </div>
            </CardContent>

            <CardFooter className="pt-2">
              <Button
                type="submit"
                className="w-full h-10 font-semibold text-sm cursor-pointer bg-indigo-600 hover:bg-indigo-500 text-white transition shadow-lg shadow-indigo-600/25"
                disabled={isPending}
              >
                {isPending ? (
                  <>
                    <Loader2 className="size-4 animate-spin mr-2" />
                    Authenticating Platform Admin...
                  </>
                ) : (
                  "Authenticate & Access Admin"
                )}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}

export default function SuperAdminLoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-8">
          <Loader2 className="size-6 animate-spin text-indigo-400" />
        </div>
      }
    >
      <SuperAdminLoginForm />
    </Suspense>
  );
}

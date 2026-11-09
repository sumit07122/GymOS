"use client";

import { useActionState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { resetPasswordAction } from "@/lib/auth/actions";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Dumbbell, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";
  const [state, formAction, isPending] = useActionState(resetPasswordAction, null);

  if (!token) {
    return (
      <CardContent className="space-y-4 pt-4">
        <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-4 text-xs text-destructive flex items-start gap-3">
          <AlertCircle className="size-5 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-semibold text-sm">Missing Reset Token</p>
            <p className="leading-relaxed">
              This password reset link is invalid or incomplete. Please request a new link.
            </p>
          </div>
        </div>
        <Link
          href="/forgot-password"
          className={cn(buttonVariants(), "w-full h-10 mt-2 font-medium justify-center")}
        >
          Request New Reset Link
        </Link>
      </CardContent>
    );
  }

  return (
    <>
      {state?.success ? (
        <CardContent className="space-y-4 pt-4">
          <div className="rounded-lg bg-emerald-500/10 border border-emerald-500/20 p-4 text-xs text-emerald-700 dark:text-emerald-400 flex items-start gap-3">
            <CheckCircle2 className="size-5 shrink-0 mt-0.5 text-emerald-600 dark:text-emerald-400" />
            <div className="space-y-1">
              <p className="font-semibold text-sm">Password Successfully Reset</p>
              <p className="leading-relaxed">{state.message}</p>
            </div>
          </div>
          <Link
            href="/login"
            className={cn(buttonVariants(), "w-full h-10 mt-2 font-medium justify-center")}
          >
            Proceed to Sign In
          </Link>
        </CardContent>
      ) : (
        <form action={formAction}>
          <input type="hidden" name="token" value={token} />

          <CardContent className="space-y-4">
            {state?.error && (
              <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-3 text-xs text-destructive flex items-start gap-2">
                <AlertCircle className="size-4 shrink-0 mt-0.5" />
                <span>{state.error}</span>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground" htmlFor="password">
                New Password
              </label>
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                placeholder="At least 8 characters"
                className="h-10 text-sm"
                disabled={isPending}
              />
              {state?.fieldErrors?.password && (
                <p className="text-[11px] text-destructive">{state.fieldErrors.password[0]}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground" htmlFor="confirmPassword">
                Confirm New Password
              </label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                required
                placeholder="Re-enter your new password"
                className="h-10 text-sm"
                disabled={isPending}
              />
              {state?.fieldErrors?.confirmPassword && (
                <p className="text-[11px] text-destructive">
                  {state.fieldErrors.confirmPassword[0]}
                </p>
              )}
            </div>
          </CardContent>

          <CardFooter className="flex flex-col gap-4 pt-2">
            <Button
              type="submit"
              className="w-full h-10 font-semibold text-sm cursor-pointer"
              disabled={isPending}
            >
              {isPending ? (
                <>
                  <Loader2 className="size-4 animate-spin mr-2" />
                  Updating password...
                </>
              ) : (
                "Update Password"
              )}
            </Button>

            <div className="text-center text-xs text-muted-foreground">
              Remember your password?{" "}
              <Link href="/login" className="text-primary hover:underline font-semibold">
                Sign in here
              </Link>
            </div>
          </CardFooter>
        </form>
      )}
    </>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex items-center justify-center gap-2 mb-2">
          <div className="size-10 rounded-xl bg-primary text-primary-foreground flex items-center justify-center font-bold shadow-sm">
            <Dumbbell className="size-6" />
          </div>
          <span className="font-extrabold text-2xl tracking-tight text-foreground">FIXIA</span>
          <span className="text-muted-foreground text-xs font-bold uppercase tracking-widest ml-1 bg-secondary px-2 py-0.5 rounded">
            GymOS
          </span>
        </div>
        <h2 className="text-center text-xl font-bold tracking-tight text-foreground mt-2">
          Choose a new password
        </h2>
        <p className="text-center text-xs text-muted-foreground mt-1">
          Must be at least 8 characters with numbers and special symbols
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <Card className="border-border/60 shadow-sm bg-card">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-lg">Set New Password</CardTitle>
            <CardDescription className="text-xs">
              Updating your password will automatically sign out all existing devices
            </CardDescription>
          </CardHeader>

          <Suspense
            fallback={
              <CardContent className="flex justify-center py-8">
                <Loader2 className="size-6 animate-spin text-muted-foreground" />
              </CardContent>
            }
          >
            <ResetPasswordForm />
          </Suspense>
        </Card>
      </div>
    </div>
  );
}


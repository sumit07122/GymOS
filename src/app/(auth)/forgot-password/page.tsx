"use client";

import { useActionState } from "react";
import Link from "next/link";
import { forgotPasswordAction } from "@/lib/auth/actions";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Dumbbell, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";

export default function ForgotPasswordPage() {
  const [state, formAction, isPending] = useActionState(forgotPasswordAction, null);

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
          Reset your password
        </h2>
        <p className="text-center text-xs text-muted-foreground mt-1">
          Enter your email and we will dispatch a single-use reset link
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <Card className="border-border/60 shadow-sm bg-card">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-lg">Forgot Password</CardTitle>
            <CardDescription className="text-xs">
              Password reset links expire in 15 minutes for your security
            </CardDescription>
          </CardHeader>

          {state?.success ? (
            <CardContent className="space-y-4 pt-2">
              <div className="rounded-lg bg-emerald-500/10 border border-emerald-500/20 p-4 text-xs text-emerald-700 dark:text-emerald-400 flex items-start gap-3">
                <CheckCircle2 className="size-5 shrink-0 mt-0.5 text-emerald-600 dark:text-emerald-400" />
                <div className="space-y-1">
                  <p className="font-semibold text-sm">Reset link dispatched</p>
                  <p className="leading-relaxed">{state.message}</p>
                </div>
              </div>
              <Link
                href="/login"
                className={cn(buttonVariants(), "w-full h-10 mt-2 font-medium justify-center")}
              >
                Return to login
              </Link>
            </CardContent>
          ) : (
            <form action={formAction}>
              <CardContent className="space-y-4">
                {state?.error && (
                  <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-3 text-xs text-destructive flex items-start gap-2">
                    <AlertCircle className="size-4 shrink-0 mt-0.5" />
                    <span>{state.error}</span>
                  </div>
                )}

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground" htmlFor="email">
                    Account Email Address
                  </label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    placeholder="name@gym.com"
                    className="h-10 text-sm"
                    disabled={isPending}
                  />
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
                      Sending reset link...
                    </>
                  ) : (
                    "Send Reset Link"
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
        </Card>
      </div>
    </div>
  );
}


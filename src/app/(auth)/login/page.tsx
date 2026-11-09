"use client";

import { useActionState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { loginAction } from "@/lib/auth/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Dumbbell, Loader2, AlertCircle } from "lucide-react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnUrl = searchParams.get("returnUrl");
  const [state, formAction, isPending] = useActionState(loginAction, null);

  useEffect(() => {
    if (state?.success && state.redirectUrl) {
      router.push(returnUrl || state.redirectUrl);
    }
  }, [state, router, returnUrl]);

  return (
    <Card className="border-border/60 shadow-sm bg-card">
      <CardHeader className="space-y-1 pb-4">
        <CardTitle className="text-lg">Welcome back</CardTitle>
        <CardDescription className="text-xs">
          Enter your credentials to access your account
        </CardDescription>
      </CardHeader>

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
              Email address
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

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-foreground" htmlFor="password">
                Password
              </label>
              <Link
                href="/forgot-password"
                className="text-xs text-primary hover:underline font-medium"
              >
                Forgot password?
              </Link>
            </div>
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              placeholder="••••••••"
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
                Signing in...
              </>
            ) : (
              "Sign in"
            )}
          </Button>

          <div className="text-center text-xs text-muted-foreground">
            Looking to start with FIXIA?{" "}
            <Link href="/register" className="text-primary hover:underline font-semibold">
              Register your gym
            </Link>
          </div>
        </CardFooter>
      </form>
    </Card>
  );
}

export default function LoginPage() {
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
          Sign in to your dashboard
        </h2>
        <p className="text-center text-xs text-muted-foreground mt-1">
          Owners, staff, and members access their portal here
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <Suspense
          fallback={
            <Card className="border-border/60 shadow-sm bg-card p-8 flex justify-center">
              <Loader2 className="size-6 animate-spin text-muted-foreground" />
            </Card>
          }
        >
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}

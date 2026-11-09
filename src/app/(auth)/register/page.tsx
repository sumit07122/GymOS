"use client";

import { useActionState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { registerOwnerAction } from "@/lib/auth/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Dumbbell, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(registerOwnerAction, null);

  useEffect(() => {
    if (state?.success && state.redirectUrl) {
      router.push(state.redirectUrl);
    }
  }, [state, router]);

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
          Create your gym workspace
        </h2>
        <p className="text-center text-xs text-muted-foreground mt-1">
          Set up your complete gym operating system in 60 seconds
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <Card className="border-border/60 shadow-sm bg-card">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-lg">Gym Owner Registration</CardTitle>
            <CardDescription className="text-xs">
              Provision your tenant database and admin account
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
                <label className="text-xs font-semibold text-foreground" htmlFor="gymName">
                  Gym / Fitness Business Name
                </label>
                <Input
                  id="gymName"
                  name="gymName"
                  type="text"
                  required
                  placeholder="e.g. IronForge Fitness Club"
                  className="h-10 text-sm"
                  disabled={isPending}
                />
                {state?.fieldErrors?.gymName && (
                  <p className="text-[11px] text-destructive">{state.fieldErrors.gymName[0]}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground" htmlFor="ownerName">
                  Your Full Name
                </label>
                <Input
                  id="ownerName"
                  name="ownerName"
                  type="text"
                  required
                  placeholder="e.g. Alex Morgan"
                  className="h-10 text-sm"
                  disabled={isPending}
                />
                {state?.fieldErrors?.ownerName && (
                  <p className="text-[11px] text-destructive">{state.fieldErrors.ownerName[0]}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground" htmlFor="email">
                  Business Email Address
                </label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  placeholder="alex@ironforge.com"
                  className="h-10 text-sm"
                  disabled={isPending}
                />
                {state?.fieldErrors?.email && (
                  <p className="text-[11px] text-destructive">{state.fieldErrors.email[0]}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground" htmlFor="password">
                  Password
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
                <div className="rounded-md bg-secondary/50 p-2 text-[11px] text-muted-foreground space-y-0.5 mt-1">
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="size-3 text-primary" />
                    <span>8+ characters (uppercase, lowercase, number, special symbol)</span>
                  </div>
                </div>
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
                    Provisioning workspace...
                  </>
                ) : (
                  "Create Gym Workspace"
                )}
              </Button>

              <div className="text-center text-xs text-muted-foreground">
                Already registered?{" "}
                <Link href="/login" className="text-primary hover:underline font-semibold">
                  Sign in here
                </Link>
              </div>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}


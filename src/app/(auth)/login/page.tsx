"use client";

import { useActionState, useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { loginAction, memberLoginAction } from "@/lib/auth/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Dumbbell, User, ShieldCheck, Loader2, AlertCircle } from "lucide-react";

function LoginFormInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnUrl = searchParams.get("returnUrl");
  const prefillGym = searchParams.get("gym") || "";

  const [activeTab, setActiveTab] = useState<"OWNER" | "MEMBER">(
    prefillGym ? "MEMBER" : "OWNER"
  );
  const [gymSlug, setGymSlug] = useState(prefillGym);

  const [ownerState, ownerAction, isOwnerPending] = useActionState(loginAction, null);
  const [memberState, memberFormAction, isMemberPending] = useActionState(memberLoginAction, null);

  useEffect(() => {
    if (ownerState?.success && ownerState.redirectUrl) {
      router.push(returnUrl || ownerState.redirectUrl);
    }
  }, [ownerState, router, returnUrl]);

  useEffect(() => {
    if (memberState?.success && memberState.redirectUrl) {
      router.push(returnUrl || memberState.redirectUrl);
    }
  }, [memberState, router, returnUrl]);

  return (
    <Card className="border-border/60 shadow-lg bg-card/95 backdrop-blur-sm">
      <CardHeader className="space-y-1 pb-4 text-center">
        <div className="flex justify-center mb-2">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600/10 border border-indigo-600/20 text-indigo-500 flex items-center justify-center font-black text-xl">
            FG
          </div>
        </div>
        <CardTitle className="text-xl font-bold tracking-tight">FIXIA GymOS</CardTitle>
        <CardDescription className="text-xs text-muted-foreground">
          Select your portal to sign in to your workspace
        </CardDescription>

        {/* Tab Selector */}
        <div className="grid grid-cols-2 gap-1.5 p-1 bg-muted/60 rounded-xl mt-4 border border-border/40">
          <button
            type="button"
            onClick={() => setActiveTab("OWNER")}
            className={`py-2 text-xs font-semibold rounded-lg flex items-center justify-center gap-2 transition ${
              activeTab === "OWNER"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Dumbbell className="w-3.5 h-3.5" />
            Gym Owner
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("MEMBER")}
            className={`py-2 text-xs font-semibold rounded-lg flex items-center justify-center gap-2 transition ${
              activeTab === "MEMBER"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <User className="w-3.5 h-3.5" />
            Gym Member
          </button>
        </div>
      </CardHeader>

      {activeTab === "OWNER" ? (
        <form action={ownerAction}>
          <CardContent className="space-y-4 pt-2">
            {ownerState?.error && (
              <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-3 text-xs text-destructive flex items-start gap-2">
                <AlertCircle className="size-4 shrink-0 mt-0.5" />
                <span>{ownerState.error}</span>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground" htmlFor="owner-email">
                Owner Email address
              </label>
              <Input
                id="owner-email"
                name="email"
                type="email"
                autoComplete="email"
                required
                placeholder="owner@yourgym.com"
                className="h-10 text-sm"
                disabled={isOwnerPending}
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-foreground" htmlFor="owner-password">
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
                id="owner-password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                placeholder="••••••••"
                className="h-10 text-sm"
                disabled={isOwnerPending}
              />
            </div>
          </CardContent>

          <CardFooter className="flex flex-col gap-4 pt-2">
            <Button
              type="submit"
              className="w-full h-10 font-semibold text-sm cursor-pointer bg-indigo-600 hover:bg-indigo-500 text-white"
              disabled={isOwnerPending}
            >
              {isOwnerPending ? (
                <>
                  <Loader2 className="size-4 animate-spin mr-2" />
                  Signing into Gym Dashboard...
                </>
              ) : (
                "Sign In as Gym Owner"
              )}
            </Button>
          </CardFooter>
        </form>
      ) : (
        <form action={memberFormAction}>
          <CardContent className="space-y-4 pt-2">
            {memberState?.error && (
              <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-3 text-xs text-destructive flex items-start gap-2">
                <AlertCircle className="size-4 shrink-0 mt-0.5" />
                <span>{memberState.error}</span>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground" htmlFor="gym-slug">
                Gym Code or URL Slug
              </label>
              <Input
                id="gym-slug"
                name="gymSlug"
                type="text"
                required
                value={gymSlug}
                onChange={(e) => setGymSlug(e.target.value)}
                placeholder="e.g. spartan-athletics"
                className="h-10 text-sm"
                disabled={isMemberPending}
              />
              <p className="text-[11px] text-muted-foreground">
                Enter your gym&apos;s unique identifier provided on your registration or membership card.
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground" htmlFor="member-email">
                Member Email address
              </label>
              <Input
                id="member-email"
                name="email"
                type="email"
                autoComplete="email"
                required
                placeholder="member@example.com"
                className="h-10 text-sm"
                disabled={isMemberPending}
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-foreground" htmlFor="member-password">
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
                id="member-password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                placeholder="••••••••"
                className="h-10 text-sm"
                disabled={isMemberPending}
              />
            </div>
          </CardContent>

          <CardFooter className="flex flex-col gap-4 pt-2">
            <Button
              type="submit"
              className="w-full h-10 font-semibold text-sm cursor-pointer bg-emerald-600 hover:bg-emerald-500 text-white"
              disabled={isMemberPending}
            >
              {isMemberPending ? (
                <>
                  <Loader2 className="size-4 animate-spin mr-2" />
                  Accessing Member Portal...
                </>
              ) : (
                "Sign In to Member Portal"
              )}
            </Button>
          </CardFooter>
        </form>
      )}

      {/* Super Admin Login Link */}
      <div className="border-t border-border/40 py-3 px-6 bg-muted/20 text-center rounded-b-xl flex items-center justify-between">
        <span className="text-[11px] text-muted-foreground flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
          FIXIA Administration?
        </span>
        <Link
          href="/platform-admin/login"
          className="text-[11px] text-indigo-400 hover:text-indigo-300 font-semibold hover:underline"
        >
          Super Admin Login &rarr;
        </Link>
      </div>
    </Card>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center p-8">
          <Loader2 className="size-6 animate-spin text-primary" />
        </div>
      }
    >
      <LoginFormInner />
    </Suspense>
  );
}

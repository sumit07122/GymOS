import Link from "next/link";
import { ShieldCheck, Mail, ArrowRight, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="inline-flex items-center justify-center gap-2 mb-4">
          <div className="size-11 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-bold shadow-lg shadow-indigo-500/20">
            <ShieldCheck className="size-6" />
          </div>
          <span className="font-extrabold text-2xl tracking-tight text-white">FIXIA</span>
          <span className="text-indigo-400 text-xs font-bold uppercase tracking-widest bg-indigo-950/80 border border-indigo-800 px-2.5 py-0.5 rounded-full">
            GymOS
          </span>
        </div>
        <h1 className="text-2xl font-black tracking-tight text-white sm:text-3xl">
          Managed SaaS Platform
        </h1>
        <p className="mt-2 text-xs sm:text-sm text-slate-400 max-w-sm mx-auto">
          Enterprise Multi-Tenant Gym Management Infrastructure
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <Card className="border-slate-800 bg-slate-900/90 shadow-2xl backdrop-blur-md text-slate-100">
          <CardHeader className="space-y-2 pb-4 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Lock className="h-6 w-6" />
            </div>
            <CardTitle className="text-lg font-bold text-white">
              Invitation-Only Platform
            </CardTitle>
            <CardDescription className="text-xs text-slate-400 leading-relaxed">
              Public self-registration is closed. Every gym tenant workspace, owner account, and feature entitlement is manually provisioned and verified directly by the FIXIA SaaS administration team.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4 pt-2">
            <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-4 space-y-3">
              <div className="text-xs font-semibold text-slate-300">
                Are you a Gym Owner interested in FIXIA GymOS?
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                We configure your custom branding, pricing plans, member quotas, and hardware integrations tailored specifically for your gym operations.
              </p>
              <div className="flex items-center gap-2 text-xs font-mono text-indigo-300 bg-indigo-950/40 border border-indigo-900/50 p-2.5 rounded-lg">
                <Mail className="h-4 w-4 shrink-0 text-indigo-400" />
                <a href="mailto:onboarding@fixia.in" className="hover:underline">
                  onboarding@fixia.in
                </a>
              </div>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-950/40 p-4 space-y-2">
              <div className="text-xs font-semibold text-slate-300">
                Already have an active account?
              </div>
              <p className="text-[11px] text-slate-400">
                Gym owners and members can access their workspaces using the verified login portal.
              </p>
            </div>
          </CardContent>

          <CardFooter className="flex flex-col gap-3 pt-2">
            <Link href="/login" className="w-full">
              <Button className="w-full h-11 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs gap-2 cursor-pointer shadow-md shadow-indigo-600/30">
                <span>Go to Secure Login</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>

            <div className="text-center text-[11px] text-slate-500">
              Official FIXIA Cloud Platform &bull;{" "}
              <span className="text-slate-400">https://gms.fixia.in</span>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}

import Link from "next/link";
import { Mail, ArrowRight, Lock, Dumbbell, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";

export default function RegisterPage() {
  return (
    <div className="min-h-[100dvh] w-full bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-4 py-8 sm:p-6 md:p-8 relative overflow-y-auto selection:bg-indigo-500 selection:text-white">
      {/* Background Decorative Ambient Glows */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-gradient-to-b from-indigo-600/20 via-purple-600/10 to-transparent blur-3xl pointer-events-none" />
      <div className="fixed bottom-0 right-1/4 w-[450px] h-[320px] bg-indigo-900/10 blur-3xl pointer-events-none" />

      {/* Main Centered Container */}
      <div className="w-full max-w-md relative z-10 flex flex-col items-center my-auto">
        {/* Brand Header */}
        <div className="text-center mb-6">
          <Link href="/" className="inline-flex items-center gap-3 group">
            <div className="size-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-indigo-500 text-white flex items-center justify-center font-bold shadow-xl shadow-indigo-600/25 ring-1 ring-white/10 group-hover:scale-105 transition-transform duration-200">
              <Dumbbell className="size-6 text-white" />
            </div>
            <div className="text-left">
              <div className="flex items-center gap-2">
                <span className="font-black text-2xl tracking-tight text-white">FIXIA</span>
                <span className="text-[10px] font-extrabold uppercase tracking-widest bg-indigo-950/90 border border-indigo-700/60 text-indigo-300 px-2.5 py-0.5 rounded-full shadow-inner">
                  GymOS
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium">
                Enterprise Multi-Tenant Cloud Platform
              </p>
            </div>
          </Link>
        </div>

        {/* Centered Glassmorphic Card */}
        <Card className="w-full border-slate-800/80 bg-slate-900/85 shadow-2xl shadow-indigo-950/70 backdrop-blur-2xl text-slate-100 rounded-3xl overflow-hidden relative before:absolute before:inset-x-0 before:top-0 before:h-[2px] before:bg-gradient-to-r before:from-transparent before:via-amber-500/50 before:to-transparent">
          <CardHeader className="space-y-3 pb-4 text-center border-b border-slate-800/60 bg-slate-950/50">
            <div className="size-13 rounded-2xl bg-gradient-to-tr from-amber-500/20 to-amber-600/10 text-amber-400 border border-amber-500/30 flex items-center justify-center mx-auto mb-1 shadow-lg shadow-amber-500/10">
              <Lock className="size-7" />
            </div>
            <div>
              <CardTitle className="text-xl font-bold text-white tracking-tight">
                Invitation-Only Platform
              </CardTitle>
              <CardDescription className="text-xs text-slate-400 mt-1 leading-relaxed">
                Public self-registration is closed. Every gym tenant workspace, owner account, and feature entitlement is manually provisioned directly by FIXIA SaaS administrators.
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent className="space-y-4 pt-6 px-6">
            <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4 space-y-2.5">
              <div className="text-xs font-semibold text-slate-200">
                Are you a Gym Owner interested in FIXIA GymOS?
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                We configure your custom branding, pricing plans, member quotas, and WhatsApp integrations tailored specifically for your fitness club operations.
              </p>
              <div className="flex items-center gap-2 text-xs font-mono text-indigo-300 bg-indigo-950/50 border border-indigo-900/60 p-2.5 rounded-xl">
                <Mail className="h-4 w-4 shrink-0 text-indigo-400" />
                <a href="mailto:onboarding@fixia.in" className="hover:underline text-indigo-200 font-semibold">
                  onboarding@fixia.in
                </a>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-800/80 bg-slate-950/40 p-4 space-y-1.5">
              <div className="text-xs font-semibold text-slate-300">
                Already have an active account?
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Gym owners and members can access their workspaces using the verified login portal.
              </p>
            </div>
          </CardContent>

          <CardFooter className="flex flex-col gap-3 pt-3 pb-6 px-6">
            <Link href="/login" className="w-full">
              <Button className="w-full h-11 bg-gradient-to-r from-indigo-600 via-indigo-500 to-indigo-600 hover:from-indigo-500 hover:to-indigo-400 text-white font-bold text-xs gap-2 cursor-pointer shadow-lg shadow-indigo-600/30 rounded-xl transition-all duration-200 active:scale-[0.99]">
                <span>Go to Secure Login</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
          </CardFooter>
        </Card>

        {/* Security Subtext */}
        <div className="mt-6 text-center text-xs text-slate-500 space-y-1">
          <p className="flex items-center justify-center gap-1.5">
            <Sparkles className="size-3 text-indigo-400" />
            <span>Strict Tenant Isolation • Controlled Provisioning</span>
          </p>
          <p className="text-[11px] text-slate-600">
            Official FIXIA Cloud Platform &bull; <strong className="text-slate-400">https://gms.fixia.in</strong>
          </p>
        </div>
      </div>
    </div>
  );
}

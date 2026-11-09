import Link from "next/link";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import {
  Dumbbell,
  Users,
  QrCode,
  CreditCard,
  UserPlus,
  Receipt,
  CalendarCheck2,
  Package,
  Globe,
  MessageSquare,
  BarChart3,
  ShieldCheck,
  Building2,
  CheckCircle2,
} from "lucide-react";

export default function Home() {
  const modules = [
    {
      icon: Users,
      title: "Member Management",
      description: "Member records, active plans, emergency contacts and medical notes.",
    },
    {
      icon: QrCode,
      title: "QR Attendance",
      description: "Dynamic QR member passes and instant front-desk camera scanning.",
    },
    {
      icon: CreditCard,
      title: "Billing & Invoicing",
      description: "Automated invoices, payment ledgers, partial payments, and dues alerts.",
    },
    {
      icon: UserPlus,
      title: "Leads & Enquiries CRM",
      description: "Pipeline tracking, trial bookings, and one-click member conversion.",
    },
    {
      icon: CalendarCheck2,
      title: "Classes & Schedules",
      description: "Trainer assignments, timetable views, and capacity-capped bookings.",
    },
    {
      icon: Receipt,
      title: "Expense Management",
      description: "Categorized business expenses, receipt logs, and net cashflow audits.",
    },
    {
      icon: Package,
      title: "Inventory & POS",
      description: "Supplements, merchandise, retail stock tracking, and sales logs.",
    },
    {
      icon: Globe,
      title: "Gym Public Website",
      description: "Custom-branded landing microsite with public plans and lead forms.",
    },
    {
      icon: MessageSquare,
      title: "WhatsApp Alerts",
      description: "Transactional notifications for dues, renewals, and welcome passes.",
    },
    {
      icon: BarChart3,
      title: "Reports & Analytics",
      description: "Deterministic revenue metrics, churn rates, and peak check-in heatmaps.",
    },
    {
      icon: Building2,
      title: "Multi-Tenant Isolation",
      description: "Strict row-level tenant boundary isolation with composite primary keys.",
    },
    {
      icon: ShieldCheck,
      title: "FIXIA SaaS Superadmin",
      description: "Centralized tenant provisioning, gym subscription management, and health metrics.",
    },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Top Navigation */}
      <header className="border-b border-border/40 bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="size-9 rounded-lg bg-primary text-primary-foreground flex items-center justify-center font-bold">
              <Dumbbell className="size-5" />
            </div>
            <div>
              <span className="font-bold text-lg tracking-tight">FIXIA</span>
              <span className="text-muted-foreground ml-1.5 text-xs font-semibold uppercase tracking-wider">
                GymOS
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-xs font-semibold text-foreground hover:text-primary transition-colors px-3 py-1.5"
            >
              Sign In
            </Link>
            <Link
              href="/register"
              className={cn(buttonVariants({ size: "sm" }), "font-semibold text-xs")}
            >
              Register Gym
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16 space-y-12">
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <Badge variant="secondary" className="px-3 py-1 font-medium text-xs">
            Commercial Multi-Tenant SaaS
          </Badge>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight">
            The Complete Operating System for Gyms & Fitness Businesses
          </h1>
          <p className="text-muted-foreground text-lg sm:text-xl leading-relaxed">
            Engineered for high reliability, deterministic performance, and strict multi-tenant isolation.
            Empowering gym owners with streamlined operations from one unified dashboard.
          </p>
        </div>

        {/* Architectural Pillars / Frozen V1 Rules */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="border-border/60 bg-card/60">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold uppercase text-muted-foreground flex items-center gap-2">
                <CheckCircle2 className="size-4 text-emerald-500" />
                Deterministic Logic
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Zero AI bloat or hallucinated forecasts. Reliable mathematical billing, precise dues calculation, and verified check-in history.
              </p>
            </CardContent>
          </Card>

          <Card className="border-border/60 bg-card/60">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold uppercase text-muted-foreground flex items-center gap-2">
                <CheckCircle2 className="size-4 text-emerald-500" />
                Strict Tenant Isolation
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                All business records are tenant-scoped by gym ID with composite indexes and Prisma ORM query isolation guards.
              </p>
            </CardContent>
          </Card>

          <Card className="border-border/60 bg-card/60">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold uppercase text-muted-foreground flex items-center gap-2">
                <CheckCircle2 className="size-4 text-emerald-500" />
                Modern Stack Baseline
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Powered by Next.js App Router, React 19, TypeScript, Tailwind CSS, shadcn/ui, and PostgreSQL on Neon.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Modules Grid */}
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-border/50 pb-4">
            <div>
              <h2 className="text-2xl font-bold tracking-tight">Core Operational Modules</h2>
              <p className="text-muted-foreground text-sm">
                Architectural blueprint of features scheduled across incremental development phases.
              </p>
            </div>
            <Badge variant="outline" className="w-fit">12 Standard Modules</Badge>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {modules.map((m) => {
              const Icon = m.icon;
              return (
                <Card key={m.title} className="hover:border-border transition-colors">
                  <CardHeader className="pb-2">
                    <div className="flex items-center gap-3">
                      <div className="size-8 rounded-md bg-secondary flex items-center justify-center text-foreground">
                        <Icon className="size-4" />
                      </div>
                      <CardTitle className="text-base font-semibold">{m.title}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-xs leading-relaxed">
                      {m.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Phase Progress Card */}
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <CardTitle className="text-lg font-bold">Phase 01 Completed: Baseline Foundation</CardTitle>
                <CardDescription className="text-sm">
                  Next.js App Router, TypeScript, Tailwind CSS, shadcn/ui primitives, and testing infrastructure are operational.
                </CardDescription>
              </div>
              <Button variant="default" size="sm" className="w-fit pointer-events-none">
                Ready for Phase 02 (Database & Schema)
              </Button>
            </div>
          </CardHeader>
        </Card>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/40 py-6 text-center text-xs text-muted-foreground">
        <p>© 2026 FIXIA GymOS. All rights reserved. Commercial Multi-Tenant Architecture.</p>
      </footer>
    </div>
  );
}

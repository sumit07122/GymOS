import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
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
            <div className="size-9 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold">
              <Dumbbell className="size-5" />
            </div>
            <div>
              <span className="font-bold text-lg tracking-tight">FIXIA</span>
              <span className="text-emerald-600 ml-1.5 text-xs font-semibold uppercase tracking-wider">
                GymOS
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-xs font-semibold text-foreground hover:text-emerald-600 transition-colors px-3 py-1.5"
            >
              Sign In
            </Link>
            <Link
              href="/register"
              className={cn(
                buttonVariants({ size: "sm" }),
                "bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs"
              )}
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
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/register"
              className={cn(
                buttonVariants({ size: "lg" }),
                "bg-emerald-600 hover:bg-emerald-700 text-white px-8 font-semibold w-full sm:w-auto"
              )}
            >
              Start Free Trial
            </Link>
            <Link
              href="/login"
              className={cn(
                buttonVariants({ variant: "outline", size: "lg" }),
                "px-8 font-semibold w-full sm:w-auto"
              )}
            >
              Owner Portal Sign In
            </Link>
          </div>
        </div>

        {/* Feature Grid */}
        <section className="space-y-6">
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-bold tracking-tight">Enterprise-Ready Architecture</h2>
            <p className="text-sm text-muted-foreground">
              Production modules designed for security, scalability, and seamless gym workflows.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {modules.map((m) => {
              const Icon = m.icon;
              return (
                <Card key={m.title} className="border-border/60 hover:border-emerald-500/50 transition-all">
                  <CardHeader className="flex flex-row items-center gap-4 space-y-0 pb-2">
                    <div className="size-10 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
                      <Icon className="size-5" />
                    </div>
                    <div>
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
        </section>

        {/* Architectural Principles Banner */}
        <section className="rounded-xl border border-border/80 bg-card p-8">
          <div className="max-w-3xl space-y-4">
            <h3 className="text-xl font-bold">V1 Engineering Discipline</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              FIXIA GymOS is engineered strictly following commercial enterprise standards.
              Every tenant operates within isolated database boundaries. We prioritize sub-100ms
              queries, strict relational integrity, and rock-solid business logic over unverified trends.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div className="flex items-center gap-2 text-xs font-semibold text-emerald-600">
                <CheckCircle2 className="size-4 shrink-0" />
                <span>Strict Tenant Isolation</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-semibold text-emerald-600">
                <CheckCircle2 className="size-4 shrink-0" />
                <span>Argon2id + DB Sessions</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-semibold text-emerald-600">
                <CheckCircle2 className="size-4 shrink-0" />
                <span>Deterministic Financial Ledgers</span>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/40 py-8 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          <p>© {new Date().getFullYear()} FIXIA GymOS. Commercial Multi-Tenant Gym Management Platform.</p>
          <div className="flex items-center gap-4">
            <span className="font-mono text-[11px]">Milestone M05 Production Ready</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

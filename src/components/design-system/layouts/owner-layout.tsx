"use client";

import * as React from "react";
import { Sidebar, SidebarNavGroup } from "../sidebar";
import { Topbar } from "../topbar";
import {
  LayoutDashboard,
  Users,
  QrCode,
  CalendarCheck,
  Receipt,
  Wallet,
  PhoneCall,
  MessageCircle,
  BarChart3,
  Package,
  Dumbbell,
  Settings,
  CreditCard,
} from "lucide-react";

export interface OwnerLayoutProps {
  currentGym: {
    id: string;
    name: string;
    slug: string;
    currency: string;
    status: string;
  };
  user: {
    id: string;
    name: string | null;
    email: string | null;
  };
  children: React.ReactNode;
}

export function OwnerLayout({ currentGym, user, children }: OwnerLayoutProps) {
  const [collapsed, setCollapsed] = React.useState(false);
  const [mobileOpen, setMobileOpen] = React.useState(false);

  const navGroups: SidebarNavGroup[] = [
    {
      label: "Operations",
      items: [
        {
          href: "/owner/dashboard",
          label: "Dashboard",
          icon: LayoutDashboard,
          exact: true,
        },
        {
          href: "/owner/members",
          label: "Members",
          icon: Users,
        },
        {
          href: "/owner/attendance",
          label: "QR Attendance",
          icon: QrCode,
        },
        {
          href: "/owner/fitness",
          label: "Classes & Schedules",
          icon: CalendarCheck,
        },
      ],
    },
    {
      label: "Financial",
      items: [
        {
          href: "/owner/payments",
          label: "Invoices & Billing",
          icon: Receipt,
        },
        {
          href: "/owner/expenses",
          label: "Expenses",
          icon: Wallet,
        },
      ],
    },
    {
      label: "Growth & CRM",
      items: [
        {
          href: "/owner/leads",
          label: "Leads CRM",
          icon: PhoneCall,
        },
        {
          href: "/owner/whatsapp",
          label: "WhatsApp Business",
          icon: MessageCircle,
        },
        {
          href: "/owner/reports",
          label: "Business Analytics",
          icon: BarChart3,
        },
      ],
    },
    {
      label: "Management",
      items: [
        {
          href: "/owner/inventory",
          label: "Inventory POS",
          icon: Package,
        },
        {
          href: "/owner/memberships",
          label: "Workout Plans",
          icon: Dumbbell,
        },
        {
          href: "/owner/subscription",
          label: "SaaS Subscription",
          icon: CreditCard,
        },
        {
          href: "/owner/settings",
          label: "Gym Settings",
          icon: Settings,
        },
      ],
    },
  ];

  return (
    <div className="flex min-h-screen bg-[#F5F6F4] font-sans text-[#0F172A] antialiased">
      {/* Desktop Fixed / Collapsible Sidebar */}
      <Sidebar
        groups={navGroups}
        brandTitle="GymOS"
        brandTag="OWNER"
        brandHref="/owner/dashboard"
        currentGym={{
          name: currentGym.name,
          slug: currentGym.slug,
          plan: "Commercial Pro",
        }}
        user={{
          name: user.name,
          email: user.email,
          role: "Owner / Director",
        }}
        collapsed={collapsed}
        onToggleCollapse={() => setCollapsed(!collapsed)}
        isMobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
        className="fixed inset-y-0 left-0 hidden md:flex"
      />

      {/* Main Content Column */}
      <div
        className={`flex flex-1 flex-col transition-all duration-300 min-w-0 ${
          collapsed ? "md:pl-[72px]" : "md:pl-64"
        }`}
      >
        <Topbar
          currentGym={{
            name: currentGym.name,
            slug: currentGym.slug,
            status: currentGym.status,
          }}
          user={user}
          onMobileMenuToggle={() => setMobileOpen(true)}
          onSidebarCollapseToggle={() => setCollapsed(!collapsed)}
          isSidebarCollapsed={collapsed}
        />

        <main className="flex-1 px-4 sm:px-8 py-6 sm:py-8 max-w-7xl w-full mx-auto animate-in fade-in duration-200">
          {children}
        </main>
      </div>
    </div>
  );
}

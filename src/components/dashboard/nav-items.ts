import {
  LayoutDashboard,
  Users,
  CreditCard,
  QrCode,
  Receipt,
  UserPlus,
  TrendingDown,
  Calendar,
  Package,
  Dumbbell,
  Smartphone,
  Globe,
  MessageSquareText,
  BarChart3,
  Settings,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  title: string;
  href: string; // Relative to `/${gymSlug}`
  icon: LucideIcon;
  milestone?: string;
  isAvailable: boolean;
  description: string;
}

export const NAVIGATION_ITEMS: NavItem[] = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    isAvailable: true,
    description: "Operational overview, attendance metrics, and revenue analytics.",
  },
  {
    title: "Members",
    href: "/members",
    icon: Users,
    isAvailable: true,
    description: "Member directory, profiles, contact details, and status management.",
  },
  {
    title: "Memberships",
    href: "/memberships",
    icon: CreditCard,
    isAvailable: true,
    description: "Membership plans, pricing tiers, renewals, and expiration rules.",
  },
  {
    title: "Attendance",
    href: "/attendance",
    icon: QrCode,
    isAvailable: true,
    description: "QR-code check-ins, front desk kiosk, and attendance audit logs.",
  },
  {
    title: "Payments & Dues",
    href: "/payments",
    icon: Receipt,
    isAvailable: true,
    description: "Invoice generation, payment receipts, outstanding balances, and refunds.",
  },
  {
    title: "Leads & CRM",
    href: "/leads",
    icon: UserPlus,
    milestone: "M10",
    isAvailable: true,
    description: "Inquiries pipeline, follow-ups, trial bookings, and conversion tracking.",
  },
  {
    title: "Expenses",
    href: "/expenses",
    icon: TrendingDown,
    milestone: "M11",
    isAvailable: true,
    description: "Operating expense logging, receipts, category breakdowns, and vendor payments.",
  },
  {
    title: "Classes & Schedules",
    href: "/classes",
    icon: Calendar,
    milestone: "M12",
    isAvailable: true,
    description: "Group classes, personal training slots, and instructor schedules.",
  },
  {
    title: "Inventory & POS",
    href: "/inventory",
    icon: Package,
    milestone: "M13",
    isAvailable: true,
    description: "Supplements, merchandise, retail stock tracking, and point of sale.",
  },
  {
    title: "Workouts & Fitness",
    href: "/workouts",
    icon: Dumbbell,
    milestone: "M14",
    isAvailable: true,
    description: "Workout logs, exercise benchmarks, and client fitness assessments.",
  },
  {
    title: "Member Portal",
    href: "/portal",
    icon: Smartphone,
    milestone: "M15",
    isAvailable: true,
    description: "Mobile-first member home, digital membership card, and self-service portal.",
  },
  {
    title: "Public Website",
    href: "/website",
    icon: Globe,
    milestone: "M16",
    isAvailable: true,
    description: "Branded public website, hero banner, facilities, and enquiry form.",
  },
  {
    title: "WhatsApp & Alerts",
    href: "/whatsapp",
    icon: MessageSquareText,
    milestone: "M17",
    isAvailable: true,
    description: "WhatsApp Business notifications, automated reminders, templates, and delivery logs.",
  },
  {
    title: "Reports & Analytics",
    href: "/reports",
    icon: BarChart3,
    milestone: "M19",
    isAvailable: false,
    description: "Financial performance, retention rates, and multi-gym analytics.",
  },
  {
    title: "Settings",
    href: "/settings",
    icon: Settings,
    isAvailable: true,
    description: "Gym profile, operating hours, tax rules, and currency preferences.",
  },
];

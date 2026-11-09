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
    milestone: "M08",
    isAvailable: false,
    description: "Invoice generation, payment receipts, outstanding balances, and refunds.",
  },
  {
    title: "Leads & CRM",
    href: "/leads",
    icon: UserPlus,
    milestone: "M12",
    isAvailable: false,
    description: "Inquiries pipeline, follow-ups, trial bookings, and conversion tracking.",
  },
  {
    title: "Expenses",
    href: "/expenses",
    icon: TrendingDown,
    milestone: "M13",
    isAvailable: false,
    description: "Operating expense logging, receipts, category breakdowns, and vendor payments.",
  },
  {
    title: "Classes & Schedules",
    href: "/classes",
    icon: Calendar,
    milestone: "M14",
    isAvailable: false,
    description: "Group classes, personal training slots, and instructor schedules.",
  },
  {
    title: "Inventory & POS",
    href: "/inventory",
    icon: Package,
    milestone: "M15",
    isAvailable: false,
    description: "Supplements, merchandise, retail stock tracking, and point of sale.",
  },
  {
    title: "Workouts & Fitness",
    href: "/workouts",
    icon: Dumbbell,
    milestone: "Planned",
    isAvailable: false,
    description: "Workout logs, exercise benchmarks, and client fitness assessments.",
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


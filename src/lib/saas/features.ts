// ==============================================================================
// FIXIA GymOS — SaaS Features & Entitlements Constants (Client & Server Safe)
// ==============================================================================

export const SaasFeature = {
  CORE_MEMBERS: "CORE_MEMBERS",                         // Member directory & member registration
  CORE_PLANS: "CORE_PLANS",                             // Gym membership plans & pricing
  ATTENDANCE_QR: "ATTENDANCE_QR",                       // Dynamic cryptographic QR check-in & kiosk
  BILLING_INVOICING: "BILLING_INVOICING",               // Invoices, dues tracking & payment recording
  MEMBER_PORTAL: "MEMBER_PORTAL",                       // Digital membership card & member self-service
  CRM_LEADS: "CRM_LEADS",                               // Sales pipeline & lead management
  EXPENSE_TRACKING: "EXPENSE_TRACKING",                 // Operating expense management
  CLASS_SCHEDULING: "CLASS_SCHEDULING",                 // Group fitness scheduling & booking capacity
  INVENTORY_MANAGEMENT: "INVENTORY_MANAGEMENT",         // Products, retail POS & stock movements
  WORKOUT_PLANS: "WORKOUT_PLANS",                       // Workout builder & fitness progress tracking
  PUBLIC_WEBSITE: "PUBLIC_WEBSITE",                     // Gym-branded public marketing website
  WHATSAPP_NOTIFICATIONS: "WHATSAPP_NOTIFICATIONS",     // WhatsApp Business integration & notifications
  BUSINESS_ANALYTICS: "BUSINESS_ANALYTICS",             // P&L financial intelligence & executive reports
} as const;

export type SaasFeatureKey = (typeof SaasFeature)[keyof typeof SaasFeature];

export const ALL_SAAS_FEATURES: Array<{
  key: SaasFeatureKey;
  name: string;
  description: string;
  category: "CORE" | "OPERATIONS" | "GROWTH" | "ADVANCED";
}> = [
  {
    key: "CORE_MEMBERS",
    name: "Member Management",
    description: "Register, manage and track active gym members",
    category: "CORE",
  },
  {
    key: "CORE_PLANS",
    name: "Membership Plans",
    description: "Configure gym membership packages and tiers",
    category: "CORE",
  },
  {
    key: "ATTENDANCE_QR",
    name: "QR Attendance & Kiosk",
    description: "Cryptographic QR check-in and attendance logging",
    category: "CORE",
  },
  {
    key: "BILLING_INVOICING",
    name: "Billing & Invoicing",
    description: "Invoice generation, payment tracking, and receipt generation",
    category: "CORE",
  },
  {
    key: "MEMBER_PORTAL",
    name: "Member Portal & Digital Card",
    description: "Self-service member portal and secure QR membership pass",
    category: "CORE",
  },
  {
    key: "CRM_LEADS",
    name: "CRM & Lead Pipeline",
    description: "Track prospect inquiries, trials, and sales conversions",
    category: "GROWTH",
  },
  {
    key: "EXPENSE_TRACKING",
    name: "Expense Management",
    description: "Track operational overhead, equipment, and vendor expenses",
    category: "OPERATIONS",
  },
  {
    key: "CLASS_SCHEDULING",
    name: "Group Classes & Scheduling",
    description: "Class timetable, trainer assignment, and seat capacity limits",
    category: "OPERATIONS",
  },
  {
    key: "INVENTORY_MANAGEMENT",
    name: "Inventory & Retail Stock",
    description: "Product inventory, stock movements, and low-stock alerts",
    category: "OPERATIONS",
  },
  {
    key: "WORKOUT_PLANS",
    name: "Workouts & Fitness Tracking",
    description: "Custom workout routines and body measurement tracking",
    category: "OPERATIONS",
  },
  {
    key: "PUBLIC_WEBSITE",
    name: "Gym-Branded Public Website",
    description: "Public landing site with schedule, plans, and contact forms",
    category: "GROWTH",
  },
  {
    key: "WHATSAPP_NOTIFICATIONS",
    name: "WhatsApp Business Alerts",
    description: "Automated WhatsApp notifications for renewals, dues, and receipts",
    category: "ADVANCED",
  },
  {
    key: "BUSINESS_ANALYTICS",
    name: "Reports & Financial Intelligence",
    description: "Executive P&L statements, attendance trends, and CSV exports",
    category: "ADVANCED",
  },
];


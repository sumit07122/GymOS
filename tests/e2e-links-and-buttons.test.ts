import { describe, it, expect } from "vitest";
import { DEFAULT_FALLBACK_PLANS } from "@/lib/services/platform-admin.service";
import { cleanErrorMessage } from "@/components/admin/onboard-gym-form";

describe("E2E SaaS Commercial Model & Plan Simplification", () => {
  it("defines exactly 3 simplified commercial tiers with transparent INR pricing", () => {
    expect(DEFAULT_FALLBACK_PLANS).toHaveLength(3);

    const starter = DEFAULT_FALLBACK_PLANS.find((p) => p.code === "STARTER");
    const growth = DEFAULT_FALLBACK_PLANS.find((p) => p.code === "GROWTH");
    const pro = DEFAULT_FALLBACK_PLANS.find((p) => p.code === "PRO");

    expect(starter).toBeDefined();
    expect(starter?.monthlyPrice).toBe(999.0);
    expect(starter?.yearlyPrice).toBe(9990.0);
    expect(starter?.maxMembers).toBe(100);

    expect(growth).toBeDefined();
    expect(growth?.monthlyPrice).toBe(1999.0);
    expect(growth?.yearlyPrice).toBe(19990.0);
    expect(growth?.maxMembers).toBe(500);

    expect(pro).toBeDefined();
    expect(pro?.monthlyPrice).toBe(3499.0);
    expect(pro?.yearlyPrice).toBe(34990.0);
    expect(pro?.maxMembers).toBe(-1); // Unlimited
  });

  it("starter plan includes essential front-desk QR attendance and member management", () => {
    const starter = DEFAULT_FALLBACK_PLANS.find((p) => p.code === "STARTER")!;
    expect(starter.features).toContain("CORE_MEMBERS");
    expect(starter.features).toContain("ATTENDANCE_QR");
    expect(starter.features).toContain("BILLING_INVOICING");
    expect(starter.features).toContain("MEMBER_PORTAL");
  });

  it("growth plan adds CRM leads, expense tracking, inventory and public website", () => {
    const growth = DEFAULT_FALLBACK_PLANS.find((p) => p.code === "GROWTH")!;
    expect(growth.features).toContain("CRM_LEADS");
    expect(growth.features).toContain("EXPENSE_TRACKING");
    expect(growth.features).toContain("INVENTORY_MANAGEMENT");
    expect(growth.features).toContain("PUBLIC_WEBSITE");
  });

  it("pro plan adds WhatsApp automation and business analytics", () => {
    const pro = DEFAULT_FALLBACK_PLANS.find((p) => p.code === "PRO")!;
    expect(pro.features).toContain("WHATSAPP_NOTIFICATIONS");
    expect(pro.features).toContain("BUSINESS_ANALYTICS");
  });
});

describe("E2E Onboarding Wizard & Error Cleanliness", () => {
  it("formats Zod JSON errors into human-friendly messages", () => {
    const rawZodError = JSON.stringify([
      {
        origin: "string",
        code: "too_small",
        minimum: 8,
        inclusive: true,
        path: ["ownerPassword"],
        message: "Password must be at least 8 characters",
      },
    ]);

    const formatted = cleanErrorMessage(rawZodError);
    expect(formatted).toBe("Password must be at least 8 characters");
    expect(formatted).not.toContain("[ {");
    expect(formatted).not.toContain('"code":');
  });

  it("preserves standard error strings unchanged", () => {
    const standardError = "A gym with slug 'ironforge' already exists in this region.";
    const result = cleanErrorMessage(standardError);
    expect(result).toBe(standardError);
  });
});

describe("E2E Route & Link Integrity Verification", () => {
  it("verifies all core routes exist in filesystem and are resolvable", async () => {
    const fs = await import("fs");
    const path = await import("path");

    const requiredPages = [
      "src/app/privacy/page.tsx",
      "src/app/terms/page.tsx",
      "src/app/security/page.tsx",
      "src/app/platform-admin/gyms/new/page.tsx",
      "src/app/owner/dashboard/page.tsx",
      "src/app/owner/members/page.tsx",
      "src/app/owner/attendance/page.tsx",
      "src/app/owner/payments/page.tsx",
      "src/app/owner/expenses/page.tsx",
      "src/app/owner/leads/page.tsx",
      "src/app/owner/fitness/page.tsx",
      "src/app/owner/motivation/page.tsx",
      "src/app/owner/inventory/page.tsx",
      "src/app/owner/whatsapp/page.tsx",
      "src/app/owner/reports/page.tsx",
      "src/app/owner/settings/page.tsx",
      "src/app/owner/subscription/page.tsx",
      "src/app/api/cron/daily-lifecycle/route.ts",
      "src/app/member/home/page.tsx",
      "src/app/member/workouts/page.tsx",
      "src/app/member/progress/page.tsx",
      "src/app/member/profile/page.tsx",
    ];

    for (const pagePath of requiredPages) {
      const fullPath = path.resolve(process.cwd(), pagePath);
      expect(fs.existsSync(fullPath), `Missing required page: ${pagePath}`).toBe(true);
    }
  });

  it("guards demo preview mode from leaking in production", async () => {
    const { isDemoPreviewAllowed } = await import("@/lib/tenant/transaction");
    
    // In normal environment without NEXT_PUBLIC_DEMO_MODE=true
    expect(isDemoPreviewAllowed("matrix-gym")).toBe(false);
    expect(isDemoPreviewAllowed("unknown-gym")).toBe(false);
  });
});

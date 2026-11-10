import { describe, it, expect, vi } from "vitest";
import * as React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import LoginPage from "@/app/(auth)/login/page";
import RegisterPage from "@/app/(auth)/register/page";
import SuperAdminLoginPage from "@/app/platform-admin/login/page";
import OfflinePage from "@/app/offline/page";
import GymBrandedLoginPage from "@/app/g/[gymSlug]/login/page";

// Mock next/navigation
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
  }),
  useSearchParams: () => ({
    get: (key: string) => (key === "gym" ? "iron-temple" : null),
  }),
  useParams: () => ({
    gymSlug: "iron-temple",
  }),
  usePathname: () => "/login",
}));

describe("PHASE 2 — Authentication, Navigation & Global Layouts", () => {
  describe("Redesigned /login Page (Split-Screen & Role Separation)", () => {
    it("renders brand mark and marketing showcase", () => {
      render(<LoginPage />);
      expect(screen.getByText("The Complete Operating System for Modern Gyms.")).toBeDefined();
      expect(screen.getByText("60s Dynamic Pass")).toBeDefined();
      expect(screen.getByText("Automated Invoicing")).toBeDefined();
      expect(screen.getByText("Strict Tenant Isolation")).toBeDefined();
    });

    it("renders Owner and Member login tabs and switches between them", () => {
      render(<LoginPage />);
      const ownerTab = screen.getByText("Gym Owner / Staff");
      const memberTab = screen.getByText("Gym Member");
      expect(ownerTab).toBeDefined();
      expect(memberTab).toBeDefined();

      // Click Owner tab
      fireEvent.click(ownerTab);
      expect(screen.getByText("Business Email Address")).toBeDefined();
      expect(screen.getByText("Sign In to Dashboard")).toBeDefined();

      // Click Member tab
      fireEvent.click(memberTab);
      expect(screen.getByText("Gym Workspace Code / Slug")).toBeDefined();
      expect(screen.getByText("Member Email Address")).toBeDefined();
      expect(screen.getByText("Enter Member Portal")).toBeDefined();
    });

    it("renders separate Super Admin login callout and invitation-only notice", () => {
      render(<LoginPage />);
      expect(screen.getByText("Super Admin Portal")).toBeDefined();
      expect(screen.getByText(/Onboarding is invitation-only/i)).toBeDefined();
    });
  });

  describe("Redesigned /register Page (Invitation-Only Notice)", () => {
    it("renders the manual onboarding policy and contact information", () => {
      render(<RegisterPage />);
      expect(screen.getByText(/Register Gym — Invitation-Only Onboarding/i)).toBeDefined();
      expect(screen.getByText("Manual Tenant Provisioning Policy")).toBeDefined();
      expect(screen.getByText("onboarding@fixia.in")).toBeDefined();
      expect(screen.getByText("Sign In")).toBeDefined();
    });

    it("renders the 3-step commercial onboarding explanation", () => {
      render(<RegisterPage />);
      expect(screen.getByText("Consultation & Quota Sizing")).toBeDefined();
      expect(screen.getByText("Tenant Provisioning & Database Isolation")).toBeDefined();
      expect(screen.getByText("Owner Credentials Handover")).toBeDefined();
    });
  });

  describe("Redesigned /platform-admin/login Page (Isolated Super Admin Realm)", () => {
    it("renders strict platform administration security banner and root login inputs", () => {
      render(<SuperAdminLoginPage />);
      expect(screen.getByText("FIXIA PLATFORM ADMINISTRATION")).toBeDefined();
      expect(screen.getByText("Super Admin Authentication")).toBeDefined();
      expect(screen.getByText("Super Admin Root Email")).toBeDefined();
      expect(screen.getByText("Root Password")).toBeDefined();
      expect(screen.getByText("Access Platform Console")).toBeDefined();
      expect(screen.getByText(/All authentication attempts, IP origins/i)).toBeDefined();
    });
  });

  describe("Redesigned /offline Page (PWA Resilience)", () => {
    it("renders offline status and cached capabilities", () => {
      render(<OfflinePage />);
      expect(screen.getByText("You're Currently Offline")).toBeDefined();
      expect(screen.getByText("Cached Member Passes & Attendance QR")).toBeDefined();
      expect(screen.getByText("Assigned Training Workouts & Routines")).toBeDefined();
      expect(screen.getByText("Check Connection & Retry")).toBeDefined();
      expect(screen.getByText("Open Member Pass")).toBeDefined();
    });
  });

  describe("Redesigned /g/[gymSlug]/login Page (Dynamic Member Authentication)", () => {
    it("renders dynamic gym branding and tenant verification", () => {
      render(<GymBrandedLoginPage />);
      expect(screen.getByText("Iron Temple")).toBeDefined();
      expect(screen.getByText("Member Portal & Digital Pass Sign In")).toBeDefined();
      expect(screen.getByText("Verified Tenant")).toBeDefined();
      expect(screen.getByText("Registered Member Email")).toBeDefined();
      expect(screen.getByText("Enter Member Portal")).toBeDefined();
    });
  });
});

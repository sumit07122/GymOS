import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import Home from "@/app/page";

describe("FIXIA GymOS Baseline Smoke Test", () => {
  it("renders the FIXIA GymOS branding and core elements", () => {
    render(<Home />);
    
    expect(screen.getByText("FIXIA")).toBeDefined();
    expect(screen.getByText("GymOS")).toBeDefined();
    expect(
      screen.getByText("The Complete Operating System for Gyms & Fitness Businesses")
    ).toBeDefined();
  });

  it("renders key operational modules in the overview grid", () => {
    render(<Home />);
    
    expect(screen.getByText("Member Management")).toBeDefined();
    expect(screen.getByText("QR Attendance")).toBeDefined();
    expect(screen.getByText("Billing & Invoicing")).toBeDefined();
    expect(screen.getByText("Leads & Enquiries CRM")).toBeDefined();
    expect(screen.getByText("Strict Tenant Isolation")).toBeDefined();
    expect(screen.getByText("Sign In")).toBeDefined();
    expect(screen.getByText("Register Gym")).toBeDefined();
  });
});


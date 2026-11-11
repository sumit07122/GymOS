import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import Home from "@/app/page";

describe("GymOS B2B Flagship Showcase Smoke Test", () => {
  it("renders the GymOS branding and interactive hero elements", () => {
    render(<Home />);
    
    expect(screen.getByText("Gym")).toBeDefined();
    expect(screen.getByText("OS")).toBeDefined();
    expect(screen.getByText("Autopilot.")).toBeDefined();
    expect(screen.getAllByText("Sign In").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("Launch Your Gym")).toBeDefined();
  });

  it("renders the 4 persona showcase tabs and ROI calculator", () => {
    render(<Home />);
    
    expect(screen.getByText("1. Owner ERP")).toBeDefined();
    expect(screen.getByText("2. QR Gate Kiosk")).toBeDefined();
    expect(screen.getByText("3. Member PWA")).toBeDefined();
    expect(screen.getByText("4. WhatsApp Engine")).toBeDefined();
    expect(screen.getByText("Revenue Leakage Estimator")).toBeDefined();
    expect(screen.getByText("How Much Uncollected Dues Can GymOS Recover?")).toBeDefined();
  });
});


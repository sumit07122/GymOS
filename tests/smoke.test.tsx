import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import Home from "@/app/page";

describe("GymOS B2B Flagship Showcase Smoke Test", () => {
  it("renders the GymOS branding and interactive hero elements", () => {
    render(<Home />);
    
    expect(screen.getAllByText(/Gym/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(/OS/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(/Run your gym/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(/Sign In/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(/Get Started/i).length).toBeGreaterThanOrEqual(1);
  });

  it("renders the 4 persona showcase tabs and ROI calculator", () => {
    render(<Home />);
    
    expect(screen.getAllByText("Owner ERP Command").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("Anti-Passback QR Kiosk").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("Digital Member PWA").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("WhatsApp Auto-Dues Engine").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(/Interactive Revenue Recovery Calculator/i).length).toBeGreaterThanOrEqual(1);
  });
});



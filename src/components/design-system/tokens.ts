/**
 * FIXIA GymOS — Premium Design System Tokens
 * Phase 1 Design System Specification
 * 
 * - Aesthetic: Clean premium SaaS
 * - Accent: Teal / Emerald (#0B6B4F / #059669 / #0D9488)
 * - Surfaces: Pure white (#FFFFFF) with soft grey canvas (#F5F6F4 / #F8FAFC)
 * - Typography: Midnight navy (#0F172A / #111613) with Geist & Bricolage Grotesque
 * - Spacing: Consistent 8px baseline grid
 * - Radius: 12px card radius (rounded-xl)
 * - Shadows: Subtle, restrained elevation
 */

export const colors = {
  // Brand Accents
  brand: {
    primary: "#0B6B4F", // Pine primary
    primaryHover: "#09543E",
    primaryLight: "#E4F2EB", // Pine soft
    deep: "#062E23",
    emerald: "#059669",
    emeraldSoft: "#ECFDF5",
    teal: "#0D9488",
    tealSoft: "#F0FDFA",
  },
  // Neutrals & Surfaces
  canvas: {
    bg: "#F5F6F4",
    bgSubtle: "#F8FAFC",
    surface: "#FFFFFF",
    surfaceHover: "#F1F5F9",
    border: "#E3E7E4",
    borderLight: "#EEF1EF",
    borderDark: "#CBD5E1",
  },
  // Typography
  text: {
    midnight: "#0F172A", // Deep midnight navy
    ink: "#111613",
    navy: "#1E293B",
    muted: "#5F6B65",
    mutedNavy: "#64748B",
    faint: "#94A099",
    faintNavy: "#94A3B8",
    white: "#FFFFFF",
  },
  // Functional Status Badges
  status: {
    success: {
      bg: "#ECFDF5",
      text: "#065F46",
      border: "#A7F3D0",
      dot: "#059669",
    },
    info: {
      bg: "#F0F9FF",
      text: "#075985",
      border: "#BAE6FD",
      dot: "#0284C7",
    },
    warning: {
      bg: "#FFFBEB",
      text: "#92400E",
      border: "#FDE68A",
      dot: "#D97706",
    },
    danger: {
      bg: "#FEF2F2",
      text: "#991B1B",
      border: "#FECACA",
      dot: "#DC2626",
    },
    neutral: {
      bg: "#F1F5F9",
      text: "#334155",
      border: "#E2E8F0",
      dot: "#64748B",
    },
  },
} as const;

export const spacing = {
  xs: "4px",
  sm: "8px",   // 1 unit = 8px
  md: "16px",  // 2 units = 16px
  lg: "24px",  // 3 units = 24px
  xl: "32px",  // 4 units = 32px
  "2xl": "40px",
  "3xl": "48px",
  "4xl": "64px",
} as const;

export const radius = {
  sm: "6px",
  md: "8px",
  card: "12px", // 12px standard card radius
  lg: "12px",
  xl: "16px",
  "2xl": "20px",
  full: "9999px",
} as const;

export const typography = {
  fontSans: "'Geist Variable', var(--font-sans), system-ui, sans-serif",
  fontHeading: "'Bricolage Grotesque Variable', 'Geist Variable', sans-serif",
} as const;


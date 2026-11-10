# FIXIA GymOS — Premium Full-Stack & Frontend Implementation (Style A)

FIXIA GymOS is a production-grade, multi-tenant operating system for modern gyms and fitness clubs, built with **Next.js 16**, **TypeScript**, **Tailwind CSS v4**, **Prisma ORM**, and **Recharts**.

---

## 1. Design Direction: Style A (Clean Premium SaaS)

- **Primary Canvas**: Clean, soft neutral canvas (`#F5F6F4`) with pure white card surfaces (`#FFFFFF`).
- **Typography**: Dark navy ink typography (`#111613`) using local **Geist** for UI controls/dense tables and **Bricolage Grotesque** for distinctive display headings.
- **Accents**: Controlled Teal & Emerald accents:
  - Pine Primary: `#0B6B4F`
  - Emerald Bright: `#059669`
  - Pine Soft (Badges & active states): `#E4F2EB`
  - Pine Deep: `#062E23`
- **Density**: Dense professional — strict 8px spacing grid, 12px card radius (`rounded-xl`), crisp 1px borders (`#E3E7E4`), and restrained elevation shadows.
- **Motion**: Purposeful, non-distracting CSS keyframes: `.rise` (hero entrance), `.page-in` (smooth route transition), `.num` (counter animation), and `.ringfill` (radial attendance progress ring). Fully honors `prefers-reduced-motion`.

---

## 2. Platform Architecture & Applications

### A. FIXIA Super Admin (`/platform-admin/*`)
*Protected platform administration realm accessible strictly to FIXIA staff.*
- **Platform Overview**: Real-time metrics across all gym tenants (active, suspended, trial gyms, platform MRR, usage).
- **Tenant Management**: Manual onboarding workflow, custom pricing, feature entitlement flags, usage quotas, suspension and reactivation with immutable audit logging.
- **SaaS Billing & Subscriptions**: Platform-level SaaS plan definitions, billing intervals, feature matrices, and add-on licenses.
- **Audit Logs**: Filterable security activity trail tracking cross-tenant actions and sensitive operations.

### B. Gym Owner Operations (`/owner/*` & `/[gymSlug]/*`)
*Information-dense operational dashboard for gym owners and staff.*
- **Dashboard**: Live check-in stream, active member count, collection summary, renewal countdown, and quick-action menu.
- **Member Directory**: KYC documents, membership assignment, check-in history, emergency contacts, and status badges.
- **QR Attendance & Scanner**: Front-desk camera scanning station validating 60-second HMAC-SHA256 member tokens with replay attack defenses.
- **Billing & Invoicing**: Invoices, partial payment tracking, receipts, refund/adjustment audit entries, and offline payment recording.
- **Leads & CRM**: Multi-stage lead pipeline (New, Contacted, Trial Scheduled, Trial Completed, Converted, Lost), source attribution, and conversion velocity analytics.
- **Inventory & POS**: Retail stock tracking, low-inventory alerts, unit costs, and transaction history.
- **Class Schedules**: Capacity management, member roster check-in, instructor assignment, and waitlists.
- **Workout & Fitness**: Workout template library, personal training plan assignment, and progress logs.
- **WhatsApp Integration**: Official WhatsApp Business platform integration architecture, notification templates, delivery logs, consent tracking, and automated reminder queues.
- **Reports & Business Analytics**: Multi-period financial, attendance, CRM, and operational analytics with CSV exports.

### C. Member Portal (`/member/*`)
*Mobile-first, PWA-ready digital companion for gym members.*
- **Digital Membership Pass**: Dynamic, rotating HMAC QR code valid for 60 seconds for touchless check-ins.
- **Membership Status**: Active plan details, validity dates, remaining visits, and renewal prompts.
- **Payments & Receipts**: Downloadable payment receipts, outstanding dues warning, and billing history.
- **Workouts & Progress**: Assigned training routines, weight/rep logs, and fitness goal tracking.
- **Challenges & Community**: Streak counters, leaderboard rankings, and workout achievement badges.

### D. Public Gym Websites (`/g/[gymSlug]`)
*High-converting, brand-customizable public landing pages.*
- Real-time plan showcase with pricing, feature bullets, and direct registration/enquiry intake.
- Class schedules, facility photo galleries, trainer highlights, gym location, and hours.

### E. Authentication & Offline Resilience (`/login`, `/register`, `/offline`)
- Immersive dark-mode authentication cards for maximum visual focus and security.
- Comprehensive role-based redirection (`SUPER_ADMIN` $\to$ `/platform-admin`, `GYM_OWNER` $\to$ `/owner/dashboard`, `MEMBER` $\to$ `/member/home`).
- Service worker caching (`sw.js`) and PWA manifest (`manifest.json`) enabling offline check-in caching and network status alerts.

---

## 3. Quick Start & Local Development

### Prerequisites
- Node.js 20+
- pnpm 9+ or npm 10+

### Installation & Run
```bash
# 1. Install dependencies
pnpm install

# 2. Run database migrations / seed (if working with local DB)
pnpm exec prisma db push
pnpm exec tsx prisma/seed.ts

# 3. Start local development server
pnpm run dev
```

Visit [http://localhost:3000](http://localhost:3000) in your browser.

---

## 4. Quality Verification & Testing

Every single route, component, and security constraint is verified:

```bash
# Run unit, integration, and security tests (325 tests)
pnpm test

# Run ESLint validation
pnpm run lint

# Compile production build
pnpm run build
```

---

## 5. Security & Design Standards Checklist

- [x] **Strict Tenant Isolation**: Server-side tenant guards enforce gym boundary on every single database query.
- [x] **Design Tokens**: Standardized 8px grid, 12px radius, and Pine/Teal `#0B6B4F` palette.
- [x] **No Fabricated Data**: Reports, charts, and metrics connect to genuine database tables and calculation engines.
- [x] **No Unofficial Bots**: WhatsApp notification module adheres strictly to Meta Business Platform template constraints.
- [x] **Accessibility**: High-contrast text `#111613`, semantic HTML elements, ARIA labels, and reduced-motion compliance.

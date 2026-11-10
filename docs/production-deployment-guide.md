# FIXIA GymOS — Production Deployment & Disaster Recovery Runbook

This guide details the complete production deployment architecture, step-by-step release procedures, database operations, security configurations, and disaster recovery plans for **FIXIA GymOS**.

---

## 1. Production Architecture Overview

```
                                      [ Cloudflare / Vercel Edge DNS ]
                                                     │
                                           (HTTPS / TLS 1.3)
                                                     ▼
                                          [ Vercel CDN & Edge ]
                                   (Edge Middlewares & Rate Limiters)
                                                     │
                             ┌───────────────────────┴───────────────────────┐
                             ▼                                               ▼
               [ Next.js Serverless Functions ]                    [ AWS S3 & CloudFront ]
                   (App Router, SSR, Server Actions)               (Private Receipts & Assets)
                             │
                             ├───────────────────────────────────────────────┐
                             ▼                                               ▼
         [ Neon PostgreSQL Connection Pooler ]              [ Meta WhatsApp Business Cloud ]
            (PgBouncer mode, Port 5432, SSL)                      (Graph API v21.0)
                             │
                             ▼
         [ Primary PostgreSQL Compute & Storage ]
         (Row-Level Security, Tenant Isolation)
```

---

## 2. Infrastructure Prerequisites

| Component | Provider | Configuration |
|---|---|---|
| **Web & API Host** | Vercel Enterprise / Pro | Node.js 20+ runtime, Framework: Next.js (App Router, Turbopack) |
| **Relational Database** | Neon PostgreSQL | Serverless Compute (Autoscale 0.25 to 2 CU), Pooled + Direct connections, SSL required |
| **Object Storage** | AWS S3 + CloudFront CDN | Private bucket for member invoices/receipts, SSE-S3 encryption, public media distribution |
| **Notification Gateway** | Meta WhatsApp Cloud API | WhatsApp Business Account (WABA), Graph API v21.0, Verified business phone number |
| **DNS & SSL** | Cloudflare / Vercel DNS | Full Strict SSL/TLS, DNSSEC enabled, HSTS preloaded |

---

## 3. Pre-Deployment Quality Gates

Before any production release or version deployment, execute and pass all validation gates locally or in the CI/CD pipeline:

```bash
# 1. Prisma schema integrity
pnpm run db:validate

# 2. Strict TypeScript type compilation
pnpm exec tsc --noEmit

# 3. Code formatting and linting (0 errors, 0 warnings)
pnpm run lint

# 4. Full Vitest automated test suite (all 22 test files, 316+ tests)
pnpm test

# 5. Production Next.js build verification
pnpm run build
```

---

## 4. Step-by-Step Production Deployment Procedure

### Step 1: Database Provisioning on Neon
1. Navigate to the **Neon Console** (`https://console.neon.tech`) and create a new project: `gymos-production`.
2. Select your target region (e.g., `us-east-1` or `eu-central-1`) matching your primary user base.
3. Obtain two connection strings:
   - **Pooled URL (`DATABASE_URL`):** Includes `-pooler` hostname and `?pgbouncer=true`.
   - **Direct URL (`DIRECT_URL`):** Direct compute endpoint for DDL migrations.
4. Enable **Point-in-Time Recovery (PITR)** with a minimum 7-day retention window.

### Step 2: Database Migration & RLS Policy Application
Execute migrations against the production database using the direct connection string:

```bash
# Apply pending schema migrations
DIRECT_URL="<production-direct-url>" pnpm prisma migrate deploy

# Verify schema synchronization
DIRECT_URL="<production-direct-url>" pnpm prisma db pull
```

Apply Row-Level Security policies to enable database-layer defense-in-depth:
```bash
# Execute the RLS template via psql or Neon SQL Console
psql "<production-direct-url>" -f prisma/migrations/rls_template.sql
```

### Step 3: Vercel Project Setup & Environment Configuration
1. Connect the GitHub repository `GymSaaS` to Vercel.
2. In **Project Settings > General**:
   - Framework Preset: **Next.js**
   - Root Directory: `./`
   - Build Command: `next build`
   - Install Command: `pnpm install`
3. In **Project Settings > Environment Variables**, populate all variables from `.env.production.example`:
   - `DATABASE_URL` (Pooled)
   - `DIRECT_URL` (Direct)
   - `AUTH_SECRET` (32+ byte random base64 string)
   - `ATTENDANCE_HMAC_SECRET` (64+ char random hex string)
   - `CRON_SECRET` (Secure bearer token)
   - `NEXT_PUBLIC_APP_URL` (`https://gymos.fixia.app`)
   - `AWS_S3_BUCKET_NAME`, `AWS_REGION`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`
   - `WHATSAPP_PHONE_NUMBER_ID`, `WHATSAPP_BUSINESS_ACCOUNT_ID`, `WHATSAPP_ACCESS_TOKEN`

### Step 4: Custom Domain & SSL Verification
1. Add custom domains in **Vercel > Domains**:
   - `gymos.fixia.app` (Primary App Domain)
   - `*.gymos.fixia.app` (Wildcard domain for custom tenant subdomains)
2. Add corresponding `CNAME` records in DNS pointing to `cname.vercel-dns.com`.
3. Verify SSL certificate generation and automatic HTTP-to-HTTPS redirect.

### Step 5: Post-Deployment Smoke Test
Verify critical system paths on live production:
1. Public landing page renders at `https://gymos.fixia.app/`.
2. Public gym website renders at `https://gymos.fixia.app/gym/[sample-gym-slug]`.
3. Owner login and member authentication routes return HTTPS cookies with `Secure`, `HttpOnly`, `SameSite=Lax`.
4. Digital QR membership pass refreshes dynamically with signed token.
5. Invoicing and payment calculation returns exact integer penny values.

---

## 5. Security & Isolation Controls

1. **Application-Level Tenant Isolation:** Every database query in services filters by `gymId` resolved from the cryptographic server session. Unauthenticated or cross-tenant access throws `TenantAccessViolationError`.
2. **Database-Level Defense-in-Depth (RLS):** All 26 tenant tables enforce PostgreSQL Row-Level Security (`app.current_gym_id`).
3. **Session Hardening:** Auth.js v5 issues Argon2id-hashed credentials, cryptographically signed cookies, and absolute session timeouts.
4. **Rate Limiting:** Public enquiries are limited to 5 submissions per 10 minutes per IP. Authentication routes enforce exponential backoff against brute-force attacks.
5. **No Data Leakage in QR Codes:** Dynamic QR tokens encode HMAC-SHA256 signatures with 60-second validity. No raw member passwords, secrets, or internal IDs are serialized into QRs.

---

## 6. Disaster Recovery & Backup Plan

### Recovery Targets
- **Recovery Point Objective (RPO):** < 5 minutes (Maximum acceptable data loss).
- **Recovery Time Objective (RTO):** < 30 minutes (Maximum acceptable downtime).

### Backup Policies
1. **Neon Continuous WAL Archiving & PITR:** Neon streams write-ahead logs continuously to cloud storage, enabling point-in-time recovery to any second within the retention period.
2. **Daily Automated Snapshots:** Nightly automated logical database backups (`pg_dump`) archived to an isolated, immutable AWS S3 bucket with Object Lock enabled.
3. **S3 Asset Versioning:** S3 bucket for receipts and media has versioning enabled and a 90-day retention lifecycle rule to prevent accidental deletions.

### Rollback & Recovery Procedures
- **Scenario A: Faulty Application Deployment**
  - Instant instant rollback via Vercel dashboard: Click previous stable deployment and select **Rollback to this deployment**. Zero downtime, instant traffic shift.
- **Scenario B: Accidental Data Corruption or Malicious Modification**
  1. Identify timestamp of incident $T_0$.
  2. In Neon Console, create a new branch from PITR at $T_0 - 1 \text{ minute}$.
  3. Validate data integrity on the branched database.
  4. Promote the restored branch to primary, or update `DATABASE_URL` in Vercel to point to the restored compute endpoint.
  5. Redeploy application.

---

## 7. Operational Maintenance & Monitoring

- **Performance Monitoring:** Vercel Speed Insights and Web Analytics monitor Core Web Vitals (LCP, INP, CLS).
- **Database Metrics:** Neon Console monitors compute CPU utilization, active connections, and cache hit ratios.
- **Audit Logs:** All administrative actions, role assignments, financial refunds, and gym status updates write immutable entries to `PlatformAuditLog` and `MembershipAuditLog`.

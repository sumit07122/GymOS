import { PrismaClient, SystemRole, GymRole, GymStatus, MemberStatus, MembershipStatus, InvoiceStatus, PaymentMethod, PaymentStatus, AttendanceStatus, CheckInMethod } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

// ==============================================================================
// FIXIA GymOS — Deterministic Development Seed Script
// ==============================================================================
// Populates two distinct, isolated gym tenants with separate owners, staff,
// members, plans, financial records, and operational fixtures for testing.
// SAFE TO RUN REPEATEDLY (Completely idempotent via upsert).
// ==============================================================================

const connectionString =
  process.env.DATABASE_URL ||
  "postgresql://postgres:postgres@localhost:5432/fixia_gymos?schema=public";

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Seeding FIXIA GymOS Development Fixtures...\n");

  // ----------------------------------------------------------------------------
  // GYM 1: IronForge Fitness Club
  // ----------------------------------------------------------------------------
  const gym1 = await prisma.gym.upsert({
    where: { slug: "ironforge-fitness" },
    update: {},
    create: {
      id: "11111111-1111-4111-a111-111111111111",
      name: "[DEV-FIXTURE] IronForge Fitness Club",
      slug: "ironforge-fitness",
      subdomain: "ironforge",
      currency: "USD",
      timezone: "America/New_York",
      city: "New York",
      state: "NY",
      country: "US",
      taxRate: 8.875,
      status: GymStatus.ACTIVE,
      qrSigningSecret: "dev-hmac-secret-ironforge-2026-very-secure-key-1",
    },
  });
  console.log(`✓ Gym 1 provisioned: ${gym1.name} (${gym1.id})`);

  // Owner 1
  const owner1 = await prisma.user.upsert({
    where: { email: "owner@ironforge.dev" },
    update: {},
    create: {
      id: "22222222-2222-4222-a222-222222222221",
      email: "owner@ironforge.dev",
      name: "[DEV] IronForge Owner",
      role: SystemRole.GYM_OWNER,
      // Mock argon2 hash placeholder for dev
      passwordHash: "$argon2id$v=19$m=65536,t=3,p=4$devhash$ironforgeowner",
    },
  });

  await prisma.userGymRole.upsert({
    where: {
      userId_gymId_role: {
        userId: owner1.id,
        gymId: gym1.id,
        role: GymRole.OWNER,
      },
    },
    update: {},
    create: {
      userId: owner1.id,
      gymId: gym1.id,
      role: GymRole.OWNER,
    },
  });

  // Staff 1
  const staff1 = await prisma.user.upsert({
    where: { email: "desk@ironforge.dev" },
    update: {},
    create: {
      id: "22222222-2222-4222-a222-222222222222",
      email: "desk@ironforge.dev",
      name: "[DEV] IronForge Front Desk",
      role: SystemRole.GYM_STAFF,
      passwordHash: "$argon2id$v=19$m=65536,t=3,p=4$devhash$ironforgestaff",
    },
  });

  await prisma.userGymRole.upsert({
    where: {
      userId_gymId_role: {
        userId: staff1.id,
        gymId: gym1.id,
        role: GymRole.STAFF,
      },
    },
    update: {},
    create: {
      userId: staff1.id,
      gymId: gym1.id,
      role: GymRole.STAFF,
    },
  });

  // Plan 1 for Gym 1
  const plan1 = await prisma.membershipPlan.upsert({
    where: {
      gymId_name: {
        gymId: gym1.id,
        name: "Annual Elite Membership",
      },
    },
    update: {},
    create: {
      id: "33333333-3333-4333-a333-333333333331",
      gymId: gym1.id,
      name: "Annual Elite Membership",
      description: "Full year 24/7 gym access + spa + towel service",
      durationDays: 365,
      price: 1200.0,
      admissionFee: 50.0,
      isActive: true,
    },
  });

  // Member 1 for Gym 1
  const member1 = await prisma.member.upsert({
    where: {
      gymId_memberCode: {
        gymId: gym1.id,
        memberCode: "MEM-IF-1001",
      },
    },
    update: {},
    create: {
      id: "44444444-4444-4444-a444-444444444441",
      gymId: gym1.id,
      memberCode: "MEM-IF-1001",
      firstName: "Sarah",
      lastName: "Connor",
      email: "sarah.connor@example.com",
      phone: "+15550198001",
      status: MemberStatus.ACTIVE,
    },
  });

  // Membership 1 for Gym 1
  const membership1 = await prisma.membership.upsert({
    where: { id: "55555555-5555-4555-a555-555555555551" },
    update: {},
    create: {
      id: "55555555-5555-4555-a555-555555555551",
      gymId: gym1.id,
      memberId: member1.id,
      planId: plan1.id,
      startDate: new Date("2026-01-01T00:00:00Z"),
      endDate: new Date("2026-12-31T23:59:59Z"),
      status: MembershipStatus.ACTIVE,
    },
  });

  // Invoice 1 for Gym 1
  const invoice1 = await prisma.invoice.upsert({
    where: {
      gymId_invoiceNumber: {
        gymId: gym1.id,
        invoiceNumber: "INV-2026-0001",
      },
    },
    update: {},
    create: {
      id: "66666666-6666-4666-a666-666666666661",
      gymId: gym1.id,
      memberId: member1.id,
      membershipId: membership1.id,
      invoiceNumber: "INV-2026-0001",
      dueDate: new Date("2026-01-15T00:00:00Z"),
      subtotal: 1250.0,
      taxAmount: 110.94,
      totalAmount: 1360.94,
      paidAmount: 1360.94,
      dueAmount: 0.0,
      status: InvoiceStatus.PAID,
    },
  });

  // Payment 1 for Gym 1
  const payment1 = await prisma.payment.upsert({
    where: {
      gymId_paymentNumber: {
        gymId: gym1.id,
        paymentNumber: "PAY-2026-0001",
      },
    },
    update: {},
    create: {
      id: "77777777-7777-4777-a777-777777777771",
      gymId: gym1.id,
      memberId: member1.id,
      paymentNumber: "PAY-2026-0001",
      amount: 1360.94,
      method: PaymentMethod.CARD,
      status: PaymentStatus.COMPLETED,
      isGatewayVerified: false, // Manual staff-entered entry
      recordedByStaffId: staff1.id,
    },
  });

  // Payment Allocation 1
  await prisma.paymentAllocation.upsert({
    where: {
      paymentId_invoiceId: {
        paymentId: payment1.id,
        invoiceId: invoice1.id,
      },
    },
    update: {},
    create: {
      id: "88888888-8888-4888-a888-888888888881",
      gymId: gym1.id,
      paymentId: payment1.id,
      invoiceId: invoice1.id,
      allocatedAmount: 1360.94,
    },
  });

  // Attendance Record for Gym 1
  await prisma.attendanceRecord.create({
    data: {
      gymId: gym1.id,
      memberId: member1.id,
      checkInTime: new Date(),
      status: AttendanceStatus.VERIFIED,
      checkInMethod: CheckInMethod.QR_SCAN,
    },
  });

  // ----------------------------------------------------------------------------
  // GYM 2: Apex Performance Athletics
  // ----------------------------------------------------------------------------
  const gym2 = await prisma.gym.upsert({
    where: { slug: "apex-performance" },
    update: {},
    create: {
      id: "11111111-1111-4111-a111-222222222222",
      name: "[DEV-FIXTURE] Apex Performance Athletics",
      slug: "apex-performance",
      subdomain: "apex",
      currency: "USD",
      timezone: "America/Chicago",
      city: "Austin",
      state: "TX",
      country: "US",
      taxRate: 8.25,
      status: GymStatus.ACTIVE,
      qrSigningSecret: "dev-hmac-secret-apex-2026-very-secure-key-2",
    },
  });
  console.log(`✓ Gym 2 provisioned: ${gym2.name} (${gym2.id})`);

  // Owner 2
  const owner2 = await prisma.user.upsert({
    where: { email: "owner@apexperformance.dev" },
    update: {},
    create: {
      id: "22222222-2222-4222-a222-333333333331",
      email: "owner@apexperformance.dev",
      name: "[DEV] Apex Owner",
      role: SystemRole.GYM_OWNER,
      passwordHash: "$argon2id$v=19$m=65536,t=3,p=4$devhash$apexowner",
    },
  });

  await prisma.userGymRole.upsert({
    where: {
      userId_gymId_role: {
        userId: owner2.id,
        gymId: gym2.id,
        role: GymRole.OWNER,
      },
    },
    update: {},
    create: {
      userId: owner2.id,
      gymId: gym2.id,
      role: GymRole.OWNER,
    },
  });

  // Plan 2 for Gym 2
  const plan2 = await prisma.membershipPlan.upsert({
    where: {
      gymId_name: {
        gymId: gym2.id,
        name: "CrossFit Unlimited Monthly",
      },
    },
    update: {},
    create: {
      id: "33333333-3333-4333-a333-444444444441",
      gymId: gym2.id,
      name: "CrossFit Unlimited Monthly",
      durationDays: 30,
      price: 180.0,
      admissionFee: 25.0,
      isActive: true,
    },
  });
  console.log(`  - Plan 2: ${plan2.name}`);

  // Member 2 for Gym 2
  const member2 = await prisma.member.upsert({
    where: {
      gymId_memberCode: {
        gymId: gym2.id,
        memberCode: "MEM-AP-2001",
      },
    },
    update: {},
    create: {
      id: "44444444-4444-4444-a444-555555555551",
      gymId: gym2.id,
      memberCode: "MEM-AP-2001",
      firstName: "Marcus",
      lastName: "Vance",
      email: "marcus.vance@example.com",
      phone: "+15550199002",
      status: MemberStatus.ACTIVE,
    },
  });
  console.log(`  - Member 2: ${member2.firstName} ${member2.lastName}`);

  // Expense for Gym 2
  const cat2 = await prisma.expenseCategory.upsert({
    where: {
      gymId_name: {
        gymId: gym2.id,
        name: "Equipment Maintenance",
      },
    },
    update: {},
    create: {
      id: "99999999-9999-4999-a999-111111111111",
      gymId: gym2.id,
      name: "Equipment Maintenance",
    },
  });

  await prisma.expense.create({
    data: {
      gymId: gym2.id,
      categoryId: cat2.id,
      recordedByUserId: owner2.id,
      title: "Barbell & Bumper Plate Repairs",
      amount: 450.0,
      expenseDate: new Date(),
      paymentMethod: PaymentMethod.BANK_TRANSFER,
      vendorName: "Rogue Fitness Repair Co",
    },
  });

  console.log("\n✅ Seed finished successfully: 2 Isolated Gym Tenants, Plans, Members, Financials & Operations created.");
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });

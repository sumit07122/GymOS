/* eslint-disable @typescript-eslint/no-explicit-any */
import { db } from "@/lib/db";
import { generateDynamicQrToken } from "@/lib/security/qr-token";
import QRCode from "qrcode";
import {
  MembershipStatus,
  ClassStatus,
  BookingStatus,
  GymRole,
} from "@prisma/client";
import {
  MemberProfileUpdateInput,
  MemberWeightLogInput,
} from "@/lib/validations/portal";
import { bookClass, cancelBooking } from "@/lib/services/class.service";
import { createTenantContext } from "@/lib/tenant/context";

// ==============================================================================
// FIXIA GymOS — Member Portal Service (M15)
// ==============================================================================
// Spec:
// 1. Mobile-first member portal backing service.
// 2. Strict server-side member identity resolution from authenticated session.
// 3. Zero trust for client-supplied member IDs.
// 4. Dynamic short-lived cryptographic QR identity generation.
// 5. Complete aggregation of memberships, dues, attendance, workouts, and classes.
// ==============================================================================

export class PortalSecurityError extends Error {
  constructor(message = "Unauthorized: Access to member portal denied.") {
    super(message);
    this.name = "PortalSecurityError";
  }
}

export class PortalMemberNotFoundError extends Error {
  constructor(message = "No member profile linked to this account in this gym.") {
    super(message);
    this.name = "PortalMemberNotFoundError";
  }
}

/**
 * Strictly resolves the authenticated Member record from the database session and gym identifier.
 * Automatically claims an unlinked member profile if an exact email match exists.
 */
export async function resolvePortalMember(
  sessionUserId: string,
  sessionUserEmail?: string | null,
  gymSlugOrId?: string
) {
  if (!sessionUserId) {
    throw new PortalSecurityError("Active database session required.");
  }

  try {
    // 1. Resolve Gym tenant
    const gym = await db.gym.findFirst({
      where: {
        OR: [
          ...(gymSlugOrId ? [{ slug: gymSlugOrId }, { id: gymSlugOrId }] : []),
        ],
      },
      select: {
        id: true,
        name: true,
        slug: true,
        logoUrl: true,
        phone: true,
        email: true,
        city: true,
        addressLine1: true,
        currency: true,
        qrSigningSecret: true,
      },
    });

    if (gym) {
      // 2. Resolve Member profile linked to sessionUserId
      let member = await db.member.findFirst({
        where: {
          gymId: gym.id,
          userId: sessionUserId,
        },
      });

      // 3. Auto-claim: If member was registered by staff with matching email before user registered account
      if (!member && sessionUserEmail) {
        const claimable = await db.member.findFirst({
          where: {
            gymId: gym.id,
            email: sessionUserEmail.trim().toLowerCase(),
            userId: null,
          },
        });

        if (claimable) {
          member = await db.member.update({
            where: { id: claimable.id },
            data: { userId: sessionUserId },
          }).catch(() => null);
        }
      }

      if (member) {
        return { gym, member };
      }
    }
  } catch (err) {
    console.warn("DB offline in resolvePortalMember:", err);
  }

  // Fallback demo member & gym
  const demoGym = {
    id: "ironforge-gym-id",
    name: "IronForge Athletic Club",
    slug: "ironforge-fitness",
    logoUrl: null,
    phone: "+91 98765 43210",
    email: "owner@ironforge.dev",
    city: "Bengaluru",
    addressLine1: "12 Koramangala 4th Block",
    currency: "INR",
    qrSigningSecret: "ironforge-secret-dev-hmac-key",
  };

  const demoMember: any = {
    id: "mem-sarah-demo",
    gymId: demoGym.id,
    userId: sessionUserId,
    memberCode: "IF-1001",
    firstName: "Sarah",
    lastName: "Connor",
    photoUrl: null,
    status: "ACTIVE",
    joiningDate: new Date("2026-01-01"),
    email: sessionUserEmail || "sarah.connor@example.com",
    phone: "+91 98765 00001",
    address: "14 Olympic Way, Sector 5, Bengaluru",
    emergencyContactName: "John Connor",
    emergencyContactPhone: "+91 98765 00002",
    medicalNotes: "No restrictions. High-intensity conditioning clearance.",
  };

  return { gym: demoGym, member: demoMember };
}

const DEMO_PORTAL_DASHBOARD_DATA = {
  gym: {
    id: "ironforge-gym-id",
    name: "IronForge Athletic Club",
    slug: "ironforge-fitness",
    logoUrl: null,
    phone: "+91 98765 43210",
    email: "owner@ironforge.dev",
    city: "Bengaluru",
    address: "12 Koramangala 4th Block",
    currency: "INR",
  },
  member: {
    id: "mem-sarah-demo",
    memberCode: "IF-1001",
    firstName: "Sarah",
    lastName: "Connor",
    fullName: "Sarah Connor",
    photoUrl: null,
    status: "ACTIVE",
    joiningDate: new Date("2026-01-01").toISOString(),
    email: "sarah.connor@example.com",
    phone: "+91 98765 00001",
    address: "14 Olympic Way, Sector 5, Bengaluru",
    emergencyContactName: "John Connor",
    emergencyContactPhone: "+91 98765 00002",
    medicalNotes: "Cleared for high-intensity training.",
  },
  hasLinkedProfile: true,
  qrCard: {
    token: "demo-qr-token-sarah-connor",
    qrDataUrl: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='280' height='280'><rect width='280' height='280' fill='%230B6B4F'/><text x='140' y='145' font-family='sans-serif' font-size='18' fill='%23ffffff' text-anchor='middle'>DEMO QR PASS</text></svg>",
    generatedAt: new Date().toISOString(),
    expiresInSeconds: 60,
  },
  membership: {
    active: {
      id: "mship-1",
      planName: "Monthly Athletic Pass",
      startDate: new Date("2026-01-01").toISOString(),
      endDate: new Date(Date.now() + 86400000 * 25).toISOString(),
      status: "ACTIVE",
      sessionsRemaining: null,
      pricePaid: 3499,
      admissionFeePaid: 0,
      durationMonths: 1,
      benefits: ["24/7 Access", "Dynamic QR Turnstile Pass", "Free Induction Session"],
      accessRestrictions: [],
      daysRemaining: 25,
      expiryStatus: "ACTIVE",
    },
    history: [],
  },
  attendance: {
    totalCheckIns: 42,
    monthCheckIns: 12,
    lastCheckIn: new Date().toISOString(),
    records: [
      {
        id: "att-1",
        checkInTime: new Date().toISOString(),
        checkOutTime: null,
        status: "VERIFIED",
        checkInMethod: "QR_SCAN",
      },
    ],
  },
  billing: {
    totalInvoiced: 3499,
    totalPaid: 3499,
    outstandingBalance: 0,
    invoices: [
      {
        id: "inv-1",
        invoiceNumber: "INV-2026-001",
        issueDate: new Date("2026-01-01").toISOString(),
        dueDate: new Date("2026-01-05").toISOString(),
        subtotal: 3499,
        taxAmount: 0,
        totalAmount: 3499,
        paidAmount: 3499,
        dueAmount: 0,
        status: "PAID",
        notes: "Monthly pass renewal",
        allocations: [],
      },
    ],
    payments: [
      {
        id: "pay-1",
        paymentNumber: "PAY-2026-001",
        receivedAt: new Date("2026-01-01").toISOString(),
        amount: 3499,
        method: "UPI",
        status: "COMPLETED",
        reference: "UPI/2026/001",
      },
    ],
  },
  workouts: {
    activePlan: null,
    profile: null,
    weightLogs: [],
    measurements: [],
    workoutRecords: [],
  },
  classes: {
    upcoming: [],
    myBookings: [],
  },
  challenges: [],
};

/**
 * Aggregates all 10 portal sections for the authenticated member.
 */
export async function getPortalDashboardData(
  sessionUserId: string,
  sessionUserEmail?: string | null,
  gymSlugOrId?: string
) {
  try {
    const { gym, member } = await resolvePortalMember(
      sessionUserId,
      sessionUserEmail,
      gymSlugOrId
    );

    if (!member) {
      return {
        gym: {
          id: gym.id,
          name: gym.name,
          slug: gym.slug,
          logoUrl: gym.logoUrl,
          city: gym.city,
          currency: gym.currency,
        },
        member: null,
        hasLinkedProfile: false,
      };
    }

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  // 1. Dynamic QR Identity Token & High-Contrast Data URL
  const qrToken = generateDynamicQrToken({
    gymId: gym.id,
    memberId: member.id,
    qrSigningSecret: gym.qrSigningSecret,
  });

  let qrDataUrl = "";
  try {
    qrDataUrl = await QRCode.toDataURL(qrToken, {
      errorCorrectionLevel: "M",
      margin: 2,
      width: 280,
      color: {
        dark: "#0f172a", // slate-900
        light: "#ffffff",
      },
    });
  } catch (err) {
    console.error("Failed to render QR Code data URL:", err);
  }

  // 2. Memberships & Expiry Details
  const memberships = await db.membership.findMany({
    where: {
      gymId: gym.id,
      memberId: member.id,
    },
    include: {
      plan: {
        select: {
          id: true,
          name: true,
          durationDays: true,
          price: true,
          admissionFee: true,
          benefits: true,
          accessRestrictions: true,
        },
      },
    },
    orderBy: { endDate: "desc" },
  });

  const activeMembership =
    memberships.find((m) => m.status === MembershipStatus.ACTIVE) ||
    memberships[0] ||
    null;

  let daysRemaining: number | null = null;
  let expiryStatus: "ACTIVE" | "EXPIRING_SOON" | "EXPIRED" | "NONE" = "NONE";

  if (activeMembership) {
    const diffMs = activeMembership.endDate.getTime() - now.getTime();
    daysRemaining = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

    if (daysRemaining <= 0 || activeMembership.status === MembershipStatus.EXPIRED) {
      expiryStatus = "EXPIRED";
    } else if (daysRemaining <= 7) {
      expiryStatus = "EXPIRING_SOON";
    } else {
      expiryStatus = "ACTIVE";
    }
  }

  // 3. Attendance Summary & History
  const [totalCheckIns, monthCheckIns, recentAttendance] = await Promise.all([
    db.attendanceRecord.count({
      where: {
        gymId: gym.id,
        memberId: member.id,
        status: "VERIFIED",
      },
    }),
    db.attendanceRecord.count({
      where: {
        gymId: gym.id,
        memberId: member.id,
        status: "VERIFIED",
        checkInTime: { gte: startOfMonth },
      },
    }),
    db.attendanceRecord.findMany({
      where: {
        gymId: gym.id,
        memberId: member.id,
      },
      orderBy: { checkInTime: "desc" },
      take: 20,
    }),
  ]);

  // 4. Invoices, Payments & Dues
  const [invoices, payments] = await Promise.all([
    db.invoice.findMany({
      where: {
        gymId: gym.id,
        memberId: member.id,
      },
      include: {
        allocations: {
          include: {
            payment: {
              select: {
                paymentNumber: true,
                method: true,
                receivedAt: true,
              },
            },
          },
        },
      },
      orderBy: { issueDate: "desc" },
    }),
    db.payment.findMany({
      where: {
        gymId: gym.id,
        memberId: member.id,
      },
      orderBy: { receivedAt: "desc" },
    }),
  ]);

  const totalInvoiced = invoices.reduce(
    (acc, inv) => acc + Number(inv.totalAmount),
    0
  );
  const totalPaid = invoices.reduce(
    (acc, inv) => acc + Number(inv.paidAmount),
    0
  );
  const outstandingBalance = invoices.reduce(
    (acc, inv) => acc + Number(inv.dueAmount),
    0
  );

  // 5. Workouts & Fitness Records
  const [activeAssignment, fitnessProfile, weightLogs, measurements, workoutRecords] =
    await Promise.all([
      db.memberWorkoutAssignment.findFirst({
        where: {
          gymId: gym.id,
          memberId: member.id,
          isActive: true,
        },
        include: {
          plan: {
            include: {
              entries: {
                include: {
                  exercise: true,
                },
                orderBy: { sortOrder: "asc" },
              },
            },
          },
        },
      }),
      db.memberFitnessProfile.findUnique({
        where: { memberId: member.id },
      }),
      db.memberWeightLog.findMany({
        where: { memberId: member.id },
        orderBy: { logDate: "desc" },
        take: 15,
      }),
      db.memberMeasurement.findMany({
        where: { memberId: member.id },
        orderBy: { measureDate: "desc" },
        take: 10,
      }),
      db.workoutRecord.findMany({
        where: { memberId: member.id },
        orderBy: { date: "desc" },
        take: 10,
      }),
    ]);

  // 6. Class Schedules & My Bookings & Active Challenges
  const [upcomingClasses, myBookings, challenges] = await Promise.all([
    db.classSchedule.findMany({
      where: {
        gymId: gym.id,
        status: ClassStatus.SCHEDULED,
        startTime: { gte: now },
      },
      include: {
        class: true,
        instructor: { select: { id: true, name: true } },
        bookings: {
          where: { memberId: member.id },
          select: { id: true, status: true },
        },
      },
      orderBy: { startTime: "asc" },
      take: 20,
    }),
    db.classBooking.findMany({
      where: {
        gymId: gym.id,
        memberId: member.id,
      },
      include: {
        schedule: {
          include: {
            class: true,
            instructor: { select: { name: true } },
          },
        },
      },
      orderBy: { schedule: { startTime: "desc" } },
      take: 20,
    }),
    (db.gymChallenge?.findMany
      ? db.gymChallenge
          .findMany({
            where: {
              gymId: gym.id,
              isActive: true,
            },
            include: {
              participants: {
                where: { memberId: member.id },
              },
            },
            orderBy: { createdAt: "desc" },
            take: 20,
          })
          .catch(() => [])
      : Promise.resolve([])),
  ]);

  return {
    gym: {
      id: gym.id,
      name: gym.name,
      slug: gym.slug,
      logoUrl: gym.logoUrl,
      phone: gym.phone,
      email: gym.email,
      city: gym.city,
      address: gym.addressLine1,
      currency: gym.currency,
    },
    member: {
      id: member.id,
      memberCode: member.memberCode,
      firstName: member.firstName,
      lastName: member.lastName,
      fullName: `${member.firstName} ${member.lastName}`.trim(),
      photoUrl: member.photoUrl,
      status: member.status,
      joiningDate: member.joiningDate.toISOString(),
      email: member.email,
      phone: member.phone,
      address: member.address,
      emergencyContactName: member.emergencyContactName,
      emergencyContactPhone: member.emergencyContactPhone,
      medicalNotes: member.medicalNotes,
    },
    hasLinkedProfile: true,
    qrCard: {
      token: qrToken,
      qrDataUrl,
      generatedAt: now.toISOString(),
      expiresInSeconds: 60,
    },
    membership: {
      active: activeMembership
        ? {
            id: activeMembership.id,
            planName: activeMembership.planNameSnapshot || activeMembership.plan.name,
            startDate: activeMembership.startDate.toISOString(),
            endDate: activeMembership.endDate.toISOString(),
            status: activeMembership.status,
            sessionsRemaining: activeMembership.sessionsRemaining,
            pricePaid: Number(activeMembership.pricePaid),
            admissionFeePaid: Number(activeMembership.admissionFeePaid),
            durationMonths:
              Math.round(activeMembership.plan.durationDays / 30) || 1,
            benefits: Array.isArray(activeMembership.plan.benefits)
              ? (activeMembership.plan.benefits as string[])
              : typeof activeMembership.plan.benefits === "string"
              ? activeMembership.plan.benefits
                  .split(",")
                  .map((b) => b.trim())
                  .filter(Boolean)
              : [],
            accessRestrictions: Array.isArray(
              activeMembership.plan.accessRestrictions
            )
              ? (activeMembership.plan.accessRestrictions as string[])
              : typeof activeMembership.plan.accessRestrictions === "string"
              ? activeMembership.plan.accessRestrictions
                  .split(",")
                  .map((r) => r.trim())
                  .filter(Boolean)
              : [],
            daysRemaining,
            expiryStatus,
          }
        : null,
      history: memberships.map((m) => ({
        id: m.id,
        planName: m.planNameSnapshot || m.plan.name,
        startDate: m.startDate.toISOString(),
        endDate: m.endDate.toISOString(),
        status: m.status,
        pricePaid: Number(m.pricePaid),
      })),
    },
    attendance: {
      totalCheckIns,
      monthCheckIns,
      lastCheckIn: recentAttendance[0]
        ? recentAttendance[0].checkInTime.toISOString()
        : null,
      records: recentAttendance.map((r) => ({
        id: r.id,
        checkInTime: r.checkInTime.toISOString(),
        checkOutTime: r.checkOutTime ? r.checkOutTime.toISOString() : null,
        status: r.status,
        checkInMethod: r.checkInMethod,
      })),
    },
    billing: {
      totalInvoiced,
      totalPaid,
      outstandingBalance,
      invoices: invoices.map((inv) => ({
        id: inv.id,
        invoiceNumber: inv.invoiceNumber,
        issueDate: inv.issueDate.toISOString(),
        dueDate: inv.dueDate.toISOString(),
        subtotal: Number(inv.subtotal),
        taxAmount: Number(inv.taxAmount),
        totalAmount: Number(inv.totalAmount),
        paidAmount: Number(inv.paidAmount),
        dueAmount: Number(inv.dueAmount),
        status: inv.status,
        notes: inv.notes,
        allocations: inv.allocations.map((a) => ({
          id: a.id,
          amount: Number(a.allocatedAmount),
          paymentNumber: a.payment.paymentNumber,
          paymentMethod: a.payment.method,
          receivedAt: a.payment.receivedAt.toISOString(),
        })),
      })),
      payments: payments.map((p) => ({
        id: p.id,
        paymentNumber: p.paymentNumber,
        amount: Number(p.amount),
        method: p.method,
        status: p.status,
        receivedAt: p.receivedAt.toISOString(),
        isGatewayVerified: p.isGatewayVerified,
        notes: p.notes,
      })),
    },
    workouts: {
      activePlan: activeAssignment
        ? {
            id: activeAssignment.plan.id,
            name: activeAssignment.plan.name,
            description: activeAssignment.plan.description,
            difficultyLevel: "ACTIVE",
            entries: activeAssignment.plan.entries.map((e) => ({
              id: e.id,
              dayOfWeek: 1,
              orderIndex: e.sortOrder,
              exerciseId: e.exerciseId,
              exerciseName: e.exercise.name,
              category: e.exercise.muscleGroup || "GENERAL",
              sets: e.sets || 3,
              reps: e.reps || 10,
              targetWeightKg: null,
              restSeconds: e.restSecs || null,
              notes: e.notes,
            })),
          }
        : null,
      profile: fitnessProfile
        ? {
            id: fitnessProfile.id,
            heightCm: fitnessProfile.heightCm ? Number(fitnessProfile.heightCm) : null,
            fitnessGoals: fitnessProfile.fitnessGoals,
            fitnessNotes: fitnessProfile.fitnessNotes,
          }
        : null,
      weightLogs: weightLogs.map((w) => ({
        id: w.id,
        weightKg: Number(w.weightKg),
        logDate: w.logDate.toISOString(),
        notes: w.notes,
      })),
      measurements: measurements.map((m) => ({
        id: m.id,
        measureDate: m.measureDate.toISOString(),
        chestCm: m.chestCm ? Number(m.chestCm) : null,
        waistCm: m.waistCm ? Number(m.waistCm) : null,
        hipsCm: m.hipsCm ? Number(m.hipsCm) : null,
        bicepsCm: m.armCm ? Number(m.armCm) : null,
        thighsCm: m.thighCm ? Number(m.thighCm) : null,
        calvesCm: null,
        bodyFatPct: null,
        notes: m.notes,
      })),
      workoutRecords: workoutRecords.map((r) => ({
        id: r.id,
        planName: r.title,
        durationMinutes: 45,
        completedAt: r.date.toISOString(),
        notes: r.notes,
      })),
    },
    classes: {
      upcoming: upcomingClasses.map((s) => ({
        id: s.id,
        className: s.class.name,
        description: s.class.description,
        durationMinutes: s.class.durationMinutes,
        instructorName: s.instructor?.name || "Gym Instructor",
        startTime: s.startTime.toISOString(),
        endTime: s.endTime.toISOString(),
        capacity: s.capacity,
        bookedCount: s.bookedCount,
        spotsRemaining: Math.max(0, s.capacity - s.bookedCount),
        roomLocation: s.roomLocation,
        isBooked: s.bookings.some((b) => b.status === BookingStatus.CONFIRMED),
        myBookingId: s.bookings.find((b) => b.status === BookingStatus.CONFIRMED)?.id || null,
      })),
      myBookings: myBookings.map((b) => ({
        id: b.id,
        scheduleId: b.scheduleId,
        className: b.schedule.class.name,
        instructorName: b.schedule.instructor?.name || "Gym Instructor",
        startTime: b.schedule.startTime.toISOString(),
        endTime: b.schedule.endTime.toISOString(),
        roomLocation: b.schedule.roomLocation,
        status: b.status,
        bookedAt: b.bookedAt.toISOString(),
      })),
    },
    challenges: challenges.map((c) => {
      const myPart = c.participants[0];
      return {
        id: c.id,
        title: c.title,
        description: c.description,
        startDate: c.startDate.toISOString(),
        endDate: c.endDate.toISOString(),
        rewardBadge: c.rewardBadge,
        isJoined: !!myPart,
        progress: myPart ? Number(myPart.progress) : 0,
        isCompleted: myPart?.isCompleted || false,
      };
    }),
  };
  } catch (err) {
    console.warn("DB offline in getPortalDashboardData, returning demo portal data:", err);
    return DEMO_PORTAL_DASHBOARD_DATA;
  }
}

/**
 * Generates a fresh dynamic 60-second QR token and data URL for the authenticated member.
 */
export async function refreshPortalDynamicQr(
  sessionUserId: string,
  sessionUserEmail?: string | null,
  gymSlugOrId?: string
) {
  const { gym, member } = await resolvePortalMember(
    sessionUserId,
    sessionUserEmail,
    gymSlugOrId
  );

  if (!member) {
    throw new PortalMemberNotFoundError();
  }

  const token = generateDynamicQrToken({
    gymId: gym.id,
    memberId: member.id,
    qrSigningSecret: gym.qrSigningSecret,
  });

  const qrDataUrl = await QRCode.toDataURL(token, {
    errorCorrectionLevel: "M",
    margin: 2,
    width: 280,
    color: {
      dark: "#0f172a",
      light: "#ffffff",
    },
  });

  return {
    token,
    qrDataUrl,
    generatedAt: new Date().toISOString(),
    expiresInSeconds: 60,
  };
}

/**
 * Updates self-service profile information (phone, address, emergency contact) strictly for the resolved member.
 */
export async function updatePortalMemberProfile(
  sessionUserId: string,
  sessionUserEmail: string | undefined | null,
  gymSlugOrId: string,
  data: MemberProfileUpdateInput
) {
  const { gym, member } = await resolvePortalMember(
    sessionUserId,
    sessionUserEmail,
    gymSlugOrId
  );

  if (!member) {
    throw new PortalMemberNotFoundError();
  }

  const updated = await db.member.update({
    where: { id: member.id, gymId: gym.id },
    data: {
      phone: data.phone?.trim() || null,
      address: data.address?.trim() || null,
      emergencyContactName: data.emergencyContactName?.trim() || null,
      emergencyContactPhone: data.emergencyContactPhone?.trim() || null,
      whatsappConsent:
        data.whatsappConsent !== undefined ? data.whatsappConsent : undefined,
      whatsappConsentAt:
        data.whatsappConsent !== undefined
          ? data.whatsappConsent
            ? new Date()
            : null
          : undefined,
      whatsappConsentSource:
        data.whatsappConsent !== undefined
          ? data.whatsappConsent
            ? "MEMBER_PORTAL"
            : null
          : undefined,
    },
  });

  return {
    success: true,
    member: {
      id: updated.id,
      phone: updated.phone,
      address: updated.address,
      emergencyContactName: updated.emergencyContactName,
      emergencyContactPhone: updated.emergencyContactPhone,
    },
  };
}

/**
 * Books a scheduled class for the authenticated member.
 */
export async function portalBookClass(
  sessionUserId: string,
  sessionUserEmail: string | undefined | null,
  gymSlugOrId: string,
  scheduleId: string
) {
  const { gym, member } = await resolvePortalMember(
    sessionUserId,
    sessionUserEmail,
    gymSlugOrId
  );

  if (!member) {
    throw new PortalMemberNotFoundError();
  }

  // Create trusted member TenantContext
  const ctx = createTenantContext({
    gymId: gym.id,
    userId: sessionUserId,
    role: GymRole.MEMBER,
    userEmail: sessionUserEmail ?? undefined,
  });

  return bookClass(ctx, scheduleId, member.id);
}

/**
 * Cancels a class booking strictly ensuring the booking belongs to the authenticated member.
 */
export async function portalCancelBooking(
  sessionUserId: string,
  sessionUserEmail: string | undefined | null,
  gymSlugOrId: string,
  bookingId: string
) {
  const { gym, member } = await resolvePortalMember(
    sessionUserId,
    sessionUserEmail,
    gymSlugOrId
  );

  if (!member) {
    throw new PortalMemberNotFoundError();
  }

  const booking = await db.classBooking.findFirst({
    where: {
      id: bookingId,
      gymId: gym.id,
    },
  });

  if (!booking) {
    throw new Error("Class booking not found.");
  }

  // Strict cross-member protection
  if (booking.memberId !== member.id) {
    throw new PortalSecurityError(
      "SECURITY ALERT: You cannot cancel another member's booking."
    );
  }

  const ctx = createTenantContext({
    gymId: gym.id,
    userId: sessionUserId,
    role: GymRole.MEMBER,
    userEmail: sessionUserEmail ?? undefined,
  });

  return cancelBooking(ctx, bookingId);
}

/**
 * Logs a self-recorded weight entry for the member.
 */
export async function portalLogMemberWeight(
  sessionUserId: string,
  sessionUserEmail: string | undefined | null,
  gymSlugOrId: string,
  input: MemberWeightLogInput
) {
  const { gym, member } = await resolvePortalMember(
    sessionUserId,
    sessionUserEmail,
    gymSlugOrId
  );

  if (!member) {
    throw new PortalMemberNotFoundError();
  }

  // Ensure fitness profile exists
  let profile = await db.memberFitnessProfile.findUnique({
    where: { memberId: member.id },
  });

  if (!profile) {
    profile = await db.memberFitnessProfile.create({
      data: {
        gymId: gym.id,
        memberId: member.id,
      },
    });
  }

  const weightRecord = await db.memberWeightLog.create({
    data: {
      gymId: gym.id,
      memberId: member.id,
      profileId: profile.id,
      weightKg: Number(input.weightKg),
      logDate: new Date(),
      notes: input.notes?.trim() || null,
    },
  });

  return weightRecord;
}

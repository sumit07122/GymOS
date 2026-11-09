/* eslint-disable @typescript-eslint/no-explicit-any */
import { db } from "@/lib/db";
import {
  TenantContext,
  assertTenantOwnership,
  assertPermission,
} from "@/lib/tenant/context";
import { Member, MemberStatus } from "@prisma/client";
import {
  MemberCreateInput,
  MemberUpdateInput,
  memberCsvRowSchema,
} from "@/lib/validations/member";

// ==============================================================================
// FIXIA GymOS — Tenant-Scoped Member Management Service
// ==============================================================================

export class DuplicateMemberError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "DuplicateMemberError";
  }
}

export class MemberNotFoundError extends Error {
  constructor(id: string) {
    super(`Member "${id}" not found or does not belong to this gym workspace.`);
    this.name = "MemberNotFoundError";
  }
}

export class MemberIntegrityError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "MemberIntegrityError";
  }
}

export interface MemberFilterParams {
  search?: string;
  status?: string; // "ALL" | MemberStatus
  planId?: string;
  sortBy?: "name" | "code" | "joiningDate" | "status";
  sortOrder?: "asc" | "desc";
  page?: number;
  limit?: number;
}

export interface PaginatedMembersResult {
  members: (Member & {
    activeMembership?: {
      id: string;
      planName: string;
      endDate: Date;
    } | null;
    outstandingDues: number;
  })[];
  total: number;
  page: number;
  totalPages: number;
  limit: number;
}

/**
 * Generates a collision-resistant, human-readable member code unique to the gym.
 * Format: MEM-1001, MEM-1002, etc.
 */
export async function generateUniqueMemberCode(gymId: string): Promise<string> {
  const count = await db.member.count({ where: { gymId } });
  let candidate = `MEM-${String(1001 + count).padStart(4, "0")}`;

  let exists = await db.member.findUnique({
    where: { gymId_memberCode: { gymId, memberCode: candidate } },
    select: { id: true },
  });

  let counter = count + 1;
  while (exists) {
    counter++;
    candidate = `MEM-${String(1001 + counter).padStart(4, "0")}`;
    exists = await db.member.findUnique({
      where: { gymId_memberCode: { gymId, memberCode: candidate } },
      select: { id: true },
    });
  }

  return candidate;
}

/**
 * Lists and filters members strictly within the authorized gym workspace.
 */
export async function getMembersList(
  ctx: TenantContext,
  params: MemberFilterParams = {}
): Promise<PaginatedMembersResult> {
  assertPermission(ctx, "MEMBER_READ");
  const gymId = ctx.gymId;

  const {
    search,
    status,
    planId,
    sortBy = "joiningDate",
    sortOrder = "desc",
    page = 1,
    limit = 20,
  } = params;

  const offset = (Math.max(page, 1) - 1) * limit;

  // Build where conditions
  const where: any = {
    gymId,
  };

  // Status Filter
  if (status && status !== "ALL") {
    where.status = status as MemberStatus;
  }

  // Plan Filter
  if (planId && planId !== "ALL") {
    where.memberships = {
      some: {
        gymId,
        planId,
        status: "ACTIVE",
      },
    };
  }

  // Search Filter (name, code, email, phone)
  if (search && search.trim()) {
    const s = search.trim();
    where.OR = [
      { firstName: { contains: s, mode: "insensitive" } },
      { lastName: { contains: s, mode: "insensitive" } },
      { memberCode: { contains: s, mode: "insensitive" } },
      { email: { contains: s, mode: "insensitive" } },
      { phone: { contains: s, mode: "insensitive" } },
    ];
  }

  // Sorting
  let orderBy: any = { createdAt: "desc" };
  if (sortBy === "name") {
    orderBy = { firstName: sortOrder };
  } else if (sortBy === "code") {
    orderBy = { memberCode: sortOrder };
  } else if (sortBy === "status") {
    orderBy = { status: sortOrder };
  } else if (sortBy === "joiningDate") {
    orderBy = { joiningDate: sortOrder };
  }

  const [rawMembers, total] = await Promise.all([
    db.member.findMany({
      where,
      orderBy,
      take: limit,
      skip: offset,
      include: {
        memberships: {
          where: { status: "ACTIVE" },
          take: 1,
          include: {
            plan: { select: { name: true } },
          },
        },
        invoices: {
          where: {
            status: { in: ["ISSUED", "PARTIALLY_PAID", "OVERDUE"] },
          },
          select: {
            dueAmount: true,
          },
        },
      },
    }),
    db.member.count({ where }),
  ]);

  const members = rawMembers.map((m) => {
    const activeMem = m.memberships[0];
    const dues = m.invoices.reduce((acc, inv) => acc + Number(inv.dueAmount), 0);

    return {
      ...m,
      activeMembership: activeMem
        ? {
            id: activeMem.id,
            planName: activeMem.plan.name,
            endDate: activeMem.endDate,
          }
        : null,
      outstandingDues: dues,
    };
  });

  return {
    members,
    total,
    page,
    totalPages: Math.ceil(total / limit) || 1,
    limit,
  };
}

/**
 * Retrieves full member profile with comprehensive relational history.
 */
export async function getMemberById(ctx: TenantContext, id: string) {
  assertPermission(ctx, "MEMBER_READ");

  const member = await db.member.findUnique({
    where: { id },
    include: {
      gym: {
        select: { currency: true, name: true, slug: true },
      },
      memberships: {
        orderBy: { startDate: "desc" },
        include: {
          plan: true,
          auditLogs: {
            orderBy: { createdAt: "desc" },
          },
        },
      },
      invoices: {
        orderBy: { issueDate: "desc" },
      },
      payments: {
        orderBy: { receivedAt: "desc" },
      },
      attendanceRecords: {
        orderBy: { checkInTime: "desc" },
        take: 30,
      },
      workoutRecords: {
        orderBy: { date: "desc" },
      },
      classBookings: {
        orderBy: { bookedAt: "desc" },
        include: {
          schedule: {
            include: {
              class: true,
            },
          },
        },
      },
      activities: {
        orderBy: { createdAt: "desc" },
        take: 50,
      },
    },
  });

  if (!member) {
    throw new MemberNotFoundError(id);
  }

  // Strict tenant boundary check
  assertTenantOwnership(ctx, member.gymId);

  // Calculate outstanding dues
  const outstandingDues = member.invoices
    .filter((inv) => ["ISSUED", "PARTIALLY_PAID", "OVERDUE"].includes(inv.status))
    .reduce((acc, inv) => acc + Number(inv.dueAmount), 0);

  const activeMembership = member.memberships.find((m) => m.status === "ACTIVE") || null;

  return {
    ...member,
    outstandingDues,
    activeMembership,
    currency: member.gym.currency || "USD",
  };
}

/**
 * Creates a new member with duplicate detection and audit logging.
 */
export async function createMember(
  ctx: TenantContext,
  data: MemberCreateInput,
  performedBy = "Staff"
): Promise<Member> {
  assertPermission(ctx, "MEMBER_CREATE");
  const gymId = ctx.gymId;

  // 1. Prevent duplicate phone in this gym
  if (data.phone && data.phone.trim()) {
    const existingPhone = await db.member.findFirst({
      where: {
        gymId,
        phone: data.phone.trim(),
        status: { not: MemberStatus.ARCHIVED },
      },
      select: { id: true, memberCode: true },
    });

    if (existingPhone) {
      throw new DuplicateMemberError(
        `A member with phone number "${data.phone}" already exists in this gym (${existingPhone.memberCode}).`
      );
    }
  }

  // 2. Prevent duplicate email in this gym
  if (data.email && data.email.trim()) {
    const existingEmail = await db.member.findFirst({
      where: {
        gymId,
        email: data.email.trim(),
        status: { not: MemberStatus.ARCHIVED },
      },
      select: { id: true, memberCode: true },
    });

    if (existingEmail) {
      throw new DuplicateMemberError(
        `A member with email "${data.email}" already exists in this gym (${existingEmail.memberCode}).`
      );
    }
  }

  // 3. Resolve or generate member code
  let memberCode = data.memberCode?.trim();
  if (!memberCode) {
    memberCode = await generateUniqueMemberCode(gymId);
  } else {
    // Check code collision
    const existingCode = await db.member.findUnique({
      where: { gymId_memberCode: { gymId, memberCode } },
      select: { id: true },
    });
    if (existingCode) {
      throw new DuplicateMemberError(
        `Member code "${memberCode}" is already in use in this gym.`
      );
    }
  }

  const joiningDate = data.joiningDate ? new Date(data.joiningDate) : new Date();
  const dateOfBirth = data.dateOfBirth ? new Date(data.dateOfBirth) : null;

  // 4. Atomic creation with activity log
  return db.$transaction(async (tx) => {
    const member = await tx.member.create({
      data: {
        gymId,
        memberCode,
        firstName: data.firstName.trim(),
        lastName: data.lastName.trim(),
        email: data.email?.trim() || null,
        phone: data.phone?.trim() || null,
        photoUrl: data.photoUrl?.trim() || null,
        address: data.address?.trim() || null,
        gender: data.gender?.trim() || null,
        dateOfBirth,
        joiningDate,
        emergencyContactName: data.emergencyContactName?.trim() || null,
        emergencyContactPhone: data.emergencyContactPhone?.trim() || null,
        medicalNotes: data.medicalNotes?.trim() || null,
        internalNotes: data.internalNotes?.trim() || null,
        status: data.status || MemberStatus.ACTIVE,
      },
    });

    await tx.memberActivity.create({
      data: {
        gymId,
        memberId: member.id,
        action: "CREATED",
        details: `Member registered with code ${member.memberCode}`,
        performedBy,
      },
    });

    return member;
  });
}

/**
 * Updates an existing member profile with duplicate guards and audit trail.
 */
export async function updateMember(
  ctx: TenantContext,
  id: string,
  data: MemberUpdateInput,
  performedBy = "Staff"
): Promise<Member> {
  assertPermission(ctx, "MEMBER_UPDATE");

  const existing = await db.member.findUnique({
    where: { id },
  });

  if (!existing) {
    throw new MemberNotFoundError(id);
  }

  assertTenantOwnership(ctx, existing.gymId);

  // Check duplicate phone if modified
  if (data.phone && data.phone.trim() && data.phone.trim() !== existing.phone) {
    const dupPhone = await db.member.findFirst({
      where: {
        gymId: ctx.gymId,
        phone: data.phone.trim(),
        id: { not: id },
        status: { not: MemberStatus.ARCHIVED },
      },
      select: { memberCode: true },
    });
    if (dupPhone) {
      throw new DuplicateMemberError(
        `Phone number "${data.phone}" is already assigned to member ${dupPhone.memberCode}.`
      );
    }
  }

  // Check duplicate email if modified
  if (data.email && data.email.trim() && data.email.trim() !== existing.email) {
    const dupEmail = await db.member.findFirst({
      where: {
        gymId: ctx.gymId,
        email: data.email.trim(),
        id: { not: id },
        status: { not: MemberStatus.ARCHIVED },
      },
      select: { memberCode: true },
    });
    if (dupEmail) {
      throw new DuplicateMemberError(
        `Email address "${data.email}" is already assigned to member ${dupEmail.memberCode}.`
      );
    }
  }

  const updatePayload: any = {};
  if (data.firstName !== undefined) updatePayload.firstName = data.firstName.trim();
  if (data.lastName !== undefined) updatePayload.lastName = data.lastName.trim();
  if (data.phone !== undefined) updatePayload.phone = data.phone?.trim() || null;
  if (data.email !== undefined) updatePayload.email = data.email?.trim() || null;
  if (data.photoUrl !== undefined) updatePayload.photoUrl = data.photoUrl?.trim() || null;
  if (data.address !== undefined) updatePayload.address = data.address?.trim() || null;
  if (data.gender !== undefined) updatePayload.gender = data.gender?.trim() || null;
  if (data.emergencyContactName !== undefined)
    updatePayload.emergencyContactName = data.emergencyContactName?.trim() || null;
  if (data.emergencyContactPhone !== undefined)
    updatePayload.emergencyContactPhone = data.emergencyContactPhone?.trim() || null;
  if (data.medicalNotes !== undefined)
    updatePayload.medicalNotes = data.medicalNotes?.trim() || null;
  if (data.internalNotes !== undefined)
    updatePayload.internalNotes = data.internalNotes?.trim() || null;
  if (data.status !== undefined) updatePayload.status = data.status;
  if (data.joiningDate) updatePayload.joiningDate = new Date(data.joiningDate);
  if (data.dateOfBirth) updatePayload.dateOfBirth = new Date(data.dateOfBirth);

  return db.$transaction(async (tx) => {
    const updated = await tx.member.update({
      where: { id },
      data: updatePayload,
    });

    await tx.memberActivity.create({
      data: {
        gymId: ctx.gymId,
        memberId: id,
        action: "UPDATED",
        details: "Member profile details updated",
        performedBy,
      },
    });

    return updated;
  });
}

/**
 * Archives a member instead of deleting when business records exist.
 */
export async function archiveMember(
  ctx: TenantContext,
  id: string,
  reason = "Archived by staff",
  performedBy = "Staff"
): Promise<Member> {
  assertPermission(ctx, "MEMBER_UPDATE");

  const existing = await db.member.findUnique({
    where: { id },
    select: { id: true, gymId: true, memberCode: true },
  });

  if (!existing) {
    throw new MemberNotFoundError(id);
  }

  assertTenantOwnership(ctx, existing.gymId);

  return db.$transaction(async (tx) => {
    const archived = await tx.member.update({
      where: { id },
      data: {
        status: MemberStatus.ARCHIVED,
        archivedAt: new Date(),
        archivedReason: reason,
      },
    });

    await tx.memberActivity.create({
      data: {
        gymId: ctx.gymId,
        memberId: id,
        action: "ARCHIVED",
        details: reason,
        performedBy,
      },
    });

    return archived;
  });
}

/**
 * Restores an archived member to ACTIVE status.
 */
export async function unarchiveMember(
  ctx: TenantContext,
  id: string,
  performedBy = "Staff"
): Promise<Member> {
  assertPermission(ctx, "MEMBER_UPDATE");

  const existing = await db.member.findUnique({
    where: { id },
    select: { id: true, gymId: true },
  });

  if (!existing) {
    throw new MemberNotFoundError(id);
  }

  assertTenantOwnership(ctx, existing.gymId);

  return db.$transaction(async (tx) => {
    const restored = await tx.member.update({
      where: { id },
      data: {
        status: MemberStatus.ACTIVE,
        archivedAt: null,
        archivedReason: null,
      },
    });

    await tx.memberActivity.create({
      data: {
        gymId: ctx.gymId,
        memberId: id,
        action: "UNARCHIVED",
        details: "Member account reactivated to Active status",
        performedBy,
      },
    });

    return restored;
  });
}

/**
 * Enforces business integrity deletion rule:
 * Permanently rejects deletion if member has financial or attendance records.
 */
export async function deleteMember(ctx: TenantContext, id: string): Promise<Member> {
  assertPermission(ctx, "MEMBER_DELETE");

  const existing = await db.member.findUnique({
    where: { id },
    select: { id: true, gymId: true, memberCode: true },
  });

  if (!existing) {
    throw new MemberNotFoundError(id);
  }

  assertTenantOwnership(ctx, existing.gymId);

  // Business rule check: verify zero financial or attendance records
  const [invoicesCount, paymentsCount, attendanceCount] = await Promise.all([
    db.invoice.count({ where: { memberId: id } }),
    db.payment.count({ where: { memberId: id } }),
    db.attendanceRecord.count({ where: { memberId: id } }),
  ]);

  if (invoicesCount > 0 || paymentsCount > 0 || attendanceCount > 0) {
    throw new MemberIntegrityError(
      `Cannot permanently delete member ${existing.memberCode} because they possess recorded financial (${invoicesCount} invoices, ${paymentsCount} payments) or attendance (${attendanceCount} check-ins) records. Please use the Archive workflow instead.`
    );
  }

  return db.member.delete({
    where: { id },
  });
}

/**
 * Adds a fitness/workout record to the member's profile.
 */
export async function addWorkoutRecord(
  ctx: TenantContext,
  memberId: string,
  title: string,
  notes?: string,
  recordedBy = "Trainer"
) {
  assertPermission(ctx, "MEMBER_UPDATE");

  const member = await db.member.findUnique({
    where: { id: memberId },
    select: { id: true, gymId: true },
  });

  if (!member) {
    throw new MemberNotFoundError(memberId);
  }

  assertTenantOwnership(ctx, member.gymId);

  return db.$transaction(async (tx) => {
    const record = await tx.workoutRecord.create({
      data: {
        gymId: ctx.gymId,
        memberId,
        title: title.trim(),
        notes: notes?.trim() || null,
        recordedBy,
      },
    });

    await tx.memberActivity.create({
      data: {
        gymId: ctx.gymId,
        memberId,
        action: "WORKOUT_LOGGED",
        details: `Workout recorded: "${title.trim()}"`,
        performedBy: recordedBy,
      },
    });

    return record;
  });
}

/**
 * Validates and imports members from CSV data in a single transactional batch.
 */
export async function importMembersFromCsv(
  ctx: TenantContext,
  csvText: string,
  performedBy = "Staff"
): Promise<{
  totalRows: number;
  imported: number;
  skipped: number;
  errors: string[];
}> {
  assertPermission(ctx, "MEMBER_CREATE");

  const lines = csvText.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  if (lines.length < 2) {
    return {
      totalRows: 0,
      imported: 0,
      skipped: 0,
      errors: ["CSV must contain a header row and at least one data row."],
    };
  }

  const headerLine = lines[0].toLowerCase();
  const headers = headerLine.split(",").map((h) => h.trim().replace(/^["']|["']$/g, ""));

  const firstIdx = headers.indexOf("firstname") !== -1 ? headers.indexOf("firstname") : headers.indexOf("first name");
  const lastIdx = headers.indexOf("lastname") !== -1 ? headers.indexOf("lastname") : headers.indexOf("last name");
  const phoneIdx = headers.indexOf("phone");
  const emailIdx = headers.indexOf("email");
  const codeIdx = headers.indexOf("membercode") !== -1 ? headers.indexOf("membercode") : headers.indexOf("member code");
  const genderIdx = headers.indexOf("gender");
  const addressIdx = headers.indexOf("address");

  if (firstIdx === -1 || lastIdx === -1) {
    return {
      totalRows: lines.length - 1,
      imported: 0,
      skipped: lines.length - 1,
      errors: ["CSV header missing required 'First Name' or 'Last Name' columns."],
    };
  }

  const errors: string[] = [];
  const validRows: any[] = [];
  const seenPhones = new Set<string>();
  const seenEmails = new Set<string>();

  for (let i = 1; i < lines.length; i++) {
    const rawCols = lines[i].split(",").map((c) => c.trim().replace(/^["']|["']$/g, ""));
    const rowNum = i + 1;

    const rowObj = {
      firstName: rawCols[firstIdx] || "",
      lastName: rawCols[lastIdx] || "",
      memberCode: codeIdx !== -1 ? rawCols[codeIdx] : undefined,
      phone: phoneIdx !== -1 ? rawCols[phoneIdx] : undefined,
      email: emailIdx !== -1 ? rawCols[emailIdx] : undefined,
      gender: genderIdx !== -1 ? rawCols[genderIdx] : undefined,
      address: addressIdx !== -1 ? rawCols[addressIdx] : undefined,
    };

    const parsed = memberCsvRowSchema.safeParse(rowObj);
    if (!parsed.success) {
      errors.push(`Row ${rowNum}: ${parsed.error.issues.map((iss) => iss.message).join(", ")}`);
      continue;
    }

    const { phone, email } = parsed.data;

    // Check duplicate within the batch
    if (phone && seenPhones.has(phone)) {
      errors.push(`Row ${rowNum}: Duplicate phone number "${phone}" within CSV.`);
      continue;
    }
    if (email && seenEmails.has(email)) {
      errors.push(`Row ${rowNum}: Duplicate email "${email}" within CSV.`);
      continue;
    }

    if (phone) seenPhones.add(phone);
    if (email) seenEmails.add(email);

    validRows.push(parsed.data);
  }

  let imported = 0;
  for (const row of validRows) {
    try {
      await createMember(
        ctx,
        {
          ...row,
          status: MemberStatus.ACTIVE,
        },
        performedBy
      );
      imported++;
    } catch (err: any) {
      errors.push(`Import error for ${row.firstName} ${row.lastName}: ${err.message}`);
    }
  }

  return {
    totalRows: lines.length - 1,
    imported,
    skipped: lines.length - 1 - imported,
    errors,
  };
}

/**
 * Exports members in the authorized gym workspace to a standard CSV string.
 */
export async function exportMembersToCsv(
  ctx: TenantContext,
  params: MemberFilterParams = {}
): Promise<string> {
  assertPermission(ctx, "MEMBER_READ");

  // Fetch up to 5,000 members for CSV export
  const { members } = await getMembersList(ctx, { ...params, limit: 5000, page: 1 });

  const headers = [
    "Member Code",
    "First Name",
    "Last Name",
    "Email",
    "Phone",
    "Status",
    "Active Plan",
    "Joining Date",
    "Outstanding Dues",
    "Emergency Contact",
    "Emergency Phone",
  ];

  const rows = members.map((m) => [
    `"${m.memberCode}"`,
    `"${m.firstName.replace(/"/g, '""')}"`,
    `"${m.lastName.replace(/"/g, '""')}"`,
    `"${m.email || ""}"`,
    `"${m.phone || ""}"`,
    `"${m.status}"`,
    `"${m.activeMembership?.planName || "None"}"`,
    `"${m.joiningDate.toISOString().split("T")[0]}"`,
    `"${m.outstandingDues.toFixed(2)}"`,
    `"${m.emergencyContactName || ""}"`,
    `"${m.emergencyContactPhone || ""}"`,
  ]);

  return [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
}

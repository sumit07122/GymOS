import { db } from "@/lib/db";
import {
  TenantContext,
  assertTenantOwnership,
  assertPermission,
} from "@/lib/tenant/context";
import { Member, MemberStatus } from "@prisma/client";

// ==============================================================================
// FIXIA GymOS — Tenant-Scoped Member Repository
// ==============================================================================
// Guarantees:
// 1. Every query is strictly locked to ctx.gymId.
// 2. Client-supplied gymId is completely ignored and overwritten by ctx.gymId.
// 3. Probing IDs belonging to other gyms triggers a TenantAccessViolationError.
// ==============================================================================

export interface CreateMemberData {
  memberCode: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  gender?: string;
  dateOfBirth?: Date;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  medicalNotes?: string;
}

export interface UpdateMemberData {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  status?: MemberStatus;
  medicalNotes?: string;
}

export const memberRepository = {
  /**
   * Retrieves a member by ID, enforcing tenant ownership.
   */
  async findById(ctx: TenantContext, id: string): Promise<Member | null> {
    assertPermission(ctx, "MEMBER_READ");

    const member = await db.member.findUnique({
      where: { id },
    });

    if (!member) {
      return null;
    }

    // Security check: if member exists but belongs to a different gym, alert & reject
    assertTenantOwnership(ctx, member.gymId);

    return member;
  },

  /**
   * Lists all members within the authorized tenant.
   */
  async findMany(
    ctx: TenantContext,
    options: {
      status?: MemberStatus;
      search?: string;
      limit?: number;
      offset?: number;
    } = {}
  ): Promise<Member[]> {
    assertPermission(ctx, "MEMBER_READ");

    const { status, search, limit = 50, offset = 0 } = options;

    return db.member.findMany({
      where: {
        gymId: ctx.gymId,
        ...(status ? { status } : {}),
        ...(search
          ? {
              OR: [
                { firstName: { contains: search, mode: "insensitive" } },
                { lastName: { contains: search, mode: "insensitive" } },
                { memberCode: { contains: search, mode: "insensitive" } },
                { email: { contains: search, mode: "insensitive" } },
                { phone: { contains: search, mode: "insensitive" } },
              ],
            }
          : {}),
      },
      orderBy: { createdAt: "desc" },
      take: limit,
      skip: offset,
    });
  },

  /**
   * Creates a member strictly within the authorized tenant.
   */
  async create(ctx: TenantContext, data: CreateMemberData): Promise<Member> {
    assertPermission(ctx, "MEMBER_CREATE");

    return db.member.create({
      data: {
        ...data,
        gymId: ctx.gymId, // Enforce tenant scoping from server context
        status: MemberStatus.ACTIVE,
      },
    });
  },

  /**
   * Updates a member strictly within the authorized tenant.
   */
  async update(
    ctx: TenantContext,
    id: string,
    data: UpdateMemberData
  ): Promise<Member> {
    assertPermission(ctx, "MEMBER_UPDATE");

    // Verify existing member ownership first
    const existing = await db.member.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new Error(`Member with ID "${id}" does not exist.`);
    }

    assertTenantOwnership(ctx, existing.gymId);

    return db.member.update({
      where: { id },
      data,
    });
  },

  /**
   * Deletes a member strictly within the authorized tenant.
   */
  async delete(ctx: TenantContext, id: string): Promise<Member> {
    assertPermission(ctx, "MEMBER_DELETE");

    const existing = await db.member.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new Error(`Member with ID "${id}" does not exist.`);
    }

    assertTenantOwnership(ctx, existing.gymId);

    return db.member.delete({
      where: { id },
    });
  },
};


/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  createLead,
  updateLead,
  changeLeadStatus,
  logLeadActivity,
  scheduleFollowUp,
  convertLeadToMember,
  getLeadsList,
  getLeadById,
  getLeadMetrics,
  LeadNotFoundError,
  LeadAlreadyConvertedError,
} from "@/lib/services/lead.service";
import { createTenantContext, TenantAccessViolationError } from "@/lib/tenant/context";
import { InsufficientPermissionError } from "@/lib/tenant/permissions";
import { db } from "@/lib/db";
import {
  GymRole,
  LeadSource,
  LeadStage,
  LeadActivityType,
  MemberStatus,
} from "@prisma/client";

describe("Milestone M10: Leads & CRM Pipeline Management", () => {
  const gymAId = "gym-alpha-101";
  const gymBId = "gym-beta-202";

  const staffAContext = createTenantContext({
    gymId: gymAId,
    userId: "staff-alpha",
    userEmail: "staff@alpha.com",
    role: GymRole.STAFF,
  });

  const trainerAContext = createTenantContext({
    gymId: gymAId,
    userId: "trainer-alpha",
    userEmail: "trainer@alpha.com",
    role: GymRole.TRAINER,
  });

  const memberAContext = createTenantContext({
    gymId: gymAId,
    userId: "member-alpha",
    userEmail: "member@alpha.com",
    role: GymRole.MEMBER,
  });

  const ownerBContext = createTenantContext({
    gymId: gymBId,
    userId: "owner-beta",
    userEmail: "owner@beta.com",
    role: GymRole.OWNER,
  });

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  // ============================================================================
  // 1. LEAD CREATION
  // ============================================================================
  describe("Lead Creation", () => {
    it("successfully creates a new prospective lead with default stage and initial activity", async () => {
      const mockLead = {
        id: "lead-001",
        gymId: gymAId,
        firstName: "Rohan",
        lastName: "Verma",
        phone: "+91 98765 11111",
        email: "rohan@example.com",
        source: LeadSource.WALK_IN,
        stage: LeadStage.NEW,
        notes: "Interested in strength conditioning",
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockActivity = {
        id: "act-001",
        gymId: gymAId,
        leadId: "lead-001",
        staffUserId: staffAContext.userId,
        staffName: staffAContext.userEmail,
        type: LeadActivityType.VISIT_NOTE,
        notes: "Enquiry captured at desk.",
        performedAt: new Date(),
      };

      vi.spyOn(db, "$transaction").mockImplementation(async (callback: any) => {
        const tx = {
          lead: {
            create: vi.fn().mockResolvedValue(mockLead),
          },
          leadActivity: {
            create: vi.fn().mockResolvedValue(mockActivity),
          },
        };
        return callback(tx);
      });

      const result = await createLead(staffAContext, {
        firstName: "Rohan",
        lastName: "Verma",
        phone: "+91 98765 11111",
        email: "rohan@example.com",
        source: LeadSource.WALK_IN,
        notes: "Interested in strength conditioning",
      });

      expect(result.id).toBe("lead-001");
      expect(result.firstName).toBe("Rohan");
      expect(result.activities).toHaveLength(1);
      expect(result.activities[0].type).toBe(LeadActivityType.VISIT_NOTE);
    });

    it("rejects lead creation if user lacks LEAD_CREATE permission (e.g. TRAINER or MEMBER)", async () => {
      await expect(
        createLead(trainerAContext, {
          firstName: "John",
          lastName: "Doe",
          phone: "+91 99999 88888",
        })
      ).rejects.toThrow(InsufficientPermissionError);

      await expect(
        createLead(memberAContext, {
          firstName: "Jane",
          lastName: "Doe",
          phone: "+91 99999 77777",
        })
      ).rejects.toThrow(InsufficientPermissionError);
    });

    it("prevents assigning staff or plans belonging to a different gym (cross-tenant safety)", async () => {
      vi.spyOn(db.userGymRole, "findFirst").mockResolvedValue(null);

      await expect(
        createLead(staffAContext, {
          firstName: "Unauthorized",
          lastName: "StaffAssignment",
          phone: "+91 98765 00000",
          assignedStaffId: "foreign-staff",
        })
      ).rejects.toThrow(TenantAccessViolationError);
    });
  });

  // ============================================================================
  // 2. LEAD UPDATES & DETAIL INSPECTION
  // ============================================================================
  describe("Lead Updates & Details", () => {
    it("updates lead fields and logs an activity record", async () => {
      const existingLead = {
        id: "lead-002",
        gymId: gymAId,
        firstName: "Priya",
        lastName: "Nair",
        phone: "+91 98765 22222",
        stage: LeadStage.NEW,
      };

      vi.spyOn(db.lead, "findUnique").mockResolvedValue(existingLead as any);

      const updatedLead = {
        ...existingLead,
        notes: "Follow up on Monday evening",
      };

      vi.spyOn(db, "$transaction").mockImplementation(async (callback: any) => {
        const tx = {
          lead: {
            update: vi.fn().mockResolvedValue(updatedLead),
          },
          leadActivity: {
            create: vi.fn().mockResolvedValue({ id: "act-upd" }),
          },
        };
        return callback(tx);
      });

      const res = await updateLead(staffAContext, {
        leadId: "lead-002",
        firstName: "Priya",
        lastName: "Nair",
        phone: "+91 98765 22222",
        source: LeadSource.WEBSITE,
        notes: "Follow up on Monday evening",
      });

      expect(res.notes).toBe("Follow up on Monday evening");
    });

    it("prevents fetching lead by ID from another gym", async () => {
      vi.spyOn(db.lead, "findUnique").mockResolvedValue({
        id: "lead-gym-a",
        gymId: gymAId,
      } as any);

      await expect(getLeadById(ownerBContext, "lead-gym-a")).rejects.toThrow(
        LeadNotFoundError
      );
    });
  });

  // ============================================================================
  // 3. PIPELINE STAGE ADVANCEMENT
  // ============================================================================
  describe("Pipeline Stage Progression", () => {
    it("moves lead from NEW to CONTACTED and logs STAGE_CHANGE activity", async () => {
      const lead = {
        id: "lead-003",
        gymId: gymAId,
        stage: LeadStage.NEW,
        firstName: "Rahul",
        lastName: "Sen",
      };

      vi.spyOn(db.lead, "findUnique").mockResolvedValue(lead as any);

      const updatedLead = {
        ...lead,
        stage: LeadStage.CONTACTED,
      };

      vi.spyOn(db, "$transaction").mockImplementation(async (callback: any) => {
        const tx = {
          lead: {
            update: vi.fn().mockResolvedValue(updatedLead),
          },
          leadActivity: {
            create: vi.fn().mockResolvedValue({ id: "act-stage" }),
          },
        };
        return callback(tx);
      });

      const res = await changeLeadStatus(staffAContext, {
        leadId: "lead-003",
        stage: LeadStage.CONTACTED,
        notes: "Called on phone, shared gym brochure.",
      });

      expect(res.stage).toBe(LeadStage.CONTACTED);
    });

    it("records lostReason when moving lead to LOST stage", async () => {
      const lead = {
        id: "lead-004",
        gymId: gymAId,
        stage: LeadStage.INTERESTED,
        firstName: "Aman",
        lastName: "Gupta",
      };

      vi.spyOn(db.lead, "findUnique").mockResolvedValue(lead as any);

      const updatedLead = {
        ...lead,
        stage: LeadStage.LOST,
        lostReason: "Price / Budget too high",
      };

      vi.spyOn(db, "$transaction").mockImplementation(async (callback: any) => {
        const tx = {
          lead: {
            update: vi.fn().mockResolvedValue(updatedLead),
          },
          leadActivity: {
            create: vi.fn().mockResolvedValue({ id: "act-lost" }),
          },
        };
        return callback(tx);
      });

      const res = await changeLeadStatus(staffAContext, {
        leadId: "lead-004",
        stage: LeadStage.LOST,
        lostReason: "Price / Budget too high",
      });

      expect(res.stage).toBe(LeadStage.LOST);
      expect(res.lostReason).toBe("Price / Budget too high");
    });
  });

  // ============================================================================
  // 4. MANUAL TOUCHPOINT & CALL LOGGING
  // ============================================================================
  describe("Manual Communication Logging", () => {
    it("successfully logs CALL, WHATSAPP, and EMAIL touchpoints with staff attribution", async () => {
      const lead = {
        id: "lead-005",
        gymId: gymAId,
      };

      vi.spyOn(db.lead, "findUnique").mockResolvedValue(lead as any);

      const activityMock = {
        id: "act-call-1",
        gymId: gymAId,
        leadId: "lead-005",
        staffUserId: staffAContext.userId,
        staffName: staffAContext.userEmail,
        type: LeadActivityType.CALL,
        notes: "Spoke for 5 minutes. Scheduled trial for Friday.",
        performedAt: new Date(),
      };

      vi.spyOn(db.leadActivity, "create").mockResolvedValue(activityMock as any);

      const res = await logLeadActivity(staffAContext, {
        leadId: "lead-005",
        type: LeadActivityType.CALL,
        notes: "Spoke for 5 minutes. Scheduled trial for Friday.",
      });

      expect(res.type).toBe(LeadActivityType.CALL);
      expect(res.notes).toContain("Scheduled trial");
      expect(res.staffName).toBe(staffAContext.userEmail);
    });
  });

  // ============================================================================
  // 5. FOLLOW-UP REMINDER SCHEDULING
  // ============================================================================
  describe("Follow-Up Reminders", () => {
    it("schedules follow-up date and notes, logging FOLLOW_UP_SCHEDULED activity", async () => {
      const lead = {
        id: "lead-006",
        gymId: gymAId,
        firstName: "Sneha",
        lastName: "Rao",
      };

      vi.spyOn(db.lead, "findUnique").mockResolvedValue(lead as any);

      const targetDate = new Date(Date.now() + 86400000 * 3); // 3 days later
      const updatedLead = {
        ...lead,
        followUpDate: targetDate,
        followUpNotes: "Call regarding seasonal discount promo",
      };

      vi.spyOn(db, "$transaction").mockImplementation(async (callback: any) => {
        const tx = {
          lead: {
            update: vi.fn().mockResolvedValue(updatedLead),
          },
          leadActivity: {
            create: vi.fn().mockResolvedValue({ id: "act-fu" }),
          },
        };
        return callback(tx);
      });

      const res = await scheduleFollowUp(staffAContext, {
        leadId: "lead-006",
        followUpDate: targetDate.toISOString(),
        followUpNotes: "Call regarding seasonal discount promo",
      });

      expect(res.followUpNotes).toBe("Call regarding seasonal discount promo");
    });
  });

  // ============================================================================
  // 6. LEAD CONVERSION & ANTI-DUPLICATE PROTECTION
  // ============================================================================
  describe("Lead Conversion to Member", () => {
    it("converts lead to a new member and updates lead to CONVERTED", async () => {
      const lead = {
        id: "lead-007",
        gymId: gymAId,
        firstName: "Vikas",
        lastName: "Khanna",
        phone: "+91 98765 77777",
        email: "vikas@example.com",
        source: LeadSource.WALK_IN,
        stage: LeadStage.TRIAL_SCHEDULED,
        interestedPlanId: null,
        convertedMemberId: null,
      };

      vi.spyOn(db.lead, "findUnique").mockResolvedValue(lead as any);
      // No existing member with this phone or email
      vi.spyOn(db.member, "findFirst").mockResolvedValue(null);
      vi.spyOn(db.member, "count").mockResolvedValue(15);
      vi.spyOn(db.member, "findUnique").mockResolvedValue(null);

      const newMember = {
        id: "mem-new-123",
        gymId: gymAId,
        memberCode: "MEM-1016",
        firstName: "Vikas",
        lastName: "Khanna",
        phone: "+91 98765 77777",
        email: "vikas@example.com",
        status: MemberStatus.ACTIVE,
      };

      const updatedLead = {
        ...lead,
        stage: LeadStage.CONVERTED,
        convertedMemberId: newMember.id,
        convertedAt: new Date(),
      };

      vi.spyOn(db, "$transaction").mockImplementation(async (callback: any) => {
        const tx = {
          member: {
            create: vi.fn().mockResolvedValue(newMember),
          },
          lead: {
            update: vi.fn().mockResolvedValue(updatedLead),
          },
          leadActivity: {
            create: vi.fn().mockResolvedValue({ id: "act-conv" }),
          },
          membershipPlan: {
            findUnique: vi.fn(),
          },
          membership: {
            create: vi.fn(),
          },
        };
        return callback(tx);
      });

      const res = await convertLeadToMember(staffAContext, {
        leadId: "lead-007",
        createMembership: false,
      });

      expect(res.isExistingMember).toBe(false);
      expect(res.member.memberCode).toBe("MEM-1016");
      expect(res.lead.stage).toBe(LeadStage.CONVERTED);
    });

    it("ANTI-DUPLICATE: links to existing member without creating duplicate record", async () => {
      const lead = {
        id: "lead-008",
        gymId: gymAId,
        firstName: "Amit",
        lastName: "Patel",
        phone: "+91 98765 88888",
        email: "amit@example.com",
        stage: LeadStage.INTERESTED,
        convertedMemberId: null,
      };

      const existingMember = {
        id: "mem-existing-888",
        gymId: gymAId,
        memberCode: "MEM-0005",
        firstName: "Amit",
        lastName: "Patel",
        phone: "+91 98765 88888",
        email: "amit@example.com",
      };

      vi.spyOn(db.lead, "findUnique").mockResolvedValue(lead as any);
      // Member already exists with this phone!
      vi.spyOn(db.member, "findFirst").mockResolvedValue(existingMember as any);

      vi.spyOn(db, "$transaction").mockImplementation(async (callback: any) => {
        const tx = {
          lead: {
            update: vi.fn().mockResolvedValue({
              ...lead,
              stage: LeadStage.CONVERTED,
              convertedMemberId: existingMember.id,
            }),
          },
          leadActivity: {
            create: vi.fn().mockResolvedValue({ id: "act-dup" }),
          },
          member: {
            create: vi.fn(), // MUST NOT BE CALLED
          },
        };
        return callback(tx);
      });

      const res = await convertLeadToMember(staffAContext, {
        leadId: "lead-008",
        createMembership: false,
      });

      expect(res.isExistingMember).toBe(true);
      expect(res.member.id).toBe(existingMember.id);
      expect(res.member.memberCode).toBe("MEM-0005");
      expect(res.membershipCreated).toBe(false);
    });

    it("rejects conversion if lead has already been converted", async () => {
      const alreadyConvertedLead = {
        id: "lead-009",
        gymId: gymAId,
        stage: LeadStage.CONVERTED,
        convertedMemberId: "mem-already-exists",
      };

      vi.spyOn(db.lead, "findUnique").mockResolvedValue(alreadyConvertedLead as any);

      await expect(
        convertLeadToMember(staffAContext, {
          leadId: "lead-009",
        })
      ).rejects.toThrow(LeadAlreadyConvertedError);
    });
  });

  // ============================================================================
  // 7. METRICS & CONVERSION RATE CALCULATION
  // ============================================================================
  describe("CRM Metrics & Conversion Rate", () => {
    it("accurately calculates conversion rate and categorizes follow-ups", async () => {
      vi.spyOn(db.lead, "count")
        .mockResolvedValueOnce(50) // totalLeads
        .mockResolvedValueOnce(15) // convertedCount (15 / 50 = 30%)
        .mockResolvedValueOnce(4) // overdueFollowUps
        .mockResolvedValueOnce(6) // todayFollowUps
        .mockResolvedValueOnce(12); // upcomingFollowUps

      vi.spyOn(db.lead, "groupBy")
        .mockResolvedValueOnce([
          { stage: LeadStage.NEW, _count: { id: 10 } },
          { stage: LeadStage.CONTACTED, _count: { id: 8 } },
          { stage: LeadStage.INTERESTED, _count: { id: 7 } },
          { stage: LeadStage.TRIAL_SCHEDULED, _count: { id: 5 } },
          { stage: LeadStage.CONVERTED, _count: { id: 15 } },
          { stage: LeadStage.LOST, _count: { id: 5 } },
        ] as any)
        .mockResolvedValueOnce([
          { source: LeadSource.WALK_IN, _count: { id: 25 } },
          { source: LeadSource.WEBSITE, _count: { id: 15 } },
          { source: LeadSource.REFERRAL, _count: { id: 10 } },
        ] as any);

      const metrics = await getLeadMetrics(staffAContext);

      expect(metrics.totalLeads).toBe(50);
      expect(metrics.conversionRate).toBe(30); // 30%
      expect(metrics.activePipelineLeads).toBe(30); // 10 + 8 + 7 + 5
      expect(metrics.followUps.overdue).toBe(4);
      expect(metrics.followUps.today).toBe(6);
      expect(metrics.followUps.upcoming).toBe(12);
    });
  });

  // ============================================================================
  // 8. STRICT MULTI-TENANT ISOLATION
  // ============================================================================
  describe("Multi-Tenant Isolation", () => {
    it("ensures Gym B staff cannot view or list Gym A leads", async () => {
      const findManySpy = vi.spyOn(db.lead, "findMany").mockResolvedValue([]);
      vi.spyOn(db.lead, "count").mockResolvedValue(0);

      await getLeadsList(ownerBContext);

      expect(findManySpy).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            gymId: gymBId, // MUST be scoped to gym B
          }),
        })
      );
    });

    it("prevents changing status of a lead belonging to another gym", async () => {
      vi.spyOn(db.lead, "findUnique").mockResolvedValue({
        id: "lead-gym-a",
        gymId: gymAId, // belongs to Gym A
      } as any);

      await expect(
        changeLeadStatus(ownerBContext, {
          leadId: "lead-gym-a",
          stage: LeadStage.CONTACTED,
        })
      ).rejects.toThrow(TenantAccessViolationError);
    });
  });
});

import { describe, it, expect } from "vitest";
import {
  TenantAccessViolationError,
  assertTenantOwnership,
  withTenantFilter,
  createTenantContext,
} from "@/lib/tenant/context";
import { GymRole, SystemRole } from "@prisma/client";

describe("Multi-Tenant Security: TenantContext & Authorization", () => {
  const gymAContext = createTenantContext({
    gymId: "gym-aaa-111",
    userId: "user-aaa-owner",
    role: GymRole.OWNER,
    userEmail: "owner@gym-a.com",
  });

  const gymBContext = createTenantContext({
    gymId: "gym-bbb-222",
    userId: "user-bbb-staff",
    role: GymRole.STAFF,
    userEmail: "staff@gym-b.com",
  });

  it("permits access when entity belongs to the authorized tenant", () => {
    expect(() => {
      assertTenantOwnership(gymAContext, "gym-aaa-111");
    }).not.toThrow();
  });

  it("blocks and raises TenantAccessViolationError when entity belongs to a different tenant", () => {
    expect(() => {
      assertTenantOwnership(gymAContext, "gym-bbb-222");
    }).toThrow(TenantAccessViolationError);

    try {
      assertTenantOwnership(gymAContext, "gym-bbb-222");
    } catch (err) {
      const error = err as TenantAccessViolationError;
      expect(error.authorizedGymId).toBe("gym-aaa-111");
      expect(error.attemptedGymId).toBe("gym-bbb-222");
      expect(error.message).toContain("SECURITY ALERT: Cross-tenant access violation");
    }
  });

  it("blocks access when target entity has null or empty gymId", () => {
    expect(() => {
      assertTenantOwnership(gymAContext, null);
    }).toThrow(TenantAccessViolationError);

    expect(() => {
      assertTenantOwnership(gymAContext, undefined);
    }).toThrow(TenantAccessViolationError);
  });

  it("safely injects tenant filter and prevents browser-supplied tenant spoofing", () => {
    // Untrusted query payload from client attempting to supply a different gymId
    const untrustedClientQuery = {
      status: "ACTIVE",
      gymId: "gym-hacked-999", // Attempted spoof
    };

    const safeQuery = withTenantFilter(gymBContext, untrustedClientQuery);

    // Filter must strictly enforce the authenticated session's gymId
    expect(safeQuery.gymId).toBe("gym-bbb-222");
    expect(safeQuery.status).toBe("ACTIVE");
    expect(safeQuery.gymId).not.toBe("gym-hacked-999");
  });

  it("supports typed system role contexts", () => {
    const adminContext = createTenantContext({
      gymId: "system-platform",
      userId: "user-superadmin",
      role: SystemRole.SUPER_ADMIN,
    });
    expect(adminContext.role).toBe(SystemRole.SUPER_ADMIN);
  });
});

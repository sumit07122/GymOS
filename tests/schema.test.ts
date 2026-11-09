import { describe, it, expect } from "vitest";
import { db } from "@/lib/db";
import {
  SystemRole,
  GymRole,
  GymStatus,
  MemberStatus,
  MembershipStatus,
  InvoiceStatus,
  PaymentMethod,
  PaymentStatus,
  AdjustmentType,
  AttendanceStatus,
  CheckInMethod,
  LeadSource,
  LeadStage,
  ClassStatus,
  BookingStatus,
  StockMovementType,
} from "@prisma/client";

describe("Database Architecture: Prisma Client & Enum Verifications", () => {
  it("initializes Prisma client singleton with driver adapter", () => {
    expect(db).toBeDefined();
    expect(db.gym).toBeDefined();
    expect(db.member).toBeDefined();
    expect(db.membership).toBeDefined();
    expect(db.invoice).toBeDefined();
    expect(db.payment).toBeDefined();
    expect(db.paymentAllocation).toBeDefined();
    expect(db.attendanceRecord).toBeDefined();
    expect(db.attendanceQrNonce).toBeDefined();
    expect(db.lead).toBeDefined();
    expect(db.expense).toBeDefined();
    expect(db.class).toBeDefined();
    expect(db.inventoryItem).toBeDefined();
  });

  it("exports all required core and auth enums", () => {
    expect(SystemRole.SUPER_ADMIN).toBe("SUPER_ADMIN");
    expect(SystemRole.GYM_OWNER).toBe("GYM_OWNER");
    expect(SystemRole.GYM_STAFF).toBe("GYM_STAFF");
    expect(SystemRole.MEMBER).toBe("MEMBER");

    expect(GymRole.OWNER).toBe("OWNER");
    expect(GymRole.STAFF).toBe("STAFF");
    expect(GymStatus.ACTIVE).toBe("ACTIVE");
    expect(MemberStatus.ACTIVE).toBe("ACTIVE");
    expect(MembershipStatus.ACTIVE).toBe("ACTIVE");
  });

  it("exports all financial, attendance, and operational enums", () => {
    // Financial separation
    expect(InvoiceStatus.PAID).toBe("PAID");
    expect(PaymentMethod.CASH).toBe("CASH");
    expect(PaymentMethod.ONLINE_GATEWAY).toBe("ONLINE_GATEWAY");
    expect(PaymentStatus.COMPLETED).toBe("COMPLETED");
    expect(AdjustmentType.REFUND).toBe("REFUND");

    // Attendance
    expect(AttendanceStatus.VERIFIED).toBe("VERIFIED");
    expect(AttendanceStatus.MANUAL_OVERRIDE).toBe("MANUAL_OVERRIDE");
    expect(CheckInMethod.QR_SCAN).toBe("QR_SCAN");

    // CRM & Operations
    expect(LeadSource.WALK_IN).toBe("WALK_IN");
    expect(LeadStage.CONVERTED).toBe("CONVERTED");
    expect(ClassStatus.SCHEDULED).toBe("SCHEDULED");
    expect(BookingStatus.CONFIRMED).toBe("CONFIRMED");
    expect(StockMovementType.SALE).toBe("SALE");
  });
});

import { GymRole, SystemRole } from "@prisma/client";

// ==============================================================================
// FIXIA GymOS — Role-Based Permission Matrix (RBAC)
// ==============================================================================

export type Permission =
  | "MEMBER_READ"
  | "MEMBER_CREATE"
  | "MEMBER_UPDATE"
  | "MEMBER_DELETE"
  | "MEMBERSHIP_READ"
  | "MEMBERSHIP_WRITE"
  | "PLAN_READ"
  | "PLAN_WRITE"
  | "INVOICE_READ"
  | "INVOICE_CREATE"
  | "INVOICE_VOID"
  | "PAYMENT_READ"
  | "PAYMENT_RECORD"
  | "REFUND_PROCESS"
  | "ATTENDANCE_SCAN"
  | "ATTENDANCE_OVERRIDE"
  | "ATTENDANCE_READ"
  | "EXPENSE_READ"
  | "EXPENSE_WRITE"
  | "CLASS_SCHEDULE"
  | "CLASS_BOOK"
  | "INVENTORY_READ"
  | "INVENTORY_MANAGE"
  | "LEAD_READ"
  | "LEAD_CREATE"
  | "LEAD_UPDATE"
  | "LEAD_CONVERT"
  | "LEAD_DELETE"
  | "WORKOUT_READ"
  | "WORKOUT_WRITE"
  | "STAFF_MANAGE"
  | "SETTINGS_MANAGE"
  | "SUPER_ADMIN_MANAGE";

const OWNER_PERMISSIONS: Permission[] = [
  "MEMBER_READ",
  "MEMBER_CREATE",
  "MEMBER_UPDATE",
  "MEMBER_DELETE",
  "MEMBERSHIP_READ",
  "MEMBERSHIP_WRITE",
  "PLAN_READ",
  "PLAN_WRITE",
  "INVOICE_READ",
  "INVOICE_CREATE",
  "INVOICE_VOID",
  "PAYMENT_READ",
  "PAYMENT_RECORD",
  "REFUND_PROCESS",
  "ATTENDANCE_SCAN",
  "ATTENDANCE_OVERRIDE",
  "ATTENDANCE_READ",
  "EXPENSE_READ",
  "EXPENSE_WRITE",
  "CLASS_SCHEDULE",
  "CLASS_BOOK",
  "INVENTORY_READ",
  "INVENTORY_MANAGE",
  "LEAD_READ",
  "LEAD_CREATE",
  "LEAD_UPDATE",
  "LEAD_CONVERT",
  "LEAD_DELETE",
  "WORKOUT_READ",
  "WORKOUT_WRITE",
  "STAFF_MANAGE",
  "SETTINGS_MANAGE",
];

const STAFF_PERMISSIONS: Permission[] = [
  "MEMBER_READ",
  "MEMBER_CREATE",
  "MEMBER_UPDATE",
  "MEMBERSHIP_READ",
  "MEMBERSHIP_WRITE",
  "PLAN_READ",
  "INVOICE_READ",
  "INVOICE_CREATE",
  "PAYMENT_READ",
  "PAYMENT_RECORD",
  "ATTENDANCE_SCAN",
  "ATTENDANCE_OVERRIDE",
  "ATTENDANCE_READ",
  "EXPENSE_READ",
  "EXPENSE_WRITE",
  "CLASS_SCHEDULE",
  "CLASS_BOOK",
  "INVENTORY_READ",
  "INVENTORY_MANAGE",
  "LEAD_READ",
  "LEAD_CREATE",
  "LEAD_UPDATE",
  "LEAD_CONVERT",
  "WORKOUT_READ",
  "WORKOUT_WRITE",
];

const TRAINER_PERMISSIONS: Permission[] = [
  "MEMBER_READ",
  "ATTENDANCE_READ",
  "CLASS_SCHEDULE",
  "CLASS_BOOK",
  "WORKOUT_READ",
  "WORKOUT_WRITE",
];

const MEMBER_PERMISSIONS: Permission[] = [
  "MEMBER_READ",
  "MEMBERSHIP_READ",
  "ATTENDANCE_READ",
  "INVOICE_READ",
  "CLASS_BOOK",
  "WORKOUT_READ",
];

export function getRolePermissions(role: GymRole | SystemRole): Set<Permission> {
  if (role === SystemRole.SUPER_ADMIN) {
    return new Set<Permission>([...OWNER_PERMISSIONS, "SUPER_ADMIN_MANAGE"]);
  }

  switch (role) {
    case GymRole.OWNER:
    case SystemRole.GYM_OWNER:
      return new Set<Permission>(OWNER_PERMISSIONS);
    case GymRole.STAFF:
    case SystemRole.GYM_STAFF:
      return new Set<Permission>(STAFF_PERMISSIONS);
    case GymRole.TRAINER:
      return new Set<Permission>(TRAINER_PERMISSIONS);
    case GymRole.MEMBER:
    case SystemRole.MEMBER:
      return new Set<Permission>(MEMBER_PERMISSIONS);
    default:
      return new Set<Permission>();
  }
}

export class InsufficientPermissionError extends Error {
  public readonly requiredPermission: Permission;
  public readonly currentRole: GymRole | SystemRole;

  constructor(permission: Permission, role: GymRole | SystemRole) {
    super(
      `SECURITY ALERT: Forbidden. Role "${role}" lacks required permission "${permission}".`
    );
    this.name = "InsufficientPermissionError";
    this.requiredPermission = permission;
    this.currentRole = role;
  }
}


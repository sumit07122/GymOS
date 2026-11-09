// ==============================================================================
// FIXIA GymOS — Centralized Security & Sensitive Action Audit Logger
// ==============================================================================
// Captures security events, cross-tenant violation attempts, and sensitive mutations.
// ==============================================================================

export type AuditSeverity = "INFO" | "WARNING" | "SECURITY_ALERT" | "CRITICAL";

export interface SecurityEventData {
  action: string;
  gymId?: string;
  userId?: string;
  targetResourceId?: string;
  details?: Record<string, unknown> | string;
  ipAddress?: string;
  severity?: AuditSeverity;
}

export const auditLogger = {
  /**
   * Logs a security or sensitive operational action.
   */
  logSecurityEvent(event: SecurityEventData): void {
    const timestamp = new Date().toISOString();
    const severity = event.severity || "INFO";

    const logPayload = {
      timestamp,
      severity,
      action: event.action,
      gymId: event.gymId || "SYSTEM",
      userId: event.userId || "ANONYMOUS",
      targetResourceId: event.targetResourceId,
      details: event.details,
      ipAddress: event.ipAddress || "UNKNOWN",
    };

    if (severity === "SECURITY_ALERT" || severity === "CRITICAL") {
      console.warn("\n🚨 [FIXIA SECURITY AUDIT ALERT]:", JSON.stringify(logPayload, null, 2));
    } else {
      console.log(`[FIXIA AUDIT ${severity}]: ${event.action} | Gym: ${event.gymId} | User: ${event.userId}`);
    }
  },
};


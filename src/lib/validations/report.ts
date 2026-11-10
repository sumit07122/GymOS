import { z } from "zod";

// ==============================================================================
// FIXIA GymOS — Reports & Business Analytics Validation Schemas (M18)
// ==============================================================================

export const ReportPresetEnum = z.enum([
  "TODAY",
  "LAST_7_DAYS",
  "LAST_30_DAYS",
  "CURRENT_MONTH",
  "PREVIOUS_MONTH",
  "CUSTOM",
]);

export type ReportPreset = z.infer<typeof ReportPresetEnum>;

export const reportFilterSchema = z.object({
  preset: ReportPresetEnum.default("LAST_30_DAYS"),
  startDate: z.string().optional().nullable(),
  endDate: z.string().optional().nullable(),
  section: z
    .enum(["ALL", "MEMBERSHIP", "ATTENDANCE", "FINANCIAL", "CRM", "OPERATIONS"])
    .default("ALL"),
});

export type ReportFilterInput = z.infer<typeof reportFilterSchema>;

export interface ResolvedDateRange {
  start: Date;
  end: Date;
  label: string;
}

/**
 * Resolves a date preset into start and end Date boundaries.
 */
export function resolveDateRange(
  preset: ReportPreset,
  customStart?: string | null,
  customEnd?: string | null,
  referenceNow = new Date()
): ResolvedDateRange {
  const now = new Date(referenceNow);

  switch (preset) {
    case "TODAY": {
      const start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
      const end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
      return { start, end, label: "Today" };
    }

    case "LAST_7_DAYS": {
      const end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
      const start = new Date(end);
      start.setDate(end.getDate() - 6);
      start.setHours(0, 0, 0, 0);
      return { start, end, label: "Last 7 Days" };
    }

    case "LAST_30_DAYS": {
      const end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
      const start = new Date(end);
      start.setDate(end.getDate() - 29);
      start.setHours(0, 0, 0, 0);
      return { start, end, label: "Last 30 Days" };
    }

    case "CURRENT_MONTH": {
      const start = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
      const end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
      const monthName = start.toLocaleString("default", { month: "long" });
      return { start, end, label: `${monthName} ${start.getFullYear()}` };
    }

    case "PREVIOUS_MONTH": {
      const start = new Date(now.getFullYear(), now.getMonth() - 1, 1, 0, 0, 0, 0);
      const end = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
      const monthName = start.toLocaleString("default", { month: "long" });
      return { start, end, label: `${monthName} ${start.getFullYear()}` };
    }

    case "CUSTOM": {
      if (customStart && customEnd) {
        const start = new Date(customStart);
        start.setHours(0, 0, 0, 0);
        const end = new Date(customEnd);
        end.setHours(23, 59, 59, 999);
        return {
          start,
          end,
          label: `${start.toLocaleDateString()} - ${end.toLocaleDateString()}`,
        };
      }
      // Fallback to last 30 days
      const end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
      const start = new Date(end);
      start.setDate(end.getDate() - 29);
      start.setHours(0, 0, 0, 0);
      return { start, end, label: "Custom Range" };
    }

    default: {
      const end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
      const start = new Date(end);
      start.setDate(end.getDate() - 29);
      start.setHours(0, 0, 0, 0);
      return { start, end, label: "Last 30 Days" };
    }
  }
}


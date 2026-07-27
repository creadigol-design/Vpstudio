import { z } from "zod";

/**
 * QC output shape (spec §25.3). Every check reports measurable evidence —
 * no fabricated confidence scores (spec §3.7).
 */
export const QcSeveritySchema = z.enum(["INFO", "WARNING", "ERROR"]);
export type QcSeverity = z.infer<typeof QcSeveritySchema>;

export const QcStatusSchema = z.enum(["PASS", "FAIL", "SKIPPED"]);
export type QcStatus = z.infer<typeof QcStatusSchema>;

export const QcCheckResultSchema = z.object({
  check: z.string().min(1),
  status: QcStatusSchema,
  measured: z.string().nullable(),
  expected: z.string().nullable(),
  severity: QcSeveritySchema,
  evidence: z.string().optional(),
  suggestedAction: z.string().optional(),
});
export type QcCheckResult = z.infer<typeof QcCheckResultSchema>;

export const QcReportSchema = z.object({
  projectVersionId: z.string().min(1),
  completedAt: z.string().datetime(),
  checks: z.array(QcCheckResultSchema),
});
export type QcReport = z.infer<typeof QcReportSchema>;

export function qcHasBlockingFailures(report: QcReport): boolean {
  return report.checks.some((c) => c.status === "FAIL" && c.severity === "ERROR");
}

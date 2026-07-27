import { z } from "zod";

/**
 * Project lifecycle states (spec §11.1). Transitions are validated by the
 * backend via `canTransition`; the front end must never assume a transition
 * is legal.
 */
export const PROJECT_STATUSES = [
  "DRAFT",
  "READY_FOR_RECORDING",
  "RECORDING",
  "UPLOADING",
  "PROCESSING",
  "DRAFT_READY",
  "CHANGES_REQUESTED",
  "AWAITING_APPROVAL",
  "APPROVED",
  "EXPORTING",
  "COMPLETED",
  "ARCHIVED",
  "FAILED",
] as const;

export const ProjectStatusSchema = z.enum(PROJECT_STATUSES);
export type ProjectStatus = z.infer<typeof ProjectStatusSchema>;

/**
 * Allowed transitions. FAILED is reachable from any active processing state;
 * ARCHIVED is reachable from any terminal-ish state. A failed project can be
 * retried back into PROCESSING or returned to recording.
 */
const TRANSITIONS: Record<ProjectStatus, readonly ProjectStatus[]> = {
  DRAFT: ["READY_FOR_RECORDING", "ARCHIVED"],
  READY_FOR_RECORDING: ["RECORDING", "DRAFT", "ARCHIVED"],
  RECORDING: ["UPLOADING", "READY_FOR_RECORDING", "FAILED"],
  UPLOADING: ["PROCESSING", "RECORDING", "FAILED"],
  PROCESSING: ["DRAFT_READY", "FAILED"],
  DRAFT_READY: ["CHANGES_REQUESTED", "AWAITING_APPROVAL", "ARCHIVED"],
  CHANGES_REQUESTED: ["READY_FOR_RECORDING", "PROCESSING", "DRAFT_READY", "ARCHIVED"],
  AWAITING_APPROVAL: ["APPROVED", "CHANGES_REQUESTED", "DRAFT_READY"],
  APPROVED: ["EXPORTING", "CHANGES_REQUESTED", "ARCHIVED"],
  EXPORTING: ["COMPLETED", "APPROVED", "FAILED"],
  COMPLETED: ["ARCHIVED", "EXPORTING"],
  ARCHIVED: [],
  FAILED: ["PROCESSING", "READY_FOR_RECORDING", "ARCHIVED"],
};

export function allowedTransitions(from: ProjectStatus): readonly ProjectStatus[] {
  return TRANSITIONS[from];
}

export function canTransition(from: ProjectStatus, to: ProjectStatus): boolean {
  return TRANSITIONS[from].includes(to);
}

export class InvalidStatusTransitionError extends Error {
  constructor(
    public readonly from: ProjectStatus,
    public readonly to: ProjectStatus,
  ) {
    super(`Invalid project status transition: ${from} -> ${to}`);
    this.name = "InvalidStatusTransitionError";
  }
}

export function assertTransition(from: ProjectStatus, to: ProjectStatus): void {
  if (!canTransition(from, to)) {
    throw new InvalidStatusTransitionError(from, to);
  }
}

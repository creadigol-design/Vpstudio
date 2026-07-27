import { z } from "zod";

/** Upload session states (spec §16.3). */
export const UPLOAD_STATES = [
  "PENDING",
  "UPLOADING",
  "PAUSED",
  "RETRYING",
  "VERIFYING",
  "COMPLETE",
  "FAILED",
  "CANCELLED",
] as const;

export const UploadStateSchema = z.enum(UPLOAD_STATES);
export type UploadState = z.infer<typeof UploadStateSchema>;

const UPLOAD_TRANSITIONS: Record<UploadState, readonly UploadState[]> = {
  PENDING: ["UPLOADING", "CANCELLED"],
  UPLOADING: ["PAUSED", "RETRYING", "VERIFYING", "FAILED", "CANCELLED"],
  PAUSED: ["UPLOADING", "CANCELLED"],
  RETRYING: ["UPLOADING", "FAILED", "CANCELLED"],
  VERIFYING: ["COMPLETE", "FAILED"],
  COMPLETE: [],
  FAILED: ["RETRYING", "CANCELLED"],
  CANCELLED: [],
};

export function canTransitionUpload(from: UploadState, to: UploadState): boolean {
  return UPLOAD_TRANSITIONS[from].includes(to);
}

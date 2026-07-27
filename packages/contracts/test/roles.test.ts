import { describe, expect, it } from "vitest";
import { roleHasPermission } from "../src/roles";
import { qcHasBlockingFailures, type QcReport } from "../src/qc";
import { canTransitionUpload } from "../src/upload-state";

describe("roleHasPermission", () => {
  it("lets creators create but not approve", () => {
    expect(roleHasPermission("CREATOR", "project:create")).toBe(true);
    expect(roleHasPermission("CREATOR", "project:approve")).toBe(false);
  });

  it("limits presenters to recording", () => {
    expect(roleHasPermission("PRESENTER", "project:record")).toBe(true);
    expect(roleHasPermission("PRESENTER", "project:read")).toBe(false);
  });

  it("gives reviewers approval but not creation", () => {
    expect(roleHasPermission("REVIEWER", "project:approve")).toBe(true);
    expect(roleHasPermission("REVIEWER", "project:create")).toBe(false);
  });

  it("grants platform admins everything", () => {
    expect(roleHasPermission("PLATFORM_ADMIN", "platform:admin")).toBe(true);
    expect(roleHasPermission("ORG_ADMIN", "platform:admin")).toBe(false);
  });
});

describe("upload state machine", () => {
  it("follows the normal upload path", () => {
    expect(canTransitionUpload("PENDING", "UPLOADING")).toBe(true);
    expect(canTransitionUpload("UPLOADING", "VERIFYING")).toBe(true);
    expect(canTransitionUpload("VERIFYING", "COMPLETE")).toBe(true);
  });

  it("allows retry from FAILED but not from COMPLETE", () => {
    expect(canTransitionUpload("FAILED", "RETRYING")).toBe(true);
    expect(canTransitionUpload("COMPLETE", "UPLOADING")).toBe(false);
  });
});

describe("qcHasBlockingFailures", () => {
  const report = (status: "PASS" | "FAIL", severity: "INFO" | "WARNING" | "ERROR"): QcReport => ({
    projectVersionId: "version_102",
    completedAt: new Date(0).toISOString(),
    checks: [{ check: "audio_loudness", status, measured: "-15.9 LUFS", expected: "-16 ± 1 LU", severity }],
  });

  it("blocks only on ERROR failures", () => {
    expect(qcHasBlockingFailures(report("FAIL", "ERROR"))).toBe(true);
    expect(qcHasBlockingFailures(report("FAIL", "WARNING"))).toBe(false);
    expect(qcHasBlockingFailures(report("PASS", "ERROR"))).toBe(false);
  });
});

import { describe, expect, it } from "vitest";
import {
  PROJECT_STATUSES,
  allowedTransitions,
  assertTransition,
  canTransition,
  InvalidStatusTransitionError,
} from "../src/project-status";

describe("project status machine", () => {
  it("follows the happy path from DRAFT to COMPLETED", () => {
    const path = [
      "DRAFT",
      "READY_FOR_RECORDING",
      "RECORDING",
      "UPLOADING",
      "PROCESSING",
      "DRAFT_READY",
      "AWAITING_APPROVAL",
      "APPROVED",
      "EXPORTING",
      "COMPLETED",
    ] as const;
    for (let i = 0; i < path.length - 1; i++) {
      expect(canTransition(path[i]!, path[i + 1]!)).toBe(true);
    }
  });

  it("rejects skipping recording", () => {
    expect(canTransition("DRAFT", "PROCESSING")).toBe(false);
    expect(canTransition("DRAFT", "APPROVED")).toBe(false);
  });

  it("supports the changes-requested loop", () => {
    expect(canTransition("DRAFT_READY", "CHANGES_REQUESTED")).toBe(true);
    expect(canTransition("CHANGES_REQUESTED", "READY_FOR_RECORDING")).toBe(true);
    expect(canTransition("CHANGES_REQUESTED", "PROCESSING")).toBe(true);
    expect(canTransition("AWAITING_APPROVAL", "CHANGES_REQUESTED")).toBe(true);
  });

  it("allows retry from FAILED", () => {
    expect(canTransition("FAILED", "PROCESSING")).toBe(true);
    expect(canTransition("FAILED", "READY_FOR_RECORDING")).toBe(true);
  });

  it("treats ARCHIVED as terminal", () => {
    expect(allowedTransitions("ARCHIVED")).toHaveLength(0);
  });

  it("every status has a transition entry", () => {
    for (const status of PROJECT_STATUSES) {
      expect(Array.isArray(allowedTransitions(status))).toBe(true);
    }
  });

  it("assertTransition throws a typed error", () => {
    expect(() => assertTransition("DRAFT", "COMPLETED")).toThrowError(InvalidStatusTransitionError);
    expect(() => assertTransition("DRAFT", "READY_FOR_RECORDING")).not.toThrow();
  });
});

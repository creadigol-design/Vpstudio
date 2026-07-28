import { describe, expect, it, vi, beforeEach } from "vitest";
import { ConflictException, ForbiddenException } from "@nestjs/common";
import { ReviewsService } from "../src/reviews/reviews.service";
import type { TenantContext } from "../src/tenancy/tenant.guard";

const creator: TenantContext = { organisationId: "org_1", userId: "user_creator", role: "CREATOR" };
const reviewer: TenantContext = { organisationId: "org_1", userId: "user_reviewer", role: "REVIEWER" };
const reviewer2: TenantContext = { organisationId: "org_1", userId: "user_reviewer2", role: "REVIEWER" };

function mockPrisma() {
  return {
    project: { findFirst: vi.fn(), update: vi.fn().mockResolvedValue({}) },
    projectVersion: { findFirst: vi.fn() },
    membership: { findMany: vi.fn() },
    approvalRequest: { findFirst: vi.fn(), create: vi.fn(), update: vi.fn().mockResolvedValue({}) },
    approvalDecision: { create: vi.fn().mockResolvedValue({ id: "dec_1" }) },
    comment: { create: vi.fn(), findFirst: vi.fn(), findMany: vi.fn(), update: vi.fn() },
    mediaAsset: { findMany: vi.fn() },
    auditEvent: { create: vi.fn().mockResolvedValue({}) },
  };
}

function requestFixture(overrides: Partial<Record<string, unknown>> = {}) {
  return {
    id: "req_1",
    status: "PENDING",
    rule: "ONE_NAMED",
    requiredUserIds: ["user_reviewer"],
    decisions: [],
    projectVersion: { project: { id: "proj_1", status: "AWAITING_APPROVAL" } },
    ...overrides,
  };
}

describe("ReviewsService.createApprovalRequest", () => {
  it("rejects approvers who are not organisation members", async () => {
    const prisma = mockPrisma();
    const service = new ReviewsService(prisma as never);
    prisma.projectVersion.findFirst.mockResolvedValue({
      id: "v1",
      projectId: "proj_1",
      project: { id: "proj_1", status: "DRAFT_READY" },
    });
    prisma.membership.findMany.mockResolvedValue([]);
    await expect(
      service.createApprovalRequest(creator, "v1", { rule: "ONE_NAMED", requiredUserIds: ["stranger"] }),
    ).rejects.toThrow("Bad Request Exception");
  });

  it("moves the project to AWAITING_APPROVAL", async () => {
    const prisma = mockPrisma();
    const service = new ReviewsService(prisma as never);
    prisma.projectVersion.findFirst.mockResolvedValue({
      id: "v1",
      projectId: "proj_1",
      project: { id: "proj_1", status: "DRAFT_READY" },
    });
    prisma.membership.findMany.mockResolvedValue([{ userId: "user_reviewer" }]);
    prisma.approvalRequest.create.mockResolvedValue({ id: "req_1" });

    await service.createApprovalRequest(creator, "v1", { rule: "ONE_NAMED", requiredUserIds: ["user_reviewer"] });

    expect(prisma.project.update).toHaveBeenCalledWith({
      where: { id: "proj_1" },
      data: { status: "AWAITING_APPROVAL" },
    });
  });

  it("refuses when the project cannot transition (still PROCESSING)", async () => {
    const prisma = mockPrisma();
    const service = new ReviewsService(prisma as never);
    prisma.projectVersion.findFirst.mockResolvedValue({
      id: "v1",
      projectId: "proj_1",
      project: { id: "proj_1", status: "PROCESSING" },
    });
    prisma.membership.findMany.mockResolvedValue([{ userId: "user_reviewer" }]);
    await expect(
      service.createApprovalRequest(creator, "v1", { rule: "ONE_NAMED", requiredUserIds: ["user_reviewer"] }),
    ).rejects.toThrow(ConflictException);
  });
});

describe("ReviewsService.decide", () => {
  let prisma: ReturnType<typeof mockPrisma>;
  let service: ReviewsService;

  beforeEach(() => {
    prisma = mockPrisma();
    service = new ReviewsService(prisma as never);
  });

  it("ONE_NAMED: a single approval approves request and project", async () => {
    prisma.approvalRequest.findFirst.mockResolvedValue(requestFixture());
    const result = await service.decide(reviewer, "req_1", { decision: "APPROVE" });
    expect(result.requestStatus).toBe("APPROVED");
    expect(result.projectStatus).toBe("APPROVED");
    expect(prisma.project.update).toHaveBeenCalledWith({ where: { id: "proj_1" }, data: { status: "APPROVED" } });
  });

  it("ALL_REQUIRED: stays pending until every approver has approved", async () => {
    prisma.approvalRequest.findFirst.mockResolvedValue(
      requestFixture({ rule: "ALL_REQUIRED", requiredUserIds: ["user_reviewer", "user_reviewer2"] }),
    );
    const first = await service.decide(reviewer, "req_1", { decision: "APPROVE" });
    expect(first.requestStatus).toBe("PENDING");
    expect(prisma.project.update).not.toHaveBeenCalled();

    prisma.approvalRequest.findFirst.mockResolvedValue(
      requestFixture({
        rule: "ALL_REQUIRED",
        requiredUserIds: ["user_reviewer", "user_reviewer2"],
        decisions: [{ userId: "user_reviewer", decision: "APPROVE" }],
      }),
    );
    const second = await service.decide(reviewer2, "req_1", { decision: "APPROVE" });
    expect(second.requestStatus).toBe("APPROVED");
    expect(second.projectStatus).toBe("APPROVED");
  });

  it("REJECT returns the project to DRAFT_READY", async () => {
    prisma.approvalRequest.findFirst.mockResolvedValue(requestFixture());
    const result = await service.decide(reviewer, "req_1", { decision: "REJECT" });
    expect(result.requestStatus).toBe("REJECTED");
    expect(result.projectStatus).toBe("DRAFT_READY");
  });

  it("REQUEST_CHANGES moves the project to CHANGES_REQUESTED", async () => {
    prisma.approvalRequest.findFirst.mockResolvedValue(requestFixture());
    const result = await service.decide(reviewer, "req_1", { decision: "REQUEST_CHANGES" });
    expect(result.projectStatus).toBe("CHANGES_REQUESTED");
  });

  it("rejects users who are not required approvers", async () => {
    prisma.approvalRequest.findFirst.mockResolvedValue(requestFixture());
    await expect(service.decide(creator, "req_1", { decision: "APPROVE" })).rejects.toThrow(ForbiddenException);
  });

  it("rejects a second decision from the same user", async () => {
    prisma.approvalRequest.findFirst.mockResolvedValue(
      requestFixture({ decisions: [{ userId: "user_reviewer", decision: "APPROVE" }] }),
    );
    await expect(service.decide(reviewer, "req_1", { decision: "APPROVE" })).rejects.toThrow(ConflictException);
  });

  it("rejects decisions on a closed request", async () => {
    prisma.approvalRequest.findFirst.mockResolvedValue(requestFixture({ status: "APPROVED" }));
    await expect(service.decide(reviewer, "req_1", { decision: "APPROVE" })).rejects.toThrow(ConflictException);
  });
});

describe("ReviewsService.listOutputs", () => {
  it("blocks downloads before approval", async () => {
    const prisma = mockPrisma();
    const service = new ReviewsService(prisma as never);
    prisma.projectVersion.findFirst.mockResolvedValue({ id: "v1", project: { status: "DRAFT_READY" } });
    await expect(service.listOutputs(creator, "v1")).rejects.toThrow(ForbiddenException);
    expect(prisma.mediaAsset.findMany).not.toHaveBeenCalled();
  });
});

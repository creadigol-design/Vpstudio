import { describe, expect, it, vi, beforeEach } from "vitest";
import { BadRequestException, ConflictException, NotFoundException } from "@nestjs/common";
import { ProjectsService } from "../src/projects/projects.service";
import type { TenantContext } from "../src/tenancy/tenant.guard";

const tenant: TenantContext = { organisationId: "org_1", userId: "user_1", role: "CREATOR" };

function mockPrisma() {
  return {
    project: {
      findFirst: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
    workspace: { findFirst: vi.fn() },
    templateVersion: { findUnique: vi.fn() },
    script: { upsert: vi.fn() },
    scriptVersion: { findFirst: vi.fn(), create: vi.fn() },
    auditEvent: { create: vi.fn().mockResolvedValue({}) },
  };
}

describe("ProjectsService.create", () => {
  let prisma: ReturnType<typeof mockPrisma>;
  let service: ProjectsService;

  beforeEach(() => {
    prisma = mockPrisma();
    service = new ProjectsService(prisma as never);
  });

  const dto = {
    workspaceId: "ws_1",
    templateVersionId: "tv_1",
    name: "Weekly update",
    languageMode: "EN_ONLY" as const,
    outputPresets: ["LANDSCAPE_1080" as const],
  };

  it("rejects a workspace outside the tenant", async () => {
    prisma.workspace.findFirst.mockResolvedValue(null);
    await expect(service.create(tenant, dto)).rejects.toThrow(NotFoundException);
    expect(prisma.workspace.findFirst).toHaveBeenCalledWith({
      where: { id: "ws_1", organisationId: "org_1" },
    });
  });

  it("seeds the running order from the template definition", async () => {
    prisma.workspace.findFirst.mockResolvedValue({ id: "ws_1" });
    prisma.templateVersion.findUnique.mockResolvedValue({
      id: "tv_1",
      definition: {
        items: [
          { type: "opening", position: 1, required: true },
          { type: "presenter", position: 2 },
          { type: "closing", position: 3 },
        ],
      },
    });
    prisma.project.create.mockResolvedValue({ id: "proj_1", runningOrderItems: [] });

    await service.create(tenant, dto);

    const createArg = prisma.project.create.mock.calls[0]![0];
    expect(createArg.data.runningOrderItems.create).toHaveLength(3);
    expect(createArg.data.runningOrderItems.create[0]).toMatchObject({
      organisationId: "org_1",
      type: "opening",
      position: 1,
      required: true,
    });
    expect(prisma.auditEvent.create).toHaveBeenCalled();
  });
});

describe("ProjectsService.transitionStatus", () => {
  let prisma: ReturnType<typeof mockPrisma>;
  let service: ProjectsService;

  beforeEach(() => {
    prisma = mockPrisma();
    service = new ProjectsService(prisma as never);
  });

  it("rejects an invalid transition with 409", async () => {
    prisma.project.findFirst.mockResolvedValue({ id: "proj_1", status: "DRAFT", runningOrderItems: [] });
    await expect(service.transitionStatus(tenant, "proj_1", "APPROVED")).rejects.toThrow(ConflictException);
    expect(prisma.project.update).not.toHaveBeenCalled();
  });

  it("blocks READY_FOR_RECORDING while the running order is incomplete", async () => {
    prisma.project.findFirst.mockResolvedValue({
      id: "proj_1",
      status: "DRAFT",
      runningOrderItems: [
        { id: "i1", type: "opening", position: 1, required: true, scriptSectionId: null, assetId: null },
        // presenter with no script attached
        { id: "i2", type: "presenter", position: 2, required: false, scriptSectionId: null, assetId: null },
        { id: "i3", type: "closing", position: 3, required: false, scriptSectionId: null, assetId: null },
      ],
    });
    await expect(service.transitionStatus(tenant, "proj_1", "READY_FOR_RECORDING")).rejects.toThrow(
      BadRequestException,
    );
  });

  it("applies a valid transition and records an audit event", async () => {
    prisma.project.findFirst.mockResolvedValue({
      id: "proj_1",
      status: "DRAFT",
      runningOrderItems: [
        { id: "i1", type: "opening", position: 1, required: true, scriptSectionId: null, assetId: null },
        { id: "i2", type: "presenter", position: 2, required: false, scriptSectionId: "s1", assetId: null },
        { id: "i3", type: "closing", position: 3, required: false, scriptSectionId: null, assetId: null },
      ],
    });
    prisma.project.update.mockResolvedValue({ id: "proj_1", status: "READY_FOR_RECORDING" });

    const result = await service.transitionStatus(tenant, "proj_1", "READY_FOR_RECORDING");

    expect(result.status).toBe("READY_FOR_RECORDING");
    expect(prisma.auditEvent.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ action: "project.status_changed" }),
      }),
    );
  });

  it("scopes lookups to the tenant", async () => {
    prisma.project.findFirst.mockResolvedValue(null);
    await expect(service.transitionStatus(tenant, "someone-elses", "RECORDING")).rejects.toThrow(NotFoundException);
    expect(prisma.project.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: "someone-elses", organisationId: "org_1" } }),
    );
  });
});

describe("ProjectsService.updateScript", () => {
  it("creates a new script version per language without touching the other language", async () => {
    const prisma = mockPrisma();
    const service = new ProjectsService(prisma as never);
    prisma.project.findFirst.mockResolvedValue({ id: "proj_1" });
    prisma.script.upsert.mockResolvedValue({ id: "script_cy" });
    prisma.scriptVersion.findFirst.mockResolvedValue({ version: 2 });
    prisma.scriptVersion.create.mockResolvedValue({ id: "sv_3", version: 3 });

    const result = await service.updateScript(tenant, "proj_1", {
      language: "cy",
      sections: [{ id: "s1", heading: "Croeso", body: "Bore da." }],
    });

    expect(result.version).toBe(3);
    expect(prisma.script.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { projectId_language: { projectId: "proj_1", language: "cy" } },
      }),
    );
  });
});

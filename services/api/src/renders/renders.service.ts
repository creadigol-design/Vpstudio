import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { presetDimensions, type OutputPreset, type RenderManifest } from "@virtual-studio/contracts";
import { QUEUES, createQueue, type RenderJobPayload } from "@virtual-studio/queues";
import type { Queue } from "bullmq";
import { PrismaService } from "../prisma.service";
import type { TenantContext } from "../tenancy/tenant.guard";

const TITLE_DURATION_SECONDS = 3;

@Injectable()
export class RendersService {
  // Instantiated here rather than injected so Nest does not try to resolve it.
  private renderQueue: Queue<RenderJobPayload> = createQueue<RenderJobPayload>(QUEUES.RENDER);

  constructor(private readonly prisma: PrismaService) {}

  /** @internal test hook */
  useQueue(renderQueue: Queue<RenderJobPayload>): void {
    this.renderQueue = renderQueue;
  }

  /**
   * Creates a project version from accepted takes and queues the draft render
   * (spec §18, §24.4). Every presenter block needs an ACCEPTED take with a
   * VALID camera-master asset; the manifest snapshots storage keys so the
   * render is deterministic even if takes change later.
   */
  async createVersion(tenant: TenantContext, projectId: string) {
    const project = await this.prisma.project.findFirst({
      where: { id: projectId, organisationId: tenant.organisationId },
      include: {
        runningOrderItems: { orderBy: { position: "asc" } },
        recordingSessions: {
          include: { takes: { where: { status: "ACCEPTED" }, include: { mediaAssets: true } } },
        },
      },
    });
    if (!project) throw new NotFoundException({ error: "PROJECT_NOT_FOUND" });

    const acceptedTakes = project.recordingSessions.flatMap((s) => s.takes);
    const scenes: RenderManifest["scenes"] = [];
    const missing: Array<{ position: number; reason: string }> = [];

    for (const item of project.runningOrderItems) {
      if (item.type === "opening") {
        scenes.push({ type: "title", text: project.name, durationSeconds: TITLE_DURATION_SECONDS });
      } else if (item.type === "closing") {
        scenes.push({ type: "title", text: "Diolch · Thank you", durationSeconds: TITLE_DURATION_SECONDS });
      } else if (item.type === "presenter") {
        const sectionId = item.scriptSectionId;
        const take = acceptedTakes.find((t) => t.sectionId === sectionId);
        const master = take?.mediaAssets.find((a) => a.kind === "CAMERA_MASTER" && a.validationStatus === "VALID");
        if (!take || !master) {
          missing.push({
            position: item.position,
            reason: !take ? "NO_ACCEPTED_TAKE" : "NO_VALID_CAMERA_MASTER",
          });
          continue;
        }
        scenes.push({
          type: "presenter",
          mediaAssetId: master.id,
          storageKey: master.storageKey,
          sectionId: sectionId ?? "",
        });
      }
      // Other block types (image, quote, statistic…) join the compositor in a
      // later phase; they are recorded in the snapshot but not yet rendered.
    }

    if (missing.length > 0) {
      throw new BadRequestException({ error: "TAKES_INCOMPLETE", missing });
    }

    const outputs = (project.outputPresets as OutputPreset[])
      .map((preset) => {
        const dims = presetDimensions(preset);
        if (!dims) return null;
        return {
          preset,
          width: dims.width,
          height: dims.height,
          fileName: `${preset.toLowerCase()}.mp4`,
        };
      })
      .filter((o): o is NonNullable<typeof o> => o !== null);
    if (outputs.length === 0) {
      throw new BadRequestException({ error: "NO_VIDEO_OUTPUT_PRESETS" });
    }

    const latest = await this.prisma.projectVersion.findFirst({
      where: { projectId },
      orderBy: { versionNumber: "desc" },
    });

    const version = await this.prisma.projectVersion.create({
      data: {
        organisationId: tenant.organisationId,
        projectId,
        versionNumber: (latest?.versionNumber ?? 0) + 1,
        snapshot: {
          runningOrder: project.runningOrderItems.map((i) => ({
            id: i.id,
            type: i.type,
            position: i.position,
            scriptSectionId: i.scriptSectionId,
            assetId: i.assetId,
          })),
          acceptedTakeIds: acceptedTakes.map((t) => t.id),
          templateVersionId: project.templateVersionId,
          brandKitId: project.brandKitId,
        },
      },
    });

    const manifest: RenderManifest = {
      projectVersionId: version.id,
      organisationId: tenant.organisationId,
      frameRate: 25,
      scenes,
      outputs,
    };
    await this.prisma.projectVersion.update({
      where: { id: version.id },
      data: { renderManifest: manifest as never },
    });

    const renderJob = await this.prisma.renderJob.create({
      data: {
        organisationId: tenant.organisationId,
        projectVersionId: version.id,
        type: "RENDER",
        status: "QUEUED",
      },
    });
    await this.renderQueue.add(
      "render",
      { renderJobId: renderJob.id, projectVersionId: version.id },
      { jobId: `render-${renderJob.id}` },
    );

    return { versionId: version.id, versionNumber: version.versionNumber, renderJobId: renderJob.id };
  }

  async getVersion(tenant: TenantContext, versionId: string) {
    const version = await this.prisma.projectVersion.findFirst({
      where: { id: versionId, organisationId: tenant.organisationId },
      include: {
        renderJobs: { orderBy: { createdAt: "desc" } },
        qualityChecks: { orderBy: { createdAt: "asc" } },
      },
    });
    if (!version) throw new NotFoundException({ error: "PROJECT_VERSION_NOT_FOUND" });
    return version;
  }

  listRenderJobs(tenant: TenantContext) {
    return this.prisma.renderJob.findMany({
      where: { organisationId: tenant.organisationId },
      orderBy: { createdAt: "desc" },
      take: 100,
    });
  }
}

import { getPrismaClient } from "@virtual-studio/database";
import { RenderManifestSchema } from "@virtual-studio/contracts";
import { QUEUES, createWorker, type RenderJobPayload } from "@virtual-studio/queues";
import { ObjectStorage } from "@virtual-studio/storage";
import { cleanupWorkDir, renderManifest } from "./pipeline";

const prisma = getPrismaClient();
const storage = new ObjectStorage();

/**
 * Render worker (spec §22.2): fetch manifest, render, upload outputs,
 * record progress and QC evidence, clean temporary storage. Failures mark
 * the RenderJob FAILED with an understandable error; BullMQ retries
 * transient errors (spec §35.2).
 */
async function processRender(job: { data: RenderJobPayload }) {
  const { renderJobId, projectVersionId } = job.data;
  const version = await prisma.projectVersion.findUnique({ where: { id: projectVersionId } });
  if (!version?.renderManifest) throw new Error(`ProjectVersion ${projectVersionId} has no render manifest`);
  const manifest = RenderManifestSchema.parse(version.renderManifest);

  await prisma.renderJob.update({
    where: { id: renderJobId },
    data: { status: "RUNNING", startedAt: new Date(), progress: 0 },
  });

  let workDir: string | null = null;
  try {
    const result = await renderManifest(manifest, storage, async (percent) => {
      await prisma.renderJob.update({ where: { id: renderJobId }, data: { progress: percent } });
    });
    workDir = result.workDir;

    for (const rendered of result.outputs) {
      await prisma.mediaAsset.create({
        data: {
          organisationId: manifest.organisationId,
          projectId: undefined,
          kind: "RENDER_OUTPUT",
          storageKey: rendered.storageKey,
          fileName: rendered.output.fileName,
          contentType: "video/mp4",
          durationSeconds: rendered.info.durationSeconds,
          validationStatus: "VALID",
          technicalMetadata: {
            preset: rendered.output.preset,
            width: rendered.output.width,
            height: rendered.output.height,
            projectVersionId,
          } as never,
        },
      });

      // QC with measurable evidence, never fabricated scores (spec §3.7, §25.3).
      const durationDelta = Math.abs(rendered.info.durationSeconds - result.expectedDurationSeconds);
      const video = rendered.info.streams.find((s) => s.codecType === "video");
      const checks = [
        {
          check: "output_duration",
          status: durationDelta <= 1 ? "PASS" : "FAIL",
          measured: `${rendered.info.durationSeconds.toFixed(2)} s`,
          expected: `${result.expectedDurationSeconds.toFixed(2)} s ± 1 s`,
          severity: durationDelta <= 1 ? "INFO" : "ERROR",
        },
        {
          check: "output_resolution",
          status: video?.width === rendered.output.width && video?.height === rendered.output.height ? "PASS" : "FAIL",
          measured: `${video?.width}x${video?.height}`,
          expected: `${rendered.output.width}x${rendered.output.height}`,
          severity:
            video?.width === rendered.output.width && video?.height === rendered.output.height ? "INFO" : "ERROR",
        },
        {
          check: "audio_present",
          status: rendered.info.hasAudio ? "PASS" : "FAIL",
          measured: rendered.info.hasAudio ? "audio stream present" : "no audio stream",
          expected: "at least one audio stream",
          severity: rendered.info.hasAudio ? "INFO" : "ERROR",
        },
      ];
      for (const c of checks) {
        await prisma.qualityCheck.create({
          data: {
            organisationId: manifest.organisationId,
            projectVersionId,
            check: `${c.check}:${rendered.output.preset}`,
            status: c.status,
            measured: c.measured,
            expected: c.expected,
            severity: c.severity,
          },
        });
      }
    }

    await prisma.renderJob.update({
      where: { id: renderJobId },
      data: { status: "COMPLETE", progress: 100, completedAt: new Date() },
    });
    console.log(`[render] COMPLETE ${renderJobId} (${result.outputs.length} outputs)`);
  } catch (err) {
    await prisma.renderJob.update({
      where: { id: renderJobId },
      data: { status: "FAILED", lastError: err instanceof Error ? err.message : String(err) },
    });
    throw err;
  } finally {
    if (workDir) await cleanupWorkDir(workDir);
  }
}

async function main() {
  await storage.ensureBucket();
  const worker = createWorker<RenderJobPayload>(QUEUES.RENDER, processRender, 1);
  worker.on("failed", (job, err) => console.error(`[render] job ${job?.id} failed: ${err.message}`));
  console.log("render worker listening");
}

void main();

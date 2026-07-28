import { getPrismaClient } from "@virtual-studio/database";
import { probeMedia } from "@virtual-studio/media-utils";
import { QUEUES, createWorker, type MediaIngestJob } from "@virtual-studio/queues";
import { ObjectStorage } from "@virtual-studio/storage";

const prisma = getPrismaClient();
const storage = new ObjectStorage();

/**
 * Ingestion worker (spec §17): verifies integrity, reads codec metadata,
 * confirms audio tracks, detects corrupt media, stores validation results.
 * Idempotent — re-running a job overwrites the same fields with the same
 * values. Local studio media is only cleaned up by the agent once the
 * upload session reaches COMPLETE (spec §16.2 step 9).
 */
async function processIngest(job: { data: MediaIngestJob }) {
  const { mediaAssetId, uploadSessionId } = job.data;
  const asset = await prisma.mediaAsset.findUnique({ where: { id: mediaAssetId } });
  if (!asset) throw new Error(`MediaAsset ${mediaAssetId} not found`);

  try {
    // ffprobe reads the object via a time-limited signed URL — no full
    // download needed for validation.
    const url = await storage.presignGet(asset.storageKey, 900);
    const info = await probeMedia(url);

    await prisma.mediaAsset.update({
      where: { id: asset.id },
      data: {
        validationStatus: "VALID",
        durationSeconds: info.durationSeconds,
        technicalMetadata: {
          formatName: info.formatName,
          bitRate: info.bitRate,
          hasVideo: info.hasVideo,
          hasAudio: info.hasAudio,
          streams: info.streams,
        } as never,
      },
    });
    await prisma.uploadSession.update({
      where: { id: uploadSessionId },
      data: { state: "COMPLETE" },
    });
    console.log(`[ingest] VALID ${asset.id} (${info.durationSeconds.toFixed(2)}s, ${info.formatName})`);
  } catch (err) {
    await prisma.mediaAsset.update({
      where: { id: asset.id },
      data: { validationStatus: "CORRUPT" },
    });
    await prisma.uploadSession.update({
      where: { id: uploadSessionId },
      data: { state: "FAILED", lastError: err instanceof Error ? err.message : String(err) },
    });
    console.error(`[ingest] CORRUPT ${asset.id}: ${err instanceof Error ? err.message : err}`);
    throw err;
  }
}

async function main() {
  await storage.ensureBucket();
  const worker = createWorker<MediaIngestJob>(QUEUES.MEDIA_INGEST, processIngest, 4);
  worker.on("failed", (job, err) => console.error(`[ingest] job ${job?.id} failed: ${err.message}`));
  console.log("media-ingest worker listening");
}

void main();

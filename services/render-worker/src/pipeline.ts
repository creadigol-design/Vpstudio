import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { writeFile } from "node:fs/promises";
import type { RenderManifest, ManifestOutput } from "@virtual-studio/contracts";
import { escapeDrawtext, probeMedia, runFfmpeg, type MediaInfo } from "@virtual-studio/media-utils";
import { ObjectStorage, buildStorageKey } from "@virtual-studio/storage";

export interface RenderedOutput {
  output: ManifestOutput;
  storageKey: string;
  localPath: string;
  info: MediaInfo;
}

export interface RenderResult {
  outputs: RenderedOutput[];
  expectedDurationSeconds: number;
  workDir: string;
}

export type ProgressFn = (percent: number) => Promise<void> | void;

const FONT = "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf";

/**
 * Renders a manifest into its output formats (spec §22.2):
 * download sources, normalise every scene to the output geometry, concat,
 * and upload the drafts. Deterministic per manifest — same input, same output.
 */
export async function renderManifest(
  manifest: RenderManifest,
  storage: ObjectStorage,
  onProgress: ProgressFn = () => undefined,
): Promise<RenderResult> {
  const workDir = await mkdtemp(join(tmpdir(), "vs-render-"));
  const sourceDir = join(workDir, "sources");
  await runFfmpegSafeMkdir(sourceDir);

  // 1. Download presenter sources (20% of progress budget).
  const sourcePaths = new Map<string, string>();
  const presenterScenes = manifest.scenes.filter((s) => s.type === "presenter");
  let downloaded = 0;
  for (const scene of presenterScenes) {
    if (scene.type !== "presenter") continue;
    const local = join(sourceDir, `${scene.mediaAssetId}.mp4`);
    await storage.downloadToFile(scene.storageKey, local);
    sourcePaths.set(scene.mediaAssetId, local);
    downloaded += 1;
    await onProgress(Math.round((downloaded / Math.max(presenterScenes.length, 1)) * 20));
  }

  // Expected duration: title scenes are fixed; presenter scenes use probed source duration.
  let expectedDurationSeconds = 0;
  for (const scene of manifest.scenes) {
    if (scene.type === "title") {
      expectedDurationSeconds += scene.durationSeconds;
    } else {
      const info = await probeMedia(sourcePaths.get(scene.mediaAssetId)!);
      expectedDurationSeconds += info.durationSeconds;
    }
  }

  // 2. Render each output format (remaining 80%).
  const outputs: RenderedOutput[] = [];
  for (let outIndex = 0; outIndex < manifest.outputs.length; outIndex++) {
    const output = manifest.outputs[outIndex]!;
    const { width, height } = output;
    const fps = manifest.frameRate;
    const segmentPaths: string[] = [];

    // Normalise every scene to identical codecs/geometry so concat is lossless.
    for (let i = 0; i < manifest.scenes.length; i++) {
      const scene = manifest.scenes[i]!;
      const segPath = join(workDir, `seg-${output.preset}-${i}.ts`);
      if (scene.type === "title") {
        // Branded title card: dark slate background, centred text (spec §40.1
        // opening/closing titles). Silent audio track keeps concat streams aligned.
        await runFfmpeg([
          "-f", "lavfi", "-i", `color=c=0x0f172a:size=${width}x${height}:rate=${fps}:duration=${scene.durationSeconds}`,
          "-f", "lavfi", "-i", `anullsrc=channel_layout=stereo:sample_rate=48000`,
          "-t", String(scene.durationSeconds),
          "-vf",
          `drawtext=fontfile=${FONT}:text='${escapeDrawtext(scene.text)}':fontcolor=white:fontsize=${Math.round(
            height / 14,
          )}:x=(w-text_w)/2:y=(h-text_h)/2`,
          "-c:v", "libx264", "-preset", "veryfast", "-pix_fmt", "yuv420p",
          "-c:a", "aac", "-ar", "48000", "-ac", "2",
          "-f", "mpegts", segPath,
        ]);
      } else {
        // Scale to fit, pad to the output frame (template-controlled layout
        // rather than blind cropping — spec §22.5).
        const source = sourcePaths.get(scene.mediaAssetId)!;
        await runFfmpeg([
          "-i", source,
          "-vf",
          `scale=${width}:${height}:force_original_aspect_ratio=decrease,pad=${width}:${height}:(ow-iw)/2:(oh-ih)/2:color=0x0f172a,fps=${fps}`,
          "-c:v", "libx264", "-preset", "veryfast", "-pix_fmt", "yuv420p",
          "-c:a", "aac", "-ar", "48000", "-ac", "2",
          "-f", "mpegts", segPath,
        ]);
      }
      segmentPaths.push(segPath);
      const sceneShare = 70 / manifest.outputs.length / manifest.scenes.length;
      await onProgress(Math.min(95, Math.round(20 + outIndex * (70 / manifest.outputs.length) + (i + 1) * sceneShare)));
    }

    // Concat the normalised segments without re-encoding.
    const listPath = join(workDir, `concat-${output.preset}.txt`);
    await writeFile(listPath, segmentPaths.map((p) => `file '${p}'`).join("\n"));
    const outPath = join(workDir, output.fileName);
    await runFfmpeg([
      "-f", "concat", "-safe", "0", "-i", listPath,
      "-c", "copy", "-movflags", "+faststart", outPath,
    ]);

    const info = await probeMedia(outPath);
    const storageKey = buildStorageKey("drafts", manifest.organisationId, manifest.projectVersionId, output.fileName);
    await storage.putFile(storageKey, outPath, "video/mp4");
    outputs.push({ output, storageKey, localPath: outPath, info });
  }

  await onProgress(100);
  return { outputs, expectedDurationSeconds, workDir };
}

export async function cleanupWorkDir(workDir: string): Promise<void> {
  await rm(workDir, { recursive: true, force: true });
}

async function runFfmpegSafeMkdir(dir: string): Promise<void> {
  const { mkdir } = await import("node:fs/promises");
  await mkdir(dir, { recursive: true });
}

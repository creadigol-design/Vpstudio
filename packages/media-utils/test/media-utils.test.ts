import { describe, expect, it } from "vitest";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { probeMedia } from "../src/ffprobe";
import { runFfmpeg, escapeDrawtext } from "../src/ffmpeg";

describe("escapeDrawtext", () => {
  it("escapes ffmpeg drawtext special characters", () => {
    expect(escapeDrawtext("Update: 100% done")).toBe("Update\\: 100\\% done");
  });
});

describe("probeMedia (requires ffmpeg)", () => {
  it("probes a synthesized clip and reports streams", async () => {
    const dir = mkdtempSync(join(tmpdir(), "vs-media-"));
    const file = join(dir, "test.mp4");
    await runFfmpeg([
      "-f", "lavfi", "-i", "testsrc=duration=2:size=640x360:rate=25",
      "-f", "lavfi", "-i", "sine=frequency=440:duration=2",
      "-shortest", "-pix_fmt", "yuv420p", file,
    ]);
    const info = await probeMedia(file);
    expect(info.hasVideo).toBe(true);
    expect(info.hasAudio).toBe(true);
    expect(info.durationSeconds).toBeGreaterThan(1.5);
    const video = info.streams.find((s) => s.codecType === "video");
    expect(video?.width).toBe(640);
    expect(video?.height).toBe(360);
  }, 60_000);

  it("throws on a corrupt file", async () => {
    const dir = mkdtempSync(join(tmpdir(), "vs-media-"));
    const file = join(dir, "corrupt.mp4");
    const { writeFileSync } = await import("node:fs");
    writeFileSync(file, Buffer.from("this is not a video"));
    await expect(probeMedia(file)).rejects.toThrow();
  });
});

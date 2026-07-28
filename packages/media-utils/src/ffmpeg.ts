import { execFile } from "node:child_process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

export interface FfmpegResult {
  stderr: string;
}

/**
 * Runs ffmpeg with the given args (spec §7.8). Always overwrites output
 * (-y) and keeps logs quiet but informative. Rejects on non-zero exit.
 */
export async function runFfmpeg(args: string[], timeoutMs = 10 * 60 * 1000): Promise<FfmpegResult> {
  const { stderr } = await execFileAsync("ffmpeg", ["-hide_banner", "-loglevel", "warning", "-y", ...args], {
    timeout: timeoutMs,
    maxBuffer: 32 * 1024 * 1024,
  });
  return { stderr };
}

/** Escapes a string for use inside an ffmpeg drawtext filter. */
export function escapeDrawtext(text: string): string {
  return text.replace(/\\/g, "\\\\").replace(/:/g, "\\:").replace(/'/g, "\\\\'").replace(/%/g, "\\%");
}

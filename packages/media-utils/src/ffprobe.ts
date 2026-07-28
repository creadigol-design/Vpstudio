import { execFile } from "node:child_process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

export interface MediaStreamInfo {
  index: number;
  codecType: string;
  codecName: string;
  width?: number;
  height?: number;
  frameRate?: number;
  sampleRate?: number;
  channels?: number;
}

export interface MediaInfo {
  formatName: string;
  durationSeconds: number;
  sizeBytes: number;
  bitRate: number | null;
  streams: MediaStreamInfo[];
  hasVideo: boolean;
  hasAudio: boolean;
}

function parseFrameRate(raw: string | undefined): number | undefined {
  if (!raw) return undefined;
  const [num, den] = raw.split("/").map(Number);
  if (!num || !den) return undefined;
  return num / den;
}

/**
 * Inspects a media file or URL with ffprobe (spec §17). Throws on corrupt or
 * unreadable media — callers should treat a throw as validation failure.
 */
export async function probeMedia(input: string): Promise<MediaInfo> {
  const { stdout } = await execFileAsync("ffprobe", [
    "-v",
    "error",
    "-print_format",
    "json",
    "-show_format",
    "-show_streams",
    input,
  ]);
  const parsed = JSON.parse(stdout) as {
    format?: { format_name?: string; duration?: string; size?: string; bit_rate?: string };
    streams?: Array<{
      index: number;
      codec_type?: string;
      codec_name?: string;
      width?: number;
      height?: number;
      avg_frame_rate?: string;
      sample_rate?: string;
      channels?: number;
    }>;
  };
  if (!parsed.format || !parsed.streams || parsed.streams.length === 0) {
    throw new Error("ffprobe returned no format or stream information");
  }
  const streams: MediaStreamInfo[] = parsed.streams.map((s) => ({
    index: s.index,
    codecType: s.codec_type ?? "unknown",
    codecName: s.codec_name ?? "unknown",
    width: s.width,
    height: s.height,
    frameRate: parseFrameRate(s.avg_frame_rate),
    sampleRate: s.sample_rate ? Number(s.sample_rate) : undefined,
    channels: s.channels,
  }));
  return {
    formatName: parsed.format.format_name ?? "unknown",
    durationSeconds: parsed.format.duration ? Number(parsed.format.duration) : 0,
    sizeBytes: parsed.format.size ? Number(parsed.format.size) : 0,
    bitRate: parsed.format.bit_rate ? Number(parsed.format.bit_rate) : null,
    streams,
    hasVideo: streams.some((s) => s.codecType === "video"),
    hasAudio: streams.some((s) => s.codecType === "audio"),
  };
}

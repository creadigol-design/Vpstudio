import { z } from "zod";

/** Initial output presets (spec §22.4, §46). */
export const OUTPUT_PRESETS = [
  "LANDSCAPE_1080",
  "VERTICAL_1080",
  "SQUARE_1080",
  "LANDSCAPE_CAPTIONED",
  "LANDSCAPE_CLEAN",
  "VERTICAL_CAPTIONED",
  "AUDIO_MP3",
  "TRANSCRIPT",
  "SRT",
  "VTT",
] as const;

export const OutputPresetSchema = z.enum(OUTPUT_PRESETS);
export type OutputPreset = z.infer<typeof OutputPresetSchema>;

export interface PresetDimensions {
  width: number;
  height: number;
}

const VIDEO_DIMENSIONS: Partial<Record<OutputPreset, PresetDimensions>> = {
  LANDSCAPE_1080: { width: 1920, height: 1080 },
  LANDSCAPE_CAPTIONED: { width: 1920, height: 1080 },
  LANDSCAPE_CLEAN: { width: 1920, height: 1080 },
  VERTICAL_1080: { width: 1080, height: 1920 },
  VERTICAL_CAPTIONED: { width: 1080, height: 1920 },
  SQUARE_1080: { width: 1080, height: 1080 },
};

export function presetDimensions(preset: OutputPreset): PresetDimensions | null {
  return VIDEO_DIMENSIONS[preset] ?? null;
}

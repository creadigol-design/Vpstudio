import { z } from "zod";

/**
 * Deterministic composition manifest for a project version (spec §22.1).
 * The API builds it; render workers consume it without further DB reads.
 */
export const ManifestSceneSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("title"),
    text: z.string(),
    durationSeconds: z.number().positive(),
  }),
  z.object({
    type: z.literal("presenter"),
    mediaAssetId: z.string(),
    storageKey: z.string(),
    sectionId: z.string(),
  }),
]);
export type ManifestScene = z.infer<typeof ManifestSceneSchema>;

export const ManifestOutputSchema = z.object({
  preset: z.string(),
  width: z.number().int().positive(),
  height: z.number().int().positive(),
  fileName: z.string(),
});
export type ManifestOutput = z.infer<typeof ManifestOutputSchema>;

export const RenderManifestSchema = z.object({
  projectVersionId: z.string(),
  organisationId: z.string(),
  frameRate: z.number().positive(),
  scenes: z.array(ManifestSceneSchema).min(1),
  outputs: z.array(ManifestOutputSchema).min(1),
});
export type RenderManifest = z.infer<typeof RenderManifestSchema>;

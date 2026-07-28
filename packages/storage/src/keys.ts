/**
 * Storage-key layout. Separate prefixes per media category (spec §7.6, §31.1)
 * so lifecycle rules can target each class independently.
 */
export const STORAGE_PREFIXES = {
  RAW: "raw",
  PROXY: "proxies",
  ASSETS: "assets",
  DRAFTS: "drafts",
  MASTERS: "masters",
  EXPORTS: "exports",
  DIAGNOSTICS: "diagnostics",
} as const;
export type StoragePrefix = (typeof STORAGE_PREFIXES)[keyof typeof STORAGE_PREFIXES];

function sanitizeFileName(fileName: string): string {
  return fileName.replace(/[^A-Za-z0-9._-]/g, "_").slice(0, 128);
}

/** raw/{organisationId}/{mediaAssetId}/{fileName} — tenant-scoped, collision-free. */
export function buildStorageKey(
  prefix: StoragePrefix,
  organisationId: string,
  mediaAssetId: string,
  fileName: string,
): string {
  return `${prefix}/${organisationId}/${mediaAssetId}/${sanitizeFileName(fileName)}`;
}

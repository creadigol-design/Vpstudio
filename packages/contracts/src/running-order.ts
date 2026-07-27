import { z } from "zod";

/** Supported initial content block types (spec §12). */
export const BLOCK_TYPES = [
  "opening",
  "presenter",
  "headline",
  "image",
  "video",
  "quote",
  "statistic",
  "call_to_action",
  "closing",
  "credits",
] as const;

export const BlockTypeSchema = z.enum(BLOCK_TYPES);
export type BlockType = z.infer<typeof BlockTypeSchema>;

export const RunningOrderItemSchema = z.object({
  id: z.string().min(1),
  type: BlockTypeSchema,
  position: z.number().int().positive(),
  required: z.boolean().optional(),
  scriptSectionId: z.string().optional(),
  assetId: z.string().optional(),
});
export type RunningOrderItem = z.infer<typeof RunningOrderItemSchema>;

export const RunningOrderSchema = z.object({
  projectId: z.string().min(1),
  items: z.array(RunningOrderItemSchema),
});
export type RunningOrder = z.infer<typeof RunningOrderSchema>;

export interface RunningOrderIssue {
  itemId: string | null;
  code:
    | "DUPLICATE_POSITION"
    | "NON_SEQUENTIAL_POSITIONS"
    | "PRESENTER_MISSING_SCRIPT"
    | "MEDIA_MISSING_ASSET"
    | "MISSING_OPENING"
    | "MISSING_CLOSING";
  message: string;
}

/**
 * Structural validation of a running order. Block types that display media
 * must reference an asset; presenter blocks must reference a script section;
 * templates require an opening and closing title (spec §12, §46).
 */
export function validateRunningOrder(order: RunningOrder): RunningOrderIssue[] {
  const issues: RunningOrderIssue[] = [];
  const positions = new Set<number>();

  const sorted = [...order.items].sort((a, b) => a.position - b.position);
  sorted.forEach((item, index) => {
    if (positions.has(item.position)) {
      issues.push({
        itemId: item.id,
        code: "DUPLICATE_POSITION",
        message: `Position ${item.position} is used more than once`,
      });
    }
    positions.add(item.position);

    if (item.position !== index + 1) {
      issues.push({
        itemId: item.id,
        code: "NON_SEQUENTIAL_POSITIONS",
        message: `Positions must run 1..n without gaps (found ${item.position} at index ${index})`,
      });
    }

    if (item.type === "presenter" && !item.scriptSectionId) {
      issues.push({
        itemId: item.id,
        code: "PRESENTER_MISSING_SCRIPT",
        message: "Presenter section has no script section attached",
      });
    }

    if ((item.type === "image" || item.type === "video") && !item.assetId) {
      issues.push({
        itemId: item.id,
        code: "MEDIA_MISSING_ASSET",
        message: `${item.type} block has no asset attached`,
      });
    }
  });

  if (!order.items.some((i) => i.type === "opening")) {
    issues.push({ itemId: null, code: "MISSING_OPENING", message: "Running order has no opening title" });
  }
  if (!order.items.some((i) => i.type === "closing")) {
    issues.push({ itemId: null, code: "MISSING_CLOSING", message: "Running order has no closing title" });
  }

  return issues;
}

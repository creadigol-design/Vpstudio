import { describe, expect, it } from "vitest";
import { validateRunningOrder, type RunningOrder } from "../src/running-order";

function baseOrder(): RunningOrder {
  return {
    projectId: "project_123",
    items: [
      { id: "item_1", type: "opening", position: 1, required: true },
      { id: "item_2", type: "presenter", position: 2, scriptSectionId: "script_1" },
      { id: "item_3", type: "image", position: 3, assetId: "asset_72" },
      { id: "item_4", type: "closing", position: 4 },
    ],
  };
}

describe("validateRunningOrder", () => {
  it("passes a valid running order", () => {
    expect(validateRunningOrder(baseOrder())).toHaveLength(0);
  });

  it("flags a presenter block without a script section", () => {
    const order = baseOrder();
    delete order.items[1]!.scriptSectionId;
    const issues = validateRunningOrder(order);
    expect(issues.map((i) => i.code)).toContain("PRESENTER_MISSING_SCRIPT");
  });

  it("flags media blocks without an asset", () => {
    const order = baseOrder();
    delete order.items[2]!.assetId;
    const issues = validateRunningOrder(order);
    expect(issues.map((i) => i.code)).toContain("MEDIA_MISSING_ASSET");
  });

  it("flags duplicate and non-sequential positions", () => {
    const order = baseOrder();
    order.items[2]!.position = 2;
    const codes = validateRunningOrder(order).map((i) => i.code);
    expect(codes).toContain("DUPLICATE_POSITION");
    expect(codes).toContain("NON_SEQUENTIAL_POSITIONS");
  });

  it("requires opening and closing titles", () => {
    const order = baseOrder();
    order.items = order.items.filter((i) => i.type === "presenter");
    order.items[0]!.position = 1;
    const codes = validateRunningOrder(order).map((i) => i.code);
    expect(codes).toContain("MISSING_OPENING");
    expect(codes).toContain("MISSING_CLOSING");
  });
});

import { describe, expect, it } from "vitest";
import { buildStorageKey } from "../src/keys";

describe("buildStorageKey", () => {
  it("builds tenant-scoped keys per prefix", () => {
    expect(buildStorageKey("raw", "org_1", "asset_1", "camera-master.mov")).toBe(
      "raw/org_1/asset_1/camera-master.mov",
    );
  });

  it("sanitises hostile file names", () => {
    expect(buildStorageKey("raw", "org_1", "asset_1", "../../etc/passwd")).toBe("raw/org_1/asset_1/.._.._etc_passwd");
    expect(buildStorageKey("drafts", "org_1", "asset_1", "a b/c?.mp4")).toBe("drafts/org_1/asset_1/a_b_c_.mp4");
  });
});

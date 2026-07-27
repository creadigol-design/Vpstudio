import { describe, expect, it } from "vitest";
import { catalog, t } from "../src/index";
import { en } from "../src/messages/en";
import { cy } from "../src/messages/cy";

describe("i18n catalogs", () => {
  it("has a Welsh translation for every English key", () => {
    for (const key of Object.keys(en)) {
      expect(cy[key as keyof typeof cy], `missing cy translation for ${key}`).toBeTruthy();
    }
  });

  it("has no extra Welsh keys", () => {
    expect(Object.keys(cy).sort()).toEqual(Object.keys(en).sort());
  });

  it("resolves messages per locale", () => {
    expect(t("en", "auth.signIn")).toBe("Sign in");
    expect(t("cy", "auth.signIn")).toBe("Mewngofnodi");
  });

  it("returns complete catalogs", () => {
    expect(Object.keys(catalog("cy"))).toHaveLength(Object.keys(en).length);
  });
});

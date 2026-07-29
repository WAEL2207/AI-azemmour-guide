import { describe, expect, it } from "vitest";
import { CATEGORY_META, CATEGORY_ORDER, categoryMeta } from "./categories.js";

describe("categories", () => {
  it("has one entry in CATEGORY_META per category in CATEGORY_ORDER", () => {
    expect(Object.keys(CATEGORY_META).sort()).toEqual([...CATEGORY_ORDER].sort());
  });

  it("has 10 categories", () => {
    expect(CATEGORY_ORDER).toHaveLength(10);
  });

  it("has both fr and en labels for every category", () => {
    for (const cat of CATEGORY_ORDER) {
      expect(CATEGORY_META[cat].label.fr).toBeTruthy();
      expect(CATEGORY_META[cat].label.en).toBeTruthy();
    }
  });

  it("returns the french label by default", () => {
    expect(categoryMeta("hotel")).toEqual({ label: "Hôtel", color: "var(--cat-hotel)" });
  });

  it("returns the english label when asked", () => {
    expect(categoryMeta("religieux", "en")).toEqual({
      label: "Religious site",
      color: "var(--cat-religieux)",
    });
  });

  it("falls back to french if a translation is somehow missing", () => {
    expect(categoryMeta("hotel", "de")).toEqual({ label: "Hôtel", color: "var(--cat-hotel)" });
  });

  it("falls back gracefully for an unknown category", () => {
    expect(categoryMeta("inexistante")).toEqual({
      label: "inexistante",
      color: "var(--color-ink-soft)",
    });
  });

  it("falls back gracefully for a missing category", () => {
    expect(categoryMeta(undefined)).toEqual({ label: "?", color: "var(--color-ink-soft)" });
  });
});

import { describe, expect, it } from "vitest";
import { CATEGORY_META, CATEGORY_ORDER, categoryMeta } from "./categories.js";

describe("categories", () => {
  it("has one entry in CATEGORY_META per category in CATEGORY_ORDER", () => {
    expect(Object.keys(CATEGORY_META).sort()).toEqual([...CATEGORY_ORDER].sort());
  });

  it("has 10 categories", () => {
    expect(CATEGORY_ORDER).toHaveLength(10);
  });

  it("returns label + color for a known category", () => {
    expect(categoryMeta("hotel")).toEqual({ label: "Hotel", color: "var(--cat-hotel)" });
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

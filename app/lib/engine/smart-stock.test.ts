import { describe, it, expect } from "vitest";
import { findBoxesWithVariant, shouldDisable } from "./smart-stock";

const activeBox = {
  id: "box-1",
  boxStatus: "active",
  itemConfig: JSON.stringify({
    items: [{ variantId: "gid://shopify/ProductVariant/1" }],
  }),
  bundleConfig: null,
};

const inactiveBox = {
  ...activeBox,
  id: "box-2",
  boxStatus: "draft",
};

const bundleBox = {
  id: "box-3",
  boxStatus: "active",
  itemConfig: null,
  bundleConfig: JSON.stringify({
    sets: [
      {
        setId: 1,
        items: [{ variantId: "gid://shopify/ProductVariant/2" }],
      },
    ],
  }),
};

describe("findBoxesWithVariant", () => {
  it("finds active single-item boxes containing the variant", () => {
    const result = findBoxesWithVariant("gid://shopify/ProductVariant/1", [
      activeBox,
    ]);
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("box-1");
  });

  it("ignores inactive boxes", () => {
    const result = findBoxesWithVariant("gid://shopify/ProductVariant/1", [
      inactiveBox,
    ]);
    expect(result).toHaveLength(0);
  });

  it("finds bundle boxes containing the variant in any set", () => {
    const result = findBoxesWithVariant("gid://shopify/ProductVariant/2", [
      bundleBox,
    ]);
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("box-3");
  });

  it("returns empty when variant not in any box", () => {
    const result = findBoxesWithVariant("gid://shopify/ProductVariant/99", [
      activeBox,
      bundleBox,
    ]);
    expect(result).toHaveLength(0);
  });
});

describe("shouldDisable", () => {
  it("returns true when any item has zero stock", () => {
    const stockMap = new Map([
      ["gid://shopify/ProductVariant/1", 0],
    ]);
    expect(shouldDisable(activeBox, stockMap)).toBe(true);
  });

  it("returns false when all items have stock", () => {
    const stockMap = new Map([
      ["gid://shopify/ProductVariant/1", 5],
    ]);
    expect(shouldDisable(activeBox, stockMap)).toBe(false);
  });

  it("returns true for bundle box when any set item has zero stock", () => {
    const stockMap = new Map([
      ["gid://shopify/ProductVariant/2", 0],
    ]);
    expect(shouldDisable(bundleBox, stockMap)).toBe(true);
  });
});

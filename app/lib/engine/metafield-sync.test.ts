import { describe, it, expect } from "vitest";
import { buildBoxMetafield } from "./metafield-sync";

const singleItemBox = {
  id: "mb-1",
  boxType: "item",
  productTitle: "Single Mystery Box",
  itemConfig: JSON.stringify({
    items: [
      { variantId: "v1", itemName: "Item A", chance: 60, color: "#FF0000" },
      { variantId: "v2", itemName: "Item B", chance: 40, color: "#FF0000" },
    ],
  }),
  bundleConfig: null,
};

const bundleBox = {
  id: "mb-2",
  boxType: "bundle",
  productTitle: "Bundle Mystery Box",
  itemConfig: null,
  bundleConfig: JSON.stringify({
    sets: [
      {
        setId: 1,
        items: [
          { variantId: "v1", itemName: "Item A", chance: 50, color: "#00FF00" },
          { variantId: "v2", itemName: "Item B", chance: 50, color: "#00FF00" },
        ],
      },
      {
        setId: 2,
        items: [
          { variantId: "v3", itemName: "Item C", chance: 100, color: "#0000FF" },
        ],
      },
    ],
  }),
};

describe("buildBoxMetafield", () => {
  it("builds correct structure for single-item box", () => {
    const result = buildBoxMetafield(singleItemBox);
    expect(result.type).toBe("item");
    expect(result.total_items).toBe(2);
    expect(result.chance_groups).toHaveLength(2);
    expect(result.chance_groups[0]).toEqual({ chance: 60, color: "#FF0000" });
    expect(result.chance_groups[1]).toEqual({ chance: 40, color: "#FF0000" });
  });

  it("builds correct structure for bundle box", () => {
    const result = buildBoxMetafield(bundleBox);
    expect(result.type).toBe("bundle");
    expect(result.set_count).toBe(2);
    expect(result.total_items).toBe(3);
    expect(result.chance_groups).toHaveLength(2);
    expect(result.chance_groups[0]).toEqual({ chance: 50, color: "#00FF00" });
    expect(result.chance_groups[1]).toEqual({ chance: 100, color: "#0000FF" });
  });

  it("groups items by chance+color for single-item box", () => {
    const box = {
      ...singleItemBox,
      itemConfig: JSON.stringify({
        items: [
          { variantId: "v1", itemName: "A", chance: 30, color: "#AAA" },
          { variantId: "v2", itemName: "B", chance: 30, color: "#AAA" },
          { variantId: "v3", itemName: "C", chance: 40, color: "#BBB" },
        ],
      }),
    };
    const result = buildBoxMetafield(box);
    expect(result.chance_groups).toHaveLength(2);
    expect(result.chance_groups[0]).toEqual({ chance: 30, color: "#AAA" });
    expect(result.chance_groups[1]).toEqual({ chance: 40, color: "#BBB" });
  });

  it("returns null for invalid config", () => {
    const box = { ...singleItemBox, itemConfig: "not json" };
    expect(buildBoxMetafield(box)).toBeNull();
  });
});

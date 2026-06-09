import { describe, it, expect } from "vitest";
import { selectFromPool, selectFromPools } from "./randomization";

const item = {
  variantId: "gid://shopify/ProductVariant/1",
  itemName: "Test Item",
  chance: 100,
  color: "#FF0000",
};

describe("selectFromPool", () => {
  it("always selects the only item in a single-item pool", () => {
    const result = selectFromPool([item]);
    expect(result).toEqual(item);
  });

  it("throws when total chance does not equal 100", () => {
    const pool = [
      { ...item, variantId: "a", chance: 40 },
      { ...item, variantId: "b", chance: 40 },
    ];
    expect(() => selectFromPool(pool)).toThrow("chance");
  });

  it("throws when pool is empty", () => {
    expect(() => selectFromPool([])).toThrow("empty");
  });

  it("selects items with weighted probability matching their chance", () => {
    const pool = [
      { ...item, variantId: "a", chance: 70 },
      { ...item, variantId: "b", chance: 30 },
    ];
    const trials = 10000;
    const counts: Record<string, number> = {};

    for (let i = 0; i < trials; i++) {
      const result = selectFromPool(pool);
      counts[result.variantId] = (counts[result.variantId] || 0) + 1;
    }

    const pctA = (counts["a"] / trials) * 100;
    const pctB = (counts["b"] / trials) * 100;

    expect(pctA).toBeGreaterThan(65);
    expect(pctA).toBeLessThan(75);
    expect(pctB).toBeGreaterThan(25);
    expect(pctB).toBeLessThan(35);
  });
});

describe("selectFromPools", () => {
  it("selects one item from each pool", () => {
    const pool1 = [{ ...item, variantId: "a", chance: 100 }];
    const pool2 = [{ ...item, variantId: "b", chance: 100 }];
    const results = selectFromPools([pool1, pool2]);
    expect(results).toHaveLength(2);
    expect(results[0].variantId).toBe("a");
    expect(results[1].variantId).toBe("b");
  });

  it("excludes already-selected variantIds when preventDuplicates is enabled", () => {
    // pool1 always selects "a". pool2 has "a" and "b".
    // With preventDuplicates, pool2 must select "b" every time.
    const pool1 = [{ ...item, variantId: "a", chance: 100 }];
    const pool2 = [
      { ...item, variantId: "a", chance: 50 },
      { ...item, variantId: "b", chance: 50 },
    ];
    for (let i = 0; i < 50; i++) {
      const results = selectFromPools([pool1, pool2], { preventDuplicates: true });
      expect(results[0].variantId).toBe("a");
      expect(results[1].variantId).toBe("b");
    }
  });
});

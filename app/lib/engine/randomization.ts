export type Item = {
  variantId: string;
  itemName: string;
  chance: number;
  color: string;
};

interface SelectOptions {
  excludeVariantIds?: Set<string>;
}

export function selectFromPool(pool: Item[], options?: SelectOptions): Item {
  if (pool.length === 0) {
    throw new Error("Cannot select from empty pool");
  }

  const exclude = options?.excludeVariantIds;
  const eligiblePool = exclude
    ? pool.filter((item) => !exclude.has(item.variantId))
    : pool;

  if (eligiblePool.length === 0) {
    throw new Error("No eligible items after excluding variantIds");
  }

  const totalChance = pool.reduce((sum, item) => sum + item.chance, 0);
  if (totalChance !== 100) {
    throw new Error(`Total chance must equal 100, got ${totalChance}`);
  }

  const eligibleSum = eligiblePool.reduce((sum, item) => sum + item.chance, 0);
  const rand = Math.random() * eligibleSum;
  let accumulator = 0;

  for (const item of eligiblePool) {
    accumulator += item.chance;
    if (rand < accumulator) {
      return item;
    }
  }

  return eligiblePool[eligiblePool.length - 1];
}

export function selectFromPools(
  pools: Item[][],
  options?: { preventDuplicates?: boolean },
): Item[] {
  const results: Item[] = [];
  const excludeVariantIds = new Set<string>();

  for (const pool of pools) {
    const result = selectFromPool(pool, {
      excludeVariantIds: options?.preventDuplicates ? excludeVariantIds : undefined,
    });
    results.push(result);
    if (options?.preventDuplicates) {
      excludeVariantIds.add(result.variantId);
    }
  }

  return results;
}

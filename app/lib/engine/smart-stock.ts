type MysteryBoxRow = {
  id: string;
  boxStatus: string;
  itemConfig: string | null;
  bundleConfig: string | null;
};

type BoxItem = {
  variantId: string;
};

type ItemConfig = {
  items: BoxItem[];
};

type BundleSet = {
  setId: number;
  items: BoxItem[];
};

type BundleConfig = {
  sets: BundleSet[];
};

function parseConfigJson(json: string | null): unknown {
  if (!json) return null;
  try {
    return JSON.parse(json);
  } catch {
    return null;
  }
}

function getVariantIds(box: MysteryBoxRow): string[] {
  if (box.itemConfig) {
    const config = parseConfigJson(box.itemConfig) as ItemConfig;
    return config?.items?.map((i) => i.variantId) ?? [];
  }
  if (box.bundleConfig) {
    const config = parseConfigJson(box.bundleConfig) as BundleConfig;
    return config?.sets?.flatMap((s) => s.items.map((i) => i.variantId)) ?? [];
  }
  return [];
}

export function findBoxesWithVariant(
  variantId: string,
  boxes: MysteryBoxRow[],
): MysteryBoxRow[] {
  return boxes.filter((box) => {
    if (box.boxStatus !== "active") return false;
    return getVariantIds(box).includes(variantId);
  });
}

export function shouldDisable(
  box: MysteryBoxRow,
  stockMap: Map<string, number>,
): boolean {
  const variantIds = getVariantIds(box);
  return variantIds.some((vid) => (stockMap.get(vid) ?? 0) === 0);
}

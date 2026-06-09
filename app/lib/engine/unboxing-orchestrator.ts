import type { PrismaClient } from "@prisma/client";
import { selectFromPool, selectFromPools, type Item } from "./randomization";
import { inventoryManager } from "./inventory";

type AdminGraphQL = {
  graphql: (
    query: string,
    options?: { variables?: Record<string, unknown> },
  ) => Promise<{ json: () => Promise<unknown> }>;
};

type RevealItem = {
  setId: number | null;
  variantId: string;
  itemName: string;
  color: string;
};

type ConfigItem = { variantId: string; itemName: string; chance: number; color: string };
type SingleConfig = { items: ConfigItem[] };
type BundleSet = { setId: number; items: ConfigItem[] };
type BundleConfig = { sets: BundleSet[] };

export async function openBox(
  prisma: PrismaClient,
  admin: AdminGraphQL,
  boxPurchaseId: string,
): Promise<{ items: RevealItem[]; openedAt: Date }> {
  const boxPurchase = await prisma.boxPurchase.findUnique({
    where: { id: boxPurchaseId },
    include: { mysteryBox: true },
  });

  if (!boxPurchase) {
    throw new Error("BoxPurchase not found");
  }

  // Idempotency: return existing reveals
  if (boxPurchase.status === "opened") {
    const existingReveals = await prisma.boxReveal.findMany({
      where: { boxPurchaseId },
      orderBy: { setId: "asc" },
    });
    return {
      items: existingReveals.map((r) => ({
        setId: r.setId ?? null,
        variantId: r.variantId,
        itemName: r.itemName,
        color: "",
      })),
      openedAt: boxPurchase.openedAt!,
    };
  }

  const box = boxPurchase.mysteryBox;

  // Parse config and select items
  let selectedItems: RevealItem[];

  if (box.itemConfig) {
    const config: SingleConfig = JSON.parse(box.itemConfig);
    const items: Item[] = config.items;
    const result = selectFromPool(items);
    selectedItems = [
      { setId: null, variantId: result.variantId, itemName: result.itemName, color: result.color },
    ];
  } else if (box.bundleConfig) {
    const config: BundleConfig = JSON.parse(box.bundleConfig);
    const pools = config.sets.map((s) => s.items);
    const results = selectFromPools(pools, {
      preventDuplicates: box.preventDuplicateBundleSelections,
    });
    selectedItems = results.map((item, idx) => ({
      setId: config.sets[idx]?.setId ?? idx + 1,
      variantId: item.variantId,
      itemName: item.itemName,
      color: item.color,
    }));
  } else {
    throw new Error("Box has no item or bundle config");
  }

  // Decrement inventory for each selected item
  for (const item of selectedItems) {
    await inventoryManager.decrementInventory(admin, item.variantId, 1);
  }

  // Persist reveals
  for (const item of selectedItems) {
    await prisma.boxReveal.create({
      data: {
        boxPurchaseId,
        setId: item.setId,
        variantId: item.variantId,
        itemName: item.itemName,
      },
    });
  }

  // Update BoxPurchase status
  const openedAt = new Date();
  await prisma.boxPurchase.update({
    where: { id: boxPurchaseId },
    data: { status: "opened", openedAt },
  });

  return { items: selectedItems, openedAt };
}

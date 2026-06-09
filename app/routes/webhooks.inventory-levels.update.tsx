import type { ActionFunctionArgs } from "react-router";
import { authenticate } from "../shopify.server";
import { findBoxesWithVariant, shouldDisable } from "../lib/engine/smart-stock";
import { inventoryManager } from "../lib/engine/inventory";
import db from "../db.server";

export const action = async ({ request }: ActionFunctionArgs) => {
  const { shop, admin, topic } = await authenticate.webhook(request);

  if (!admin) {
    console.warn("No admin client available for webhook");
    return new Response(null, { status: 500 });
  }

  const activeBoxes = await db.mysteryBox.findMany({
    where: { shop, boxStatus: "active" },
  });

  if (activeBoxes.length === 0) {
    return new Response();
  }

  // Collect all variant IDs across all active boxes
  const allVariantIds = new Set<string>();
  for (const box of activeBoxes) {
    const config = box.itemConfig || box.bundleConfig;
    if (!config) continue;
    try {
      const parsed = JSON.parse(config);
      const items =
        parsed.items ??
        parsed.sets?.flatMap(
          (s: { items: Array<{ variantId: string }> }) => s.items,
        ) ??
        [];
      for (const item of items) {
        if (item.variantId) allVariantIds.add(item.variantId);
      }
    } catch {
      // skip invalid config
    }
  }

  // Check stock for all variants
  const stockMap = await inventoryManager.checkStock(admin, [...allVariantIds]);

  // Disable boxes where any item is OOS
  let disabledCount = 0;
  for (const box of activeBoxes) {
    if (shouldDisable(box, stockMap)) {
      await db.mysteryBox.update({
        where: { id: box.id },
        data: { boxStatus: "inactive" },
      });
      disabledCount++;
    }
  }

  if (disabledCount > 0) {
    console.log(
      `[${topic}] Disabled ${disabledCount} mystery box(es) due to out-of-stock items`,
    );
  }

  return new Response();
};

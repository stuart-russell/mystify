type BoxRow = {
  boxType: string;
  itemConfig: string | null;
  bundleConfig: string | null;
};

type ChanceGroup = { chance: number; color: string };
type BoxMetafield = {
  type: string;
  total_items: number;
  description?: string;
  set_count?: number;
  chance_groups: ChanceGroup[];
};

export function buildBoxMetafield(box: BoxRow): BoxMetafield | null {
  try {
    if (box.itemConfig) {
      const config = JSON.parse(box.itemConfig);
      const items: Array<{ chance: number; color: string }> = config.items ?? [];
      const groups = groupByChance(items);
      return {
        type: "item",
        total_items: items.length,
        chance_groups: groups,
      };
    }
    if (box.bundleConfig) {
      const config = JSON.parse(box.bundleConfig);
      const sets: Array<{ items: Array<{ chance: number; color: string }> }> = config.sets ?? [];
      const allItems = sets.flatMap((s) => s.items);
      const groups = groupByChance(allItems);
      return {
        type: "bundle",
        set_count: sets.length,
        total_items: allItems.length,
        chance_groups: groups,
      };
    }
    return null;
  } catch {
    return null;
  }
}

function groupByChance(items: Array<{ chance: number; color: string }>): ChanceGroup[] {
  const seen = new Map<number, string>();
  for (const item of items) {
    if (!seen.has(item.chance)) {
      seen.set(item.chance, item.color);
    }
  }
  return [...seen.entries()].map(([chance, color]) => ({ chance, color }));
}

type AdminGraphQL = {
  graphql: (
    query: string,
    options?: { variables?: Record<string, unknown> },
  ) => Promise<{ json: () => Promise<unknown> }>;
};

export async function syncBoxMetafield(
  admin: AdminGraphQL,
  productId: string,
  box: BoxRow,
): Promise<void> {
  const value = buildBoxMetafield(box);
  if (!value) return;

  const response = await admin.graphql(
    `#graphql
    mutation setMetafield($metafields: [MetafieldsSetInput!]!) {
      metafieldsSet(metafields: $metafields) {
        metafields { id }
        userErrors { field message }
      }
    }`,
    {
      variables: {
        metafields: [
          {
            namespace: "mystify",
            key: "box_config",
            type: "json",
            value: JSON.stringify(value),
            ownerId: productId,
          },
        ],
      },
    },
  );

  const json = await response.json();
  const data = json as {
    data?: {
      metafieldsSet?: { userErrors?: Array<{ field: string; message: string }> };
    };
  };

  const errors = data.data?.metafieldsSet?.userErrors;
  if (errors && errors.length > 0) {
    console.warn("Metafield sync warning:", errors[0].message);
  }
}

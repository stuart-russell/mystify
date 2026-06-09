type AdminGraphQL = {
  graphql: (
    query: string,
    options?: { variables?: Record<string, unknown> },
  ) => Promise<{ json: () => Promise<unknown> }>;
};

export const inventoryManager = {
  async checkStock(
    admin: AdminGraphQL,
    variantIds: string[],
  ): Promise<Map<string, number>> {
    if (variantIds.length === 0) {
      return new Map();
    }

    const response = await admin.graphql(
      `#graphql
      query variantNodes($ids: [ID!]!) {
        nodes(ids: $ids) {
          ... on ProductVariant {
            id
            inventoryQuantity
          }
        }
      }`,
      { variables: { ids: variantIds } },
    );

    const json = (await response.json()) as {
      data?: {
        nodes?: Array<{ id?: string; inventoryQuantity?: number } | null>;
      };
    };

    const stockMap = new Map<string, number>();
    json.data?.nodes?.forEach((node) => {
      if (node?.id) {
        stockMap.set(node.id, node.inventoryQuantity ?? 0);
      }
    });

    return stockMap;
  },

  async decrementInventory(
    admin: AdminGraphQL,
    variantId: string,
    amount: number,
  ): Promise<void> {
    const response = await admin.graphql(
      `#graphql
      mutation inventoryAdjust($input: InventoryAdjustQuantitiesInput!) {
        inventoryAdjustQuantities(input: $input) {
          userErrors {
            field
            message
          }
        }
      }`,
      {
        variables: {
          input: {
            reason: "correction",
            changes: [
              {
                inventoryItemId: variantId,
                delta: -amount,
              },
            ],
          },
        },
      },
    );

    const json = (await response.json()) as {
      data?: {
        inventoryAdjustQuantities?: {
          userErrors?: Array<{ field: string; message: string }>;
        };
      };
    };

    const errors = json.data?.inventoryAdjustQuantities?.userErrors;
    if (errors && errors.length > 0) {
      throw new Error(`Inventory adjust failed: ${errors[0].message}`);
    }
  },
};

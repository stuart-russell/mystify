import { describe, it, expect, vi } from "vitest";
import { inventoryManager } from "./inventory";

type MockGraphQLResponse = {
  json: () => Promise<unknown>;
};

type MockAdmin = {
  graphql: (
    query: string,
    options?: { variables?: Record<string, unknown> },
  ) => Promise<MockGraphQLResponse>;
};

function mockAdmin(response: unknown): MockAdmin {
  return {
    graphql: vi.fn().mockResolvedValue({
      json: async () => response,
    }),
  };
}

describe("inventoryManager.checkStock", () => {
  it("returns a map of variantId to inventory quantity", async () => {
    const admin = mockAdmin({
      data: {
        nodes: [
          { id: "gid://shopify/ProductVariant/1", inventoryQuantity: 42 },
          { id: "gid://shopify/ProductVariant/2", inventoryQuantity: 7 },
        ],
      },
    });

    const stock = await inventoryManager.checkStock(admin, [
      "gid://shopify/ProductVariant/1",
      "gid://shopify/ProductVariant/2",
    ]);

    expect(stock.get("gid://shopify/ProductVariant/1")).toBe(42);
    expect(stock.get("gid://shopify/ProductVariant/2")).toBe(7);
  });
});

describe("inventoryManager.decrementInventory", () => {
  it("calls the inventory adjust mutation with correct parameters", async () => {
    const admin = mockAdmin({
      data: {
        inventoryAdjustQuantities: {
          userErrors: [],
        },
      },
    });

    await inventoryManager.decrementInventory(
      admin,
      "gid://shopify/ProductVariant/1",
      3,
    );

    expect(admin.graphql).toHaveBeenCalledOnce();
    const callArgs = (admin.graphql as ReturnType<typeof vi.fn>).mock.calls[0];
    expect(callArgs[0]).toContain("inventoryAdjustQuantities");
  });
});

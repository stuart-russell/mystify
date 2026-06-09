import { describe, it, expect, beforeAll, afterAll, beforeEach, vi } from "vitest";
import { PrismaClient } from "@prisma/client";
import { openBox } from "./unboxing-orchestrator";

const prisma = new PrismaClient();
const SHOP = "test-shop.myshopify.com";

function mockAdmin() {
  return {
    graphql: vi.fn().mockResolvedValue({
      json: async () => ({ data: { inventoryAdjustQuantities: { userErrors: [] } } }),
    }),
  };
}

beforeAll(async () => {
  await prisma.$connect();
});

beforeEach(async () => {
  await prisma.boxReveal.deleteMany();
  await prisma.boxPurchase.deleteMany();
  await prisma.boxDesign.deleteMany();
  await prisma.mysteryBox.deleteMany({ where: { shop: SHOP } });
});

afterAll(async () => {
  await prisma.$disconnect();
});

describe("openBox", () => {
  it("opens an unopened box, creates reveal and decrements inventory", async () => {
    await prisma.mysteryBox.create({
      data: {
        id: "orchestrator-test-mb",
        shop: SHOP,
        productId: "gid://shopify/Product/10",
        productTitle: "Test Mystery Box",
        boxType: "item",
        boxStatus: "active",
        itemConfig: JSON.stringify({
          items: [{ variantId: "gid://shopify/ProductVariant/10", itemName: "Test Item", chance: 100, color: "#FF0000" }],
        }),
      },
    });

    const bp = await prisma.boxPurchase.create({
      data: {
        shop: SHOP,
        orderId: "orch-test-1",
        orderLineItemId: "li1",
        mysteryBoxId: "orchestrator-test-mb",
        price: "19.99",
      },
    });

    const admin = mockAdmin();
    const result = await openBox(prisma, admin, bp.id);

    expect(result.items).toHaveLength(1);
    expect(result.items[0].variantId).toBe("gid://shopify/ProductVariant/10");
    expect(result.items[0].itemName).toBe("Test Item");
    expect(result.items[0].color).toBe("#FF0000");

    // Verify BoxPurchase status updated
    const updated = await prisma.boxPurchase.findUnique({ where: { id: bp.id } });
    expect(updated!.status).toBe("opened");
    expect(updated!.openedAt).not.toBeNull();

    // Verify BoxReveal created
    const reveals = await prisma.boxReveal.findMany({ where: { boxPurchaseId: bp.id } });
    expect(reveals).toHaveLength(1);
    expect(reveals[0].variantId).toBe("gid://shopify/ProductVariant/10");
  });

  it("returns existing reveals without side effects when box is already opened", async () => {
    await prisma.mysteryBox.create({
      data: {
        id: "orch-idem-mb",
        shop: SHOP,
        productId: "gid://shopify/Product/11",
        productTitle: "Idempotent Box",
        boxType: "item",
        boxStatus: "active",
        itemConfig: JSON.stringify({
          items: [{ variantId: "gid://shopify/ProductVariant/11", itemName: "Only Item", chance: 100, color: "#00FF00" }],
        }),
      },
    });

    const bp = await prisma.boxPurchase.create({
      data: { shop: SHOP, orderId: "orch-idem-1", orderLineItemId: "li2", mysteryBoxId: "orch-idem-mb", price: "9.99" },
    });

    const admin = mockAdmin();
    const first = await openBox(prisma, admin, bp.id);
    const callCount = (admin.graphql as ReturnType<typeof vi.fn>).mock.calls.length;

    // Second call should not re-decrement inventory
    const second = await openBox(prisma, admin, bp.id);

    expect(second.items).toHaveLength(1);
    expect(second.items[0].variantId).toBe("gid://shopify/ProductVariant/11");
    expect((admin.graphql as ReturnType<typeof vi.fn>).mock.calls.length).toBe(callCount);

    // No duplicate reveals
    const reveals = await prisma.boxReveal.findMany({ where: { boxPurchaseId: bp.id } });
    expect(reveals).toHaveLength(1);
  });

  it("throws when BoxPurchase does not exist", async () => {
    const admin = mockAdmin();
    await expect(openBox(prisma, admin, "nonexistent-id")).rejects.toThrow("not found");
  });
});

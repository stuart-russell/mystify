import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";
import { PrismaClient } from "@prisma/client";
import { processOrder } from "./order-processor";

const prisma = new PrismaClient();

const productGid = "gid://shopify/Product/999";

async function seedMysteryBox() {
  await prisma.mysteryBox.create({
    data: {
      id: "test-mb-order",
      shop: "test-shop.myshopify.com",
      productId: productGid,
      productTitle: "Test Mystery Box",
      boxType: "item",
      boxStatus: "active",
    },
  });
}

async function cleanup() {
  await prisma.boxReveal.deleteMany();
  await prisma.boxPurchase.deleteMany();
  await prisma.boxDesign.deleteMany();
  await prisma.mysteryBox.deleteMany({ where: { id: "test-mb-order" } });
}

beforeAll(async () => {
  await prisma.$connect();
});

beforeEach(async () => {
  await prisma.boxReveal.deleteMany();
  await prisma.boxPurchase.deleteMany();
  await prisma.boxDesign.deleteMany();
  await prisma.mysteryBox.deleteMany({ where: { id: { startsWith: "test-mb" } } });
  await seedMysteryBox();
});

afterAll(async () => {
  await cleanup();
  await prisma.$disconnect();
});

describe("processOrder", () => {
  it("creates a BoxPurchase for a mystery box line item", async () => {
    const payload = {
      id: 1001,
      line_items: [
        {
          id: 2001,
          product_id: 999,
          name: "Test Mystery Box",
          price: "19.99",
          quantity: 1,
        },
      ],
    };

    const results = await processOrder(payload, "test-shop.myshopify.com", prisma);
    expect(results).toHaveLength(1);
    expect(results[0].orderId).toBe("1001");
    expect(results[0].orderLineItemId).toBe("2001");
    expect(results[0].mysteryBoxId).toBe("test-mb-order");
    expect(results[0].price).toBe("19.99");
    expect(results[0].quantity).toBe(1);
    expect(results[0].status).toBe("unopened");
  });

  it("creates multiple BoxPurchases for multiple mystery box line items", async () => {
    // Add a second MysteryBox
    await prisma.mysteryBox.create({
      data: {
        id: "test-mb-order-2",
        shop: "test-shop.myshopify.com",
        productId: "gid://shopify/Product/888",
        productTitle: "Another Box",
        boxType: "bundle",
        boxStatus: "active",
      },
    });

    const payload = {
      id: 1002,
      line_items: [
        { id: 3001, product_id: 999, name: "Box A", price: "10.00", quantity: 1 },
        { id: 3002, product_id: 888, name: "Box B", price: "20.00", quantity: 2 },
      ],
    };

    const results = await processOrder(payload, "test-shop.myshopify.com", prisma);
    expect(results).toHaveLength(2);
    expect(results[0].orderLineItemId).toBe("3001");
    expect(results[1].orderLineItemId).toBe("3002");
    expect(results[1].quantity).toBe(2);

    await prisma.boxPurchase.deleteMany({ where: { orderId: "1002" } });
    await prisma.mysteryBox.deleteMany({ where: { id: "test-mb-order-2" } });
  });

  it("ignores line items that are not mystery box products", async () => {
    const payload = {
      id: 1003,
      line_items: [
        { id: 4001, product_id: 999, name: "Box A", price: "10.00", quantity: 1 },
        { id: 4002, product_id: 777, name: "Regular Item", price: "5.00", quantity: 1 },
      ],
    };

    const results = await processOrder(payload, "test-shop.myshopify.com", prisma);
    expect(results).toHaveLength(1);
    expect(results[0].orderLineItemId).toBe("4001");

    await prisma.boxPurchase.deleteMany({ where: { orderId: "1003" } });
  });

  it("returns empty array when order has no mystery box products", async () => {
    const payload = {
      id: 1004,
      line_items: [
        { id: 5001, product_id: 777, name: "Regular Item", price: "5.00", quantity: 1 },
      ],
    };

    const results = await processOrder(payload, "test-shop.myshopify.com", prisma);
    expect(results).toHaveLength(0);
  });

  it("does not create duplicate BoxPurchases for already-processed orders", async () => {
    const payload = {
      id: 1005,
      line_items: [
        { id: 6001, product_id: 999, name: "Box A", price: "10.00", quantity: 1 },
      ],
    };

    const first = await processOrder(payload, "test-shop.myshopify.com", prisma);
    expect(first).toHaveLength(1);

    const second = await processOrder(payload, "test-shop.myshopify.com", prisma);
    expect(second).toHaveLength(0);

    await prisma.boxPurchase.deleteMany({ where: { orderId: "1005" } });
  });
});

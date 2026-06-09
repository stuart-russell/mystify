import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";
import { PrismaClient } from "@prisma/client";
import { getDashboardMetrics, getRevealDistribution } from "./analytics";

const prisma = new PrismaClient();
const SHOP = "test-shop.myshopify.com";

beforeAll(async () => {
  await prisma.$connect();
});

beforeEach(async () => {
  await prisma.boxReveal.deleteMany();
  await prisma.boxPurchase.deleteMany();
  await prisma.mysteryBox.deleteMany({ where: { shop: SHOP } });
});

afterAll(async () => {
  await prisma.$disconnect();
});

describe("getDashboardMetrics", () => {
  it("returns zeroes when no data exists", async () => {
    const metrics = await getDashboardMetrics(prisma, SHOP);
    expect(metrics.totalBoxesSold).toBe(0);
    expect(metrics.totalRevenue).toBe(0);
    expect(metrics.openRate).toBe(0);
  });

  it("returns correct totals for boxes sold and revenue", async () => {
    await prisma.mysteryBox.create({
      data: {
        id: "test-analytics-mb",
        shop: SHOP,
        productId: "gid://shopify/Product/1",
        productTitle: "Test Box",
        boxType: "item",
        boxStatus: "active",
      },
    });

    await prisma.boxPurchase.createMany({
      data: [
        { shop: SHOP, orderId: "o1", orderLineItemId: "li1", mysteryBoxId: "test-analytics-mb", price: "19.99" },
        { shop: SHOP, orderId: "o2", orderLineItemId: "li2", mysteryBoxId: "test-analytics-mb", price: "29.99" },
      ],
    });

    const metrics = await getDashboardMetrics(prisma, SHOP);
    expect(metrics.totalBoxesSold).toBe(2);
    expect(metrics.totalRevenue).toBeCloseTo(49.98, 2);
  });

  it("calculates open rate correctly", async () => {
    await prisma.mysteryBox.create({
      data: {
        id: "test-analytics-mb2",
        shop: SHOP,
        productId: "gid://shopify/Product/2",
        productTitle: "Test Box 2",
        boxType: "item",
        boxStatus: "active",
      },
    });

    await prisma.boxPurchase.createMany({
      data: [
        { id: "bp1", shop: SHOP, orderId: "o3", orderLineItemId: "li3", mysteryBoxId: "test-analytics-mb2", price: "10.00", status: "opened" },
        { id: "bp2", shop: SHOP, orderId: "o4", orderLineItemId: "li4", mysteryBoxId: "test-analytics-mb2", price: "10.00", status: "unopened" },
        { id: "bp3", shop: SHOP, orderId: "o5", orderLineItemId: "li5", mysteryBoxId: "test-analytics-mb2", price: "10.00", status: "opened" },
      ],
    });

    const metrics = await getDashboardMetrics(prisma, SHOP);
    expect(metrics.openRate).toBeCloseTo(66.67, 1);
  });
});

describe("getRevealDistribution", () => {
  it("returns item distribution with correct counts", async () => {
    await prisma.mysteryBox.create({
      data: {
        id: "test-rd-mb",
        shop: SHOP,
        productId: "gid://shopify/Product/3",
        productTitle: "Test Box 3",
        boxType: "item",
        boxStatus: "active",
      },
    });

    const bp = await prisma.boxPurchase.create({
      data: { shop: SHOP, orderId: "o6", orderLineItemId: "li6", mysteryBoxId: "test-rd-mb", price: "10.00" },
    });

    await prisma.boxReveal.createMany({
      data: [
        { boxPurchaseId: bp.id, variantId: "v1", itemName: "Item A" },
        { boxPurchaseId: bp.id, variantId: "v2", itemName: "Item B" },
        { boxPurchaseId: bp.id, variantId: "v1", itemName: "Item A" },
        { boxPurchaseId: bp.id, variantId: "v1", itemName: "Item A" },
        { boxPurchaseId: bp.id, variantId: "v3", itemName: "Item C" },
      ],
    });

    const dist = await getRevealDistribution(prisma, SHOP);
    expect(dist).toHaveLength(3);

    const itemA = dist.find((d) => d.itemName === "Item A")!;
    expect(itemA.count).toBe(3);
    expect(itemA.percentage).toBe(60);

    const itemB = dist.find((d) => d.itemName === "Item B")!;
    expect(itemB.count).toBe(1);
    expect(itemB.percentage).toBe(20);
  });
});

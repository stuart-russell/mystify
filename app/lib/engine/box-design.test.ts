import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { PrismaClient } from "@prisma/client";
import { boxDesign } from "./box-design";

const prisma = new PrismaClient();

async function createMysteryBox(id: string) {
  await prisma.mysteryBox.create({
    data: {
      id,
      shop: "test-shop.myshopify.com",
      productId: `gid://shopify/Product/${id}`,
      productTitle: "Test Box",
      boxType: "item",
    },
  });
}

async function cleanupMysteryBox(id: string) {
  await prisma.boxDesign.deleteMany({ where: { mysteryBoxId: id } });
  await prisma.mysteryBox.deleteMany({ where: { id } });
}

beforeAll(async () => {
  await prisma.$connect();
});

afterAll(async () => {
  await prisma.$disconnect();
});

describe("boxDesign", () => {
  it("createDefault creates a BoxDesign with default values", async () => {
    await createMysteryBox("test-mb-1");
    const design = await boxDesign.createDefault(prisma, "test-mb-1");
    expect(design.mysteryBoxId).toBe("test-mb-1");
    expect(design.animationStyle).toBe("default");
    expect(design.boxImageUrl).toBeNull();
    expect(design.openSoundUrl).toBeNull();

    await cleanupMysteryBox("test-mb-1");
  });

  it("getByBoxId returns the design after creation", async () => {
    await createMysteryBox("test-mb-2");
    await boxDesign.createDefault(prisma, "test-mb-2");
    const design = await boxDesign.getByBoxId(prisma, "test-mb-2");
    expect(design).not.toBeNull();
    expect(design!.animationStyle).toBe("default");

    await cleanupMysteryBox("test-mb-2");
  });

  it("getByBoxId returns null for nonexistent box", async () => {
    const design = await boxDesign.getByBoxId(prisma, "nonexistent-id");
    expect(design).toBeNull();
  });

  it("update modifies specified fields", async () => {
    await createMysteryBox("test-mb-3");
    await boxDesign.createDefault(prisma, "test-mb-3");
    const updated = await boxDesign.update(prisma, "test-mb-3", {
      animationStyle: "slide",
      backgroundColor: "#000000",
    });
    expect(updated.animationStyle).toBe("slide");
    expect(updated.backgroundColor).toBe("#000000");
    expect(updated.boxImageUrl).toBeNull();

    await cleanupMysteryBox("test-mb-3");
  });
});

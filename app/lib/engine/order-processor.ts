import type { PrismaClient } from "@prisma/client";

type OrderLineItem = {
  id: number;
  product_id: number;
  name: string;
  price: string;
  quantity: number;
};

type OrderPayload = {
  id: number;
  line_items: OrderLineItem[];
};

export async function processOrder(
  payload: OrderPayload,
  shop: string,
  prisma: PrismaClient,
) {
  // Idempotency: skip if order already processed
  const existing = await prisma.boxPurchase.findFirst({
    where: { shop, orderId: String(payload.id) },
  });
  if (existing) return [];

  const productIds = payload.line_items.map(
    (item) => `gid://shopify/Product/${item.product_id}`,
  );

  const boxes = await prisma.mysteryBox.findMany({
    where: { shop, productId: { in: productIds } },
  });

  const boxByProductId = new Map(boxes.map((b) => [b.productId, b]));

  const purchases = [];
  for (const item of payload.line_items) {
    const productGid = `gid://shopify/Product/${item.product_id}`;
    const box = boxByProductId.get(productGid);
    if (!box) continue;

    const purchase = await prisma.boxPurchase.create({
      data: {
        shop,
        orderId: String(payload.id),
        orderLineItemId: String(item.id),
        mysteryBoxId: box.id,
        price: item.price,
        quantity: item.quantity,
      },
    });
    purchases.push(purchase);
  }

  return purchases;
}

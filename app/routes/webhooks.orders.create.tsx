import type { ActionFunctionArgs } from "react-router";
import { authenticate } from "../shopify.server";
import { processOrder } from "../lib/engine/order-processor";
import db from "../db.server";

export const action = async ({ request }: ActionFunctionArgs) => {
  const { shop, topic } = await authenticate.webhook(request);
  const payload = await request.json();

  const purchases = await processOrder(payload, shop, db);

  console.log(
    `[${topic}] Created ${purchases.length} BoxPurchase(s) for order ${payload.id}`,
  );

  return new Response();
};

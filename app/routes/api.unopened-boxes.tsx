import type { LoaderFunctionArgs } from "react-router";
import { authenticate } from "../shopify.server";
import db from "../db.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { session } = await authenticate.public.appProxy(request);

  const url = new URL(request.url);
  const orderId = url.searchParams.get("orderId");

  if (!orderId) {
    return Response.json({ unopened: [] });
  }

  const purchases = await db.boxPurchase.findMany({
    where: {
      shop: session.shop,
      orderId,
      status: "unopened",
    },
    include: {
      mysteryBox: { select: { productTitle: true } },
    },
  });

  return Response.json({
    unopened: purchases.map((p) => ({
      boxPurchaseId: p.id,
      boxName: p.mysteryBox.productTitle,
    })),
  });
};

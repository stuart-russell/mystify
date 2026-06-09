import type { ActionFunctionArgs } from "react-router";
import { authenticate } from "../shopify.server";
import { openBox } from "../lib/engine/unboxing-orchestrator";
import db from "../db.server";

export const action = async ({ request }: ActionFunctionArgs) => {
  const { admin } = await authenticate.public.appProxy(request);

  if (!admin) {
    return Response.json({ error: "Not authenticated" }, { status: 401 });
  }

  let boxPurchaseId: string;
  try {
    const body = await request.json();
    boxPurchaseId = body.boxPurchaseId;
  } catch {
    boxPurchaseId = new URL(request.url).searchParams.get("boxPurchaseId") ?? "";
  }

  if (!boxPurchaseId) {
    return Response.json({ error: "Missing boxPurchaseId" }, { status: 400 });
  }

  try {
    const result = await openBox(db, admin, boxPurchaseId);
    return Response.json({ success: true, ...result });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return Response.json({ error: message }, { status: 400 });
  }
};

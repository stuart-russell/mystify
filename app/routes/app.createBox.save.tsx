import { safeParseCreateBoxPostPayload } from "app/lib/api/mystify/schema";
import { Prisma } from "@prisma/client";
import { authenticate } from "app/shopify.server";
import db from "../db.server";
import type { ActionFunctionArgs } from "react-router";

const parseJsonField = (value: FormDataEntryValue | null): unknown => {
  if (typeof value !== "string" || value.length === 0) return null;

  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const { session, admin } = await authenticate.admin(request);
  const formData = await request.formData();

  const boxType = formData.get("boxType");
  const productId = formData.get("productId");
  const productTitle = formData.get("productTitle");
  const boxStatus = formData.get("boxStatus");
  const smartStockManagement =
    formData.get("smartStockManagement")?.toString() === "true";
  const preventDuplicateBundleSelections =
    formData.get("preventDuplicateBundleSelections")?.toString() === "true";
  const itemConfig = parseJsonField(formData.get("itemConfig"));
  const bundleConfig = parseJsonField(formData.get("bundleConfig"));

  const parsed = safeParseCreateBoxPostPayload({
    boxType,
    productId,
    productTitle,
    boxStatus,
    smartStockManagement,
    preventDuplicateBundleSelections,
    config: boxType === "item" ? itemConfig : bundleConfig,
  });

  if (!parsed.success) {
    return new Response(
      JSON.stringify({
        error: "Invalid mystery box payload",
        issues: parsed.error.issues,
      }),
      {
        status: 400,
        headers: { "Content-Type": "application/json" },
      },
    );
  }

  const { data } = parsed;
  const productResponse = await admin.graphql(
    `#graphql
    query getProduct($id: ID!) {
      product(id: $id) {
        id
      }
    }`,
    { variables: { id: data.productId } },
  );
  const productResponseJson = await productResponse.json();
  const productExists = Boolean(productResponseJson.data?.product?.id);

  if (!productExists) {
    return new Response(
      JSON.stringify({
        error: "Invalid productId for this shop",
      }),
      {
        status: 400,
        headers: { "Content-Type": "application/json" },
      },
    );
  }

  try {
    // @ts-ignore: Ignore type error if Prisma type is not recognized
    await db.mysteryBox.create({
      data: {
        shop: session.shop,
        productId: data.productId,
        productTitle: data.productTitle,
        boxType: data.boxType,
        boxStatus: data.boxStatus,
        smartStockManagement: data.smartStockManagement,
        preventDuplicateBundleSelections:
          data.boxType === "bundle"
            ? data.preventDuplicateBundleSelections
            : false,
        itemConfig:
          data.boxType === "item" ? JSON.stringify(data.config) : null,
        bundleConfig:
          data.boxType === "bundle" ? JSON.stringify(data.config) : null,
      },
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return new Response(
        JSON.stringify({
          error:
            "This product already has a mystery box. Please select a different product.",
        }),
        {
          status: 409,
          headers: { "Content-Type": "application/json" },
        },
      );
    }
    throw error;
  }

  return Response.json({ ok: true });
};

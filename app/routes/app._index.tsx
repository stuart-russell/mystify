import { ExistingBoxTable } from "app/components/existingBoxTable";
import { TBoxTable } from "app/lib/api/mystify/schema";
import { authenticate } from "app/shopify.server";
import db from "../db.server";
import type { LoaderFunctionArgs } from "react-router";
import { useLoaderData } from "react-router";

const safeParseItemConfig = (value: string | null): number => {
  if (!value) return 1;
  try {
    const parsed = JSON.parse(value) as { items?: unknown[] };
    return Array.isArray(parsed.items) ? Math.max(parsed.items.length, 1) : 1;
  } catch {
    return 1;
  }
};

const safeParseBundleConfig = (value: string | null): number => {
  if (!value) return 1;
  try {
    const parsed = JSON.parse(value) as {
      sets?: Array<{ items?: unknown[] }>;
    };
    if (!Array.isArray(parsed.sets)) return 1;
    const itemCount = parsed.sets.reduce((sum, set) => {
      return sum + (Array.isArray(set.items) ? set.items.length : 0);
    }, 0);
    return Math.max(itemCount, 1);
  } catch {
    return 1;
  }
};

const toBoxType = (value: string): TBoxTable["type"] =>
  value === "bundle" ? "bundle" : "item";

const toBoxStatus = (value: string): TBoxTable["status"] => {
  if (value === "active") return "active";
  if (value === "inactive") return "inactive";
  if (value === "expired") return "expired";
  return "draft";
};

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { session, admin } = await authenticate.admin(request);
  const mysteryBoxes = await db.mysteryBox.findMany({
    where: { shop: session.shop },
    orderBy: { updatedAt: "desc" },
  });
  const fallbackImageUrl =
    "https://cdn.shopify.com/static/themes/horizon/placeholders/product-cube.png.png";
  const productIds = mysteryBoxes.map((box) => box.productId);
  const productImageMap = new Map<string, string>();

  if (productIds.length > 0) {
    const response = await admin.graphql(
      `#graphql
      query productsByIds($ids: [ID!]!) {
        nodes(ids: $ids) {
          ... on Product {
            id
            featuredImage {
              url
            }
          }
        }
      }`,
      { variables: { ids: productIds } },
    );
    const responseJson = await response.json();
    const nodes = responseJson.data?.nodes as
      | Array<{ id?: string; featuredImage?: { url?: string } }>
      | undefined;

    nodes?.forEach((node) => {
      if (node?.id && node.featuredImage?.url) {
        productImageMap.set(node.id, node.featuredImage.url);
      }
    });
  }

  const tableData: TBoxTable[] = mysteryBoxes.map((box) => ({
    imageUrl: productImageMap.get(box.productId) ?? fallbackImageUrl,
    boxName: box.productTitle || `Box ${box.productId.slice(-8)}`,
    type: toBoxType(box.boxType),
    status: toBoxStatus(box.boxStatus),
    amount:
      box.boxType === "bundle"
        ? safeParseBundleConfig(box.bundleConfig)
        : safeParseItemConfig(box.itemConfig),
  }));

  return { tableData };
};

export default function Index() {
  const { tableData } = useLoaderData<typeof loader>();
  return (
    <s-page>
      <s-box padding="base"></s-box>
      <s-stack
        direction="inline"
        paddingBlockEnd="base"
        gap="large"
        justifyContent="space-between"
      >
        <s-box>
          <s-heading>Manage Existing Boxes</s-heading>
        </s-box>
        <s-box>
          <s-link href="/app/createBox">
            <s-button>Create New Box</s-button>
          </s-link>
          <s-app-window
            id="create-box-window"
            src="/app/createBox"
          ></s-app-window>
        </s-box>
      </s-stack>
      <ExistingBoxTable tableData={tableData} />
    </s-page>
  );
}

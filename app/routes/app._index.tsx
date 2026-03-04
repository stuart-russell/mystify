import { ExistingBoxTable } from "app/components/existingBoxTable";
import { TBoxTable } from "app/lib/api/mystify/schema";
import { authenticate } from "app/shopify.server";
import db from "../db.server";
import { redirect, type ActionFunctionArgs, type LoaderFunctionArgs } from "react-router";
import { useLoaderData } from "react-router";

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
  const productInventoryMap = new Map<string, number>();

  if (productIds.length > 0) {
    const response = await admin.graphql(
      `#graphql
      query productsByIds($ids: [ID!]!) {
        nodes(ids: $ids) {
          ... on Product {
            id
            totalInventory
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
      | Array<{
          id?: string;
          totalInventory?: number;
          featuredImage?: { url?: string };
        }>
      | undefined;

    nodes?.forEach((node) => {
      if (!node?.id) return;
      if (node.featuredImage?.url) productImageMap.set(node.id, node.featuredImage.url);
      productInventoryMap.set(node.id, node.totalInventory ?? 0);
    });
  }

  const tableData: TBoxTable[] = mysteryBoxes.map((box) => ({
    id: box.id,
    imageUrl: productImageMap.get(box.productId) ?? fallbackImageUrl,
    boxName: box.productTitle || `Box ${box.productId.slice(-8)}`,
    type: toBoxType(box.boxType),
    status: toBoxStatus(box.boxStatus),
    amount: productInventoryMap.get(box.productId) ?? 0,
  }));

  return { tableData };
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const { session } = await authenticate.admin(request);
  const formData = await request.formData();
  const intent = formData.get("intent");
  const boxId = formData.get("boxId");

  if (intent !== "delete" || typeof boxId !== "string" || boxId.length === 0) {
    return redirect("/app/");
  }

  await db.mysteryBox.deleteMany({
    where: {
      id: boxId,
      shop: session.shop,
    },
  });

  return redirect("/app/");
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

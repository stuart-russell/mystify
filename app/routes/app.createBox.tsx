import { TBoxType } from "app/lib/api/mystify/schema";
import { useState } from "react";
import { useAppBridge } from "@shopify/app-bridge-react";
import { SelectProduct } from "app/components/selectProduct";
import { SelectBoxType } from "app/components/selectBoxType";
import { CreateBundleBox } from "app/components/createBundleBox";
import { CreateSingleItemBox } from "app/components/createSingleItemBox";
("app/lib/api/shopify/api");
import { TProduct, TVariantSelection } from "app/lib/api/shopify/schema";
import {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  useFetcher,
} from "react-router";
import { authenticate } from "app/shopify.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await authenticate.admin(request);

  return null;
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const { admin } = await authenticate.admin(request);
  const formData = await request.formData();

  const response = await admin.graphql(
    `#graphql
    query productInfo($id: ID!) {
      product(id: $id) {
        title
        description
        totalInventory
        variants(first: 1) {
          nodes {
            price
          }
        }
        media(first: 1) {
          nodes {
            preview {
              image {
                url
              }
            }
          }
        }
      }
    }`,
    {
      variables: {
        id: formData.get("productId")?.toString() || "",
      },
    },
  );
  const responseJson = await response.json();

  const image = responseJson.data?.product?.media.nodes[0]?.preview?.image?.url
    ? responseJson.data.product.media.nodes[0].preview.image.url
    : "https://cdn.shopify.com/static/themes/horizon/placeholders/product-cube.png.png";

  const price = responseJson.data?.product?.variants.nodes[0]?.price
    ? `${responseJson.data.product.variants.nodes[0].price}`
    : `N/A`;

  return {
    title: responseJson.data?.product?.title || "Mystery Box Product Title",
    image: image,
    price: price,
    description:
      responseJson.data?.product?.description.replace(/<[^>]*>/g, "") ||
      "This is a brief description of the product inside the mystery box. It gives an overview of what to expect.",
    inventory: responseJson.data?.product?.totalInventory || 0,
  };
};

export default function Index() {
  const [selectedType, setSelectedType] = useState<TBoxType>();
  const [selectedProduct, setSelectedProduct] = useState<TProduct>({
    title: "Mystery Box Product Title",
    description:
      "This is a brief description of the product inside the mystery box. It gives an overview of what to expect.",
    price: "N/A",
    image:
      "https://cdn.shopify.com/static/themes/horizon/placeholders/product-cube.png.png",
    inventory: 0,
  });

  const appBridge = useAppBridge();

  const handleTypeSelection = (type: TBoxType) => {
    setSelectedType(type);
  };

  const fetcher = useFetcher<typeof action>();

  const routeToProductCreation = async (): Promise<string> => {
    if (!appBridge.intents.invoke) return Promise.resolve("");
    const productCreateActivity = await appBridge.intents.invoke(
      "create:shopify/Product",
    );
    const productCreateResponse = (await productCreateActivity.complete) as {
      data: { id: string };
    };
    return productCreateResponse.data.id;
  };

  return (
    <s-page heading="Create a New Mystery Box">
      <s-button
        slot="primary-action"
        variant="primary"
        onClick={() => shopify.toast.show("Save")}
      >
        Save
      </s-button>
      <s-box padding="base"></s-box>
      <s-stack
        direction="inline"
        paddingBlockEnd="base"
        gap="large"
        justifyContent="space-between"
      >
        <s-box>
          <s-heading>Select Box Type</s-heading>
        </s-box>
        <s-box></s-box>
      </s-stack>
      <s-grid
        gridTemplateColumns="repeat(2, 1fr)"
        gap="small"
        justifyContent="center"
      >
        <SelectBoxType
          handleTypeSelection={handleTypeSelection}
          selectedType={selectedType}
        />
      </s-grid>
      <s-box padding="base"></s-box>

      {selectedType && (
        <>
          <SelectProduct
            selectedProduct={selectedProduct}
            routeToProductCreation={routeToProductCreation}
            setSelectedProduct={setSelectedProduct}
            productFetcher={fetcher}
          />
        </>
      )}
      <s-box padding="small-300"></s-box>
      {selectedProduct.title !== "Mystery Box Product Title" ? (
        <>
          <s-heading>Configure Box</s-heading>
          <s-box padding="small-200"></s-box>
          <s-section>
            {selectedType == "bundle" ? (
              <CreateBundleBox />
            ) : (
              <CreateSingleItemBox />
            )}
          </s-section>
        </>
      ) : null}
    </s-page>
  );
}

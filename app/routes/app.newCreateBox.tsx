import { Package, Shuffle } from "lucide-react";
import { TBoxType } from "app/lib/api/mysify/schema";
import { useState } from "react";
import { selectProduct } from "app/lib/api/shopify/api";
import { useAppBridge } from "@shopify/app-bridge-react";

export default function Index() {
  const [selectedType, setSelectedType] = useState<TBoxType>();
  const [selectedProduct, setSelectedProduct] = useState<String>();

  const shopify = useAppBridge();

  const handleTypeSelection = (type: TBoxType) => {
    setSelectedType(type);
  };

  const routeToProductCreation = async () => {
    if (!shopify.intents.invoke) return;
    const productCreateActivity = await shopify.intents.invoke(
      "create:shopify/Product",
    );
    const response = (await productCreateActivity.complete) as {
      data: { id: string };
    };
    setSelectedProduct(response.data.id);
  };

  return (
    <s-page heading="Create a New Mystery Box">
      <s-button slot="primary-action" onclick="shopify.toast.show('Save')">
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
        <s-grid-item gridColumn="span 1">
          <s-clickable
            border="base"
            padding="base"
            background={selectedType == "bundle" ? "subdued" : "transparent"}
            borderRadius="base"
            borderColor={selectedType == "bundle" ? "strong" : "base"}
            borderWidth={selectedType == "bundle" ? "large" : "base"}
            onClick={() => handleTypeSelection("bundle")}
          >
            <Package style={{ fontSize: "24px", color: "#faad14" }} />
            <s-heading>Bundle Box</s-heading>
            <s-text>
              Curate a bundle of mystery items. Customers receive multiple
              surprise products in one box.
            </s-text>
          </s-clickable>
        </s-grid-item>
        <s-grid-item gridColumn="auto">
          <s-clickable
            border="base"
            padding="base"
            background={selectedType == "item" ? "subdued" : "transparent"}
            borderRadius="base"
            borderColor={selectedType == "item" ? "strong" : "base"}
            borderWidth={selectedType == "item" ? "large" : "base"}
            onClick={() => handleTypeSelection("item")}
          >
            <Shuffle style={{ fontSize: "24px", color: "#52c41a" }} />
            <s-heading>Single Item</s-heading>
            <s-text>
              One randomly selected item from your inventory. Perfect for
              affordable mystery options.
            </s-text>
          </s-clickable>
        </s-grid-item>
      </s-grid>
      <s-box padding="base"></s-box>

      {selectedType && (
        <>
          <s-divider />
          <s-box padding="base"></s-box>
          {/*<s-grid gridTemplateColumns="1fr 5fr 1fr">*/}
          <s-grid-item></s-grid-item>
          <s-grid-item>
            <s-section>
              <s-heading>Select or Create Mystery Box Product</s-heading>
              Choose an existing product to use as a mystery box or create a new
              one.
              <s-grid-item padding="base none none none">
                <s-stack direction="inline" gap="base">
                  <s-button
                    onClick={(_) => {
                      selectProduct(setSelectedProduct);
                    }}
                    accessibilityLabel="Select the product to use as a mystery box"
                  >
                    Select product
                  </s-button>
                  <s-button
                    onClick={routeToProductCreation}
                    accessibilityLabel="Create a new product to use as a mystery box"
                  >
                    Create Product
                  </s-button>
                </s-stack>
              </s-grid-item>
            </s-section>
            <s-box padding="base"></s-box>
            {selectedProduct ? <s-section>{selectedProduct}</s-section> : null}
          </s-grid-item>
        </>
      )}
      {/*</s-grid>*/}
    </s-page>
  );
}

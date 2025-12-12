import { TBoxType } from "app/lib/api/mysify/schema";
import { useState } from "react";
import { useAppBridge } from "@shopify/app-bridge-react";
import { SelectProduct } from "app/components/selectProduct";
import { SelectBoxType } from "app/components/selectBoxType";
import { CreateBundleBox } from "app/components/createBundleBox";
import { CreateSingleItemBox } from "app/components/createSingleItemBox";
import { getCreatedProductData } from "app/lib/api/shopify/api";
import { TProduct } from "app/lib/api/shopify/schema";

export default function Index() {
  const [selectedType, setSelectedType] = useState<TBoxType>();
  const [selectedProduct, setSelectedProduct] = useState<TProduct>();

  const appBridge = useAppBridge();

  const handleTypeSelection = (type: TBoxType) => {
    setSelectedType(type);
  };

  const routeToProductCreation = async () => {
    if (!appBridge.intents.invoke) return;
    const productCreateActivity = await appBridge.intents.invoke(
      "create:shopify/Product",
    );
    const productCreateResponse = (await productCreateActivity.complete) as {
      data: { id: string };
    };
    const response = productCreateResponse;
    const productData = await getCreatedProductData(response.data.id);
    setSelectedProduct(productData);
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
          />
        </>
      )}
      <s-box padding="base"></s-box>
      {selectedProduct ? (
        <s-section>
          {selectedType == "bundle" ? CreateBundleBox() : CreateSingleItemBox()}
        </s-section>
      ) : null}
    </s-page>
  );
}

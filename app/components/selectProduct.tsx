import { selectProduct } from "app/lib/api/shopify/api";
import { TProduct } from "app/lib/api/shopify/schema";
import { Dispatch, SetStateAction } from "react";

export function SelectProduct({
  selectedProduct,
  setSelectedProduct,
  routeToProductCreation,
}: {
  selectedProduct: TProduct;
  setSelectedProduct: Dispatch<SetStateAction<TProduct>>;
  routeToProductCreation: Function;
}) {
  return (
    <>
      <s-section>
        <s-grid
          gridTemplateColumns="repeat(2, 1fr)"
          gap="small"
          justifyContent="center"
        >
          <s-grid-item>
            <s-heading>Select or Create Mystery Box Product</s-heading>
            Choose an existing product to use as a mystery box or create a new
            one.
            <s-grid-item padding="base none none none">
              <s-stack direction="block" gap="base">
                <s-box padding="none large-100 none none">
                  <s-image
                    src={selectedProduct.image}
                    alt="Mystery Box"
                    sizes="200px"
                  />
                </s-box>
              </s-stack>
              <s-stack direction="inline" gap="base" padding="base none">
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
          </s-grid-item>
          {/*<s-grid-item>
            {selectedProduct && (
              <>
                <s-box padding="base" maxBlockSize="20px">
                  <s-heading>{selectedProduct.title}</s-heading>
                  <s-image src={selectedProduct.image} alt="Mystery Box" />
                </s-box>
              </>
            )}
          </s-grid-item>*/}
        </s-grid>
      </s-section>
    </>
  );
}

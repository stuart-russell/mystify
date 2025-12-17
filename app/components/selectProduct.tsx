import { selectProduct } from "app/lib/api/shopify/api";
import { TProduct } from "app/lib/api/shopify/schema";
import { Dispatch, SetStateAction, useEffect } from "react";
import { ProductCard } from "./productDisplayCard";
import { FetcherWithComponents } from "react-router";

export function SelectProduct({
  selectedProduct,
  setSelectedProduct,
  routeToProductCreation,
  productFetcher,
}: {
  selectedProduct: TProduct;
  setSelectedProduct: Dispatch<SetStateAction<TProduct>>;
  routeToProductCreation: () => Promise<string>;
  productFetcher: FetcherWithComponents<TProduct>;
}) {
  useEffect(() => {
    if (productFetcher.data) {
      setSelectedProduct(productFetcher.data);
    }
  }, [productFetcher.data]);

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
                  onClick={async () => {
                    const productId = await routeToProductCreation();
                    await productFetcher.submit(
                      { productId },
                      { method: "POST" },
                    );
                  }}
                  accessibilityLabel="Create a new product to use as a mystery box"
                >
                  Create Product
                </s-button>
              </s-stack>
            </s-grid-item>
          </s-grid-item>
          <s-grid-item>
            <ProductCard
              title={selectedProduct.title}
              description={selectedProduct.description}
              price={selectedProduct.price}
              image={selectedProduct.image}
            />
          </s-grid-item>
        </s-grid>
      </s-section>
    </>
  );
}

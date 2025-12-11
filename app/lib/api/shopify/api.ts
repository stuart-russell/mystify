import { Dispatch, SetStateAction } from "react";

export async function selectProduct(
  setSelectedProduct: Dispatch<SetStateAction<String | undefined>>,
) {
  const products = await window.shopify.resourcePicker({
    type: "product",
    action: "select", // customized action verb, either 'select' or 'add',
  });

  if (products) {
    const { id } = products[0];
    // const { images, id, variants, title, handle } = products[0];

    setSelectedProduct(id);
  }
}

import { Dispatch, SetStateAction } from "react";
import { TProduct } from "./schema";

export async function selectProduct(
  setSelectedProduct: Dispatch<SetStateAction<TProduct>>,
) {
  const products = await window.shopify.resourcePicker({
    type: "product",
    action: "select",
  });

  if (products) {
    const { images, title, descriptionHtml, variants } = products[0];
    const price = variants[0].price || "N/A";
    const image = images[0]
      ? images[0].originalSrc
      : "https://cdn.shopify.com/static/themes/horizon/placeholders/product-cube.png.png";
    setSelectedProduct({
      image,
      title,
      price,
      description: descriptionHtml.replace(/<[^>]*>/g, ""),
    });
  }
}

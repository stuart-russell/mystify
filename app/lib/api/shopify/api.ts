import { Dispatch, SetStateAction } from "react";
import { TProduct, TVariantSelection } from "./schema";

export async function selectProduct(
  setSelectedProduct: Dispatch<SetStateAction<TProduct>>,
) {
  const products = await window.shopify.resourcePicker({
    type: "product",
    action: "select",
  });
  if (products) {
    const { images, title, descriptionHtml, variants, totalInventory } =
      products[0];
    const price = variants[0].price || "N/A";
    const image = images[0]
      ? images[0].originalSrc
      : "https://cdn.shopify.com/static/themes/horizon/placeholders/product-cube.png.png";
    const inventory =
      variants.length === 1 ? variants[0].inventoryQuantity : totalInventory;
    setSelectedProduct({
      image,
      title,
      price,
      description: descriptionHtml.replace(/<[^>]*>/g, ""),
      inventory: inventory || 0,
    });
  }
}

export async function selectMultipleProducts(
  setSelectedVariants: Dispatch<SetStateAction<TVariantSelection>>,
) {
  const products = await window.shopify.resourcePicker({
    type: "product",
    action: "add",
    multiple: true,
  });

  console.log(products);

  let selectedVariants: TVariantSelection = [];

  if (products) {
    for (const product of products) {
      const { images, variants } = product;
      const productTitle = product.title;
      const image = images[0]
        ? images[0].originalSrc
        : "https://cdn.shopify.com/static/themes/horizon/placeholders/product-cube.png.png";

      for (const variant of variants) {
        const { title, id, inventoryQuantity } = variant;
        let finalTitle = title;
        if (title == "Default Title") {
          finalTitle = productTitle;
        } else {
          finalTitle = `${productTitle} - ${title}`;
        }
        selectedVariants.push({
          itemName: finalTitle || "Title Missing",
          image,
          variantId: id as string,
          inventory: inventoryQuantity || 0,
        });
      }
      setSelectedVariants(selectedVariants!);
    }
  }
}

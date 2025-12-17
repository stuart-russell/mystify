export function ProductCard({
  title,
  description,
  price,
  image,
}: {
  title: string;
  description: string;
  price: string;
  image: string;
}) {
  return (
    <>
      <s-box padding="base" border="base" borderRadius="base">
        <s-stack gap="base">
          <s-image
            src={
              image ||
              "https://cdn.shopify.com/static/themes/horizon/placeholders/product-cube.png.png"
            }
            alt={title || "Product Image"}
            aspectRatio="4/3"
            borderRadius="base"
            objectFit="cover"
          />
          <s-stack gap="small">
            <s-stack
              direction="inline"
              gap="small"
              justifyContent="space-between"
              alignItems="center"
            >
              <s-heading>{title || "Mystery Box Product Title"}</s-heading>
            </s-stack>
            <s-paragraph color="subdued">
              {description.length > 200
                ? `${description.substring(0, 200)}...`
                : description ||
                  "This is a brief description of the product inside the mystery box. It gives an overview of what to expect."}
            </s-paragraph>
          </s-stack>
          <s-divider />
          <s-text type="strong">{price}</s-text>
        </s-stack>
      </s-box>
    </>
  );
}

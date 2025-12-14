export function ProductCard({
  title,
  description,
  image,
}: {
  title: string;
  description: string;
  image: string;
}) {
  return (
    <>
      <s-box
        padding="base"
        // background="surface"
        border="base"
        borderRadius="base"
        // maxInlineSize="300px"
      >
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
              {description ||
                "This is a brief description of the product inside the mystery box. It gives an overview of what to expect."}
            </s-paragraph>
          </s-stack>
        </s-stack>
      </s-box>
    </>
  );
}

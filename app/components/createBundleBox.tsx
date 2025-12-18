import { selectMultipleProducts } from "app/lib/api/shopify/api";
import { TVariantSelection } from "app/lib/api/shopify/schema";
import { useState } from "react";
import { ColorPicker } from "antd";

export function CreateBundleBox() {
  const [mysteryItems, setMysteryItems] = useState<TVariantSelection>([]);

  return (
    <>
      <s-stack>
        <s-table>
          <s-table-header-row>
            <s-table-header></s-table-header>
            <s-table-header>Item</s-table-header>
            <s-table-header>Chance</s-table-header>
            <s-table-header>Colour</s-table-header>
            <s-table-header></s-table-header>
          </s-table-header-row>
          <s-table-body>
            {mysteryItems.map((item, idx) => (
              <s-table-row key={idx}>
                <s-table-cell>
                  <s-box
                    // padding="base"
                    border="base"
                    borderRadius="base"
                    maxInlineSize="30px"
                  >
                    <s-stack gap="base">
                      <s-image
                        src={item.image}
                        alt={item.itemName}
                        aspectRatio="1/1"
                        borderRadius="base"
                        objectFit="cover"
                      />
                    </s-stack>
                  </s-box>
                </s-table-cell>
                <s-table-cell>
                  {item.itemName.length > 30
                    ? `${item.itemName.substring(0, 30)}...`
                    : item.itemName}
                </s-table-cell>
                <s-table-cell>
                  <s-box maxInlineSize="70px">
                    <s-number-field
                      placeholder="0"
                      step={1}
                      min={0}
                      max={100}
                      suffix={"%"}
                    />
                  </s-box>
                </s-table-cell>
                <s-table-cell>
                  <s-box maxInlineSize="32px">
                    <ColorPicker defaultValue="#000000" disabledAlpha />
                  </s-box>
                </s-table-cell>
                <s-table-cell>
                  <s-button
                    variant="tertiary"
                    icon="x"
                    onClick={(_) => {
                      const updatedItems = mysteryItems.filter(
                        (_, index) => index !== idx,
                      );
                      setMysteryItems(updatedItems);
                    }}
                    accessibilityLabel="Remove item from mystery box"
                  ></s-button>
                </s-table-cell>
              </s-table-row>
            ))}
          </s-table-body>
        </s-table>
        <s-box padding="base none">
          <s-button
            onClick={(_) => {
              selectMultipleProducts(setMysteryItems);
            }}
            accessibilityLabel="Select the product to use as a mystery box"
          >
            Select Products
          </s-button>
        </s-box>
      </s-stack>
    </>
  );
}

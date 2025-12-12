import { TBoxType } from "app/lib/api/mysify/schema";
import { Package, Shuffle } from "lucide-react";

export function SelectBoxType({
  selectedType,
  handleTypeSelection,
}: {
  selectedType: TBoxType | undefined;
  handleTypeSelection: (type: TBoxType) => void;
}) {
  return (
    <>
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
    </>
  );
}

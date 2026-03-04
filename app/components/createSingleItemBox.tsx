import { ColorPicker } from "antd";
import { TSingleItemBoxConfig } from "app/lib/api/mystify/schema";
import { selectMultipleProducts } from "app/lib/api/shopify/api";
import { TVariantSelection } from "app/lib/api/shopify/schema";
import { useState, useEffect, useMemo } from "react";

type TInitialSingleItem = TVariantSelection[number] & {
  chance: number;
  color: string;
};

const toVariantSelection = (item: TInitialSingleItem): TVariantSelection[number] => ({
  variantId: item.variantId,
  itemName: item.itemName,
  image: item.image,
  inventory: item.inventory,
});

export function CreateSingleItemBox({
  onValidationChange,
  onConfigChange,
  initialItems,
}: {
  onValidationChange?: (isValid: boolean) => void;
  onConfigChange?: (config: TSingleItemBoxConfig) => void;
  initialItems?: TInitialSingleItem[];
}) {
  const [mysteryItems, setMysteryItems] = useState<TVariantSelection>(
    initialItems?.map(toVariantSelection) ?? [],
  );
  const [chanceValues, setChanceValues] = useState<number[]>(
    initialItems?.map((item) => item.chance) ?? [],
  );
  const [colorValues, setColorValues] = useState<string[]>(
    initialItems?.map((item) => item.color) ?? [],
  );

  useEffect(() => {
    if (!initialItems) return;
    setMysteryItems(initialItems.map(toVariantSelection));
    setChanceValues(initialItems.map((item) => item.chance));
    setColorValues(initialItems.map((item) => item.color));
  }, [initialItems]);

  // Calculate total chance
  const totalChance = useMemo(() => {
    return chanceValues.reduce((sum, val) => sum + (val || 0), 0);
  }, [chanceValues]);

  // Check if colors are unique per chance value
  const hasUniqueColorsPerChance = useMemo(() => {
    if (mysteryItems.length === 0) return false;
    
    // Group items by chance value
    const chanceGroups = new Map<number, string[]>();
    chanceValues.forEach((chance, idx) => {
      if (!chanceGroups.has(chance)) {
        chanceGroups.set(chance, []);
      }
      chanceGroups.get(chance)!.push(colorValues[idx] || "#000000");
    });

    // Check if all items with same chance have same color
    for (const colors of chanceGroups.values()) {
      const uniqueColors = new Set(colors);
      if (uniqueColors.size > 1) {
        return false;
      }
    }
    return true;
  }, [chanceValues, colorValues, mysteryItems.length]);

  // Validate form
  const isValid = useMemo(() => {
    return (
      mysteryItems.length > 0 &&
      totalChance === 100 &&
      hasUniqueColorsPerChance
    );
  }, [mysteryItems.length, totalChance, hasUniqueColorsPerChance]);

  // Notify parent of validation changes
  useEffect(() => {
    onValidationChange?.(isValid);
  }, [isValid, onValidationChange]);

  useEffect(() => {
    onConfigChange?.({
      items: mysteryItems.map((item, idx) => ({
        variantId: item.variantId,
        itemName: item.itemName,
        chance: chanceValues[idx] || 0,
        color: colorValues[idx] || "#000000",
      })),
    });
  }, [mysteryItems, chanceValues, colorValues, onConfigChange]);

  // Generate random hex color
  const generateRandomColor = (): string => {
    return `#${Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0')}`;
  };

  // Randomly assign colors based on chance values
  const assignRandomColors = () => {
    // Create a map of unique chance values to colors
    const uniqueChances = [...new Set(chanceValues)];
    const chanceToColor = new Map<number, string>();
    
    uniqueChances.forEach((chance) => {
      chanceToColor.set(chance, generateRandomColor());
    });

    // Assign colors based on chance values
    const newColors = chanceValues.map((chance) => chanceToColor.get(chance) || "#000000");
    setColorValues(newColors);
  };

  // Update arrays when items change - preserve existing values, only initialize new items
  useEffect(() => {
    const newLength = mysteryItems.length;

    setChanceValues((prev) => {
      const currentLength = prev.length;
      if (newLength > currentLength) {
        // Items were added - preserve existing values and add defaults for new items
        const newValues = [...prev];
        for (let i = currentLength; i < newLength; i++) {
          newValues.push(0);
        }
        return newValues;
      } else if (newLength < currentLength) {
        // Items were removed - trim array to match
        return prev.slice(0, newLength);
      } else if (newLength === 0) {
        // All items removed - reset array
        return [];
      }
      // If lengths are equal and > 0, return unchanged (items might have been reordered or replaced)
      return prev;
    });

    setColorValues((prev) => {
      const currentLength = prev.length;
      if (newLength > currentLength) {
        // Items were added - preserve existing values and add defaults for new items
        const newValues = [...prev];
        for (let i = currentLength; i < newLength; i++) {
          newValues.push("#000000");
        }
        return newValues;
      } else if (newLength < currentLength) {
        // Items were removed - trim array to match
        return prev.slice(0, newLength);
      } else if (newLength === 0) {
        // All items removed - reset array
        return [];
      }
      // If lengths are equal and > 0, return unchanged (items might have been reordered or replaced)
      return prev;
    });
  }, [mysteryItems.length]);

  const handleChanceChange = (idx: number, value: number) => {
    const newChanceValues = [...chanceValues];
    newChanceValues[idx] = value || 0;
    setChanceValues(newChanceValues);
  };

  const handleColorChange = (idx: number, color: string) => {
    const newColorValues = [...colorValues];
    newColorValues[idx] = color;
    setColorValues(newColorValues);
  };

  return (
    <s-stack>
      <s-table>
        <s-table-header-row>
          <s-table-header></s-table-header>
          <s-table-header>Item</s-table-header>
          <s-table-header>Chance</s-table-header>
          <s-table-header>
            <s-stack direction="inline" gap="small" alignItems="center">
              <span>Colour</span>
              <s-button
                type="button"
                icon="paint-brush-flat"
                variant="tertiary"
                onClick={assignRandomColors}
                disabled={mysteryItems.length === 0}
                accessibilityLabel="Randomly assign colors to products"
              ></s-button>
            </s-stack>
          </s-table-header>
          <s-table-header></s-table-header>
        </s-table-header-row>
        <s-table-body>
          {mysteryItems.map((item, idx) => (
            <s-table-row key={idx}>
              <s-table-cell>
                <s-box border="base" borderRadius="base" maxInlineSize="30px">
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
                    value={chanceValues[idx]?.toString() || "0"}
                    onChange={(e) =>
                      handleChanceChange(
                        idx,
                        parseFloat(e.currentTarget.value) || 0,
                      )
                    }
                    placeholder="0"
                    step={1}
                    min={0}
                    max={100}
                    suffix={"%"}
                    error={
                      totalChance !== 100 && chanceValues[idx] !== undefined
                        ? ""
                        : undefined
                    }
                  />
                </s-box>
              </s-table-cell>
              <s-table-cell>
                <s-box maxInlineSize="32px">
                  <ColorPicker
                    value={colorValues[idx] || "#000000"}
                    onChange={(color, hex) =>
                      handleColorChange(idx, hex || colorValues[idx] || "#000000")
                    }
                    disabledAlpha
                  />
                </s-box>
              </s-table-cell>
              <s-table-cell>
                <s-button
                  type="button"
                  variant="tertiary"
                  icon="x"
                  onClick={() => {
                    const updatedItems = mysteryItems.filter(
                      (_, index) => index !== idx,
                    );
                    const updatedChances = chanceValues.filter(
                      (_, index) => index !== idx,
                    );
                    const updatedColors = colorValues.filter(
                      (_, index) => index !== idx,
                    );
                    setMysteryItems(updatedItems);
                    setChanceValues(updatedChances);
                    setColorValues(updatedColors);
                  }}
                  accessibilityLabel="Remove item from mystery box"
                ></s-button>
              </s-table-cell>
            </s-table-row>
          ))}
        </s-table-body>
      </s-table>
      {mysteryItems.length > 0 && (
        <s-box padding="base">
          <s-stack gap="small">
            <s-text
              tone={totalChance === 100 ? "success" : "critical"}
            >
              Total Chance: {totalChance}%{" "}
              {totalChance !== 100 &&
                `(${totalChance < 100 ? 100 - totalChance : totalChance - 100}% ${
                  totalChance < 100 ? "remaining" : "over"
                })`}
            </s-text>
            {totalChance !== 100 && mysteryItems.length > 0 && (
              <s-text tone="critical">
                Please ensure all chances add up to exactly 100%
              </s-text>
            )}
          </s-stack>
        </s-box>
      )}
      <s-box padding="base none">
        <s-button
          type="button"
          onClick={() => {
            selectMultipleProducts(setMysteryItems);
          }}
          accessibilityLabel="Select the product to use as a mystery box"
        >
          Select Products
        </s-button>
      </s-box>
    </s-stack>
  );
}

import { ColorPicker } from "antd";
import { TBundleBoxConfig } from "app/lib/api/mystify/schema";
import { selectMultipleProducts } from "app/lib/api/shopify/api";
import { TVariantSelection } from "app/lib/api/shopify/schema";
import { SetStateAction, useEffect, useMemo, useState } from "react";

type TBundleSetItem = TVariantSelection[number] & {
  chance: number;
  color: string;
};

type TBundleSet = {
  id: number;
  items: TBundleSetItem[];
};

function groupHasUniqueColorsPerChance(items: TBundleSetItem[]): boolean {
  if (items.length === 0) return false;

  const chanceGroups = new Map<number, string[]>();

  items.forEach((item) => {
    if (!chanceGroups.has(item.chance)) {
      chanceGroups.set(item.chance, []);
    }
    chanceGroups.get(item.chance)!.push(item.color || "#000000");
  });

  for (const colors of chanceGroups.values()) {
    if (new Set(colors).size > 1) return false;
  }

  return true;
}

export function CreateBundleBox({
  onValidationChange,
  onConfigChange,
}: {
  onValidationChange?: (isValid: boolean) => void;
  onConfigChange?: (config: TBundleBoxConfig) => void;
}) {
  const [bundleSets, setBundleSets] = useState<TBundleSet[]>([{ id: 1, items: [] }]);

  const setValidation = useMemo(() => {
    return bundleSets.map((set) => {
      const totalChance = set.items.reduce((sum, item) => sum + (item.chance || 0), 0);
      const hasUniqueColorsPerChance = groupHasUniqueColorsPerChance(set.items);
      const hasItems = set.items.length > 0;

      return {
        id: set.id,
        hasItems,
        totalChance,
        hasUniqueColorsPerChance,
        isValid: hasItems && totalChance === 100 && hasUniqueColorsPerChance,
      };
    });
  }, [bundleSets]);

  const isValid = useMemo(() => {
    return bundleSets.length > 0 && setValidation.every((set) => set.isValid);
  }, [bundleSets.length, setValidation]);

  useEffect(() => {
    onValidationChange?.(isValid);
  }, [isValid, onValidationChange]);

  useEffect(() => {
    onConfigChange?.({
      sets: bundleSets.map((set) => ({
        setId: set.id,
        items: set.items.map((item) => ({
          variantId: item.variantId,
          itemName: item.itemName,
          chance: item.chance,
          color: item.color || "#000000",
        })),
      })),
    });
  }, [bundleSets, onConfigChange]);

  const addSet = () => {
    setBundleSets((prev) => {
      const maxId = prev.reduce((max, set) => Math.max(max, set.id), 0);
      return [...prev, { id: maxId + 1, items: [] }];
    });
  };

  const removeSet = (id: number) => {
    setBundleSets((prev) => prev.filter((set) => set.id !== id));
  };

  const removeItemFromSet = (setId: number, itemIndex: number) => {
    setBundleSets((prev) =>
      prev.map((set) =>
        set.id === setId
          ? { ...set, items: set.items.filter((_, idx) => idx !== itemIndex) }
          : set,
      ),
    );
  };

  const updateItemChance = (setId: number, itemIndex: number, chance: number) => {
    setBundleSets((prev) =>
      prev.map((set) => {
        if (set.id !== setId) return set;
        return {
          ...set,
          items: set.items.map((item, idx) =>
            idx === itemIndex ? { ...item, chance: chance || 0 } : item,
          ),
        };
      }),
    );
  };

  const updateItemColor = (setId: number, itemIndex: number, color: string) => {
    setBundleSets((prev) =>
      prev.map((set) => {
        if (set.id !== setId) return set;
        return {
          ...set,
          items: set.items.map((item, idx) =>
            idx === itemIndex ? { ...item, color } : item,
          ),
        };
      }),
    );
  };

  const generateRandomColor = (): string => {
    return `#${Math.floor(Math.random() * 16777215)
      .toString(16)
      .padStart(6, "0")}`;
  };

  const assignRandomColorsForSet = (setId: number) => {
    setBundleSets((prev) =>
      prev.map((set) => {
        if (set.id !== setId) return set;

        const uniqueChances = [...new Set(set.items.map((item) => item.chance))];
        const chanceToColor = new Map<number, string>();

        uniqueChances.forEach((chance) => {
          chanceToColor.set(chance, generateRandomColor());
        });

        return {
          ...set,
          items: set.items.map((item) => ({
            ...item,
            color: chanceToColor.get(item.chance) || "#000000",
          })),
        };
      }),
    );
  };

  const mapSelectionToSetItems = (
    selection: TVariantSelection,
    previousItems: TBundleSetItem[],
  ): TBundleSetItem[] => {
    const previousByVariantId = new Map(
      previousItems.map((item) => [item.variantId, item]),
    );

    return selection.map((selected) => {
      const previous = previousByVariantId.get(selected.variantId);
      return {
        ...selected,
        chance: previous?.chance ?? 0,
        color: previous?.color ?? "#000000",
      };
    });
  };

  const selectProductsForSet = (setId: number) => {
    selectMultipleProducts((next: SetStateAction<TVariantSelection>) => {
      setBundleSets((prev) =>
        prev.map((set) => {
          if (set.id !== setId) return set;

          const currentSelection: TVariantSelection = set.items.map((item) => ({
            variantId: item.variantId,
            itemName: item.itemName,
            image: item.image,
            inventory: item.inventory,
          }));

          const resolvedSelection =
            typeof next === "function" ? next(currentSelection) : next;

          return {
            ...set,
            items: mapSelectionToSetItems(resolvedSelection, set.items),
          };
        }),
      );
    });
  };

  return (
    <s-stack gap="large">
      <s-stack direction="inline" justifyContent="space-between" alignItems="center">
        <s-text>Bundle Sets</s-text>
        <s-button
          type="button"
          variant="secondary"
          onClick={addSet}
          accessibilityLabel="Add a new bundle set"
        >
          Add Set
        </s-button>
      </s-stack>

      {bundleSets.map((set, setIdx) => {
        const validation = setValidation.find((entry) => entry.id === set.id);
        const totalChance = validation?.totalChance ?? 0;
        const hasItems = validation?.hasItems ?? false;
        const hasUniqueColorsPerChance = validation?.hasUniqueColorsPerChance ?? false;

        return (
          <s-box key={set.id} border="base" borderRadius="base" padding="base">
            <s-stack gap="base">
              <s-stack
                direction="inline"
                justifyContent="space-between"
                alignItems="center"
              >
                <s-stack gap="small">
                  <s-heading>Set {setIdx + 1}</s-heading>
                  <s-text tone={hasItems && totalChance === 100 ? "success" : "neutral"}>
                    {set.items.length} {set.items.length === 1 ? "item" : "items"} •{" "}
                    {totalChance}%
                  </s-text>
                </s-stack>
                <s-stack direction="inline" gap="small">
                  <s-button
                    type="button"
                    variant="tertiary"
                    icon="paint-brush-flat"
                    onClick={() => assignRandomColorsForSet(set.id)}
                    disabled={set.items.length === 0}
                    accessibilityLabel={`Randomly assign colors for set ${setIdx + 1}`}
                  ></s-button>
                  <s-button
                    type="button"
                    variant="secondary"
                    onClick={() => selectProductsForSet(set.id)}
                    accessibilityLabel={`Select products for set ${setIdx + 1}`}
                  >
                    {set.items.length > 0 ? "Edit Products" : "Select Products"}
                  </s-button>
                  <s-button
                    type="button"
                    variant="tertiary"
                    icon="x"
                    onClick={() => removeSet(set.id)}
                    disabled={bundleSets.length === 1}
                    accessibilityLabel={`Remove set ${setIdx + 1}`}
                  ></s-button>
                </s-stack>
              </s-stack>

              <s-table>
                <s-table-header-row>
                  <s-table-header></s-table-header>
                  <s-table-header>Item</s-table-header>
                  <s-table-header>Chance</s-table-header>
                  <s-table-header>Colour</s-table-header>
                  <s-table-header></s-table-header>
                </s-table-header-row>
                <s-table-body>
                  {set.items.map((item, itemIdx) => (
                    <s-table-row key={`${set.id}-${item.variantId}-${itemIdx}`}>
                      <s-table-cell>
                        <s-box border="base" borderRadius="base" maxInlineSize="30px">
                          <s-image
                            src={item.image}
                            alt={item.itemName}
                            aspectRatio="1/1"
                            borderRadius="base"
                            objectFit="cover"
                          />
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
                            value={item.chance.toString()}
                            onChange={(e) =>
                              updateItemChance(
                                set.id,
                                itemIdx,
                                parseFloat(e.currentTarget.value) || 0,
                              )
                            }
                            placeholder="0"
                            step={1}
                            min={0}
                            max={100}
                            suffix="%"
                            error={totalChance !== 100 ? "" : undefined}
                          />
                        </s-box>
                      </s-table-cell>
                      <s-table-cell>
                        <s-box maxInlineSize="32px">
                          <ColorPicker
                            value={item.color || "#000000"}
                            onChange={(_color, hex) =>
                              updateItemColor(
                                set.id,
                                itemIdx,
                                hex || item.color || "#000000",
                              )
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
                          onClick={() => removeItemFromSet(set.id, itemIdx)}
                          accessibilityLabel={`Remove item ${item.itemName} from set ${setIdx + 1}`}
                        ></s-button>
                      </s-table-cell>
                    </s-table-row>
                  ))}
                </s-table-body>
              </s-table>

              <s-stack gap="small">
                {!hasItems && (
                  <s-text tone="critical">
                    Set {setIdx + 1} must include at least one product.
                  </s-text>
                )}
                {hasItems && (
                  <s-text tone={totalChance === 100 ? "success" : "critical"}>
                    Set {setIdx + 1} Total Chance: {totalChance}%{" "}
                    {totalChance !== 100 &&
                      `(${totalChance < 100 ? 100 - totalChance : totalChance - 100}% ${
                        totalChance < 100 ? "remaining" : "over"
                      })`}
                  </s-text>
                )}
                {hasItems && totalChance !== 100 && (
                  <s-text tone="critical">
                    Please ensure this set's item chances add up to exactly 100%
                  </s-text>
                )}
                {hasItems && !hasUniqueColorsPerChance && (
                  <s-text tone="critical">
                    Items with the same chance in this set must share the same colour.
                  </s-text>
                )}
              </s-stack>
            </s-stack>
          </s-box>
        );
      })}
    </s-stack>
  );
}

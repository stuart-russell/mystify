import { z } from "zod";

const zBoxType = z.enum(["bundle", "item"]);
const zCreateBoxStatus = z.enum(["draft", "active", "inactive"]);
const zHexColor = z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Invalid hex color");

const zBoxItem = z.object({
  variantId: z.string().min(1),
  itemName: z.string().min(1),
  chance: z.number().min(0).max(100),
  color: zHexColor,
});

const hasUniqueColorsPerChance = (items: Array<{ chance: number; color: string }>) => {
  const chanceGroups = new Map<number, string[]>();
  items.forEach((item) => {
    if (!chanceGroups.has(item.chance)) {
      chanceGroups.set(item.chance, []);
    }
    chanceGroups.get(item.chance)!.push(item.color);
  });

  for (const colors of chanceGroups.values()) {
    if (new Set(colors).size > 1) return false;
  }

  return true;
};

const validateChanceAndColorRules = (
  items: Array<{ chance: number; color: string }>,
  ctx: z.RefinementCtx,
) => {
  const totalChance = items.reduce((sum, item) => sum + item.chance, 0);
  if (totalChance !== 100) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Item chances must add up to 100",
    });
  }

  if (!hasUniqueColorsPerChance(items)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Items with the same chance must share the same color",
    });
  }
};

const zSingleItemBoxConfig = z
  .object({
    items: z.array(zBoxItem).min(1),
  })
  .superRefine((value, ctx) => {
    validateChanceAndColorRules(value.items, ctx);
  });

const zBundleSet = z
  .object({
    setId: z.number().int().positive(),
    items: z.array(zBoxItem).min(1),
  })
  .superRefine((value, ctx) => {
    validateChanceAndColorRules(value.items, ctx);
  });

const zBundleBoxConfig = z.object({
  sets: z.array(zBundleSet).min(1),
});

const zCreateItemBoxPostPayload = z.object({
  boxType: z.literal("item"),
  productId: z.string().min(1),
  productTitle: z.string().min(1),
  boxStatus: zCreateBoxStatus,
  smartStockManagement: z.boolean(),
  config: zSingleItemBoxConfig,
});

const zCreateBundleBoxPostPayload = z.object({
  boxType: z.literal("bundle"),
  productId: z.string().min(1),
  productTitle: z.string().min(1),
  boxStatus: zCreateBoxStatus,
  smartStockManagement: z.boolean(),
  preventDuplicateBundleSelections: z.boolean(),
  config: zBundleBoxConfig,
});

export const zCreateBoxPostPayload = z.discriminatedUnion("boxType", [
  zCreateItemBoxPostPayload,
  zCreateBundleBoxPostPayload,
]);

const zBoxTable = z.object({
  imageUrl: z.string().url().optional(),
  boxName: z.string().min(1),
  type: zBoxType,
  status: z.enum(["active", "expired", "inactive", "draft"]),
  amount: z.number().min(1),
});

export const safeParseCreateBoxPostPayload = (payload: unknown) =>
  zCreateBoxPostPayload.safeParse(payload);

export type TBoxTable = z.infer<typeof zBoxTable>;
export type TBoxType = z.infer<typeof zBoxType>;
export type TCreateBoxStatus = z.infer<typeof zCreateBoxStatus>;
export type TSingleItemBoxConfig = z.infer<typeof zSingleItemBoxConfig>;
export type TBundleBoxConfig = z.infer<typeof zBundleBoxConfig>;
export type TCreateBoxPostPayload = z.infer<typeof zCreateBoxPostPayload>;

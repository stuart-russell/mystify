import { z } from "zod";

const zProduct = z.object({
  image: z.string(),
  title: z.string(),
  price: z.string(),
  description: z.string(),
  inventory: z.number(),
});

export const zVariantSelection = z
  .object({
    itemName: z.string(),
    image: z.string(),
    inventory: z.number(),
    variantId: z.string(),
  })
  .array();

export type TProduct = z.infer<typeof zProduct>;
export type TVariantSelection = z.infer<typeof zVariantSelection>;

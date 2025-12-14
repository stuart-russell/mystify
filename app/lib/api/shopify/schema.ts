import { z } from "zod";

const zProduct = z.object({
  image: z.string(),
  title: z.string(),
  description: z.string(),
});

export type TProduct = z.infer<typeof zProduct>;

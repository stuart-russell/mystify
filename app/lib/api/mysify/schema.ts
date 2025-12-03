import { z } from "zod";

const zBoxType = z.enum(["bundle", "item"]);

const zBoxTable = z.object({
  boxName: z.string().min(1),
  type: zBoxType,
  status: z.enum(["active", "expired", "inactive", "draft"]),
  amount: z.number().min(1),
});

export type TBoxTable = z.infer<typeof zBoxTable>;
export type TBoxType = z.infer<typeof zBoxType>;

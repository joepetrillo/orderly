import z from "zod";

export const coursePOST = {
  body: z.object({
    name: z.string().min(5).max(255),
  }),
};

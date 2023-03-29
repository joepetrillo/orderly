import z from "zod";

export const coursePOST = {
  body: z.object({
    name: z.string().min(5).max(255),
  }),
};

export const courseEnrollPOST = {
  body: z.object({
    code: z
      .string()
      .length(7)
      .regex(/^[A-Z0-9]{7}$/),
  }),
};

import z from "zod";

export const courseGET = {
  params: z.object({
    course_id: z.coerce
      .number()
      .int()
      .positive()
      .finite()
      .safe()
      .transform(Number),
  }),
};

export const coursePOST = {
  body: z.object({
    name: z
      .string()
      .min(5, "Must contain at least 5 characters")
      .max(255, "Must contain at most 255 characters"),
  }),
};

export const courseEnrollPOST = {
  body: z.object({
    code: z
      .string()
      .length(7, "Must contain exactly 7 characters")
      .regex(
        /^[A-Z0-9]{7}$/,
        "Valid codes only contain uppercase letters and numbers"
      ),
  }),
};

export const updateRolePATCH = {
  body: z.object({
    course_id: z.number(),
    user_id: z.string(),
    role: z.number().min(0).max(1),
  }),
};

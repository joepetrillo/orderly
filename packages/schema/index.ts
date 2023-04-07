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

import z from "zod";

const valid_course_id = z.coerce
  .number()
  .int()
  .positive()
  .finite()
  .safe()
  .transform(Number);

// just for checking course_id
export const coursePARAM = {
  params: z.object({
    course_id: valid_course_id,
  }),
};

// creating a new course
export const createCoursePOST = {
  body: z.object({
    name: z
      .string()
      .min(5, "Must contain at least 5 characters")
      .max(255, "Must contain at most 255 characters"),
  }),
};

// joining a course
export const joinCoursePOST = {
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

// leaving (or kicking a user from) a course
export const kickUserDELETE = {
  params: z.object({
    course_id: valid_course_id,
    user_id: z.string(),
  }),
};

// update user role to 0 or 1
export const updateRolePATCH = {
  params: z.object({
    course_id: valid_course_id,
    user_id: z.string(),
  }),
  body: z.object({
    role: z.literal(0).or(z.literal(1)),
  }),
};

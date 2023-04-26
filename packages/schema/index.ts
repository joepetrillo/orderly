import z from "zod";

const valid_id_type = z.coerce
  .number()
  .int()
  .positive()
  .finite()
  .safe()
  .transform(Number);

// just for checking course_id
export const coursePARAM = {
  params: z.object({
    course_id: valid_id_type,
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
    course_id: valid_id_type,
    user_id: z.string(),
  }),
};

// update user role to 0 or 1
export const updateRolePATCH = {
  params: z.object({
    course_id: valid_id_type,
    user_id: z.string(),
  }),
  body: z.object({
    role: z.literal(0).or(z.literal(1)),
  }),
};

export const enqueueMeetingPOST = {
  params: z.object({
    course_id: valid_id_type,
    meeting_id: valid_id_type,
  }),
};
export const meetingPOST = {
  body: z.object({
    course_id: z.number(),
    day: z
      .literal(0)
      .or(z.literal(1))
      .or(z.literal(2))
      .or(z.literal(3))
      .or(z.literal(4))
      .or(z.literal(5))
      .or(z.literal(6)),
    start_time: z.string().datetime(),
    end_time: z.string().datetime(),
    link: z.string().url(),
  }),
};

export const meetingPATCH = {
  body: z.object({
    id: z.number(),
    course_id: z.number().optional(),
    day: z
      .literal(0)
      .or(z.literal(1))
      .or(z.literal(2))
      .or(z.literal(3))
      .or(z.literal(4))
      .or(z.literal(5))
      .or(z.literal(6))
      .optional(),
    start_time: z.string().datetime().optional(),
    end_time: z.string().datetime().optional(),
    link: z.string().url().optional(),
  }),
};

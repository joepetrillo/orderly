import z from "zod";

const valid_id_type = z.coerce
  .number()
  .int()
  .positive()
  .finite()
  .safe()
  .transform(Number);

const valid_time = z
  .string()
  .regex(/^(?:[01]\d|2[0-3]):[0-5]\d$/, "Invalid time format");

// just for checking course_id
export const coursePARAM = {
  params: z.object({
    course_id: valid_id_type,
  }),
};

// check meeting paramters
export const courseAndMeetingPARAM = {
  params: z.object({
    meeting_id: valid_id_type,
    course_id: valid_id_type,
  }),
};

// creating a new course
export const createCoursePOST = {
  body: z.object({
    name: z
      .string()
      .min(5, "Must contain at least 5 characters")
      .max(100, "Must contain at most 100 characters"),
  }),
};

export const updateCourseNamePATCH = {
  params: z.object({
    course_id: valid_id_type,
  }),
  body: z.object({
    name: z
      .string()
      .min(5, "Must contain at least 5 characters")
      .max(100, "Must contain at most 100 characters"),
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

export const removeMeetingDELETE = {
  params: z.object({
    course_id: valid_id_type,
    meeting_id: valid_id_type,
    user_id: z.string(),
  }),
};

export const createMeetingPOST = {
  params: z.object({
    course_id: valid_id_type,
  }),
  body: z.object({
    day: z
      .literal("Mondays")
      .or(z.literal("Tuesdays"))
      .or(z.literal("Wednesdays"))
      .or(z.literal("Thursdays"))
      .or(z.literal("Fridays")),
    start_time: valid_time,
    end_time: valid_time,
    link: z.string().url(),
  }),
};

export const updateMeetingPATCH = {
  params: z.object({
    course_id: valid_id_type,
    meeting_id: valid_id_type,
  }),
  body: z.object({
    day: z
      .literal("Mondays")
      .or(z.literal("Tuesdays"))
      .or(z.literal("Wednesdays"))
      .or(z.literal("Thursdays"))
      .or(z.literal("Fridays"))
      .optional(),
    start_time: valid_time.optional(),
    end_time: valid_time.optional(),
    link: z.string().url().optional(),
  }),
};

type CourseBase = {
  id: number;
  name: string;
  owner_name: string;
  member_count: number;
};

export type CourseData =
  | (CourseBase & { code: string; role: 1 | 2 })
  | (CourseBase & { role: 0 });

export type Member = {
  id: string;
  profileImageUrl: string;
  name: string;
  emailAddress: string;
  role: 0 | 1;
};

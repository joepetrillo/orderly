import express from "express";
import { prisma } from "../prisma/init";
import { processRequest, validateRequest } from "zod-express-middleware";
import { coursePARAM, createCoursePOST, joinCoursePOST } from "@orderly/schema";
import clerkClient from "@clerk/clerk-sdk-node";
import members from "./members";

const router = express.Router();

router.use("/:course_id/members", members);

// get general details about all courses enrolled in
router.get("/", async (req, res) => {
  type CourseGeneral = {
    id: number;
    name: string;
    code: string;
    role: 0 | 1 | 2;
    owner_name: string;
    member_count: number;
  };

  const allCourses: CourseGeneral[] = [];

  try {
    // get all of the courses the person making this request are a part of (owner, instructor, or student)
    const courses = await prisma.enrolled.findMany({
      where: {
        user_id: req.auth.userId,
      },
      include: {
        course: {
          include: {
            _count: {
              select: {
                Enrolled: true,
              },
            },
          },
        },
      },
    });

    // if not enrolled in any courses, return empty array
    if (courses.length === 0) return res.status(200).json(allCourses);

    // get owner user objects from clerk
    const userId = courses.map((curr) => curr.course.owner_id);
    const owners = await clerkClient.users.getUserList({ userId });

    for (const curr of courses) {
      const owner = owners.find((user) => user.id === curr.course.owner_id);
      if (!owner) throw new Error("The owner of a course was not found");

      const course = {
        id: curr.course.id,
        name: curr.course.name,
        code: curr.course.code,
        role: curr.role as 0 | 1 | 2,
        owner_name: `${owner.firstName} ${owner.lastName}`,
        member_count: curr.course._count.Enrolled,
      };

      allCourses.push(course);
    }

    res.status(200).json(allCourses);
  } catch (error) {
    res
      .status(500)
      .json({ error: "Something went wrong while fetching course data" });
  }
});

// get all specific course details for an exact course
router.get("/:course_id", processRequest(coursePARAM), async (req, res) => {
  type CourseData = {
    id: number;
    name: string;
    code: string;
    role: 0 | 1 | 2;
    meetings: {
      id: number;
      owner_id: string;
      day: 0 | 1 | 2 | 3 | 4 | 5 | 6;
      start_time: Date;
      end_time: Date;
    }[];
    enrolled: {
      user_id: string;
      role: number;
    }[];
  };

  const { course_id } = req.params;

  try {
    // first check if the course with the given course id exists
    const course = await prisma.course.findFirst({
      where: {
        id: course_id,
      },
      include: {
        Enrolled: {
          where: {
            user_id: req.auth.userId,
            course_id: course_id,
          },
        },
        Meeting: true,
      },
    });

    // course does not exist
    if (course === null) {
      return res.status(404).json({ error: "This course does not exist" });
    }

    // requester is not enrolled in the course
    if (course.Enrolled.length === 0) {
      return res
        .status(403)
        .json({ error: "You are not enrolled in this course" });
    }

    const response: CourseData = {
      id: course.id,
      name: course.name,
      code: course.code,
      role: course.Enrolled[0].role as 0 | 1 | 2,
      meetings: course.Meeting.map((meeting) => {
        return {
          id: meeting.id,
          owner_id: meeting.owner_id,
          day: meeting.day as 0 | 1 | 2 | 3 | 4 | 5 | 6,
          start_time: meeting.start_time,
          end_time: meeting.end_time,
        };
      }),
      enrolled: course.Enrolled.map((enrollment) => {
        return {
          user_id: enrollment.user_id,
          role: enrollment.role,
        };
      }),
    };

    // if they are an instructor of the course, include ALL of the enrolled data in response
    if (course.Enrolled[0].role === 2 || course.Enrolled[0].role === 1) {
      const allEnrolled = await prisma.enrolled.findMany({
        where: {
          course_id: course_id,
        },
      });
      response.enrolled = allEnrolled.map((enrollment) => {
        return {
          user_id: enrollment.user_id,
          role: enrollment.role,
        };
      });
    }

    res.status(200).json(response);
  } catch (error) {
    res
      .status(500)
      .json({ error: "Something went wrong while fetching course data" });
  }
});

// create new course
router.post("/", validateRequest(createCoursePOST), async (req, res) => {
  try {
    let entryCode: string;

    while (true) {
      // generate random entry code
      entryCode = Array.from(Array(7), () =>
        Math.floor(Math.random() * 36).toString(36)
      )
        .join("")
        .toUpperCase();

      // ensure the entry code is not already in use for another course
      const exists = await prisma.course.findUnique({
        where: {
          code: entryCode,
        },
      });

      // code is not already in use, will only reloop if we need to generate a new code
      if (exists === null) break;
    }

    const alreadyOwned = await prisma.enrolled.findMany({
      where: {
        user_id: req.auth.userId,
        role: 2,
      },
    });

    if (alreadyOwned.length >= 6) {
      return res
        .status(400)
        .json({ error: "You have reached the maximum of 6 courses owned" }); // TODO - probably change this to something else
    }

    // create the course and add creator of course to enrolled table with owner role (2)
    const course = await prisma.course.create({
      data: {
        owner_id: req.auth.userId,
        name: req.body.name,
        code: entryCode,
        Enrolled: {
          create: {
            user_id: req.auth.userId,
            role: 2,
          },
        },
      },
      include: {
        Enrolled: true,
      },
    });

    res.status(201).json(course);
  } catch (error) {
    res
      .status(500)
      .json({ error: "Something went wrong while creating a new course" });
  }
});

// enroll in a course
router.post("/enroll", validateRequest(joinCoursePOST), async (req, res) => {
  try {
    // check if code provided by client matches an existing course
    const course = await prisma.course.findUnique({
      where: {
        code: req.body.code,
      },
      include: {
        Enrolled: true,
      },
    });

    // if no course exists with the provided entry code
    if (course === null) {
      return res
        .status(404)
        .json({ error: "The entry code provided is invalid" });
    }

    const alreadyEnrolled = course.Enrolled.findIndex(
      (row) => row.user_id === req.auth.userId
    );

    if (alreadyEnrolled !== -1) {
      return res
        .status(400)
        .json({ error: "You are already enrolled in this course" });
    }

    // enroll user into the class as a student (role 0)
    const enrolled = await prisma.enrolled.create({
      data: {
        user_id: req.auth.userId,
        course_id: course.id,
        role: 0,
      },
    });

    res.status(201).json(enrolled);
  } catch (error) {
    res
      .status(500)
      .json({ error: "Something went wrong while enrolling in a course" });
  }
});

// delete a course
router.delete("/:course_id", processRequest(coursePARAM), async (req, res) => {
  const { course_id } = req.params;

  try {
    // first check if the course with the given course id exists
    const course = await prisma.course.findFirst({
      where: {
        id: course_id,
      },
    });

    // course does not exist
    if (course === null) {
      return res.status(404).json({ error: "This course does not exist" });
    }

    // requester is not the owner of the course, so they are not allowed to delete it (IMPORTANT!)
    if (course.owner_id !== req.auth.userId) {
      return res
        .status(403)
        .json({ error: "You do not have permission to delete this course" });
    }

    // delete the course (NO GOING BACK - WILL DELETE ALL DATA RELATED TO THIS COURSE)
    const deletedCourse = await prisma.course.delete({
      where: {
        id: course_id,
      },
    });

    res.status(200).json(deletedCourse);
  } catch (error) {
    res
      .status(500)
      .json({ error: "Something went wrong while deleting the course" });
  }
});

export default router;

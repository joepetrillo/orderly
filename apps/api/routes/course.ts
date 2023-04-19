import express from "express";
import { prisma } from "../prisma/init";
import { processRequest, validateRequest } from "zod-express-middleware";
import { coursePOST, courseEnrollPOST, courseGET } from "@orderly/schema";
import clerkClient from "@clerk/clerk-sdk-node";

const router = express.Router();

// get general details about all courses enrolled in
router.get("/", async (req, res) => {
  type CourseGeneral = {
    id: number;
    name: string;
    code: string;
    role: 0 | 1 | 2;
    owner_name: string;
    instructor_count: number;
    student_count: number;
  };

  const allCourses: CourseGeneral[] = [];

  try {
    // get all of the courses the person making this request are a part of (owner, host, or just enrolled in)
    const courses = await prisma.enrolled.findMany({
      where: {
        user_id: req.auth.userId,
      },
      include: {
        course: true,
      },
    });

    for (const curr of courses) {
      // get instructor id
      const creator = await prisma.enrolled.findFirst({
        select: {
          user_id: true,
        },
        where: {
          role: 2,
          course_id: curr.course.id,
        },
      });

      // get instructor count
      const instructor = await prisma.enrolled.aggregate({
        _count: true,
        where: {
          OR: [{ role: 1 }, { role: 2 }],
          course_id: curr.course.id,
        },
      });

      // get student count
      const student = await prisma.enrolled.aggregate({
        _count: true,
        where: {
          role: 0,
          course_id: curr.course.id,
        },
      });

      if (!creator) throw new Error("The owner of a course was not found");
      const owner = await clerkClient.users.getUser(creator.user_id);

      const course: CourseGeneral = {
        id: curr.course.id,
        name: curr.course.name,
        code: curr.course.code,
        role: curr.role as 0 | 1 | 2,
        owner_name: `${owner.firstName} ${owner.lastName}`,
        instructor_count: instructor._count,
        student_count: student._count,
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
router.get("/:course_id", processRequest(courseGET), async (req, res) => {
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

  try {
    const { course_id } = req.params;

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
router.post("/", validateRequest(coursePOST), async (req, res) => {
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
router.post("/enroll", validateRequest(courseEnrollPOST), async (req, res) => {
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

export default router;

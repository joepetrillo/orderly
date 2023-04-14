import express from "express";
import { prisma } from "../prisma/init";
import { processRequest, validateRequest } from "zod-express-middleware";
import { coursePOST, courseEnrollPOST, courseGET } from "@orderly/schema";
import { Prisma } from "@prisma/client";

const router = express.Router();

// get all courses enrolled in
router.get("/", async (req, res) => {
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

    res.status(200).json(courses);
  } catch (error) {
    res
      .status(500)
      .json({ error: "Something went wrong while fetching course data" });
  }
});

// get specific course details for exact course
router.get("/:course_id", processRequest(courseGET), async (req, res) => {
  try {
    const { course_id } = req.params;

    // first check if the course with the given course id exists
    const exists = await prisma.course.findFirst({
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
    if (exists === null) {
      return res.status(404).json({ error: "This course does not exist" });
    }

    // requester is not enrolled in the course
    if (exists.Enrolled.length === 0) {
      return res
        .status(403)
        .json({ error: "You are not enrolled in this course" });
    }

    type CourseData = {
      role: 0 | 1 | 2;
      course: Prisma.CourseGetPayload<{
        select: {
          id: true;
          name: true;
          code: true;
          Meeting: true;
        } & Prisma.CourseSelect;
      }>;
    };

    const response: CourseData = {
      role: exists.Enrolled[0].role as 0 | 1 | 2,
      course: {
        id: exists.id,
        name: exists.name,
        code: exists.code,
        Meeting: exists.Meeting,
      },
    };

    // if they are owner of course, include all of the enrolled data in response
    if (exists.Enrolled[0].role === 2 || exists.Enrolled[0].role === 1) {
      const allEnrolled = await prisma.enrolled.findMany({
        where: {
          course_id: course_id,
        },
      });
      response.course.Enrolled = allEnrolled;
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

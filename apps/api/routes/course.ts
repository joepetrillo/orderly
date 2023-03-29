import express from "express";
import { prisma } from "../prisma/init";
import { validateRequest } from "zod-express-middleware";
import { coursePOST, courseEnrollPOST } from "@orderly/schema";

const router = express.Router();

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

    // create the course and add creator of course to enrolled table with owner role (2)
    const course = await prisma.course.create({
      data: {
        name: req.body.name,
        code: entryCode,
        Enrolled: {
          create: {
            user_id: "userID999", // req.auth.userID
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
      (row) => row.user_id === "userID888"
    ); // req.auth.userID

    if (alreadyEnrolled !== -1) {
      return res
        .status(400)
        .json({ error: "You are already enrolled in this course" });
    }

    // enroll user into the class as a student (role 0)
    const enrolled = await prisma.enrolled.create({
      data: {
        user_id: "userID888", // req.auth.userID
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

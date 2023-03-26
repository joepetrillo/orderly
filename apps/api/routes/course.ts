import express from "express";
import { prisma } from "../prisma/init";
import { validateRequest } from "zod-express-middleware";
import { coursePOST } from "@orderly/schema";

const router = express.Router();

// create new course
router.post("/", validateRequest(coursePOST), async (req, res) => {
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

  // create the course
  const course = await prisma.course.create({
    data: {
      name: req.body.name,
      code: entryCode,
    },
  });

  // add creator of course to enrolled table with owner role (2)
  const enrolled = await prisma.enrolled.create({
    data: {
      user_id: req.auth.userId,
      course_id: course.id,
      role: 2,
    },
  });

  res.status(201).json(course);
});

export default router;

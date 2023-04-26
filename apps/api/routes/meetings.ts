import express from "express";
import { prisma } from "../prisma/init";
import { processRequest, validateRequest } from "zod-express-middleware";
import { enqueueMeetingPOST } from "@orderly/schema";
import clerkClient from "@clerk/clerk-sdk-node";
import members from "./members";

const router = express.Router({ mergeParams: true });

// enqueue in meeting
router.post("/:meeting_id", validateRequest(enqueueMeetingPost), async (req, res) => {
  
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

    // check if client is enrolled in the course
    const isEnrolled = course.Enrolled.findIndex(
      (row) => row.user_id === req.auth.userId
    );

    if (isEnrolled == -1) {
      return res
        .status(400)
        .json({ error: "You are not enrolled in this course" });
    }

    // must not be owner of meeting or course 
    // check if meeting and course exists
    


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

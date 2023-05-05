import express from "express";
import { prisma } from "../prisma/init";
import { processRequest, validateRequest } from "zod-express-middleware";
import {
  coursePARAM,
  createCoursePOST,
  joinCoursePOST,
  CourseData,
  updateCourseNamePATCH,
} from "@orderly/schema";
import clerkClient from "@clerk/clerk-sdk-node";
import members from "./members";
import meetings from "./meetings";

const router = express.Router();

router.use("/:course_id/members", members);
router.use("/:course_id/meetings", meetings);

/*  Gets the details of every course the requestor is enrolled in
    - Anyone can use this route
*/
router.get("/", async (req, res) => {
  const allCourses: CourseData[] = [];

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

      if (curr.role === 0) {
        const course: CourseData = {
          id: curr.course.id,
          name: curr.course.name,
          role: curr.role,
          owner_name: `${owner.firstName} ${owner.lastName}`,
          member_count: curr.course._count.Enrolled,
        };
        allCourses.push(course);
      } else if (curr.role === 1 || curr.role === 2) {
        const course: CourseData = {
          id: curr.course.id,
          name: curr.course.name,
          code: curr.course.code,
          role: curr.role,
          owner_name: `${owner.firstName} ${owner.lastName}`,
          member_count: curr.course._count.Enrolled,
        };
        allCourses.push(course);
      }
    }

    res.status(200).json(allCourses);
  } catch (error) {
    res
      .status(500)
      .json({ error: "Something went wrong while fetching course data" });
  }
});

/*  Gets the details of a specific course
    - Requestor must be enrolled in the course
*/
router.get("/:course_id", processRequest(coursePARAM), async (req, res) => {
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
          },
        },
        _count: {
          select: {
            Enrolled: true,
          },
        },
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

    const owner = await clerkClient.users.getUser(course.owner_id);
    let response: CourseData | null = null;

    if (course.Enrolled[0].role === 0) {
      response = {
        id: course.id,
        name: course.name,
        role: course.Enrolled[0].role,
        owner_name: `${owner.firstName} ${owner.lastName}`,
        member_count: course._count.Enrolled,
      };
    } else if (course.Enrolled[0].role === 1 || course.Enrolled[0].role === 2) {
      response = {
        id: course.id,
        name: course.name,
        code: course.code,
        role: course.Enrolled[0].role,
        owner_name: `${owner.firstName} ${owner.lastName}`,
        member_count: course._count.Enrolled,
      };
    }

    res.status(200).json(response);
  } catch (error) {
    res
      .status(500)
      .json({ error: "Something went wrong while fetching course data" });
  }
});

/*  Creates a new course
    - Anyone can use this route
    - Each user is limited to owning 6 courses
*/
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
        user_id: req.auth.userId, // req.auth.userId
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
    });

    res.status(201).json(course);
  } catch (error) {
    res
      .status(500)
      .json({ error: "Something went wrong while creating a new course" });
  }
});

/*  Enrolls user into a course that uses the code given
    - Anyone can use this route
*/
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

/*  Deletes a course and ALL related resources
    - Only the owner of the course can use this route
    - The deletion cascades to all meetings and queue positions (everything is lost)
*/
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

/*  Updates the name of a course
    - Only the owner of the course can use this route
*/
router.patch(
  "/:course_id/name",
  processRequest(updateCourseNamePATCH),
  async (req, res) => {
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

      // requester is not the owner of the course, so they are not allowed to update it
      if (course.owner_id !== req.auth.userId) {
        return res.status(403).json({
          error: "You do not have permission to update the name of this course",
        });
      }

      const updatedCourse = await prisma.course.update({
        where: {
          id: course_id,
        },
        data: {
          name: req.body.name,
        },
      });

      res.status(200).json(updatedCourse);
    } catch (error) {
      res
        .status(500)
        .json({ error: "Something went wrong while updating the course name" });
    }
  }
);

/*  Regenerates the entry code of a course
    - Only the owner of the course can use this route
    - Only the latest code generated is valid
*/
router.patch(
  "/:course_id/code",
  processRequest(coursePARAM),
  async (req, res) => {
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

      // requester is not the owner of the course, so they are not allowed to update it
      if (course.owner_id !== req.auth.userId) {
        return res.status(403).json({
          error:
            "You do not have permission to regenerate the entry code of this course",
        });
      }

      let newCode: string;

      while (true) {
        // generate random entry code
        newCode = Array.from(Array(7), () =>
          Math.floor(Math.random() * 36).toString(36)
        )
          .join("")
          .toUpperCase();

        // ensure the entry code is not already in use for another course
        const exists = await prisma.course.findUnique({
          where: {
            code: newCode,
          },
        });

        // code is not already in use, will only reloop if we need to generate a new code
        if (exists === null) break;
      }

      const updatedCourse = await prisma.course.update({
        where: {
          id: course_id,
        },
        data: {
          code: newCode,
        },
      });

      res.status(200).json(updatedCourse);
    } catch (error) {
      res
        .status(500)
        .json({ error: "Something went wrong while updating the course name" });
    }
  }
);

export default router;

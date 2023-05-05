import express from "express";
import { prisma } from "../prisma/init";
import { processRequest } from "zod-express-middleware";
import {
  coursePARAM,
  updateRolePATCH,
  kickUserDELETE,
  Member,
} from "@orderly/schema";
import clerkClient from "@clerk/clerk-sdk-node";

const router = express.Router({ mergeParams: true });

/*  Gets everyone enrolled in the course
    - Only the owner of the course has permission to use this route
    - The list of members returned does NOT include the owner
    - The order of the list puts members with instructor role first
*/
router.get("/", processRequest(coursePARAM), async (req, res) => {
  const { course_id } = req.params;

  try {
    // only the owner can view every user enrolled, so first check that they own the course
    const course = await prisma.course.findFirst({
      where: {
        id: course_id,
      },
      include: {
        Enrolled: {
          where: {
            OR: [{ role: 0 }, { role: 1 }],
          },
          orderBy: {
            role: "desc",
          },
        },
      },
    });

    // course does not exist
    if (course === null) {
      return res.status(404).json({
        error: "This course does not exist",
      });
    }

    // only owners can view this list
    if (course.owner_id !== req.auth.userId) {
      return res.status(400).json({
        error:
          "You do not have permission to view the users enrolled in this course",
      });
    }

    const userId = course.Enrolled.map((curr) => curr.user_id);
    if (userId.length === 0) return res.status(200).json(userId);

    const lookup: Record<string, Partial<Member>> = {};
    for (let i = 0; i < course.Enrolled.length; ++i) {
      const currUser = course.Enrolled[i];
      if (currUser.role === 0 || currUser.role === 1) {
        lookup[currUser.user_id] = {
          id: currUser.user_id,
          role: currUser.role,
        };
      }
    }

    const users = await clerkClient.users.getUserList({ userId });

    users.forEach((currUser) => {
      const existingEntry = lookup[currUser.id];
      existingEntry.name = `${currUser.firstName} ${currUser.lastName}`;
      existingEntry.profileImageUrl = currUser.profileImageUrl;
      existingEntry.emailAddress = currUser.emailAddresses.find(
        (email) => email.id === currUser.primaryEmailAddressId
      )?.emailAddress as string;
    });

    res.status(200).json(Object.values(lookup));
  } catch (error) {
    res.status(500).json({
      error: "Something went wrong while fetching members",
    });
  }
});

/*  Update the role of the user to 0 or 1 (student or instructor)
    - Only the owner of the course has permission to use this route
    - Only one course owner can exist, so we do not allow updating to role 2 (owner)
*/
router.patch("/:user_id", processRequest(updateRolePATCH), async (req, res) => {
  const { course_id, user_id } = req.params;

  try {
    // ensure that the person making the request is the owner of the course
    const course = await prisma.course.findFirst({
      where: {
        id: course_id,
      },
      include: {
        Enrolled: {
          where: {
            user_id: user_id,
            OR: [{ role: 0 }, { role: 1 }],
          },
        },
      },
    });

    // course does not exist
    if (course === null) {
      return res.status(404).json({
        error: "This course does not exist",
      });
    }

    // only owners can update roles
    if (course.owner_id !== req.auth.userId) {
      return res.status(403).json({
        error: "You do not have permission to update roles in this course",
      });
    }

    // user id being updated is not enrolled in course as instructor or student
    if (course.Enrolled.length !== 1) {
      return res.status(404).json({
        error:
          "The user you are trying to update is not enrolled in this course as an instructor or student",
      });
    }

    // update the role of the user
    const updatedUser = await prisma.enrolled.update({
      where: {
        user_id_course_id: {
          user_id: user_id,
          course_id: course_id,
        },
      },
      data: {
        role: req.body.role,
      },
    });

    res.status(200).json(updatedUser);
  } catch (error) {
    res.status(500).json({
      error: "Something went wrong while updating the role",
    });
  }
});

/*  Handles leaving a course (could be a user leaving on their own or the owner of a course kicking a user)
    - Only the owner of the course has permission to kick others
    - When the userid param matches the requestor userid, we know its a user trying to leave on their own
    - When the userid param does NOT match the requestor userid, we know a kick is being attempted
*/
router.delete("/:user_id", processRequest(kickUserDELETE), async (req, res) => {
  const { course_id, user_id } = req.params;

  try {
    // person making request is trying to leave on their own
    if (user_id === req.auth.userId) {
      // to allow this, requestor must be enrolled and requestor cannot be the owner
      // first check if course exists
      const course = await prisma.course.findFirst({
        where: {
          id: course_id,
        },
        include: {
          Enrolled: {
            where: {
              user_id: req.auth.userId,
              OR: [{ role: 0 }, { role: 1 }],
            },
          },
          Meeting: true,
        },
      });

      // course does not exist
      if (course === null) {
        return res.status(404).json({
          error: "This course does not exist",
        });
      }

      // owners cannot leave their own courses
      if (course.owner_id === req.auth.userId) {
        return res.status(400).json({
          error: "You cannot leave your own course",
        });
      }

      // length should be 1 if this user is actually enrolled
      if (course.Enrolled.length !== 1) {
        return res.status(400).json({
          error:
            "You are not enrolled in this course as an instructor or student",
        });
      }

      // delete self from course
      const deletedUser = await prisma.enrolled.delete({
        where: {
          user_id_course_id: {
            user_id: req.auth.userId,
            course_id: course_id,
          },
        },
      });

      // delete all meetings you may have owned
      await prisma.meeting.deleteMany({
        where: {
          course_id: course_id,
          owner_id: deletedUser.user_id,
        },
      });

      // delete any queue positions you may have held in meetings that were not your own
      await prisma.queue.deleteMany({
        where: {
          user_id: deletedUser.user_id,
          OR: course.Meeting.map((meeting) => {
            return {
              meeting_id: meeting.id,
            };
          }),
        },
      });

      res.status(200).json(deletedUser);
    }
    // trying to kick a user from course
    else {
      // first check if course exists
      const course = await prisma.course.findFirst({
        where: {
          id: course_id,
        },
        include: {
          Enrolled: {
            where: {
              user_id: user_id,
              OR: [{ role: 0 }, { role: 1 }],
            },
          },
          Meeting: true,
        },
      });

      // course does not exist
      if (course === null) {
        return res.status(404).json({
          error: "This course does not exist",
        });
      }

      if (course.owner_id !== req.auth.userId) {
        return res.status(400).json({
          error: "You do not have permission to kick users from this course",
        });
      }

      // length should be 1 if user_id to kick was found
      if (course.Enrolled.length !== 1) {
        return res.status(400).json({
          error:
            "The user you are trying to kick is not enrolled in this course as an instructor or student",
        });
      }

      // delete the user from the course
      const deletedUser = await prisma.enrolled.delete({
        where: {
          user_id_course_id: {
            course_id: course_id,
            user_id: user_id,
          },
        },
      });

      // delete all meetings the deleted user may have owned
      await prisma.meeting.deleteMany({
        where: {
          course_id: course_id,
          owner_id: deletedUser.user_id,
        },
      });

      // delete any queue positions this user may have been in for the meetings that are a part of this course
      await prisma.queue.deleteMany({
        where: {
          user_id: deletedUser.user_id,
          OR: course.Meeting.map((meeting) => {
            return {
              meeting_id: meeting.id,
            };
          }),
        },
      });

      res.status(200).json(deletedUser);
    }
  } catch (error) {
    res.status(500).json({
      error: "Something went wrong leaving the course",
    });
  }
});

export default router;

import express from "express";
import { prisma } from "../prisma/init";
import { processRequest } from "zod-express-middleware";
import { coursePARAM, updateRolePATCH, kickUserDELETE, meetingPARAM } from "@orderly/schema";
import clerkClient from "@clerk/clerk-sdk-node";

const router = express.Router({ mergeParams: true });

// get everyone enrolled in the course (not including the owner)
router.get("/", processRequest(coursePARAM), async (req, res) => {
  type memberList = {
    id: string;
    profileImageUrl: string;
    name: string;
    emailAddress: string;
  }[];

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

    const users = await clerkClient.users.getUserList({ userId });
    const memberList: memberList = users.map((user) => {
      return {
        id: user.id,
        profileImageUrl: user.profileImageUrl,
        name: `${user.firstName} ${user.lastName}`,
        emailAddress: user.emailAddresses.find(
          (email) => email.id === user.primaryEmailAddressId
        )?.emailAddress as string,
      };
    });

    res.status(200).json(memberList);
  } catch (error) {
    res.status(500).json({
      error: "Something went wrong while fetching users",
    });
  }
});

// update role of user
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
      return res.status(400).json({
        error: "You do not have permission to update roles in this course",
      });
    }

    // user id being updated is not enrolled in course as instructor or student
    if (course.Enrolled.length !== 1) {
      return res.status(400).json({
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

// student leaves a course on their own
router.delete("/", processRequest(coursePARAM), async (req, res) => {
  const { course_id } = req.params;

  try {
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
  } catch (error) {
    res.status(500).json({
      error: "Something went wrong leaving the course",
    });
  }
});

// kick a user from course
router.delete("/:user_id", processRequest(kickUserDELETE), async (req, res) => {
  const { course_id, user_id } = req.params;

  try {
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

    res.status(200).json({
      user_id: deletedUser.user_id,
      course_id: course.id,
      role: deletedUser.role,
    });
  } catch (error) {
    res.status(500).json({
      error: "Something went wrong leaving the course",
    });
  }
});



// get current position in queue
router.get("/:meeting_id", processRequest(meetingPARAM), async (req, res, next) => {
  const { meeting_id } = req.params;

  try {
    const queue = await prisma.queue.findMany({
      orderBy: [
        {
          join_time: 'asc',
        },
      ],
      where: { 
        meeting_id: meeting_id
       },
    });


    if (queue === null) {
      return res.status(404).json({ error: "Could not find queue with meeting id" });
    }

    let pos = 0;
    const queueList = queue.map((user) => 
      {
        return {
          user_id : req.body.user_id,
          meeting_id : meeting_id,
          position: pos
        };
      },
      pos++,
    );

    const userPosition = queueList.filter((user) =>
      user.user_id == req.body.user_id
    );

    // const course = await prisma.course.findFirst({
    //   where: {
    //     id: req.body.course_id,
    //     Meeting: {
    //       some: {
    //         Queue: {
    //           some:{
    //             user_id : req.auth.userId,
    //           },
    //         },
    //       },
    //     },
    //   },
    //   include: {
    //     Meeting: {
    //       include: {
    //         Queue: {
    //           select: {
    //             user_id: true,
    //             join_time: true,
    //           }
    //         },
    //       },
    //     },
    //   },
    // });

    res.status(200).json(userPosition);
  } catch (error) {
    res.status(500).json({
      error: "Something went wrong getting queue position",
    });
  }
});


export default router;

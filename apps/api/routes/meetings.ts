import clerkClient from "@clerk/clerk-sdk-node";
import express from "express";
import { processRequest, validateRequest } from "zod-express-middleware";
import { prisma } from "../prisma/init";
import {
  coursePARAM,
  enqueueMeetingPOST,
  createMeetingPOST,
  updateMeetingPATCH,
  courseAndMeetingPARAM,
  dequeueMeetingDELETE,
  Member,
} from "@orderly/schema";

const router = express.Router({ mergeParams: true });

/*  Get all meetings owned by requestor
    - Anyone can use this route, but only helpful to office hours hosters
*/
router.get("/owned", processRequest(coursePARAM), async (req, res) => {
  const { course_id } = req.params;

  try {
    const meetings = await prisma.meeting.findMany({
      where: {
        owner_id: req.auth.userId,
        course_id: course_id,
      },
    });

    res.status(200).json(meetings);
  } catch (error) {
    res.status(500).json({
      error: "Something went wrong fetching meetings",
    });
  }
});

/*  Create new meeting
    - Only course owners or instructors can use this route
    - Currently no cap for number of owned meetings, but theoretically could limit to around 10 per hoster
*/
router.post("/", processRequest(createMeetingPOST), async (req, res) => {
  const { course_id } = req.params;

  try {
    const course = await prisma.course.findFirst({
      where: {
        id: course_id,
      },
      include: {
        Enrolled: {
          where: {
            user_id: req.auth.userId,
            role: 1,
          },
        },
      },
    });

    // course does not exist
    if (course === null) {
      return res.status(404).json({ error: "This course does not exist" });
    }

    // no permission to make meeting
    if (course.Enrolled.length === 0 && course.owner_id !== req.auth.userId) {
      return res.status(403).json({
        error: "You do not have permission to create a meeting in this course",
      });
    }

    const meeting = await prisma.meeting.create({
      data: {
        owner_id: req.auth.userId,
        course_id: course_id,
        day: req.body.day,
        start_time: req.body.start_time,
        end_time: req.body.end_time,
        link: req.body.link,
      },
    });

    res.status(200).json(meeting);
  } catch (error) {
    res
      .status(500)
      .json({ error: "Something went wrong while creating a meeting" });
  }
});

/*  Delete a meeting
    - Only course owners or instructors can use this route on their own meetings
*/
router.delete(
  "/:meeting_id",
  processRequest(courseAndMeetingPARAM),
  async (req, res) => {
    const { meeting_id } = req.params;

    try {
      const meeting = await prisma.meeting.findFirst({
        where: {
          id: meeting_id,
        },
      });

      // meeting does not exist
      if (meeting === null) {
        return res.status(404).json({ error: "This meeting does not exist" });
      }

      // check that owner is the requestor
      if (meeting.owner_id !== req.auth.userId) {
        return res
          .status(403)
          .json({ error: "You do not have permission to delete this meeting" });
      }

      // delete the meeting
      const deletedMeeting = await prisma.meeting.delete({
        where: {
          id: meeting_id,
        },
      });

      // delete all related queue positions for meeting
      await prisma.queue.deleteMany({
        where: {
          meeting_id: deletedMeeting.id,
        },
      });

      res.status(200).json(deletedMeeting);
    } catch (error) {
      res
        .status(500)
        .json({ error: "Something went wrong while creating a meeting" });
    }
  }
);

/*  Get queue of specific meeting
    - Only the owner of the meeting can use this route
    - This will return the entire queue for a given meeting
*/
router.get(
  "/:meeting_id/queue",
  processRequest(courseAndMeetingPARAM),
  async (req, res) => {
    const { meeting_id } = req.params;

    try {
      const meeting = await prisma.meeting.findFirst({
        where: {
          id: meeting_id,
        },
      });

      if (meeting === null) {
        return res.status(404).json({ error: "This meeting does not exist" });
      }

      if (meeting.owner_id !== req.auth.userId) {
        return res.status(404).json({
          error: "You do not have permission to view the queue of this meeting",
        });
      }

      // get the queue and associated clerk user details (pic and full name), must maintain order
      const queue = await prisma.queue.findMany({
        orderBy: {
          join_time: "asc",
        },
        where: {
          meeting_id: meeting.id,
        },
      });

      // if queue is empty, this is not an error just send back empty array to convey this
      if (queue.length === 0) {
        return res.status(200).json(queue);
      }

      const userId = queue.map((row) => row.user_id);
      const users = await clerkClient.users.getUserList({ userId });

      const lookup: Record<
        string,
        Partial<Omit<Member, "emailAddress" | "role">>
      > = {};
      for (let i = 0; i < queue.length; ++i) {
        const currUser = queue[i];
        lookup[currUser.user_id] = {
          id: currUser.user_id,
        };
      }

      users.forEach((currUser) => {
        const existingEntry = lookup[currUser.id];
        existingEntry.name = `${currUser.firstName} ${currUser.lastName}`;
        existingEntry.profileImageUrl = currUser.profileImageUrl;
      });

      res.status(200).json(Object.values(lookup));
    } catch (error) {
      res
        .status(500)
        .json({ error: "Something went wrong while fetching a meeting queue" });
    }
  }
);

/*  Get all meetings for a course
    - Anyone enrolled in the course can use this route, will include positions for each
*/
router.get("/", processRequest(coursePARAM), async (req, res) => {
  const { course_id } = req.params;
  try {
    const meetings = await prisma.meeting.findMany({
      where: {
        course_id: course_id,
      },
      include: {
        Queue: {
          orderBy: {
            join_time: "asc",
          },
        },
      },
    });

    const allMeetings = meetings.map((meeting) => {
      const { Queue, ...publicMeeting } = meeting;

      return {
        ...publicMeeting,
        position: meeting.Queue.findIndex(
          (row) => row.user_id === req.auth.userId
        ),
      };
    });

    res.status(200).json(allMeetings);
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ error: "Something went wrong while fetching meetings" });
  }
});

// enqueue in meeting (join the queue) and return position in queue
router.post(
  "/:meeting_id/enqueue",
  processRequest(enqueueMeetingPOST),
  async (req, res) => {
    const { course_id, meeting_id } = req.params;

    try {
      // check if course id provided by client matches an existing course
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
          Meeting: {
            where: {
              id: meeting_id,
            },
          },
        },
      });

      // if no course exists with the provided entry code
      if (course === null) {
        return res.status(404).json({ error: "This course does not exist" });
      }

      // requester is not enrolled in the course
      if (course.Enrolled.length === 0) {
        return res
          .status(403)
          .json({ error: "You are not enrolled in this course" });
      }

      // instructors cannot enqueue
      if (course.Enrolled[0].role === 2 || course.Enrolled[0].role === 1) {
        return res
          .status(400)
          .json({ error: "Only students can join meeting queues" });
      }

      // if no meeting exists with the provided id
      if (course.Meeting.length === 0) {
        return res.status(404).json({ error: "This meeting does not exist" });
      }

      // enqueue student
      const enqueue = await prisma.queue.create({
        data: {
          user_id: req.auth.userId,
          meeting_id: meeting_id,
        },
      });

      // get the queue and associated clerk user details (pic and full name), must maintain order
      const queue = await prisma.queue.findMany({
        orderBy: {
          join_time: "asc",
        },
        where: {
          meeting_id: meeting_id,
        },
      });

      res.status(201).json({
        ...enqueue,
        position: queue.findIndex((row) => row.user_id === req.auth.userId),
      });
    } catch (error) {
      res.status(500).json({
        error: "Something went wrong while joining the meeting queue",
      });
    }
  }
);

// dequeue from meeting (leave the queue)
router.delete(
  "/:meeting_id/dequeue/:user_id",
  processRequest(dequeueMeetingDELETE),
  async (req, res) => {
    const { course_id, meeting_id, user_id } = req.params;

    try {
      // check if course id provided by client matches an existing course
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
          Meeting: {
            where: {
              id: meeting_id,
            },
            include: {
              Queue: {
                where: {
                  user_id: user_id,
                },
              },
            },
          },
        },
      });

      // if no course exists with the provided entry code
      if (course === null) {
        return res.status(404).json({ error: "This course does not exist" });
      }

      // if no meeting exists with the provided id
      if (course.Meeting.length === 0) {
        return res.status(404).json({ error: "This meeting does not exist" });
      }

      // student trying to leave own course
      if (user_id === req.auth.userId) {
        // requester is not enrolled in the course
        if (course.Enrolled.length === 0) {
          return res
            .status(400)
            .json({ error: "You are not enrolled in this course" });
        }

        // if student isn't in queue
        if (course.Meeting[0].Queue.length === 0) {
          return res
            .status(400)
            .json({ error: "You are not in the queue for this meeting" });
        }
      } else {
        if (course.Enrolled.length === 0) {
          return res
            .status(400)
            .json({ error: "User not enrolled in this course" });
        }

        // if student isn't in queue
        if (course.Meeting[0].Queue.length === 0) {
          return res.status(400).json({ error: "User not found in the queue" });
        }

        if (course.Meeting[0].owner_id !== req.auth.userId) {
          return res
            .status(400)
            .json({
              error:
                "Only the owner of the meeting can remove users from queue",
            });
        }
      }

      // dequeue student
      const dequeue = await prisma.queue.delete({
        where: {
          user_id_meeting_id: {
            user_id: user_id,
            meeting_id: meeting_id,
          },
        },
      });

      res.status(201).json(dequeue);
    } catch (error) {
      res
        .status(500)
        .json({ error: "Something went wrong while attempting to dequeue" });
    }
  }
);

// get current position in queue
router.get(
  "/:meeting_id",
  processRequest(courseAndMeetingPARAM),
  async (req, res) => {
    const { meeting_id } = req.params;

    try {
      const queue = await prisma.queue.findMany({
        orderBy: [
          {
            join_time: "asc",
          },
        ],
        where: {
          meeting_id: meeting_id,
        },
      });

      const meeting = await prisma.meeting.findFirst({
        where: {
          id: meeting_id,
        },
      });

      if (queue.length === 0) {
        return res
          .status(404)
          .json({ error: "Could not find queue with meeting id" });
      }

      let pos = 0;
      const queueList = queue.map((user) => {
        pos++;
        return {
          user_id: user.user_id,
          meeting_id: meeting_id,
          position: pos,
        };
      });

      const userPosition = queueList.filter(
        (user) => user.user_id == req.body.user_id
      );

      if (userPosition.length == 0) {
        return res.status(404).json({ error: "Could not find user in queue" });
      }

      const meetingAndPosition = {
        meeting,
        userPosition,
      };

      res.status(200).json(meetingAndPosition);
    } catch (error) {
      res.status(500).json({
        error: "Something went wrong getting queue position",
      });
    }
  }
);

// edit fields of a meeting (not all fields required)
router.patch(
  "/:meeting_id",
  processRequest(updateMeetingPATCH),
  async (req, res) => {
    const { meeting_id } = req.params;

    try {
      // check if meeting id exists
      const meeting = await prisma.meeting.findFirst({
        where: {
          id: meeting_id,
        },
      });

      // course does not exist
      if (meeting === null) {
        return res.status(404).json({ error: "This meeting does not exist" });
      }

      const updatedMeeting = await prisma.meeting.update({
        where: {
          id: meeting_id,
        },
        data: {
          day: req.body.day,
          start_time: req.body.start_time,
          end_time: req.body.end_time,
          link: req.body.link,
        },
      });

      res.status(200).json(updatedMeeting);
    } catch (error) {
      res.status(500).json({
        error: "Something went wrong while updating the meeting",
      });
    }
  }
);

export default router;

import express from "express";
import { prisma } from "../prisma/init";
import { processRequest, validateRequest } from "zod-express-middleware";
import {
  enqueueMeetingPOST,
  meetingPOST,
  meetingPATCH,
  courseAndMeetingPARAM,
} from "@orderly/schema";

const router = express.Router({ mergeParams: true });

// edit all fields of a meetings (not all fields required)
router.patch("/:id", processRequest(meetingPATCH), async (req, res) => {
  try {
    // check if meeting id exists
    const meeting = await prisma.meeting.findFirst({
      where: {
        id: req.body.id,
      },
    });
    const updatedMeeting = await prisma.meeting.update({
      where: {
        id: req.body.id,
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
});

// create new meeting
router.post("/", validateRequest(meetingPOST), async (req, res) => {
  try {
    //error check end date is after start date
    // error check end and start date are in the future and not the past

    const meeting = await prisma.meeting.create({
      data: {
        owner_id: "replace_with_clerk", // should be clerk auth
        course_id: req.body.course_id,
        day: req.body.day,
        start_time: req.body.start_time,
        end_time: req.body.end_time,
        link: req.body.link,
      },
    });
    res.status(200).json(meeting);
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ error: "Something went wrong while creating a new meeting" });
  }
});

// enqueue in meeting (join the queue)
router.post("/:meeting_id",validateRequest(enqueueMeetingPOST),async (req, res) => {

  const { course_id, meeting_id } = req.params

  try {
    // check if course id provided by client matches an existing course
    const course = await prisma.course.findUnique({
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
            id: meeting_id
          }
        }
      },
    });

    // if no course exists with the provided entry code
    if (course === null) {
      return res
        .status(404)
        .json({ error: "This course does not exist" });
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
        .json({ error: "Only students can join the queue" });
    }

    // if no meeting exists with the provided id
    if (course.Meeting.length === 0) {
      return res
        .status(404)
        .json({ error: "This meeting does not exist" });
    }

    // enqueue student
    const enqueue = await prisma.queue.create({
      data: {
        user_id: req.auth.userId,
        meeting_id: meeting_id,
      },
    });

    res.status(201).json(enqueue);
    
    } catch (error) {
      res
        .status(500)
        .json({ error: "Something went wrong while enrolling in a course" });
    }
  }
);

// dequeue from meeting (leave the queue)
router.delete("/:meeting_id",validateRequest(enqueueMeetingPOST),async (req, res) => {

  const { course_id, meeting_id } = req.params

  try {
    // check if course id provided by client matches an existing course
    const course = await prisma.course.findUnique({
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
            id: meeting_id
          }
        }
      },
    });

    // if no course exists with the provided entry code
    if (course === null) {
      return res
        .status(404)
        .json({ error: "This course does not exist" });
    }

    // requester is not enrolled in the course
    if (course.Enrolled.length === 0) {
      return res
        .status(403)
        .json({ error: "You are not enrolled in this course" });
    }

    // if no meeting exists with the provided id
    if (course.Meeting.length === 0) {
      return res
        .status(404)
        .json({ error: "This meeting does not exist" });
    }

    // check if student is in queue
    const queue = await prisma.queue.findUnique({
      where:{
        user_id: req.auth.userId,
        meeting_id: meeting_id
      }
    })

    //if student isn't in queue
    if(queue === null){
      return res
      .status(405)
      .json({error: "User not found in the queue"})
    }

    // dequeue student
    const dequeue = await prisma.queue.delete({
      where: {
        user_id: req.auth.userId,
        meeting_id: meeting_id,
      } 
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
  async (req, res, next) => {
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

      if (queue === null) {
        return res
          .status(404)
          .json({ error: "Could not find queue with meeting id" });
      }

      let pos = 0;
      const queueList = queue.map((user) => {
        return {
          user_id: req.auth.userId,
          meeting_id: meeting_id,
          position: pos,
        };
      }, pos++);

      const userPosition = queueList.filter(
        (user) => user.user_id == req.auth.userId
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
  }
);

export default router;

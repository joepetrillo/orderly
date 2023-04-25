import express from "express";
import { prisma } from "../prisma/init";
import { meetingPOST, meetingPATCH } from "@orderly/schema";
import { processRequest, validateRequest } from "zod-express-middleware";

const router = express.Router();

// edit all fields of a meetings
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

export default router;

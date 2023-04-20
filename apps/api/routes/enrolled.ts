import express from "express";
import { prisma } from "../prisma/init";
import { validateRequest } from "zod-express-middleware";
import { updateRolePATCH, courseUnenrollDELETE } from "@orderly/schema";

const router = express.Router();

// update role
router.patch("/", validateRequest(updateRolePATCH), async (req, res) => {
  try {
    // ensure that the person making the request is the owner of the course they want to update someones role in
    // we want to know if the person who made this request has role 2 (owner)
    const isOwner = await prisma.enrolled.findFirst({
      where: {
        course_id: req.body.course_id,
        role: 2,
        user_id: req.auth.userId,
      },
    });

    if (isOwner === null) {
      return res.status(400).json({
        error: "You do not have permission to update roles in this course",
      });
    }

    // verify that the user that is being updated is already enrolled in the course
    const userToUpdate = await prisma.enrolled.findFirst({
      where: {
        user_id: req.body.user_id,
        course_id: req.body.course_id,
      },
    });

    if (userToUpdate === null) {
      return res.status(404).json({
        error:
          "The user you are trying to update is not enrolled in the course",
      });
    }

    // update the role of the user
    const updatedUser = await prisma.enrolled.update({
      where: {
        user_id_course_id: {
          user_id: req.body.user_id,
          course_id: req.body.course_id,
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

// student side leave class
router.delete("/", validateRequest(courseUnenrollDELETE), async (req, res, next) => {
  try {
    // owner cannot leave own class
    const isOwner = await prisma.enrolled.findFirst({
      where: {
        course_id: req.body.course_id,
        role: 2,
        user_id: req.auth.userId,
      },
    });

    if (isOwner === null) {
      return res.status(400).json({
        error: "Cannot leave course",
      });
    }

    // verify that the user that is being updated is already enrolled in the course
    const deleteUser = await prisma.enrolled.delete({
      where: {
        user_id_course_id: {
          user_id: req.auth.userId,
          course_id: req.body.course_id,
        },
      },
    });

    res.status(200).json(deleteUser);
  } catch (error) {
    res.status(500).json({
      error: "Something went wrong while unenrolling from a course",
    });
  }
});


export default router;

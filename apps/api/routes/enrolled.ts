import express from "express";
import { validateRequest } from "zod-express-middleware";
import { updateRolePATCH } from "@orderly/schema";
import { prisma } from "../prisma/init";

const router = express.Router();



// change role ? 
router.patch("/", validateRequest(updateRolePATCH), async (req, res) => {
    //at this point you have the user_id and the role you want to change that user to

    try {
        const isOwner = await prisma.enrolled.findFirst({
            where: {
                course_id: req.body.course_id,
                role: 2,
                user_id: "userID888" //req.auth.userId
            }
        })
        if (isOwner === null) {
            return res
                .status(400)
                .json({ error: "You do not have permission to update roles in this course" });
        }
        // at this stage we have the correct authenticated professor who is eligible to make the update
        // we know the person who made this request has role 2 (owner privilages)

        //person who called is role 2 as only role 2 has role update access 
        const userToUpdate = await prisma.enrolled.findFirst({
            where: {
                user_id: req.body.user_id,
                course_id: req.body.course_id
            }
        })
        //verify the user that you are trying to update role is also enrolled
        if (userToUpdate === null) {
            return res
                .status(404)
                .json({ error: "The user you are trying to update is not enrolled in the course" });
        }

        //at this stage you have the user you need to update the role in 
        const updatedUser = await prisma.enrolled.update({
            where:{
                user_id_course_id:{
                    user_id: req.body.user_id,
                    course_id: req.body.course_id
                }
            },
            data:{
                role: req.body.role
            }
        })
        res.status(200).json(updatedUser)
    }
    catch (error) {
        res
            .status(500)
            .json({ error: `Something went wrong while updating the role of the user ${req.body.user_id}` });
        // this is called a template string
    }
});

export default router;
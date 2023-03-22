import express from "express";
import clerk from "@clerk/clerk-sdk-node";
const router = express.Router();

router.get("/", async (req, res) => {
  const userList = await clerk.users.getUserList();
  res.json(userList);
});

export default router;

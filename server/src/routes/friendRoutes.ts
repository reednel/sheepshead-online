import express from "express";
import * as friendController from "../controllers/friendController";

const router = express.Router();

router.post(
  "/u/:from_username/friends/request",
  friendController.sendFriendRequest
);
router.post(
  "/u/:to_username/friends/accept",
  friendController.acceptFriendRequest
);
router.delete(
  "/u/:to_username/friends/ignore",
  friendController.ignoreFriendRequest
);

export default router;

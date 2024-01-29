import express from "express";
import * as friendController from "../controllers/friendController";

const router = express.Router();

router.post(
  "/u/:from_username/friends/request",
  friendController.sendFriendRequest
);
router.delete(
  "/u/:from_username/friends/revoke",
  friendController.revokeFriendRequest
);
router.post(
  "/u/:to_username/friends/accept",
  friendController.acceptFriendRequest
);
router.delete(
  "/u/:to_username/friends/ignore",
  friendController.ignoreFriendRequest
);
router.delete(
  "/u/:from_username/friends/remove",
  friendController.removeFriend
);

export default router;
import express from "express";
import { verifySession } from "supertokens-node/recipe/session/framework/express";
import * as friendController from "../controllers/friend.controller";

const router = express.Router();

router.post(
  "/u/:from_username/friends/request",
  verifySession(),
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

import express from "express";
import { verifySession } from "supertokens-node/recipe/session/framework/express";
import * as userController from "../controllers/user.controller";

const router = express.Router();

// router.post("/u", userController.createUser);
router.delete("/u/:username", verifySession(), userController.deleteUser);
router.post("/change-email", verifySession(), userController.changeEmail);

export default router;

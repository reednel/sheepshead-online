import express from "express";
import { verifySession } from "supertokens-node/recipe/session/framework/express";
import * as userController from "../controllers/user.controller";

const router = express.Router();

router.delete("/delete-user", verifySession(), userController.deleteUser);
router.post("/change-email", verifySession(), userController.changeEmail);
router.post("/change-password", verifySession(), userController.changePassword);

export default router;

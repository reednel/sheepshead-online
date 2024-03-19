import express from "express";
import { verifySession } from "supertokens-node/recipe/session/framework/express";
import * as authController from "../controllers/auth.controller";

const router = express.Router();

router.delete("/delete-user", verifySession(), authController.deleteUser);
router.post("/change-email", verifySession(), authController.changeEmail);
router.post("/change-password", verifySession(), authController.changePassword);

export default router;

import express from "express";
import { verifySession } from "supertokens-node/recipe/session/framework/express";
import * as userController from "../controllers/user.controller";

const router = express.Router();

router.get("/u/update", verifySession(), userController.updateUser);

export default router;

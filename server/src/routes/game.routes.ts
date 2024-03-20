import express from "express";
import { verifySession } from "supertokens-node/recipe/session/framework/express";
import * as gameController from "../controllers/game.controller";

const router = express.Router();

router.post("/create-house", verifySession(), gameController.createHouse);
router.post("/join-house", verifySession(), gameController.joinHouse);

export default router;

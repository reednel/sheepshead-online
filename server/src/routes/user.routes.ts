import express from "express";
import * as userController from "../controllers/user.controller";

const router = express.Router();

// router.post("/u", userController.createUser);
router.delete("/u/:username", userController.deleteUser);

export default router;

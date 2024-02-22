import { Request, Response } from "express";
import { prisma } from "../utils/prismaClient";
import { getUserByUsername } from "./user.controller";

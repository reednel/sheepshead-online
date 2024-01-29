import { prisma } from "../utils/prismaClient";
import { Request, Response } from "express";

// Get a user record from a username
export async function getUserByUsername(username: string) {
  try {
    const user = await prisma.users.findUnique({
      where: { username: username },
    });
    return user;
  } catch (error) {
    console.error(`Error fetching user ID for username ${username}:`, error);
    throw error;
  }
}

// Create users record and user_configs record with all default values
export async function createUser(req: Request, res: Response) {
  try {
    const result = await prisma.$transaction(async (prisma) => {
      const user = await prisma.users.create({
        data: { ...req.body },
      });
      const userConfig = await prisma.user_configs.create({
        data: { user_id: user.user_id },
      });
      return { user, userConfig };
    });
    res.json({ message: "User created" });
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

// Delete user record
// Cascades to user_configs, friends, and friend_requests
export async function deleteUser(req: Request, res: Response) {
  const { username } = req.params;
  const user = await getUserByUsername(username);

  if (!user) {
    res.status(404).json({ message: `User not found: ${username}` });
    return;
  }

  try {
    const result = await prisma.users.delete({
      where: { user_id: user.user_id },
    });
    res.json({ message: "User deleted" });
  } catch (error) {
    console.error(`Error deleting user:`, error);
    res.status(500).json({ message: "Internal server error" });
  }
}

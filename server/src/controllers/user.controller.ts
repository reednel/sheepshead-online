import { Request, Response } from "express";
import { prisma } from "../utils/prisma";
import { deleteUser as deleteAuthUser } from "supertokens-node";

// Get a user record from a username
export async function getUserByUsername(username: string) {
  try {
    const user = await prisma.users.findUnique({
      where: { username: username },
    });
    return user;
  } catch (error) {
    console.error(`Error fetching user for username ${username}:`, error);
    throw error;
  }
}

// Get a user record from a user ID
export async function getUserById(user_id: number) {
  try {
    const user = await prisma.users.findUnique({
      where: { user_id: user_id },
    });
    return user;
  } catch (error) {
    console.error(`Error fetching user for user ID ${user_id}:`, error);
    throw error;
  }
}

// Get a user record from an email
export async function getUserByEmail(email: string) {
  try {
    const user = await prisma.users.findUnique({
      where: { email: email },
    });
    return user;
  } catch (error) {
    console.error(`Error fetching user for email ${email}:`, error);
    throw error;
  }
}

// Create users record and user_configs record with all default values
export async function createUser(
  username: string,
  email: string
): Promise<string> {
  try {
    let user = null;
    await prisma.$transaction(async (prisma: any) => {
      user = await prisma.users.create({
        data: { username: username, email: email },
      });
      console.log("user:", user); // DEBUG
      const userConfig = await prisma.user_configs.create({
        data: { user_id: user.user_id },
      });
    });
    return user!.user_id.toString();
  } catch (error) {
    console.error("Error creating user:", error);
    throw error;
  }
}

// Delete user record
// Cascades to user_configs, friends, and friend_requests
// Also deletes the user from the auth database
export async function deleteUser(req: Request, res: Response) {
  const { username } = req.params;
  const user = await getUserByUsername(username);

  if (!user) {
    res.status(404).json({ message: `User not found: ${username}` });
    return;
  }

  try {
    await prisma.$transaction(async (prisma: any) => {
      await prisma.users.delete({
        where: { user_id: user.user_id },
      });

      await deleteAuthUser(user.user_id.toString());
      // await deleteAuthUser("0683f15c-f10e-404f-a228-a4ce01369b59");
    });

    res.json({ message: "User deleted" });
  } catch (error) {
    console.error(`Error deleting user:`, error);
    res.status(500).json({ message: "Internal server error" });
  }
}

import { Response } from "express";
import { SessionRequest } from "supertokens-node/framework/express";
import { prisma } from "../utils/prisma";
import { users } from "@prisma/client";
import {
  isValidEmail,
  isValidUserID,
  isValidUsername,
} from "../utils/validation";

// Check if an email is banned
export async function isBannedEmail(email: string) {
  let bannedEmails = await prisma.users_banned.findMany({
    where: { email: email },
  });
  return bannedEmails.length > 0;
}

/**
 * Get a user record by username.
 * @param {string} username - The username to search for.
 * @returns {Promise<users|null>} The user object if found, or null if not found.
 * @throws {Error} Throws an error for database issues, invalid input, etc.
 */
export async function getUserByUsername(
  username: string
): Promise<users | null> {
  if (!isValidUsername(username)) {
    throw new Error("Invalid username input");
  }

  try {
    const user = await prisma.users.findUnique({
      where: { username: username },
    });

    if (!user) {
      console.warn(`User not found for username: ${username}`);
      return null;
    }

    return user;
  } catch (error) {
    console.error(`Error fetching user for username ${username}:`, error);
    throw error;
  }
}

/**
 * Get a user record by user_id.
 * @param {string} user_id - The user_id to search for.
 * @returns {Promise<users|null>} The user object if found, or null if not found.
 * @throws {Error} Throws an error for database issues, invalid input, etc.
 */
export async function getUserByUserId(user_id: number): Promise<users | null> {
  // Input validation (simple example, can be more complex)
  if (!isValidUserID(user_id)) {
    throw new Error("Invalid user_id input");
  }

  try {
    const user = await prisma.users.findUnique({
      where: { user_id: user_id },
    });

    if (!user) {
      console.warn(`User not found for user_id: ${user_id}`);
      return null;
    }

    return user;
  } catch (error) {
    console.error(`Error fetching user for user_id ${user_id}:`, error);
    throw error;
  }
}

/**
 * Get a user record by email.
 * @param {string} email - The email to search for.
 * @returns {Promise<users|null>} The user object if found, or null if not found.
 * @throws {Error} Throws an error for database issues, invalid input, etc.
 */
export async function getUserByEmail(email: string): Promise<users | null> {
  if (!isValidEmail(email)) {
    throw new Error("Invalid email input");
  }

  try {
    const user = await prisma.users.findUnique({
      where: { email: email },
    });

    if (!user) {
      console.warn(`User not found for email: ${email}`);
      return null;
    }

    return user;
  } catch (error) {
    console.error(`Error fetching user for email ${email}:`, error);
    throw error;
  }
}

/**
 * Update an existing user record.
 * @param {SessionRequest} req - The request object.
 * @param {Response} res - The response object.
 * @returns {Promise<users|null>} The new user object if successful, or null if not successful.
 * @throws {Error} Throws an error for database issues, invalid input, etc.
 */
export async function updateUser(req: SessionRequest, res: Response) {
  const user: users = req.body.user;

  if (!user) {
    res.status(400).json({ message: "Invalid user object" });
    return;
  }

  if (!user.user_id) {
    res.status(400).json({ message: "Invalid user_id" });
    return;
  }
  try {
    await prisma.users.update({
      where: { user_id: user.user_id },
      data: {
        display_name: user.display_name,
        display_city: user.display_city,
        display_region: user.display_region,
        display_country: user.display_country,
        bio: user.bio,
      },
    });

    return res.status(200).json({ message: "User updated successfully" });
  } catch (error) {
    console.error("Error updating user:", error);
    throw error;
  }
}

import { Response } from "express";
import { Users } from "@prisma/client";
import SuperTokens from "supertokens-node";
import Session from "supertokens-node/recipe/session";
import { deleteUser as deleteAuthUser } from "supertokens-node";
import EmailPassword from "supertokens-node/recipe/emailpassword";
import EmailVerification from "supertokens-node/recipe/emailverification";
import { SessionRequest } from "supertokens-node/framework/express";
import { prisma } from "../utils/prisma";
import {
  isValidEmail,
  isValidUserID,
  isValidUsername,
} from "../utils/validation";

// Check if an email is banned
export async function isBannedEmail(email: string) {
  let bannedEmails = await prisma.Users_Banned.findMany({
    where: { email: email },
  });
  return bannedEmails.length > 0;
}

/**
 * Get a user record by username.
 * @param {string} username - The username to search for.
 * @returns {Promise<Users|null>} The user object if found, or null if not found.
 * @throws {Error} Throws an error for database issues, invalid input, etc.
 */
export async function getUserByUsername(
  username: string
): Promise<Users | null> {
  if (!isValidUsername(username)) {
    throw new Error("Invalid username input");
  }

  try {
    const user = await prisma.Users.findUnique({
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
 * @returns {Promise<Users|null>} The user object if found, or null if not found.
 * @throws {Error} Throws an error for database issues, invalid input, etc.
 */
export async function getUserByUserId(user_id: number): Promise<Users | null> {
  // Input validation (simple example, can be more complex)
  if (!isValidUserID(user_id)) {
    throw new Error("Invalid user_id input");
  }

  try {
    const user = await prisma.Users.findUnique({
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
 * @returns {Promise<Users|null>} The user object if found, or null if not found.
 * @throws {Error} Throws an error for database issues, invalid input, etc.
 */
export async function getUserByEmail(email: string): Promise<Users | null> {
  if (!isValidEmail(email)) {
    throw new Error("Invalid email input");
  }

  try {
    const user = await prisma.Users.findUnique({
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
 * Create Users record and user_configs record with all default values
 * @param username
 * @param email
 * @returns {Promise<Users|null>}
 */
export async function createUser(
  username: string,
  email: string
): Promise<Users | null> {
  try {
    let user = null;
    await prisma.$transaction(async (prisma: any) => {
      user = await prisma.Users.create({
        data: { username: username, email: email },
      });
      await prisma.user_configs.create({
        data: { user_id: user.user_id },
      });
    });
    return user;
  } catch (error) {
    console.error("Error creating user:", error);
    throw error;
  }
}

/**
 * Delete user record
 * Cascades to user_configs, friends, and friend_requests
 * Also deletes the user from the auth database
 * @param {SessionRequest} req
 * @param {Response} res
 * @returns {Promise<void>}
 * @throws {Error} Throws an error for database issues, invalid input, etc.
 */
export async function deleteUser(req: SessionRequest, res: Response) {
  const username = req.body.username;

  if (!isValidUsername(username)) {
    res.status(400).json({ message: "Invalid username" });
    return;
  }

  let user: Users | null;

  try {
    user = await getUserByUsername(username);
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({ message: "Internal server error" });
    return;
  }

  if (!user) {
    res
      .status(404)
      .json({ message: `User not found for username: ${username}` });
    return;
  }

  try {
    await prisma.$transaction(async (prisma: any) => {
      await prisma.Users.delete({
        where: { user_id: user!.user_id },
      });

      await deleteAuthUser(user!.user_id.toString());
    });

    res.json({ message: "User deleted" });
  } catch (error) {
    console.error(`Error deleting user:`, error);
    res.status(500).json({ message: "Internal server error" });
  }
}

/**
 * Change user email
 * @param {SessionRequest} req
 * @param {Response} res
 * @returns {Promise<void>}
 * @throws {Error} Throws an error for database issues, invalid input, etc.
 */
export async function changeEmail(req: SessionRequest, res: Response) {
  let session = req.session!;
  let email = req.body.email;

  // Validate the input email
  if (!isValidEmail(email)) {
    return res.status(400).send("Email is invalid");
  }

  // Check if email is banned
  if (await isBannedEmail(email)) {
    return res.status(400).send("Email is banned");
  }

  // Check that the email is verified for this user ID
  let isVerified = await EmailVerification.isEmailVerified(
    session.getRecipeUserId(),
    email
  );

  if (!isVerified) {
    // Check if email is already in use
    if (await getUserByEmail(email)) {
      return res
        .status(400)
        .send("Email already in use. Please sign in, or use another email");
    }

    // Send the email verification link to the user for the new email
    await EmailVerification.sendEmailVerificationEmail(
      session.getTenantId(),
      session.getUserId(),
      session.getRecipeUserId(),
      email
    );

    return res.status(200).send("Email verification email sent");
  }

  try {
    await prisma.$transaction(async (prisma: any) => {
      // Update email in app db
      await prisma.Users.update({
        where: { user_id: Number(session.getUserId()) },
        data: { email: email },
      });
      // Update email in auth db
      await EmailPassword.updateEmailOrPassword({
        recipeUserId: session.getRecipeUserId(),
        email: email,
      });
    });
    return res.status(200).send("Email updated");
  } catch (error) {
    console.error("Error updating email:", error);
    return res.status(500).send("Internal server error");
  }
}

/**
 * Change user password
 * @param {SessionRequest} req
 * @param {Response} res
 * @returns {Promise<void>}
 * @throws {Error} Throws an error for database issues, invalid input, etc.
 */
export async function changePassword(req: SessionRequest, res: Response) {
  let session = req.session;
  let oldPassword = req.body.oldPassword;
  let updatedPassword = req.body.newPassword;
  let userId = req.session!.getUserId();
  let userInfo = await SuperTokens.getUser(session!.getUserId());

  if (userInfo === undefined) {
    throw new Error("Should never come here");
  }

  let loginMethod = userInfo.loginMethods.find(
    (lM) =>
      lM.recipeUserId.getAsString() ===
        session!.getRecipeUserId().getAsString() &&
      lM.recipeId === "emailpassword"
  );
  if (loginMethod === undefined) {
    throw new Error("Should never come here");
  }
  const email = loginMethod.email!;

  // call signin to check that input password is correct
  let isPasswordValid = await EmailPassword.signIn(
    session!.getTenantId(),
    email,
    oldPassword
  );

  if (isPasswordValid.status !== "OK") {
    // TODO: handle incorrect password error
    return;
  }

  // update the user's password using updateEmailOrPassword
  let response = await EmailPassword.updateEmailOrPassword({
    recipeUserId: session!.getRecipeUserId(),
    password: updatedPassword,
    tenantIdForPasswordPolicy: session!.getTenantId(),
  });

  if (response.status === "PASSWORD_POLICY_VIOLATED_ERROR") {
    // TODO: handle incorrect password error
    return;
  }

  // revoke all sessions for the user
  await Session.revokeAllSessionsForUser(userId);

  // revoke the current user's session, we do this to remove the auth cookies, logging out the user on the frontend.
  await req.session!.revokeSession();

  // TODO: send successful password update response
}

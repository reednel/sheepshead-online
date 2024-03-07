import { Request, Response } from "express";
import { prisma } from "../utils/prisma";
import { deleteUser as deleteAuthUser } from "supertokens-node";
import EmailPassword from "supertokens-node/recipe/emailpassword";
import EmailVerification from "supertokens-node/recipe/emailverification";
import { SessionRequest } from "supertokens-node/framework/express";
import supertokens from "supertokens-node";
import { isEmailChangeAllowed } from "supertokens-node/recipe/accountlinking";
import { get } from "http";

// Check if an email is valid
function isValidEmail(email: string) {
  let regexp = new RegExp(
    /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
  );
  return regexp.test(email);
}

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
): Promise<any> {
  // TODO: add return type
  try {
    let user;
    await prisma.$transaction(async (prisma: any) => {
      user = await prisma.users.create({
        data: { username: username, email: email },
      });
      const userConfig = await prisma.user_configs.create({
        data: { user_id: user.user_id },
      });
    });
    return user;
  } catch (error) {
    console.error("Error creating user:", error);
    throw error;
  }
}

// Delete user record
// Cascades to user_configs, friends, and friend_requests
// Also deletes the user from the auth database
export async function deleteUser(req: SessionRequest, res: Response) {
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
    });

    res.json({ message: "User deleted" });
  } catch (error) {
    console.error(`Error deleting user:`, error);
    res.status(500).json({ message: "Internal server error" });
  }
}

// Change user email
export async function changeEmail(req: SessionRequest, res: Response) {
  let session = req.session!;
  let email = req.body.email;

  // Validate the input email
  if (!isValidEmail(email)) {
    return res.status(400).send("Email is invalid");
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

  // Since the email is verified, we try and do an update
  let resp = await EmailPassword.updateEmailOrPassword({
    recipeUserId: session.getRecipeUserId(),
    email: email,
  });

  if (resp.status === "OK") {
    return res.status(200).send("Email updated");
  }

  // TODO: is this necessary?
  if (resp.status === "EMAIL_ALREADY_EXISTS_ERROR") {
    return res.status(400).send("Email already in use");
  }
}

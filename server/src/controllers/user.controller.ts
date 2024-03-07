import { Response } from "express";
import { prisma } from "../utils/prisma";
import SuperTokens from "supertokens-node";
import Session from "supertokens-node/recipe/session";
import { deleteUser as deleteAuthUser } from "supertokens-node";
import EmailPassword from "supertokens-node/recipe/emailpassword";
import EmailVerification from "supertokens-node/recipe/emailverification";
import { SessionRequest } from "supertokens-node/framework/express";

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

  try {
    await prisma.$transaction(async (prisma: any) => {
      // Update email in app db
      await prisma.users.update({
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

// Change user password
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

import dotenv from "dotenv";
import SuperTokens from "supertokens-node";
import Dashboard from "supertokens-node/recipe/dashboard";
import EmailPassword from "supertokens-node/recipe/emailpassword";
import Session from "supertokens-node/recipe/session";
import supertokensTypes from "supertokens-node/types";
import { RecipeUserId } from "supertokens-node";
import {
  createUser,
  getUserByEmail,
  getUserByUsername,
} from "../controllers/user.controller";

dotenv.config();

function isEmail(input: string): boolean {
  return (
    input.match(
      /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    ) !== null
  );
}

SuperTokens.init({
  framework: "express",
  supertokens: {
    connectionURI: "http://auth-server:3567",
    apiKey: process.env.SUPERTOKENS_API_KEY,
  },
  appInfo: {
    // learn more about this on https://supertokens.com/docs/session/appinfo
    appName: "sheepshead-online",
    apiDomain: "http://localhost:4000",
    websiteDomain: "http://localhost:4200",
    apiBasePath: "/auth",
    websiteBasePath: "/auth",
  },
  recipeList: [
    Dashboard.init({
      admins: [process.env.SUPERTOKENS_EMAIL || ""],
    }),
    EmailPassword.init({
      signUpFeature: {
        formFields: [
          {
            id: "email", // username, but SuperTokens needs it to be called email
            validate: async (value) => {
              if (typeof value !== "string") {
                return "Please provide a string input.";
              }
              if (value.length < 3) {
                return "Usernames must be at least 3 characters long.";
              }
              if (value.length > 32) {
                return "Usernames may be at most 32 characters long.";
              }
              if (!value.match(/^[a-z0-9_-]+$/)) {
                return "Username must contain only alphanumeric, underscore or hyphen characters.";
              }
            },
          },
          {
            id: "actualEmail",
            validate: async (value) => {
              if (!isEmail(value)) {
                return "Email is invalid";
              }
              if (await getUserByEmail(value)) {
                return "Email already in use. Please sign in, or use another email";
              }
              // TODO: Verify email is not on the blocklist
            },
          },
        ],
      },
      override: {
        apis: (originalImplementation) => {
          return {
            ...originalImplementation,
            signUpPOST: async function (input) {
              let response = await originalImplementation.signUpPOST!(input);
              if (
                response.status === "OK" &&
                response.user.loginMethods.length === 1
              ) {
                // Create user in app-db
                const app_username = response.user.emails[0];
                const app_email = input.formFields.find(
                  (i) => i.id === "actualEmail"
                )!.value;
                console.log("app_username:", app_username); // DEBUG
                console.log("app_email:", app_email); // DEBUG
                await createUser(app_username, app_email);
              }
              return response;
            },
            // TODO?: override generatePasswordResetTokenPOST
          };
        },
        functions: (originalImplementation) => {
          return {
            ...originalImplementation,
            signUp: async function (input) {
              let response = await originalImplementation.signUp(input);
              if (
                response.status === "OK" &&
                response.user.loginMethods.length === 1
              ) {
                // TODO: Send email verification

                console.log("response:", response); // DEBUG

                // Map auth user_id to app_user_id
                const app_user = await getUserByUsername(
                  response.user.emails[0]
                ); // TODO: add exception handling
                const app_user_id = app_user!.user_id.toString();
                SuperTokens.createUserIdMapping({
                  superTokensUserId: response.user.id,
                  externalUserId: app_user_id,
                });
                response.user.id = app_user_id;
                response.user.loginMethods[0].recipeUserId = new RecipeUserId(
                  app_user_id
                );
              }
              return response;
            },
            signIn: async function (input) {
              if (isEmail(input.email)) {
                let user = await getUserByEmail(input.email);
                let userId = user!.user_id.toString(); // TODO: add exception handling
                if (userId !== undefined) {
                  let superTokensUser = await SuperTokens.getUser(userId);
                  if (superTokensUser !== undefined) {
                    // we find the right login method for this user
                    // based on the user ID.
                    let loginMethod = superTokensUser.loginMethods.find(
                      (lm) =>
                        lm.recipeUserId.getAsString() === userId &&
                        lm.recipeId === "emailpassword"
                    );

                    if (loginMethod !== undefined) {
                      input.email = loginMethod.email!;
                    }
                  }
                }
              }
              return originalImplementation.signIn(input);
            },
          };
        },
      },
    }),
    Session.init(),
  ],
});

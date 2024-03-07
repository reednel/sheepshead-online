import dotenv from "dotenv";
import SuperTokens from "supertokens-node";
import Dashboard from "supertokens-node/recipe/dashboard";
import EmailPassword from "supertokens-node/recipe/emailpassword";
import EmailVerification from "supertokens-node/recipe/emailverification";
import Session from "supertokens-node/recipe/session";
import { RecipeUserId } from "supertokens-node";
import { createUser, getUserByEmail } from "../controllers/user.controller";

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
            id: "username",
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
            id: "email",
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
          // TODO?: Add password validation
        ],
      },
      override: {
        apis: (originalImplementation) => {
          return {
            ...originalImplementation,
            signUpPOST: async function (input) {
              input.userContext.username = input.formFields.find(
                (i) => i.id === "username"
              )!.value;
              let response = await originalImplementation.signUpPOST!(input);
              return response;
            },
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
                // Create user in app-db
                const app_username = input.userContext.username;
                const app_email = response.user.emails[0];
                const app_user = await createUser(app_username, app_email); // TODO: add exception handling
                console.log("app_user:", app_user); // DEBUG

                // Map auth user_id to app user_id
                const app_user_id = app_user!.user_id.toString();
                await SuperTokens.createUserIdMapping({
                  superTokensUserId: response.user.id,
                  externalUserId: app_user_id,
                });
                response.user.id = app_user_id;
                response.user.loginMethods[0].recipeUserId = new RecipeUserId(
                  app_user_id
                );

                // TODO?: Send email verification
              }
              return response;
            },
          };
        },
      },
    }),
    EmailVerification.init({
      mode: "REQUIRED", // or "OPTIONAL"
      override: {
        apis: (oI) => {
          return {
            ...oI,
            verifyEmailPOST: async function (input) {
              let response = await oI.verifyEmailPOST!(input);
              if (response.status === "OK") {
                await EmailPassword.updateEmailOrPassword({
                  recipeUserId: response.user.recipeUserId,
                  email: response.user.email,
                });
              }
              // TODO?: update email in app db
              return response;
            },
          };
        },
      },
    }),
    Session.init(),
  ],
});

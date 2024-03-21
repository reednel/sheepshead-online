import dotenv from "dotenv";
import SuperTokens from "supertokens-node";
import Dashboard from "supertokens-node/recipe/dashboard";
import EmailPassword from "supertokens-node/recipe/emailpassword";
import EmailVerification from "supertokens-node/recipe/emailverification";
import Session from "supertokens-node/recipe/session";
import { RecipeUserId } from "supertokens-node";
import { createUser } from "../controllers/auth.controller";
import {
  getUserByEmail,
  getUserByUsername,
  isBannedEmail,
} from "../controllers/user.controller";
import {
  isValidEmail,
  isValidPassword,
  isValidUsername,
} from "../utils/validation";

dotenv.config();

SuperTokens.init({
  debug: true,
  framework: "express",
  supertokens: {
    connectionURI: "http://auth-server:3567",
    apiKey: process.env.SUPERTOKENS_API_KEY,
  },
  appInfo: {
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
              if (!isValidUsername(value)) {
                return "Username is invalid";
              }
            },
          },
          {
            id: "email",
            validate: async (value) => {
              if (!isValidEmail(value)) {
                return "Email is invalid";
              }
              if (await getUserByEmail(value)) {
                return "Email already in use. Please sign in, or use another email";
              }
              if (await isBannedEmail(value)) {
                return "Email is banned";
              }
            },
          },
          {
            id: "password",
            validate: async (value) => {
              if (!isValidPassword(value)) {
                return "Password is invalid";
              }
            },
          },
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

                const app_user = await createUser(app_username, app_email);

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
            signIn: async function (input) {
              console.log("input!:", input);
              if (!isValidEmail(input.email)) {
                let user = await getUserByUsername(input.email);
                input.email = user?.email || input.email;
              }
              return originalImplementation.signIn(input);
            },
          };
        },
      },
    }),
    EmailVerification.init({
      mode: "OPTIONAL", // or "REQUIRED"
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
    Session.init({
      exposeAccessTokenToFrontendInCookieBasedAuth: true,
    }),
  ],
});

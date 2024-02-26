import express from "express";
import cors from "cors";
import supertokens from "supertokens-node";
import Dashboard from "supertokens-node/recipe/dashboard";
import EmailPassword from "supertokens-node/recipe/emailpassword";
import Session from "supertokens-node/recipe/session";
import { errorHandler, middleware } from "supertokens-node/framework/express";

import userRoutes from "./routes/user.routes";
import friendRoutes from "./routes/friend.routes";

supertokens.init({
  framework: "express",
  supertokens: {
    connectionURI: "http://supertokens:3567",
  },
  appInfo: {
    // learn more about this on https://supertokens.com/docs/session/appinfo
    appName: "sheepshead-online",
    apiDomain: "http://localhost:4000",
    websiteDomain: "http://localhost:4200",
    apiBasePath: "/auth",
    websiteBasePath: "/auth",
  },
  recipeList: [Dashboard.init(), EmailPassword.init(), Session.init()],
});

const app = express();
app.use(express.json());
app.disable("x-powered-by");

app.use(
  cors({
    origin: "http://localhost:4200",
    allowedHeaders: ["content-type", ...supertokens.getAllCORSHeaders()],
    credentials: true,
  })
);

app.use(middleware());

app.use(userRoutes);
app.use(friendRoutes);

app.use(errorHandler());

app.listen(4000, () =>
  console.log("Sheepshead Online server ready at: http://localhost:4000")
);

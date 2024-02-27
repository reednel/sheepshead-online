import SuperTokens from "supertokens-web-js";
import Session from "supertokens-web-js/recipe/session";
import EmailPassword from "supertokens-web-js/recipe/emailpassword";

SuperTokens.init({
  appInfo: {
    appName: "sheepshead-online",
    apiDomain: "http://localhost:4000",
    apiBasePath: "/auth",
  },
  recipeList: [Session.init(), EmailPassword.init()],
});

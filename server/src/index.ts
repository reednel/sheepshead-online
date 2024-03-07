import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import supertokens from "supertokens-node";
import { errorHandler, middleware } from "supertokens-node/framework/express";
import userRoutes from "./routes/user.routes";
import friendRoutes from "./routes/friend.routes";
import "./utils/supertokens";

dotenv.config();

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

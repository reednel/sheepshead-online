import dotenv from "dotenv";
import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import cors from "cors";
import supertokens from "supertokens-node";
import { errorHandler, middleware } from "supertokens-node/framework/express";
import authRoutes from "./routes/auth.routes";
import friendRoutes from "./routes/friend.routes";
import userRoutes from "./routes/user.routes";
import registerGameHandlers from "./handlers/game.handlers";
import "./utils/supertokens";
import { connectRedis, disconnectRedis } from "./utils/redis";
import {
  ClientToServerEvents,
  InterServerEvents,
  ServerToClientEvents,
  SocketData,
} from "./types/socket.types";

dotenv.config();

const app = express();
const server = createServer(app);
const io = new Server<
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData
>(server);

app.use(express.json());
app.disable("x-powered-by");

app.use(
  cors({
    origin: "http://localhost:4200",
    allowedHeaders: ["content-type", ...supertokens.getAllCORSHeaders()],
    credentials: true,
  })
);

connectRedis();

app.use(middleware());
app.use(authRoutes);
app.use(friendRoutes);
app.use(userRoutes);
app.use(errorHandler());

io.on("connection", (socket) => {
  registerGameHandlers(io, socket);
});

server.listen(4000, () =>
  console.log("Sheepshead Online server ready at: http://localhost:4000")
);

function handleExit(signal: NodeJS.Signals) {
  console.log(`Received ${signal}. Closing server and Redis client.`);
  server.close(async () => {
    await disconnectRedis();
    console.log("Server and Redis client closed.");
    process.exit(0);
  });
}

// Handle shutdown signals
process.on("SIGTERM", handleExit);
process.on("SIGINT", handleExit);

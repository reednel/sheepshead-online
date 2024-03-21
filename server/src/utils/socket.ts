import { Server as HttpServer } from "http";
import { Server } from "socket.io";
import jwt, { JwtHeader, SigningKeyCallback } from "jsonwebtoken";
import jwksClient from "jwks-rsa";
import { redisClient } from "./redis";
import registerGameHandlers from "../handlers/game.handlers";
import {
  ClientToServerEvents,
  InterServerEvents,
  ServerToClientEvents,
  SocketData,
} from "../types/socket.types";

let io: Server<
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData
> | null = null;

export function initializeWebSocket(
  server: HttpServer
): Server<
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData
> {
  io = new Server<
    ClientToServerEvents,
    ServerToClientEvents,
    InterServerEvents,
    SocketData
  >(server);

  // Functions to fetch jwks
  var client = jwksClient({
    jwksUri: "http://localhost:4000/auth/jwt/jwks.json",
  });

  function getKey(header: JwtHeader, callback: SigningKeyCallback) {
    client.getSigningKey(header.kid, function (err, key) {
      var signingKey = key!.getPublicKey();
      callback(err, signingKey);
    });
  }

  io.use(function (socket: any, next: any) {
    if (socket.handshake.query && socket.handshake.query.token) {
      jwt.verify(
        socket.handshake.query.token,
        getKey,
        {},
        function (err, decoded) {
          if (err) return next(new Error("Authentication error"));
          socket.decoded = decoded;
          next();
        }
      );
    } else {
      next(new Error("Authentication error"));
    }
  }).on("connection", function (socket: any) {
    // Connection now authenticated
    console.log("Authenticated user socket connected!"); // DEBUG
    const userId = socket.decoded.sub;

    // Store the mapping in Redis
    redisClient.set(`userSocket:${userId}`, socket.id);

    registerGameHandlers(io!, socket);

    socket.on("disconnect", () => {
      redisClient.del(`userSocket:${userId}`);
    });
  });

  return io;
}

// Function to retrieve a user's socket
// POSSIBLY UNUSED! IN WHICH CASE DELETE AND RM IO AS GLOBAL
export async function getUserSocket(userId: number) {
  try {
    if (!io) {
      throw new Error("Socket.io not initialized");
    }
    const socketId = await redisClient.get(`userSocket:${userId}`);
    return socketId ? io.sockets.sockets.get(socketId) : null;
  } catch (error) {
    console.error("Error in getUserSocket:", error);
    return null;
  }
}

import { createClient } from "redis";

// Create a Redis client instance
const redisClient = createClient({
  socket: {
    host: "app-cache",
    port: 6379,
  },
});
redisClient.on("error", (err) => console.log("Redis Client Error", err));
redisClient.on("connect", () => console.log("Redis Client Connected"));

// Connect to Redis
async function connectRedis() {
  try {
    await redisClient.connect();
    console.log("Connected to Redis successfully");
  } catch (err) {
    console.error("Failed to connect to Redis", err);
  }
}

// Disconnect from Redis
async function disconnectRedis() {
  try {
    await redisClient.quit();
    console.log("Disconnected from Redis successfully");
  } catch (err) {
    console.error("Failed to disconnect from Redis", err);
  }
}

export { redisClient, connectRedis, disconnectRedis };

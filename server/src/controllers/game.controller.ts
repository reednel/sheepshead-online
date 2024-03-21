import { Response } from "express";
import { SessionRequest } from "supertokens-node/framework/express";
import { prisma } from "../utils/prisma";
import { redisClient } from "../utils/redis";
import { getUserSocket } from "../utils/socket";
import { HouseData } from "../types/redis.types";

/**
 * Create a new house record in the database and store it in Redis, add the caller as host of the house.
 * @param {SessionRequest} req
 * @param {Response} res
 * @returns {Promise<void>}
 * @throws {Error} Throws an error for database issues, invalid input, etc.
 */
export async function createHouse(req: SessionRequest, res: Response) {
  try {
    const host_id = Number(req.session!.getUserId());
    const {
      player_count,
      blind_size,
      leaster_legal,
      automatic_double,
      chat_enabled,
      players_permitted,
      spectators_permitted,
    } = req.body;

    // TODO: validate inputs

    // Create house record in app-db
    const houseRecord = await prisma.houses.create({
      data: {
        host_id: host_id,
        player_count: player_count,
        blind_size: blind_size,
        leaster_legal: leaster_legal,
        automatic_double: automatic_double,
        chat_enabled: chat_enabled,
        players_permitted: players_permitted,
        spectators_permitted: spectators_permitted,
      },
    });

    // Cache house record in Redis
    const houseKey = `house:${houseRecord.house_id}`;
    const houseData: HouseData = {
      houseRecord: houseRecord,
      playerList: [host_id],
    };

    await redisClient.set(houseKey, JSON.stringify(houseData));

    // Set expiration for the Redis key?
    // await redisClient.expire(houseKey, 3600);

    res.status(201).json({ house: houseData });
  } catch (error) {
    console.error("Error in createHouse:", error);
    res.status(500).send("Internal Server Error");
  }
}

/**
 * Join a house in the cache.
 * @param {SessionRequest} req
 * @param {Response} res
 * @returns {Promise<void>}
 * @throws {Error} Throws an error for database issues, invalid input, etc.
 */
export async function joinHouse(req: SessionRequest, res: Response) {
  try {
    const { house_id } = req.params;
    const user_id = Number(req.session!.getUserId());

    const houseKey = `house:${house_id}`;
    const houseData = await redisClient.get(houseKey);

    if (!houseData) {
      return res
        .status(404)
        .json({ success: false, message: "House not found" });
    }

    const house = JSON.parse(houseData as string);

    // Check if user is already in the house
    if (house.playerList.includes(user_id)) {
      return res.json({ success: false, message: "Already in the house" });
    }

    // Check if the house is full
    if (house.houseRecord.player_count <= house.playerList.length) {
      return res.json({ success: false, message: "House is full" });
    }

    // Check if the user is allowed to join the house
    // TODO: implement this check

    // Add user to the house in the cache
    house.playerList.push(user_id);
    await redisClient.set(houseKey, JSON.stringify(house));

    // // IN CLIENT SIDE: Something like
    // const socket = getUserSocket(user_id);
    // socket.emit('joinRoom', houseKey); // houseKey is like `house:123`

    res.json({ success: true, message: "Joined house" });
  } catch (error) {
    console.error("Error in joinHouse:", error);
    res.status(500).send("Internal Server Error");
  }
}

/**
 * Leave a house in the cache.
 * @param {SessionRequest} req
 * @param {Response} res
 * @returns {Promise<void>}
 * @throws {Error} Throws an error for database issues, invalid input, etc.
 */
export async function leaveHouse(req: SessionRequest, res: Response) {
  try {
    const { house_id } = req.params;
    const user_id = Number(req.session!.getUserId());

    const houseKey = `house:${house_id}`;
    const houseData = await redisClient.get(houseKey);

    if (!houseData) {
      return res
        .status(404)
        .json({ success: false, message: "House not found" });
    }

    const house = JSON.parse(houseData as string);

    if (!house.playerList.includes(user_id)) {
      return res.json({ success: false, message: "Not in the house" });
    }

    house.playerList = house.playerList.filter((id: number) => id !== user_id);
    await redisClient.set(houseKey, JSON.stringify(house));
    res.json({ success: true, message: "Left house" });
  } catch (error) {
    console.error("Error in leaveHouse:", error);
    res.status(500).send("Internal Server Error");
  }
}

/**
 * Start a game.
 * @param {SessionRequest} req
 * @param {Response} res
 * @returns {Promise<void>}
 * @throws {Error} Throws an error for database issues, invalid input, etc.
 */
export async function startGame(req: SessionRequest, res: Response) {
  try {
    const { house_id } = req.body;
    const user_id = Number(req.session!.getUserId());
    const houseKey = `house:${house_id}`;
    const houseData = await redisClient.get(houseKey);

    if (!houseData) {
      return res
        .status(404)
        .json({ success: false, message: "House not found" });
    }

    const house = JSON.parse(houseData as string);

    if (house.houseRecord.host_id !== user_id) {
      return res
        .status(403)
        .json({ success: false, message: "Not authorized to start game" });
    }

    // io.to(houseKey).emit('gameStart', {/* game start data */});
    // res.json({ success: true, message: "Game started" });
  } catch (error) {
    console.error("Error in startGame:", error);
    res.status(500).send("Internal Server Error");
  }
}

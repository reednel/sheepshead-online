import { Response } from "express";
import { SessionRequest } from "supertokens-node/framework/express";
import { prisma } from "../utils/prisma";
import { redisClient } from "../utils/redis";
import { getUserSocket } from "../utils/socket";
import { HouseData, HandData, PlayerData } from "../types/redis.types";
import { initHand } from "../utils/gamemodes";

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
      gamemode,
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
    // TODO: make this an upsert(?) that's called when a hand is submitted to app-db
    const houseRecord = await prisma.houses.create({
      data: {
        host_id: host_id,
        gamemode: gamemode,
        player_count: player_count,
        blind_size: blind_size,
        leaster_legal: leaster_legal,
        double: automatic_double,
        chat_enabled: chat_enabled,
        players_permitted: players_permitted,
        spectators_permitted: spectators_permitted,
      },
    });

    // Cache house record in Redis
    const houseKey = `house:${houseRecord.house_id}`;
    const houseData: HouseData = {
      houseRecord: houseRecord,
      player_ids: [host_id],
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

    const house: HouseData = JSON.parse(houseData as string);

    // Check if the house is full
    if (house.houseRecord.player_count <= house.player_ids.length) {
      return res.json({ success: false, message: "House is full" });
    }

    // Check if user is already in the house
    if (house.player_ids.includes(user_id)) {
      return res.json({ success: false, message: "Already in the house" });
    }

    // Check if the user is allowed to join the house
    // TODO: implement this check

    // Add user to the house in the cache, in a random position
    const randomIndex = Math.floor(
      Math.random() * (house.player_ids.length + 1)
    );
    house.player_ids.splice(randomIndex, 0, user_id);

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

    const house: HouseData = JSON.parse(houseData as string);

    if (!house.player_ids.includes(user_id)) {
      return res.json({ success: false, message: "Not in the house" });
    }

    house.player_ids = house.player_ids.filter((id: number) => id !== user_id);
    await redisClient.set(houseKey, JSON.stringify(house));
    res.json({ success: true, message: "Left house" });
  } catch (error) {
    console.error("Error in leaveHouse:", error);
    res.status(500).send("Internal Server Error");
  }
}

/**
 * Start a hand.
 * @param {SessionRequest} req
 * @param {Response} res
 * @returns {Promise<void>}
 * @throws {Error} Throws an error for database issues, invalid input, etc.
 */
export async function startHand(req: SessionRequest, res: Response) {
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

    const house: HouseData = JSON.parse(houseData as string);

    if (house.houseRecord.host_id !== user_id) {
      return res
        .status(403)
        .json({ success: false, message: "Not authorized to start hand" });
    }

    // Create hand in app-cache
    const temp_hand_id = redisClient.incr("temp_hand_id");
    const handKey = `hand:${temp_hand_id}`;
    const handData = await initHand(house, 0);
    await redisClient.set(handKey, JSON.stringify(handData));

    res.json({ success: true, message: "Hand started" });

    // io.to(houseKey).emit('handStart', {/* hand start data */});
    // res.json({ success: true, message: "Hand started" });
  } catch (error) {
    console.error("Error in startHand:", error);
    res.status(500).send("Internal Server Error");
  }
}

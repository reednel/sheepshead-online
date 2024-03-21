import { Response } from "express";
import { SessionRequest } from "supertokens-node/framework/express";
import { prisma } from "../utils/prisma";
import { redisClient } from "../utils/redis";
import { House } from "../types/redis.types";

// All a rough draft

/**
 * Create a new house record
 * @param {SessionRequest} req
 * @param {Response} res
 * @returns {Promise<void>}
 * @throws {Error} Throws an error for database issues, invalid input, etc.
 */
export async function createHouse(req: SessionRequest, res: Response) {
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

  // Cache house record in redis
  const house: House = {
    houseRecord: houseRecord,
    playerList: [host_id],
  };

  redisClient.set(houseRecord.house_id.toString(), JSON.stringify(house));
  redisClient.quit();

  res.status(201).json({ house: house });
}

/**
 * Join a house
 * @param {SessionRequest} req
 * @param {Response} res
 * @returns {Promise<void>}
 * @throws {Error} Throws an error for database issues, invalid input, etc.
 */
export async function joinHouse(req: SessionRequest, res: Response) {
  const { house_id } = req.params;
  const user_id = Number(req.session!.getUserId());

  const house = JSON.parse(
    (await redisClient.get(`house:${house_id}`)) as string
  );

  if (house.players.length < house.player_count) {
    house.players.push(user_id);
    await redisClient.set(
      `house:${house_id}`,
      JSON.stringify(house.players) // pretty sure this is wrong
    );
    res.json({ success: true, message: "Joined house" });
  } else {
    res.json({ success: false, message: "House is full" });
  }
}

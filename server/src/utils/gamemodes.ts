import { cards } from "@prisma/client";
import { getDeck, shuffle, dealPlayers, dealBlind, seatPlayers } from "./table";
import { HandData, HouseData, PlayerData } from "../types/redis.types";

// enum gamemodes {
//     G_2H_4P // 2 handed, 4 pairs down each, 8 each hand
//     G_2H_6P // 2 handed, 6 pairs down each, 4 each hand
//     G_3H_10E // 3 handed, 10 each, 2 blind, picker alone
//     G_4H_8E_BQP // 4 handed, 8 each, black queens partners, double on the bump
//     G_4H_8E_QJP // 4 handed, 8 each, queens jack partners
//     G_4H_8E_FQP // 4 handed, 8 each, first 2 queens partners, double on the bump
//     G_4H_7E_2B_CA // 4 handed, 7 each, 2 blind, called ace, black 7s removed, double on the bump
//     G_4H_7E_4B_PA // 4 handed, 7 each, 4 blind, picker alone
//     G_5H_CA // 5 handed, 6 each, 2 blind, called ace
//     G_5H_JD // 5 handed, 6 each, 2 blind, jack of diamonds partner
//     G_6H_5E_DS // 6 handed, G_5H_CA, dealer sits
//     G_6H_5E_JC // 6 handed, 5 each, 4 blind jack of clubs partner
//     G_7H_4E_JD // 7 handed, 4 each, 4 blind, jack of diamonds partner
//     G_7H_4E_2P // 7 handed, 4 each, 4 blind, jack of diamonds and random partner
//     G_7H_4E_LP // 7 handed, 4 each, 4 blind, left of picker is partner
//     G_7H_DS // 7 handed, G_5H_CA, dealer and left of dealer sit
//     G_8H_4E_BQP // 8 handed, 4 each, black queens partners
//     G_8H_4E_FQP // 8 handed, 4 each, first two cleans partners, 7 of diamonds highest trump
//   }

export async function initHand(
  house: HouseData,
  dealerIndex: number
): Promise<HandData> {
  try {
    const gamemode = house.houseRecord.gamemode;
    switch (gamemode) {
      // case "G_2H_4P":
      //   return await init2H4P(house, dealerIndex);
      // case "G_2H_6P":
      //   return await init2H6P(house, dealerIndex);
      // case "G_3H_10E":
      //   return await init3H10E(house, dealerIndex);
      // case "G_4H_8E_BQP":
      //   return await init4H8E_BQP(house, dealerIndex);
      // case "G_4H_8E_QJP":
      //   return await init4H8E_QJP(house, dealerIndex);
      // case "G_4H_8E_FQP":
      //   return await init4H8E_FQP(house, dealerIndex);
      // case "G_4H_7E_2B_CA":
      //   return await init4H7E_2B_CA(house, dealerIndex);
      // case "G_4H_7E_4B_PA":
      //   return await init4H7E_4B_PA(house, dealerIndex);
      case "G_5H_CA":
        return await init5H_CA(house, dealerIndex);
      // case "G_5H_JD":
      //   return await init5H_JD(house, dealerIndex);
      // case "G_6H_5E_DS":
      //   return await init6H5E_DS(house, dealerIndex);
      // case "G_6H_5E_JC":
      //   return await init6H5E_JC(house, dealerIndex);
      // case "G_7H_4E_JD":
      //   return await init7H4E_JD(house, dealerIndex);
      // case "G_7H_4E_2P":
      //   return await init7H4E_2P(house, dealerIndex);
      // case "G_7H_4E_LP":
      //   return await init7H4E_LP(house, dealerIndex);
      // case "G_7H_DS":
      //   return await init7H_DS(house, dealerIndex);
      // case "G_8H_4E_BQP":
      //   return await init8H4E_BQP(house, dealerIndex);
      // case "G_8H_4E_FQP":
      //   return await init8H4E_FQP(house, dealerIndex);
      default:
        throw new Error("Invalid gamemode");
    }
  } catch (error) {
    console.error("Error in initHand:", error);
    throw new Error("Internal Server Error");
  }
}

// ...

/**
 * Initialize a hand of Sheepshead.
 * Mode: 5 handed, called ace.
 * @param house
 * @param dealerIndex
 * @returns {Promise<HandData>}
 * @throws {Error} Throws an error for database issues, invalid input, etc.
 */
async function init5H_CA(
  house: HouseData,
  dealerIndex: number
): Promise<HandData> {
  let deck: cards[] = shuffle(await getDeck());
  let players: PlayerData[] = seatPlayers(house, dealerIndex);
  let blind: cards[] = [];

  [players, deck] = dealPlayers(deck, players, 3);
  [blind, deck] = dealBlind(deck, 2);
  [players, deck] = dealPlayers(deck, players, 3);

  const handData: HandData = {
    house_id: house.houseRecord.house_id,
    players: players,
    blind: blind,
    tricks: [],
  };

  return handData;
}

// ...

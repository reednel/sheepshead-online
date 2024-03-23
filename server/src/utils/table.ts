import { randomBytes } from "crypto";
import { cards, players } from "@prisma/client";
import { prisma } from "./prisma";
import { redisClient } from "./redis";
import { HandData, HouseData, PlayerData } from "../types/redis.types";

/**
 * Get the current deck of cards.
 * Fetch it from app-db if it doesn't exist in the cache.
 * @returns {Promise<cards[]>}
 * @throws {Error} Throws an error for database issues, invalid input, etc.
 */
export async function getDeck(): Promise<cards[]> {
  try {
    const deckData = await redisClient.get("deck");

    if (deckData) {
      const deck: cards[] = JSON.parse(deckData as string);
      return deck;
    }

    const deck = await prisma.cards.findMany();
    await redisClient.set("deck", JSON.stringify(deck));

    return deck;
  } catch (error) {
    console.error("Error in getDeck:", error);
    throw new Error("Internal Server Error");
  }
}

/**
 * Shuffle the deck of cards, with cryptographically secure randomness.
 * @returns {cards[]}
 */
export function shuffle(deck: cards[]): cards[] {
  let currentIndex = deck.length;
  let randomIndex = 0;

  while (currentIndex !== 0) {
    randomIndex = parseInt(randomBytes(4).toString("hex"), 16) % currentIndex;
    currentIndex--;
    [deck[currentIndex], deck[randomIndex]] = [
      deck[randomIndex],
      deck[currentIndex],
    ];
  }

  return deck;
}

/**
 * Deal numCards from the given deck to the given players.
 * @param {cards[]} deck
 * @param {PlayerData[]} players
 * @param {number} numCards
 * @returns {PlayerData[], cards[]} The players with cards dealt, and the updated deck.
 * @throws {Error} Throws an error for database issues, invalid input, etc.
 */
export function dealPlayers(
  deck: cards[],
  players: PlayerData[],
  numCards: number
): [PlayerData[], cards[]] {
  let remainingDeck: cards[] = deck;
  for (let i = 0; i < 5; i++) {
    const dealtCards = deck.slice(0, numCards);
    remainingDeck = deck.slice(numCards);
    if (!players[i].hand) {
      players[i].hand = [];
    }
    players[i].hand!.push(...dealtCards);
  }
  return [players, remainingDeck];
}

/**
 * Deal numCards from the given deck to the given blind.
 * @param {cards[]} deck
 * @param {cards[]} blind
 * @param {number} numCards
 * @returns {cards[], cards[]} The dealt cards, and the updated deck.
 * @throws {Error} Throws an error for database issues, invalid input, etc.
 */
export function dealBlind(deck: cards[], numCards: number): [cards[], cards[]] {
  const dealtCards = deck.slice(0, numCards);
  const remainingDeck = deck.slice(numCards);
  return [dealtCards, remainingDeck];
}

/**
 * Seat the players in the house.
 * @param {HouseData} house
 * @param {number} dealerIndex
 * @returns {PlayerData[]}
 * @throws {Error} Throws an error for database issues, invalid input, etc.
 */
export function seatPlayers(
  house: HouseData,
  dealerIndex: number
): PlayerData[] {
  const players: PlayerData[] = [];
  const playerCount = house.player_ids.length;
  for (let i = 0; i < playerCount; i++) {
    const player_id = house.player_ids[(dealerIndex + 1 + i) % playerCount];
    const player: PlayerData = {
      user_id: player_id,
      player_index: i,
      role: null,
      hand: null,
    };
    players.push(player);
  }
  return players;
}

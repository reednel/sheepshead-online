import { houses, hand_roles, cards } from "@prisma/client";

export interface HouseData {
  houseRecord: houses;
  player_ids: number[];
}

export interface HandData {
  house_id: number;
  players: PlayerData[];
  blind: cards[] | null;
  tricks: TrickData[];
}

export interface PlayerData {
  user_id: number;
  player_index: number;
  role: hand_roles | null;
  hand: cards[] | null;
}

export interface TrickData {
  trick_index: number;
  winner: number;
  points_won: number;
  plays: PlayData[];
}

export interface PlayData {
  play_index: number;
  user_id: number;
  card_code: string;
}

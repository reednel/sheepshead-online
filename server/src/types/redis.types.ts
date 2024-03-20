import { houses } from "@prisma/client";

export interface House {
  houseRecord: houses;
  playerList: number[];
}

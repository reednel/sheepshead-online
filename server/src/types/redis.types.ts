import { houses } from "@prisma/client";

export interface HouseData {
  houseRecord: houses;
  playerList: number[];
}

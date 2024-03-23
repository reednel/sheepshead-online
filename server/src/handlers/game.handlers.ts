import { Server, Socket } from "socket.io";
import { MoveData } from "../types/socket.types";

const registerGameHandlers = (io: Server, socket: Socket) => {
  const joinHouse = (houseKey: string) => {
    socket.join(houseKey);
  };

  const playerMove = (moveData: MoveData) => {
    const { houseKey, move } = moveData;
    socket.to(houseKey).emit("updateGame", move);
  };

  socket.on("playerMove", playerMove);
  socket.on("joinHouse", joinHouse);
};

export default registerGameHandlers;

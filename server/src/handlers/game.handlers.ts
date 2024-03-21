import { Server, Socket } from "socket.io";
import { CreateGamePayload, JoinGamePayload } from "../types/socket.types";

const registerGameHandlers = (io: Server, socket: Socket) => {
  const joinHouse = (houseKey: string) => {
    socket.join(houseKey);
  };

  const playerMove = (moveData: any) => {
    const { houseKey, move } = moveData;
    socket.to(houseKey).emit("updateGame", move);
  };

  const createGame = (payload: CreateGamePayload) => {
    // ...
    console.log("createGame", payload);
    console.log("io", io);
  };

  const joinGame = (gameID: JoinGamePayload, callback: Function) => {
    // ...
    console.log("joinGame", gameID);
    callback("joined");
  };

  socket.on("playerMove", playerMove);
  socket.on("joinHouse", joinHouse);
  socket.on("game:create", createGame);
  socket.on("game:join", joinGame);
};

export default registerGameHandlers;

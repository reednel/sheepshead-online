import { Server, Socket } from "socket.io";

const registerGameHandlers = (io: Server, socket: Socket) => {
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

  socket.on("game:create", createGame);
  socket.on("game:join", joinGame);
};

export default registerGameHandlers;

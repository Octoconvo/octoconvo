import { ClientToServerEvents, ServerToClientEvents } from "../@types/socket";
import { Socket } from "socket.io";
import debug from "debug";

const logger = debug("backend:socket");

const createSubToRoomFn = (
  socket: Socket<ClientToServerEvents, ServerToClientEvents>,
): ((room: string) => void) => {
  return (room: string) => {
    socket.join(room);
    logger(`a client joined room: ${room}`);
  };
};

const createUnsubToRoomFn = (
  socket: Socket<ClientToServerEvents, ServerToClientEvents>,
): ((room: string) => void) => {
  return (room: string) => {
    socket.join(room);
    logger(`a client left room: ${room}`);
  };
};

export { createSubToRoomFn, createUnsubToRoomFn };

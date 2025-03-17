import { Server } from "socket.io";
import { Express } from "express";
import { Server as NodeServer } from "node:http";
import { ClientToServerEvents, ServerToClientEvents } from "../@types/socket";
import { createSubToRoomFn, createUnsubToRoomFn } from "./room";

const createSocketServer = (server: NodeServer, app: Express) => {
  const io = new Server<ClientToServerEvents, ServerToClientEvents>(server, {
    cors: {
      origin: process.env.ORIGIN,
      methods: ["GET", "POST", "PUT", "DELETE"],
      credentials: true,
    },
  });

  app.set("io", io);

  io.on("connection", socket => {
    socket.emit("initiate");

    socket.on("subscribe", createSubToRoomFn(socket));

    socket.on("unsubscribe", createUnsubToRoomFn(socket));
  });
};

exports.createSocketServer = createSocketServer;
export { createSocketServer };

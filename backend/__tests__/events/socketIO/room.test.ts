import { Server, Socket } from "socket.io";
import { createSubToRoomFn, createUnsubToRoomFn } from "../../../events/room";
import { createServer } from "node:http";
import ioc, { Socket as ClientSocket } from "socket.io-client";

describe("Test subscribe and unsibscribe to room functions", () => {
  let io: null | Server = null;
  let serverSocket: null | Socket = null;
  let clientSocket: null | ClientSocket = null;
  let subToRoom: null | ((room: string) => void) = null;
  let unsubToRoom: null | ((room: string) => void) = null;

  beforeAll(done => {
    const httpServer = createServer();

    io = new Server(httpServer);

    httpServer.listen(() => {
      const addr = httpServer.address();
      const port = typeof addr === "string" ? addr : addr?.port;

      clientSocket = ioc(`http://localhost:${port}`);

      io?.on("connection", socket => {
        subToRoom = jest.fn(createSubToRoomFn(socket));
        unsubToRoom = jest.fn(createUnsubToRoomFn(socket));
        serverSocket = socket;
      });

      clientSocket.on("connect", done);
    });
  });

  afterAll(() => {
    io?.close();
    clientSocket?.disconnect();
    serverSocket?.disconnect();
  });

  test("subToRoom function should be called on subscribe emit", () => {
    if (subToRoom) {
      subToRoom("1");
      expect(subToRoom).toHaveBeenCalledWith("1");
    }
  });

  test("unsubToRoom function should be called on unsubscribe emit", () => {
    if (unsubToRoom) {
      unsubToRoom("2");

      expect(unsubToRoom).toHaveBeenCalledWith("2");
    }
  });
});

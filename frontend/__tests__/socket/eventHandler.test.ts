import { connectToRoom, onConnect } from "@/socket/eventHandler";
import socket from "@/socket/socket";

describe("Test onConnect function", () => {
  test("log successful user connect", () => {
    const logSpy = jest.spyOn(console, "log");

    onConnect();

    expect(logSpy).toHaveBeenCalledTimes(1);
  });
});

describe("Test connectToRoom funtion", () => {
  beforeAll(() => {
    jest.spyOn(socket, "emit").mockImplementation(jest.fn());
  });
  test("ConnectToRoom to be called with test:1", () => {
    connectToRoom(socket, "test:1");
    expect(socket.emit).toHaveBeenCalledWith("subscribe", "test:1");
  });
});

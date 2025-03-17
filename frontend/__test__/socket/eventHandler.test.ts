import { onConnect } from "@/socket/eventHandler";

describe("Test onConnect function", () => {
  test("log successful user connect", () => {
    const logSpy = jest.spyOn(console, "log");

    onConnect();

    expect(logSpy).toHaveBeenCalledTimes(1);
  });
});

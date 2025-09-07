import { logPopulateMessage } from "../../utils/loggerUtils";

describe("Test logPopulateMessage function", () => {
  beforeAll(() => {
    jest.spyOn(console, "log").mockImplementation(
      jest.fn(
        (
          // eslint-disable-next-line
          string: string,
        ) => {},
      ),
    );
  });

  afterEach(() => {
    jest.spyOn(console, "log").mockClear();
  });

  test("Log the HELLO! with the correct colour", () => {
    logPopulateMessage("HELLO!");
    expect(console.log).toHaveBeenCalledWith("\x1b[36HELLO!");
  });
});

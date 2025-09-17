import { logErrorMessage } from "../../utils/error";

describe("Test logErrorMessage function", () => {
  beforeAll(() => {
    jest
      .spyOn(console, "log")
      .mockImplementation(jest.fn((data: string): string => data) as jest.Mock);
  });

  afterEach(() => {
    jest.spyOn(console, "log").mockClear();
  });

  test("Log error message if the error is instance of Error", () => {
    const error = new Error("Network Error");
    error.message = "Somethng went wrong!";

    logErrorMessage(error);
    expect(console.log).toHaveBeenCalledWith(error.message);
  });
});

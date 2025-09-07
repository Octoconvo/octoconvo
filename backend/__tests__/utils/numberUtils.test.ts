import { isEven } from "../../utils/numberUtils";

describe("Test isEven function", () => {
  test("1 is odd, return false", () => {
    expect(isEven(1)).toBe(false);
  });

  test("2 is even, return true", () => {
    expect(isEven(2)).toBe(true);
  });

  test("0 is even, return true", () => {
    expect(isEven(0)).toBe(true);
  });

  test("1000001 is odd, return false", () => {
    expect(isEven(1000001)).toBe(false);
  });
});

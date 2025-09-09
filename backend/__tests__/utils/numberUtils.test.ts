import {
  floorNumberToInteger,
  getBiggestPowerOfTen,
  isEven,
} from "../../utils/numberUtils";

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

describe("Test getBiggestPowerOfTen", () => {
  test("1 should return 0", () => {
    expect(getBiggestPowerOfTen(1)).toBe(0);
  });

  test("15 should return 1", () => {
    expect(getBiggestPowerOfTen(15)).toBe(1);
  });

  test("100 should return 2", () => {
    expect(getBiggestPowerOfTen(100)).toBe(2);
  });

  test("1001 should return 3", () => {
    expect(getBiggestPowerOfTen(1001)).toBe(3);
  });

  test("12345 should return 4", () => {
    expect(getBiggestPowerOfTen(12345)).toBe(4);
  });

  test("999999 should return 5", () => {
    expect(getBiggestPowerOfTen(999999)).toBe(5);
  });

  test("1336699 should return 6", () => {
    expect(getBiggestPowerOfTen(1336699)).toBe(6);
  });
});

describe("Test floorNumberToInteger", () => {
  test("0.01 should return 0", () => {
    expect(floorNumberToInteger(0.001)).toBe(0);
  });

  test("4.56 should return 4.56", () => {
    expect(floorNumberToInteger(4.56)).toBe(4);
  });

  test("100.9999999 should return 100", () => {
    expect(floorNumberToInteger(100.999999)).toBe(100);
  });

  test("100000.333666 should return 1000000", () => {
    expect(floorNumberToInteger(100000.333666)).toBe(100000);
  });
});

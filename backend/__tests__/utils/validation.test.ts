import { isISOString, isUUID } from "../../utils/validation";

describe("Test isISOString validation function", () => {
  test("Return false when string is invalid iso string", () => {
    expect(isISOString("hi")).toBe(false);
  });

  test("Return true if string is a valid iso string", () => {
    expect(isISOString("2025-05-27T12:22:03.186Z")).toBe(true);
  });

  test("Return false if string is a partial is string", () => {
    expect(isISOString("2025-05-27T12:22:03.186")).toBe(false);
  });

  test("Return false if string is a date", () => {
    expect(isISOString("Tue May 27 2025 19:22:22")).toBe(false);
  });
});

describe("Test isUUID validation function", () => {
  test("Return false when string is invalid UUId", () => {
    expect(isISOString("testUUID1")).toBe(false);
  });

  test("Return true when string is a valid UUID", () => {
    expect(isUUID("12345678-1234-1234-8123-123456789011")).toBe(true);
  });
});

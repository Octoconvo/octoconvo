import { formatDateString } from "@/utils/dateUtils";

describe("Test transformDateString function", () => {
  test("return correct date string in january 01 2000 format", () => {
    const date = formatDateString("2025-03-12T20:09:55.245Z");
    const dateChecker = new Date("2025-03-12T20:09:55.245Z");

    expect(date).toBe("March " + `${dateChecker.getDate()}` + " 2025");
  });
});

import { createMockURL } from "@/utils/tests/mocks";

describe("Test createMockURL function", () => {
  test("createMockURL should return the correct link format", () => {
    expect(createMockURL("testurl")).toBe("blob: https://testurl");
  });
});

import { generateUsernameCursor } from "../../utils/cursor";

describe("Test generateUsernameCursor function", () => {
  test("The usernameCursor should return ar", () => {
    const username = generateUsernameCursor({
      firstUsername: "aaron",
      lastUsername: "ar",
    });

    expect(username).toBe("ar");
  });

  test("The usernameCursor should return username1", () => {
    const username = generateUsernameCursor({
      firstUsername: "username",
      lastUsername: "username1",
    });

    expect(username).toBe("username1");
  });

  test("The usernameCursor should return b", () => {
    const username = generateUsernameCursor({
      firstUsername: "aaron",
      lastUsername: "baron",
    });

    expect(username).toBe("b");
  });

  test("The usernameCursor should return ar", () => {
    const username = generateUsernameCursor({
      firstUsername: "adrianne",
      lastUsername: "aryan",
    });

    expect(username).toBe("ar");
  });

  test("The usernameCursor should return A", () => {
    const username = generateUsernameCursor({
      firstUsername: "aryan",
      lastUsername: "Aryan",
    });

    expect(username).toBe("A");
  });
});

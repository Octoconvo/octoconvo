import {
  deconstructFriendCursor,
  generateUsernameCursor,
} from "../../utils/cursor";

describe("Test generateUsernameCursor function", () => {
  test("The usernameCursor should return ab", () => {
    const username = generateUsernameCursor({
      firstUsername: "aaron",
      lastUsername: "ab",
    });

    expect(username).toBe("ab");
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

  test("The usernameCursor should return aa", () => {
    const username = generateUsernameCursor({
      firstUsername: "adrianne",
      lastUsername: "aaron",
    });

    expect(username).toBe("aa");
  });

  test("The usernameCursor should return A", () => {
    const username = generateUsernameCursor({
      firstUsername: "aaron",
      lastUsername: "Aaron",
    });

    expect(username).toBe("A");
  });
});

describe("Test deconstructFriendCursor function", () => {
  test("Return id and username properties", () => {
    const friendCursor = deconstructFriendCursor("testid1_testusername1");

    expect(friendCursor).toStrictEqual({
      id: "testid1",
      username: "testusername1",
    });
  });

  test("Return empty username", () => {
    const friendCursor = deconstructFriendCursor("testid1");

    expect(friendCursor).toStrictEqual({
      id: "testid1",
      username: "",
    });
  });

  test("Return empty id and username", () => {
    const friendCursor = deconstructFriendCursor("");

    expect(friendCursor).toStrictEqual({
      id: "",
      username: "",
    });
  });
});

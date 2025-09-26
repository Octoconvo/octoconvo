import {
  createMockURL,
  generateUserFriendMocks,
  UserFriendMock,
} from "@/utils/tests/mocks";

describe("Test createMockURL function", () => {
  test("createMockURL should return the correct link format", () => {
    expect(createMockURL("testurl")).toBe("blob: https://testurl");
  });
});

describe("Test UserFriendMock Class", () => {
  const displayNameMock = "testdisplayName";
  const usernameMock = "testusername";
  const avatarMock = "testavatar";
  const userFriendMock = new UserFriendMock({
    displayName: displayNameMock,
    username: usernameMock,
  });

  test("username should be testdisplayName", () => {
    expect(userFriendMock.friend.username).toBe(usernameMock);
  });

  test("displayName should be testusername", () => {
    expect(userFriendMock.friend.displayName).toBe(displayNameMock);
  });

  test("avatar should be null", () => {
    expect(userFriendMock.friend.avatar).toBeNull();
  });

  test("status should be pending", () => {
    expect(userFriendMock.status).toBe("PENDING");
  });

  test("friendId should a string", () => {
    const { friendId } = userFriendMock;
    expect(typeof friendId).toBe("string");
  });

  test("friendOfId should a string", () => {
    const { friendOfId } = userFriendMock;
    expect(typeof friendOfId).toBe("string");
  });

  test("createdAt should be a string", () => {
    const { createdAt } = userFriendMock;
    expect(typeof createdAt).toBe("string");
  });

  test(
    "updatedAt should be a string and has the same value as" + " createdAt",
    () => {
      const { createdAt, updatedAt } = userFriendMock;
      expect(typeof updatedAt).toBe("string");
      expect(createdAt).toBe(updatedAt);
    }
  );

  test("Avatar should be a string that contains testavatar", () => {
    const userFriendMock = new UserFriendMock({
      displayName: displayNameMock,
      username: usernameMock,
      avatar: avatarMock,
    });

    expect(userFriendMock.friend.avatar).toContain(avatarMock);
  });
});

describe("Test generateUserFriendsMocks", () => {
  test("Return 10 UserFriendMocks", () => {
    const userFriends = generateUserFriendMocks(10);
    expect(userFriends.length).toBe(10);
  });
});

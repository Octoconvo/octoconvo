import DirectMessageMock from "@/mocks/API/directMessage";

describe("Test DirectMessageMock", () => {
  test("Ensure the DirectMessageMock has the correct shape", () => {
    const directMessageMock: DirectMessageMock = new DirectMessageMock({
      username: "username1",
      displayName: "displayName1",
      message: "content1",
    });

    expect(directMessageMock.id).toBeDefined();
    expect(directMessageMock.recipient).toBeDefined();
    expect(directMessageMock.inbox).toBeDefined();
    expect(directMessageMock.lastMessage).toBeDefined();
  });

  test("DirectMessageMock's recipient's avatar should be null", () => {
    const directMessageMock: DirectMessageMock = new DirectMessageMock({
      username: "username1",
      displayName: "displayName1",
      message: "content1",
    });

    expect(directMessageMock.recipient.avatar).toBeNull();
  });

  test(
    "DirectMessageMock's recipient's avatar should have the correct" + " URL",
    () => {
      const directMessageMock: DirectMessageMock = new DirectMessageMock({
        username: "username1",
        displayName: "displayName1",
        avatar: "user1Avatar",
        message: "content1",
      });

      expect(directMessageMock.recipient.avatar).toContain("user1Avatar");
    }
  );
});

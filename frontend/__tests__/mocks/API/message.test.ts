import AttachmentMock from "@/mocks/API/attachment";
import MessageMock from "@/mocks/API/message";
import { randomUUID } from "crypto";

describe("Test MessageMock class", () => {
  const messageMock: MessageMock = new MessageMock({
    authorDisplayName: "testauthordisplayName",
    authorUsername: "testauthorusername",
    content: "testmessage",
  });

  test("Ensure the MessageMock has the correct shape", () => {
    expect(messageMock.id).toBeDefined();
    expect(messageMock.inboxId).toBeDefined();
    expect(messageMock.authorId).toBeDefined();
    expect(messageMock.content).toBeDefined();
    expect(messageMock.createdAt).toBeDefined();
    expect(messageMock.updatedAt).toBeDefined();
    expect(messageMock.isDeleted).toBeDefined();
    expect(messageMock.isRead).toBeDefined();
    expect(messageMock.hiddenFromAuthor).toBeDefined();
    expect(messageMock.hiddenFromRecipient).toBeDefined();
    expect(messageMock.replyToId).toBeDefined();
    expect(messageMock.author.username).toBeDefined();
    expect(messageMock.author.displayName).toBeDefined();
    expect(messageMock.author.avatar).toBeDefined();
    expect(messageMock.attachments).toBeDefined();
  });

  test(
    "MessageMocks's author's displayName should be" + " testauthordisplayName",
    () => {
      expect(messageMock.author.displayName).toBe("testauthordisplayName");
    }
  );

  test(
    "MessageMocks's author's username should be" + " testauthorusername",
    () => {
      expect(messageMock.author.username).toBe("testauthorusername");
    }
  );

  test("MessageMocks's author's avatar default to null", () => {
    expect(messageMock.author.avatar).toBeNull();
  });

  test("MessageMocks's content should be testmessage", () => {
    expect(messageMock.content).toBe("testmessage");
  });

  test("MessageMocks's attachments defaults to an empty array", () => {
    expect(messageMock.attachments).toStrictEqual([]);
  });

  const authorIdMock: string = randomUUID();
  test(`MessageMocks's authorId to be ${authorIdMock}`, () => {
    const messageMock: MessageMock = new MessageMock({
      authorDisplayName: "testauthordisplayName",
      authorUsername: "testauthorusername",
      content: "testmessage",
      authorId: authorIdMock,
    });
    expect(messageMock.authorId).toBe(authorIdMock);
  });

  test("MessageMocks's replyToId defaults to null", () => {
    expect(messageMock.replyToId).toBeNull();
  });

  test(
    "Generate MessageMock's replyToId if the replyToId argument equals" +
      " true",
    () => {
      const messageMock: MessageMock = new MessageMock({
        authorDisplayName: "testauthordisplayName",
        authorUsername: "testauthorusername",
        content: "testmessage",
        replyToId: true,
      });
      expect(typeof messageMock.replyToId).toBe("string");
    }
  );

  const replyToIdMock: string = randomUUID();
  test(`MessageMock's replyToId should be ${replyToIdMock}`, () => {
    const messageMock: MessageMock = new MessageMock({
      authorDisplayName: "testauthordisplayName",
      authorUsername: "testauthorusername",
      content: "testmessage",
      replyToId: replyToIdMock,
    });
    expect(messageMock.replyToId).toBe(replyToIdMock);
  });

  test("MessageMock's avatar url should be correct", () => {
    const messageMock: MessageMock = new MessageMock({
      authorDisplayName: "testauthordisplayName",
      authorUsername: "testauthorusername",
      content: "testmessage",
      authorAvatar: "testavatar",
    });
    expect(messageMock.author.avatar).toContain("avatar");
  });

  test("MessageMock's attachments should have the correct authorId", () => {
    const messageMock: MessageMock = new MessageMock({
      authorDisplayName: "testauthordisplayName",
      authorUsername: "testauthorusername",
      content: "testmessage",
      attachments: [
        new AttachmentMock({
          subType: "JPEG",
          thumbnailUrl: "testthumbnailUrl",
          url: "testurl",
        }),
      ],
    });
    for (const attachment of messageMock.attachments) {
      expect(attachment.messageId).toBe(messageMock.id);
    }
  });
});

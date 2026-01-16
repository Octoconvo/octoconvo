import AttachmentMock from "@/mocks/API/attachment";
import { randomUUID } from "crypto";

describe("Test AttachmentMock class", () => {
  const messageIdMock: string = randomUUID();
  const attachmentMock: AttachmentMock = new AttachmentMock({
    messageId: messageIdMock,
    subType: "JPEG",
    width: 500,
    height: 240,
    url: "url",
    thumbnailUrl: "thumbnailUrl",
  });

  test("Ensure the AttachmentMock has the correct shape", () => {
    expect(attachmentMock.id).toBeDefined();
    expect(attachmentMock.messageId).toBeDefined();
    expect(attachmentMock.type).toBeDefined();
    expect(attachmentMock.subType).toBeDefined();
    expect(attachmentMock.width).toBeDefined();
    expect(attachmentMock.height).toBeDefined();
    expect(attachmentMock.url).toBeDefined();
    expect(attachmentMock.thumbnailUrl).toBeDefined();
  });

  test("AttachmentMock's width and height default values", () => {
    const attachmentMock: AttachmentMock = new AttachmentMock({
      messageId: randomUUID(),
      subType: "JPEG",

      url: "url",
      thumbnailUrl: "thumbnailUrl",
    });

    expect(attachmentMock.width).toBe(320);
    expect(attachmentMock.height).toBe(320);
  });

  test("AttachmentMock's width should be 500", () => {
    expect(attachmentMock.width).toBe(500);
  });

  test("AttachmentMock's height should be 240", () => {
    expect(attachmentMock.height).toBe(240);
  });

  test("AttachmentMock's subType should be JPEG", () => {
    expect(attachmentMock.subType).toBe("JPEG");
  });

  test(`AttachmentMock's messageId should be ${messageIdMock}`, () => {
    expect(attachmentMock.messageId).toBe(messageIdMock);
  });

  test(
    "AttachmenMock's messageId should be updated after running updateMessageId" +
      " method",
    () => {
      expect(attachmentMock.messageId).toBe(messageIdMock);
      const newMessageIdMock: string = randomUUID();
      attachmentMock.updateMessageId(newMessageIdMock);
      expect(attachmentMock.messageId).toBe(newMessageIdMock);
    }
  );
});

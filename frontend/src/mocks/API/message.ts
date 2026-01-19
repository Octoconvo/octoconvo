import { InboxMessageAPI, AttachmentAPI } from "@/types/api";
import { randomUUID } from "crypto";
import AttachmentMock from "./attachment";

interface MessageMockConstructor {
  content: string;
  authorId?: string;
  authorAvatar?: string | null;
  authorUsername: string;
  authorDisplayName: string;
  replyToId?: boolean | string;
  attachments?: AttachmentMock[];
}

class MessageMock implements InboxMessageAPI {
  id: string;
  inboxId: string;
  authorId: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  isDeleted: boolean;
  isRead: boolean;
  hiddenFromAuthor: boolean;
  hiddenFromRecipient: boolean;
  replyToId: string | null;
  author: { username: string; displayName: string; avatar: string | null };
  attachments: AttachmentMock[];

  constructor({
    content,
    replyToId,
    authorUsername,
    authorAvatar,
    authorDisplayName,
    attachments,
    authorId,
  }: MessageMockConstructor) {
    this.id = randomUUID();
    this.inboxId = randomUUID();
    this.authorId = authorId ? authorId : randomUUID();
    this.content = content;
    this.createdAt = new Date().toISOString();
    this.updatedAt = this.createdAt;
    this.isDeleted = false;
    this.isRead = false;
    this.hiddenFromAuthor = false;
    this.hiddenFromRecipient = false;
    this.replyToId = replyToId
      ? typeof replyToId === "string"
        ? replyToId
        : randomUUID()
      : null;
    this.author = {
      username: authorUsername,
      displayName: authorDisplayName,
      avatar: authorAvatar ? authorAvatar : null,
    };
    this.attachments = attachments || [];

    for (const attachment of this.attachments) {
      attachment.updateMessageId(this.id);
    }
  }
}

const generateMessageMock = (size: number): MessageMock[] => {
  const messages: MessageMock[] = [];

  for (let i: number = 0; i < size; i++) {
    const authorUsername: string = `authorusername${i}`;
    const authorDisplayName: string = `authordisplayName${i}`;
    const content: string = `message${i}`;

    messages.push(
      new MessageMock({
        authorUsername: authorUsername,
        authorDisplayName: authorDisplayName,
        content: content,
      })
    );
  }

  return messages;
};

export default MessageMock;
export { generateMessageMock };

import {
  DirectMessageAPI,
  DirectMessageAPILastMessage,
  DirectMessageAPIInbox,
  DirectMessageAPIRecipient,
} from "@/types/api";
import { randomUUID } from "crypto";
import createMockURL from "../createMockURL";

interface DirectMessageMockConstructor {
  username: string;
  displayName: string;
  avatar?: string | null;
  message: string;
}

class DirectMessageMock implements DirectMessageAPI {
  id: string;
  recipient: DirectMessageAPIRecipient;
  inbox: DirectMessageAPIInbox;
  lastMessage: DirectMessageAPILastMessage;

  constructor({
    username,
    displayName,
    avatar,
    message,
  }: DirectMessageMockConstructor) {
    this.id = randomUUID();
    this.recipient = {
      id: randomUUID(),
      username: username,
      displayName: displayName,
      avatar: avatar ? createMockURL(`${avatar}`) : null,
    };
    this.inbox = {
      id: randomUUID(),
    };
    this.lastMessage = {
      content: message,
    };
  }
}

const generateDirectMessageMock = (size: number): DirectMessageAPI[] => {
  const directMessages: DirectMessageAPI[] = [];

  for (let i: number = 0; i < size; i++) {
    const username: string = `username${i}`;
    const displayName: string = `displayName${i}`;
    const message: string = `message${i}`;

    directMessages.push(
      new DirectMessageMock({ username, displayName, message })
    );
  }

  return directMessages;
};

export { DirectMessageMock, generateDirectMessageMock };

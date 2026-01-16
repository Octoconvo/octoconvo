import { Message } from "@prisma/client";

type GenerateUsernameCursor = {
  firstUsername: string;
  lastUsername: string;
};

const generateUsernameCursor = ({
  firstUsername,
  lastUsername,
}: GenerateUsernameCursor) => {
  let username = "";
  let doUsernamesCharAtMatch = true;

  for (let i = 0; i <= lastUsername.length && doUsernamesCharAtMatch; i++) {
    username += lastUsername.charAt(i);
    doUsernamesCharAtMatch = firstUsername.charAt(i) === lastUsername.charAt(i);
  }

  return username;
};

type FriendCursor = {
  id: string;
  username: string;
};

const deconstructFriendCursor = (string: string): FriendCursor => {
  const cursorValues = string.split("_");

  return {
    id: cursorValues[0] || "",
    username: cursorValues[1] || "",
  };
};

type ConstructFriendCursor = {
  id: string;
  username: string;
};

const constructFriendCursor = ({
  id,
  username,
}: ConstructFriendCursor): string => {
  return `${id}_${username}`;
};

interface MessageCursorFields {
  id: string;
  createdAt: string;
}

const deconstructMessageCursor = (string: string): MessageCursorFields => {
  const cursorValues: string[] = string.split("_");

  return {
    id: cursorValues[0],
    createdAt: cursorValues[1],
  };
};

interface ConstructMessageCursorArgs {
  id: string;
  createdAt: Date;
}

const constructMessageCursor = ({
  id,
  createdAt,
}: ConstructMessageCursorArgs) => {
  return `${id}_${new Date(createdAt).toISOString()}`;
};

const getMsgCursors = (
  messages: Message[],
): {
  prevCursor: string | null;
  nextCursor: string | null;
} => {
  const firstMsgCursor =
    messages.length && messages[0] ? constructMessageCursor(messages[0]) : null;

  const lastIndex = messages.length - 1;
  const lastMsgCursor =
    messages.length && messages[lastIndex]
      ? constructMessageCursor(messages[lastIndex])
      : null;

  // Get the oldest message as the previous cursor
  const prevCursor: string | null = firstMsgCursor;

  // Get the latest message as the next cursor
  const nextCursor: string | null = lastMsgCursor;

  return {
    prevCursor,
    nextCursor,
  };
};

export {
  generateUsernameCursor,
  deconstructFriendCursor,
  constructFriendCursor,
  constructMessageCursor,
  deconstructMessageCursor,
  getMsgCursors,
};

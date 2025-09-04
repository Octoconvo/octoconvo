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

export {
  generateUsernameCursor,
  deconstructFriendCursor,
  constructFriendCursor,
};

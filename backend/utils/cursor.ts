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

export { generateUsernameCursor };

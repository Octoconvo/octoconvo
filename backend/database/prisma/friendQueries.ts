import prisma from "./client";

type GetFriendByUsername = {
  userUsername: string;
  friendUsername: string;
};

const getFriendByUsername = async ({
  userUsername,
  friendUsername,
}: GetFriendByUsername) => {
  const friend = await prisma.friend.findFirst({
    where: {
      friendOf: {
        username: userUsername,
      },
      friend: {
        username: friendUsername,
      },
    },
  });

  return friend;
};

export { getFriendByUsername };

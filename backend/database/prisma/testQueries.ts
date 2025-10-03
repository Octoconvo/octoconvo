import prisma from "./client";

interface GetUserFriendsArgs {
  username: string;
  limit?: number;
}

const getUserFriends = ({ username, limit }: GetUserFriendsArgs) => {
  return prisma.friend.findMany({
    where: {
      friendOf: {
        username: username,
      },
    },
    orderBy: [{ friend: { username: "asc" } }, { friend: { id: "asc" } }],
    include: {
      friend: {
        select: {
          username: true,
        },
      },
    },
    ...(limit
      ? {
          take: limit,
        }
      : {}),
  });
};

interface GetUserLastFriendArgs {
  username: string;
  orderBy: "asc" | "desc";
}

const getUserLastFriend = ({ username, orderBy }: GetUserLastFriendArgs) => {
  return prisma.friend.findFirst({
    where: {
      friendOf: {
        username: username,
      },
    },
    orderBy: [{ friend: { username: orderBy } }, { friend: { id: orderBy } }],
    include: {
      friend: {
        select: {
          username: true,
        },
      },
    },
    take: 1,
  });
};

export { getUserFriends, getUserLastFriend };

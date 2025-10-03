import { NotificationType } from "@prisma/client";
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

interface CreateNotificationArgs {
  triggeredByUsername: string;
  triggeredForUsername: string;
  type: NotificationType;
  payload: string;
}

const createNotification = ({
  triggeredByUsername,
  triggeredForUsername,
  type,
  payload,
}: CreateNotificationArgs) => {
  return prisma.notification.create({
    data: {
      triggeredBy: {
        connect: {
          username: triggeredByUsername,
        },
      },
      triggeredFor: {
        connect: {
          username: triggeredForUsername,
        },
      },
      type: type,
      payload: payload,
      status: "PENDING",
      isRead: false,
    },
    include: {
      triggeredBy: {
        select: {
          username: true,
        },
      },
      triggeredFor: {
        select: {
          username: true,
        },
      },
      community: {
        select: {
          name: true,
        },
      },
    },
  });
};

interface CreateFriendArgs {
  friendOfUsername: string;
  friendUsername: string;
}

const createFriend = ({
  friendOfUsername,
  friendUsername,
}: CreateFriendArgs) => {
  return prisma.friend.create({
    data: {
      friendOf: {
        connect: {
          username: friendOfUsername,
        },
      },
      friend: {
        connect: {
          username: friendUsername,
        },
      },
    },
  });
};

export { getUserFriends, getUserLastFriend, createNotification, createFriend };

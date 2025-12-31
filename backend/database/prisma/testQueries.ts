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

interface CreateFriendsAndNotificationArgs {
  username: string;
  friendUsername: string;
}
const createFriendsAndNotification = async ({
  username,
  friendUsername,
}: CreateFriendsAndNotificationArgs) => {
  const notification = await createNotification({
    triggeredForUsername: username,
    triggeredByUsername: friendUsername,
    payload: "sent a friend request",
    type: "FRIENDREQUEST",
  });

  const friends = await Promise.all([
    createFriend({
      friendOfUsername: username,
      friendUsername: friendUsername,
    }),
    createFriend({
      friendOfUsername: friendUsername,
      friendUsername: username,
    }),
  ]);

  return {
    notification,
    friends,
  };
};

type DeleteFriendByIds = {
  friendOfId: string;
  friendId: string;
};

const deleteFriendByIds = async ({
  friendOfId,
  friendId,
}: DeleteFriendByIds) => {
  return prisma.friend.delete({
    where: {
      friendOfId_friendId: {
        friendOfId: friendOfId,
        friendId: friendId,
      },
    },
  });
};

const deleteNotificatioById = async (id: string) => {
  return prisma.notification.delete({
    where: {
      id: id,
    },
  });
};

const getUserByUsername = (username: string) => {
  return prisma.user.findUnique({
    where: {
      username: username,
    },
  });
};

interface DeleteFriendRequestsArgs {
  id: string;
  friendId: string;
  startDate: string;
  endDate: string;
}

const deleteFriendRequests = ({
  id,
  friendId,
  startDate,
  endDate,
}: DeleteFriendRequestsArgs) => {
  return prisma.notification.deleteMany({
    where: {
      OR: [
        {
          triggeredForId: id,
          triggeredById: friendId,
        },
        {
          triggeredForId: friendId,
          triggeredById: id,
        },
      ],
      type: "FRIENDREQUEST",
      createdAt: {
        gte: startDate,
        lte: endDate,
      },
    },
  });
};

interface GetDMByParticipantsArgs {
  usernameOne: string;
  usernameTwo: string;
}

const getDMByParticipants = ({
  usernameOne,
  usernameTwo,
}: GetDMByParticipantsArgs) => {
  return prisma.directMessage.findFirst({
    where: {
      AND: [
        {
          participants: {
            some: {
              user: {
                username: usernameOne,
              },
            },
          },
        },
        {
          participants: {
            some: {
              user: {
                username: usernameTwo,
              },
            },
          },
        },
      ],
    },
  });
};

export {
  getUserFriends,
  getUserLastFriend,
  createNotification,
  createFriend,
  createFriendsAndNotification,
  deleteNotificatioById,
  deleteFriendByIds,
  getUserByUsername,
  deleteFriendRequests,
  getDMByParticipants,
};

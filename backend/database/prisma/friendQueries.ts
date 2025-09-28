import { Friend, Prisma } from "@prisma/client";
import prisma from "./client";
import {
  createNotificationTransaction,
  updateNotificationByIdTransaction,
} from "./notificationQueries";
import { NotificationRes } from "../../@types/apiResponse";

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

type CreateFriendTransaction = {
  tx: Prisma.TransactionClient;
  status: "PENDING" | "ACTIVE";
  userId: string;
  friendId: string;
};

const createFriendTransaction = async ({
  tx,
  status,
  userId,
  friendId,
}: CreateFriendTransaction) => {
  return tx.friend.create({
    data: {
      friendOf: {
        connect: {
          id: userId,
        },
      },
      friend: {
        connect: {
          id: friendId,
        },
      },
      status: status,
    },
  });
};

type AddFriend = {
  userId: string;
  friendId: string;
  payload: string;
};

const addFriend = async ({ userId, friendId, payload }: AddFriend) => {
  const { friends, notification } = await prisma.$transaction(async tx => {
    const userToFriend = createFriendTransaction({
      tx,
      userId: userId,
      friendId,
      status: "PENDING",
    });
    const friendToUser = createFriendTransaction({
      tx,
      userId: friendId,
      friendId: userId,
      status: "PENDING",
    });
    const friends = await Promise.all([userToFriend, friendToUser]);

    const notification = await createNotificationTransaction({
      tx: tx,
      type: "FRIENDREQUEST",
      communityId: null,
      triggeredById: userId,
      triggeredForId: friendId,
      payload: payload,
      status: "PENDING",
    });

    return {
      friends,
      notification,
    };
  });

  return { friends, notification };
};

type DeleteFriendByIdsTransaction = {
  tx: Prisma.TransactionClient;
  friendOfId: string;
  friendId: string;
};

const deleteFriendByIdsTransaction = ({
  tx,
  friendOfId,
  friendId,
}: DeleteFriendByIdsTransaction) => {
  return tx.friend.delete({
    where: {
      friendOfId_friendId: {
        friendOfId: friendOfId,
        friendId: friendId,
      },
    },
  });
};

type UpdateFriendByIdsTransaction = {
  tx: Prisma.TransactionClient;
  friendOfId: string;
  friendId: string;
  status: "ACTIVE" | "PENDING";
  updatedAt: Date;
};

const updateFriendByIdsTransaction = ({
  tx,
  friendOfId,
  friendId,
  status,
  updatedAt,
}: UpdateFriendByIdsTransaction) => {
  return tx.friend.update({
    where: {
      friendOfId_friendId: {
        friendOfId: friendOfId,
        friendId: friendId,
      },
    },
    data: {
      status: status,
      updatedAt: updatedAt,
    },
  });
};

type HandleFriendRequest = {
  userId: string;
  friendId: string;
  notificationId: string;
  action: "REJECT" | "ACCEPT";
};

const handleFriendRequest = async ({
  userId,
  friendId,
  notificationId,
  action,
}: HandleFriendRequest) => {
  const { friends, notification, newNotification } = await prisma.$transaction(
    async tx => {
      let friends: null | Friend[] = null;
      let newNotification: null | NotificationRes = null;

      if (action === "REJECT") {
        await deleteFriendByIdsTransaction({
          tx,
          friendOfId: userId,
          friendId: friendId,
        });
        await deleteFriendByIdsTransaction({
          tx,
          friendOfId: friendId,
          friendId: userId,
        });
      }

      if (action === "ACCEPT") {
        const updatedAt = new Date();
        const userToFriend = await updateFriendByIdsTransaction({
          tx,
          friendOfId: userId,
          friendId: friendId,
          status: "ACTIVE",
          updatedAt: updatedAt,
        });
        const friendToUser = await updateFriendByIdsTransaction({
          tx,
          friendOfId: friendId,
          friendId: userId,
          status: "ACTIVE",
          updatedAt: updatedAt,
        });
        friends = await Promise.all([userToFriend, friendToUser]);
        newNotification = await createNotificationTransaction({
          tx,
          communityId: null,
          type: "REQUESTUPDATE",
          triggeredById: userId,
          triggeredForId: friendId,
          payload: "accepted your friend request",
          status: "COMPLETED",
        });
      }

      const notification = await updateNotificationByIdTransaction({
        tx: tx,
        id: notificationId,
        isRead: true,
        status:
          action === "ACCEPT"
            ? "ACCEPTED"
            : action === "REJECT"
              ? "REJECTED"
              : null,
      });

      return {
        friends,
        notification,
        newNotification,
      };
    },
  );

  return { friends, notification, newNotification };
};

type FriendCursor = {
  id: string;
  username: string;
};

type GetUserFriendsWithCursor = {
  cursor: FriendCursor;
  userId: string;
  limit: number;
};

const getUserFriendsWithCursor = async ({
  cursor,
  userId,
  limit,
}: GetUserFriendsWithCursor) => {
  const friends = await prisma.friend.findMany({
    where: {
      friendOfId: userId,
      OR: [
        {
          friend: {
            username: {
              gt: cursor.username,
            },
          },
        },
        {
          friend: {
            username: {
              gte: cursor.username,
            },
            id: {
              gt: cursor.id,
            },
          },
        },
      ],
    },
    orderBy: [{ friend: { username: "asc" } }, { friend: { id: "asc" } }],
    take: limit,
    include: {
      friend: {
        select: {
          username: true,
          displayName: true,
          avatar: true,
        },
      },
    },
  });

  return friends;
};

export {
  getFriendByUsername,
  createFriendTransaction,
  updateFriendByIdsTransaction,
  addFriend,
  handleFriendRequest,
  getUserFriendsWithCursor,
};

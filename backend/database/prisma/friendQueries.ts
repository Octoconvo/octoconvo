import { Prisma } from "@prisma/client";
import prisma from "./client";
import { createNotificationTransaction } from "./notificationQueries";

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

export { getFriendByUsername, createFriendTransaction, addFriend };

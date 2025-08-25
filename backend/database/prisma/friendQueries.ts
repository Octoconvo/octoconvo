import { Prisma } from "@prisma/client";
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

export { getFriendByUsername, createFriendTransaction };

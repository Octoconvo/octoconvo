import { User, FriendsStatus } from "@prisma/client";
import prisma from "./client";

const getUserByUsername = async (username: string): Promise<User | null> => {
  return await prisma.user.findUnique({
    where: {
      username: username,
    },
  });
};

type GetSeedUsersData = Promise<User[]>;

const getSeedUsers = async (): GetSeedUsersData => {
  const user = await prisma.user.findMany({
    where: {
      username: {
        startsWith: "seeduser",
      },
    },
  });

  return user;
};

const deleteUserFriends = async (userId: string) => {
  await prisma.friend.deleteMany({
    where: {
      OR: [{ friendOfId: userId }, { friendId: userId }],
    },
  });
};

type CreateFriends = {
  friendOfId: string;
  friendId: string;
  status: FriendsStatus;
};

const createFriend = ({ friendOfId, friendId, status }: CreateFriends) => {
  return prisma.friend.create({
    data: {
      friendOf: {
        connect: {
          id: friendOfId,
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

type CreateFriendsRelationship = {
  userOneId: string;
  userTwoId: string;
  status: FriendsStatus;
};

const createFriendsRelationship = async ({
  userOneId,
  userTwoId,
  status,
}: CreateFriendsRelationship) => {
  const userOneToUserTwo = createFriend({
    friendOfId: userOneId,
    friendId: userTwoId,
    status: status,
  });

  const userTwoToUserOne = createFriend({
    friendOfId: userTwoId,
    friendId: userOneId,
    status: status,
  });

  await prisma.$transaction([userOneToUserTwo, userTwoToUserOne]);
};

const getSeedUsersToPopulateFriends = () => {
  const users = prisma.user.findMany({
    where: {
      username: {
        startsWith: "seeduser",
      },
      NOT: { username: "seeduser1" },
    },
    take: 100,
    orderBy: { username: "asc" },
  });

  return users;
};

const getSeedCommunities = async () => {
  const communities = await prisma.community.findMany({
    where: {
      name: {
        startsWith: "seedcommunity",
      },
    },
  });

  return communities;
};

const deleteCommunityMessages = async (communityId: string) => {
  await prisma.message.deleteMany({
    where: {
      inbox: {
        communityId: communityId,
      },
    },
  });
};

export {
  getUserByUsername,
  getSeedUsers,
  getSeedUsersToPopulateFriends,
  deleteUserFriends,
  createFriendsRelationship,
  getSeedCommunities,
  deleteCommunityMessages,
};

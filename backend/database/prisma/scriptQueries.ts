import {
  User,
  FriendsStatus,
  Community,
  Inbox,
  ParticipantStatus,
  DirectMessage,
  PrismaPromise,
} from "@prisma/client";
import prisma from "./client";
import {
  CommunitiesWithOwnerAndIInbox,
  CommunityWithOwnerAndInbox,
} from "../../@types/scriptTypes";

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

const getClientUsers = () => {
  return prisma.user.findMany({
    where: {
      username: {
        startsWith: "clientuser",
      },
    },
  });
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

type GetSeedUsersToPopulateFriends = {
  limit: number;
};

const getSeedUsersToPopulateFriends = ({
  limit,
}: GetSeedUsersToPopulateFriends) => {
  const users = prisma.user.findMany({
    where: {
      username: {
        startsWith: "seeduser",
      },
      NOT: [
        {
          username: "seeduser1",
        },
        {
          username: "seeduser2",
        },
        {
          username: "seeduser3",
        },
      ],
    },
    take: limit,
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

const getClientCommunities = async () => {
  return prisma.community.findMany({
    where: {
      name: {
        startsWith: "clientcommunity",
      },
    },
  });
};

const getCommunityOwner = async (communityId: string): Promise<User | null> => {
  const owner = await prisma.participant.findFirst({
    where: {
      communityId: communityId,
      role: "OWNER",
    },
    include: {
      user: true,
    },
  });

  return owner?.user || null;
};

const getSeedCommunitiesWithOwnerAndInbox =
  async (): Promise<CommunitiesWithOwnerAndIInbox> => {
    type CommunityAndInbox = Community & {
      inbox: Inbox | null;
      owner?: User | null;
    };

    const communities: CommunityAndInbox[] = await prisma.community.findMany({
      where: {
        name: {
          startsWith: "seedcommunity",
        },
      },
      include: {
        inbox: true,
      },
    });

    const getCommunitiesOwnerPromises = communities.map(
      async (community: CommunityAndInbox, index: number) => {
        const owner = await getCommunityOwner(community.id);
        communities[index] = { ...communities[index], owner };
      },
    );

    await Promise.all(getCommunitiesOwnerPromises);

    return communities;
  };

const deleteCommunityMessages = (communityId: string) => {
  return prisma.message.deleteMany({
    where: {
      inbox: {
        communityId: communityId,
      },
    },
  });
};

type CreateCommunitySeedMessage = {
  number: number;
  inboxId: string;
  authorId: string;
};

const createCommunitySeedMessage = async ({
  number,
  inboxId,
  authorId,
}: CreateCommunitySeedMessage) => {
  await prisma.message.create({
    data: {
      content: `seedmessage${number}`,
      inboxId: inboxId,
      authorId: authorId,
    },
  });
};

const deleteUserNotifications = async (userId: string) => {
  await prisma.notification.deleteMany({
    where: {
      OR: [{ triggeredById: userId }, { triggeredForId: userId }],
    },
  });
};

type CreateCommunityNotification = {
  communityId: string;
  triggeredById: string;
  triggeredForId: string;
};

const createCommunityNotification = async ({
  communityId,
  triggeredById,
  triggeredForId,
}: CreateCommunityNotification) => {
  await prisma.notification.create({
    data: {
      triggeredById: triggeredById,
      triggeredForId: triggeredForId,
      communityId: communityId,
      isRead: false,
      payload: "requested to join",
      type: "COMMUNITYREQUEST",
    },
  });
};

const getSeedUsersWithLimit = async (limit: number) => {
  const user = await prisma.user.findMany({
    where: {
      username: {
        startsWith: "seeduser",
      },
    },
    take: limit,
  });

  return user;
};

const deleteCommunityParticipants = (communityId: string) => {
  return prisma.participant.deleteMany({
    where: {
      communityId: communityId,
      role: "MEMBER",
    },
  });
};

type CreateCommunityMember = {
  communityId: string;
  userId: string;
  status: ParticipantStatus;
};

const createCommunityMember = ({
  status,
  userId,
  communityId,
}: CreateCommunityMember) => {
  return prisma.participant.create({
    data: {
      role: "MEMBER",
      status: status,
      communityId: communityId,
      userId: userId,
    },
  });
};

type IncrementCommunityParticipantsCount = {
  communityId: string;
  count: number;
};

const incrementCommunityParticipantsCount = ({
  communityId,
  count,
}: IncrementCommunityParticipantsCount) => {
  return prisma.community.update({
    where: {
      id: communityId,
    },
    data: {
      participantsCount: {
        increment: count,
      },
    },
  });
};

type AddMemberToCommunity = {
  communityId: string;
  userId: string;
  status: ParticipantStatus;
  count: number;
};

const addMemberToCommunity = async ({
  communityId,
  userId,
  status,
  count,
}: AddMemberToCommunity) => {
  prisma.$transaction([
    createCommunityMember({ communityId, userId, status }),
    incrementCommunityParticipantsCount({ communityId, count }),
  ]);
};

const getCommunityWithOwnerAndInboxByName = async (
  name: string,
): Promise<CommunityWithOwnerAndInbox | null> => {
  const community: CommunityWithOwnerAndInbox | null =
    await prisma.community.findFirst({
      where: {
        name: name,
      },
      include: {
        inbox: true,
      },
    });

  if (community) {
    const owner = await getCommunityOwner(community.id);
    community.owner = owner;
  }

  return community;
};

const deleteCommunityOwner = (communityId: string) => {
  return prisma.participant.deleteMany({
    where: {
      communityId: communityId,
      role: "OWNER",
    },
  });
};

const deleteCommunityNotifications = (communityId: string) => {
  return prisma.notification.deleteMany({
    where: {
      communityId: communityId,
    },
  });
};

const deleteCommunityInbox = (communityId: string) => {
  return prisma.inbox.deleteMany({
    where: {
      communityId: communityId,
    },
  });
};

const deleteCommunity = (communityId: string) => {
  return prisma.community.delete({
    where: {
      id: communityId,
    },
  });
};

const deleteCommunityAndItsData = (communityId: string) => {
  return prisma.$transaction([
    deleteCommunityOwner(communityId),
    deleteCommunityParticipants(communityId),
    deleteCommunityMessages(communityId),
    deleteCommunityInbox(communityId),
    deleteCommunityNotifications(communityId),
    deleteCommunity(communityId),
  ]);
};

type CreateCommunity = {
  name: string;
  bio: string;
  ownerId: string;
};

const createCommunity = ({ name, bio, ownerId }: CreateCommunity) => {
  return prisma.community.create({
    data: {
      name: name,
      bio: bio,
      inbox: {
        create: {
          inboxType: "COMMUNITY",
        },
      },
      participantsCount: 1,
      participants: {
        create: {
          userId: ownerId,
          role: "OWNER",
          status: "ACTIVE",
        },
      },
    },
  });
};

// Create a special seecuser who does not have any relations
type CreateSeedLoneUser = {
  index: number;
  password: string;
};

const createSeedLoneUser = async ({ index, password }: CreateSeedLoneUser) => {
  return prisma.user.create({
    data: {
      username: `seedloneuser${index}`,
      displayName: `seedloneuser${index}`,
      password: password,
    },
  });
};

type CreateUser = {
  username: string;
  displayName: string;
  password: string;
};

const createUser = async ({ username, displayName, password }: CreateUser) => {
  return prisma.user.create({
    data: {
      username: username,
      displayName: displayName,
      password: password,
    },
  });
};

const getSeedLoneUsers = async () => {
  return prisma.user.findMany({
    where: {
      username: {
        startsWith: "seedloneuser",
      },
    },
  });
};

const deleteUser = async (id: string) => {
  return prisma.user.delete({
    where: {
      id: id,
    },
  });
};

const deleteUserMessages = async (id: string) => {
  return prisma.message.deleteMany({
    where: {
      authorId: id,
    },
  });
};

type CreateCommunityMessage = CreateCommunitySeedMessage;

const createCommunityMessage = async ({
  number,
  inboxId,
  authorId,
}: CreateCommunityMessage) => {
  await prisma.message.create({
    data: {
      content: `seedmessage${number}`,
      inboxId: inboxId,
      authorId: authorId,
    },
  });
};

interface CreateDirectMessageArgs {
  userOneId: string;
  userTwoId: string;
}

const createDirectMessage = async ({
  userOneId,
  userTwoId,
}: CreateDirectMessageArgs): Promise<DirectMessage> => {
  return prisma.directMessage.create({
    data: {
      inbox: {
        create: {
          inboxType: "DM",
        },
      },
      participants: {
        createMany: {
          data: [
            {
              userId: userOneId,
              role: "MEMBER",
              status: "ACTIVE",
              memberSince: new Date(),
            },
            {
              userId: userTwoId,
              role: "MEMBER",
              status: "ACTIVE",
              memberSince: new Date(),
            },
          ],
        },
      },
    },
    include: {
      participants: true,
    },
  });
};

const deleteDirectMessageParticipants = (
  id: string,
): PrismaPromise<{ count: number }> => {
  return prisma.participant.deleteMany({
    where: {
      directMessageId: id,
    },
  });
};

const deleteDirectMessageMessages = (
  id: string,
): PrismaPromise<{
  count: number;
}> => {
  return prisma.message.deleteMany({
    where: {
      inbox: {
        directMessageId: id,
      },
    },
  });
};

const deleteDirectMessageInbox = (id: string): PrismaPromise<Inbox> => {
  return prisma.inbox.delete({
    where: {
      directMessageId: id,
    },
  });
};

const deleteDirectMessage = (id: string): PrismaPromise<DirectMessage> => {
  return prisma.directMessage.delete({
    where: {
      id: id,
    },
  });
};

const deleteDirectMessageAndItsData = async (id: string) => {
  return prisma.$transaction([
    deleteDirectMessageMessages(id),
    deleteDirectMessageParticipants(id),
    deleteDirectMessageInbox(id),
    deleteDirectMessage(id),
  ]);
};

const getSeedDirectMessages = async (): Promise<DirectMessage[]> => {
  return prisma.directMessage.findMany({
    where: {
      participants: {
        every: {
          user: {
            username: {
              startsWith: "seed",
            },
          },
        },
      },
    },
  });
};

export {
  getUserByUsername,
  getSeedUsers,
  getClientUsers,
  getSeedUsersToPopulateFriends,
  deleteUserFriends,
  createFriendsRelationship,
  getSeedCommunities,
  getSeedCommunitiesWithOwnerAndInbox,
  getClientCommunities,
  deleteCommunityMessages,
  createCommunitySeedMessage,
  deleteUserNotifications,
  createCommunityNotification,
  getSeedUsersWithLimit,
  deleteCommunityParticipants,
  addMemberToCommunity,
  getCommunityWithOwnerAndInboxByName,
  deleteCommunityAndItsData,
  createCommunity,
  createSeedLoneUser,
  createUser,
  getSeedLoneUsers,
  deleteUser,
  deleteUserMessages,
  createCommunityMessage,
  createDirectMessage,
  deleteDirectMessageAndItsData,
  getSeedDirectMessages,
};

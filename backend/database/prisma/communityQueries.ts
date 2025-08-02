import { Community, Participant } from "@prisma/client";
import prisma from "./client";
import {
  createParticipantTransaction,
  deleteParticipantByIdTransaction,
  updateParticipantByIdTransaction,
} from "./participantQueries";
import {
  createNotificationsTransaction,
  updateNotificationByIdTransaction,
} from "./notificationQueries";

const deleteCommunityById = async (id: string) => {
  const deleteCommunity = prisma.community.delete({
    where: {
      id,
    },
  });

  const deleteInbox = prisma.inbox.delete({
    where: {
      communityId: id,
    },
  });

  const deleteParticipants = prisma.participant.deleteMany({
    where: {
      communityId: id,
    },
  });

  await prisma.$transaction([deleteInbox, deleteParticipants, deleteCommunity]);
};

const getCommunityById = async (id: string) => {
  const community = await prisma.community.findUnique({
    where: {
      id: id,
    },
    include: {
      inbox: true,
    },
  });

  return community;
};

const getCommunityByName = async (name: string) => {
  const community = await prisma.community.findFirst({
    where: {
      name: {
        equals: name,
        mode: "insensitive",
      },
    },
  });

  return community;
};

const createCommunity = async ({
  id,
  name,
  bio,
  avatar,
  banner,
}: {
  id: string;
  name: string;
  bio: string | null;
  avatar: string | null;
  banner: string | null;
}) => {
  const community = await prisma.community.create({
    data: {
      name,
      bio,
      avatar,
      banner,
      inbox: {
        create: {
          inboxType: "COMMUNITY",
        },
      },
      participants: {
        create: {
          userId: id,
          role: "OWNER",
          status: "ACTIVE",
          memberSince: new Date(),
        },
      },
      participantsCount: 1,
    },
    include: {
      participants: true,
    },
  });

  return community;
};

const updateCommunity = async ({
  id,
  name,
  bio,
  avatar,
  banner,
  includeParticipant,
}: {
  id: string;
  name?: string;
  bio?: string | null;
  avatar?: string | null;
  banner?: string | null;
  includeParticipant?: boolean;
}) => {
  const community = await prisma.community.update({
    where: {
      id: id,
    },
    data: {
      ...(name ? { name: name } : {}),
      ...(bio ? { bio: bio } : {}),
      ...(avatar ? { avatar: avatar } : {}),
      ...(banner ? { banner: banner } : {}),
    },
    include: {
      ...(includeParticipant ? { participants: true } : {}),
    },
  });

  return community;
};

const getUserCommunities = async ({ userId }: { userId: string }) => {
  const participants = await prisma.participant.findMany({
    where: {
      userId: userId,
      status: "ACTIVE",
    },
  });

  const communityQuery: { id: string }[] = [];

  const createCommunityQuery = participants.map(participant => {
    return new Promise(resolve => {
      if (participant.communityId) {
        communityQuery.push({ id: participant.communityId });
      }

      resolve(participant.communityId);
    });
  });

  await Promise.all(createCommunityQuery);

  const communities = await prisma.community.findMany({
    where: {
      OR: communityQuery,
    },
    include: {
      participants: true,
      inbox: true,
    },
  });

  return communities;
};

const getCommunityByIdAndParticipant = async ({
  communityId,
  participantId,
}: {
  communityId: string;
  participantId: string;
}) => {
  const community = await prisma.community.findUnique({
    where: {
      id: communityId,
      participants: {
        some: {
          userId: participantId,
          status: "ACTIVE",
        },
      },
    },
  });

  return community;
};

const searchCommunities = async ({
  name,
  cursor,
  limit,
}: {
  name: string | null;
  limit: number;
  cursor: null | {
    memberCount: number;
    id: string;
    createdAt: string;
  };
}) => {
  const nameQuery: string = name ? `%${name}%` : "";
  const cursorQuery = cursor ? "TRUE" : "FALSE";
  const memberCountQuery = cursor ? cursor.memberCount : 0;
  const createdAtQuerry = cursor ? new Date(cursor.createdAt) : new Date();
  const idQuery = cursor ? cursor.id : "";

  type CommunityDataRaw = Community & {
    participants?: number;
  };

  const communities: CommunityDataRaw[] = await prisma.$queryRaw`
    SELECT * FROM "Community" 
    WHERE
      (
        CASE WHEN ${nameQuery} = '' THEN "Community"."id" = "Community"."id"
        ELSE UPPER("Community"."name") LIKE UPPER(${nameQuery})
        END
      ) 
      AND
      (
        CASE WHEN ${cursorQuery} = 'FALSE' THEN "id" = "id"
        ELSE
        (
          (
              "participantsCount" < CAST(${memberCountQuery} AS INT) 
            OR
            (
              "participantsCount" = CAST(${memberCountQuery} AS INT) 
              AND
              (
                "createdAt" < CAST(${createdAtQuerry} AS Date)
              OR 
                (
                  "createdAt" = CAST(${createdAtQuerry} AS Date)
                    AND
                  "id" < ${idQuery} 
                )
              )
            )
          )
        ) 
      END) 
    ORDER BY 
      "Community"."participantsCount" DESC
      ,"Community"."createdAt" DESC
      ,"Community"."id" DESC
    LIMIT ${limit}`;

  type CommunityData = Community & {
    _count: {
      participants: number;
    };
  };

  const updateCount = communities.map(community => {
    return new Promise<CommunityData>(resolve => {
      const updatedCommunity = {
        ...community,
        _count: {
          participants: community.participantsCount as number,
        },
      };
      delete updatedCommunity["participants"];
      resolve(updatedCommunity);
    });
  });

  const data = await Promise.all(updateCount);

  return data;
};

const joinCommunity = async ({
  userId,
  communityId,
  triggeredForIds,
  payload,
}: {
  userId: string;
  communityId: string;
  triggeredForIds: string[];
  payload: string;
}) => {
  const { participant, notifications } = await prisma.$transaction(async tx => {
    const participant = await createParticipantTransaction({
      tx: tx,
      userId: userId,
      status: "PENDING",
      role: "MEMBER",
      type: "COMMUNITY",
      directMessageId: null,
      communityId: communityId,
    });

    const notifications = await createNotificationsTransaction({
      tx: tx,
      type: "COMMUNITYREQUEST",
      communityId: communityId,
      triggeredForIds: triggeredForIds,
      triggeredById: userId,
      payload: payload,
    });

    return {
      participant,
      notifications,
    };
  });

  return { participant, notifications };
};

const handleCommunityRequest = async ({
  notificationId,
  participantId,
  action,
}: {
  notificationId: string;
  participantId: string;
  action: "REJECT" | "ACCEPT";
}) => {
  const { participant, notification } = await prisma.$transaction(async tx => {
    let participant: null | Participant = null;

    if (action === "REJECT") {
      await deleteParticipantByIdTransaction({
        tx,
        id: participantId,
      });
    }

    if (action === "ACCEPT") {
      participant = await updateParticipantByIdTransaction({
        tx,
        id: participantId,
        status: "ACTIVE",
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
      participant,
      notification,
    };
  });

  return { participant, notification };
};
export {
  getCommunityById,
  getCommunityByName,
  createCommunity,
  deleteCommunityById,
  getUserCommunities,
  getCommunityByIdAndParticipant,
  searchCommunities,
  updateCommunity,
  joinCommunity,
  handleCommunityRequest,
};

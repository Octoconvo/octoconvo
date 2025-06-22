import { Community } from "@prisma/client";
import prisma from "./client";

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
    },
    include: {
      participants: true,
    },
  });

  return community;
};

const getUserCommunities = async ({ userId }: { userId: string }) => {
  const communities = await prisma.community.findMany({
    where: {
      participants: {
        every: {
          userId: userId,
        },
      },
    },
    include: {
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
    SELECT * FROM (
      SELECT *, 
      CAST((
        SELECT COUNT(*) FROM "Participant" 
        WHERE "Participant"."communityId" = "Community"."id"
        ) AS INT
      ) AS participants
    FROM "Community" 
    WHERE
      (CASE WHEN ${nameQuery} = '' THEN "Community"."id" = "Community"."id"
      ELSE UPPER("Community"."name") LIKE UPPER(${nameQuery})
      END) 
    ORDER BY 
      participants DESC
      , "Community"."createdAt" ASC
      , "Community"."id" DESC
    )
    WHERE 
      (CASE WHEN ${cursorQuery} = 'FALSE' THEN "id" = "id"
      ELSE (
      "participants" <= CAST(${memberCountQuery} AS INT) 
      AND "createdAt" >= CAST(${createdAtQuerry} AS Date) 
      AND NOT "id" = ${idQuery})
      END) 
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
          participants: community.participants as number,
        },
      };
      delete updatedCommunity["participants"];
      resolve(updatedCommunity);
    });
  });

  const data = await Promise.all(updateCount);

  return data;
};

export {
  getCommunityById,
  getCommunityByName,
  createCommunity,
  deleteCommunityById,
  getUserCommunities,
  getCommunityByIdAndParticipant,
  searchCommunities,
};

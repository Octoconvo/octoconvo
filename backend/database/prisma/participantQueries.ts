import prisma from "./client";

const getCommunityParticipant = async ({
  userId,
  communityId,
}: {
  userId: string;
  communityId: string;
}) => {
  const participant = await prisma.participant.findFirst({
    where: {
      communityId: communityId,
      userId: userId,
    },
  });

  return participant;
};

const getCommunityOwner = async ({ communityId }: { communityId: string }) => {
  const participant = await prisma.participant.findFirst({
    where: {
      communityId: communityId,
      role: "OWNER",
    },
  });

  return participant;
};

export { getCommunityParticipant, getCommunityOwner };

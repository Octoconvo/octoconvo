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

export { getCommunityParticipant };

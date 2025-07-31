import { Prisma } from "@prisma/client";
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

const createParticipantTransaction = async ({
  tx,
  userId,
  status,
  role,
  type,
  communityId,
  directMessageId,
}: {
  tx: Prisma.TransactionClient;
  userId: string;
  status: "ACTIVE" | "PENDING";
  role: "MEMBER" | "OWNER";
  type: "COMMUNITY" | "DM";
  communityId: string | null;
  directMessageId: string | null;
}) => {
  return tx.participant.create({
    data: {
      ...(type === "COMMUNITY" && communityId
        ? {
            communityId: communityId,
          }
        : {}),
      ...(type === "DM" && directMessageId
        ? {
            directMessageId: directMessageId,
          }
        : {}),
      role: role,
      userId: userId,
      status: status,
    },
  });
};

const deleteParticipantByIdTransaction = async ({
  tx,
  id,
}: {
  tx: Prisma.TransactionClient;
  id: string;
}) => {
  console.log({ id }, "delete participant");
  return tx.participant.delete({
    where: { id: id },
  });
};

const updateParticipantByIdTransaction = async ({
  tx,
  id,
  userId,
  status,
  role,
  type,
  communityId,
  directMessageId,
}: {
  tx: Prisma.TransactionClient;
  id: string;
  userId?: string;
  status?: "ACTIVE" | "PENDING";
  role?: "MEMBER" | "OWNER";
  type?: "COMMUNITY" | "DM";
  communityId?: string;
  directMessageId?: string;
}) => {
  return tx.participant.update({
    where: { id: id },
    data: {
      ...(type === "COMMUNITY" && communityId
        ? {
            communityId: communityId,
          }
        : {}),
      ...(type === "DM" && directMessageId
        ? {
            directMessageId: directMessageId,
          }
        : {}),
      ...(role ? { role: role } : {}),
      ...(userId ? { userId: userId } : {}),
      ...(status ? { status: status } : {}),
    },
  });
};

export {
  getCommunityParticipant,
  createParticipantTransaction,
  getCommunityOwner,
  deleteParticipantByIdTransaction,
  updateParticipantByIdTransaction,
};

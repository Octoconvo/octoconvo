import prisma from "./client";

const getInboxById = async (id: string) => {
  const community = await prisma.inbox.findUnique({
    where: {
      id,
    },
  });

  return community;
};

export { getInboxById };

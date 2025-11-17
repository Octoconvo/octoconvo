import { DirectMessage } from "@prisma/client";
import prisma from "./client";

interface GetUserDMsArgs {
  userId: string;
}

const getUserDMs = async ({
  userId,
}: GetUserDMsArgs): Promise<DirectMessage[]> => {
  return prisma.directMessage.findMany({
    where: {
      participants: {
        some: {
          userId: userId,
          status: "ACTIVE",
        },
      },
    },
  });
};

export { getUserDMs };

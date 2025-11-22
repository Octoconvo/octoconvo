import { PrismaPromise } from "@prisma/client";
import { UserDMData } from "../../@types/database";
import prisma from "./client";

interface GetUserDMsArgs {
  userId: string;
}

const getUserDMs = ({
  userId,
}: GetUserDMsArgs): PrismaPromise<UserDMData[]> => {
  return prisma.directMessage.findMany({
    where: {
      participants: {
        some: {
          userId: userId,
          status: "ACTIVE",
        },
      },
    },
    include: {
      participants: {
        where: {
          user: {
            NOT: {
              id: userId,
            },
          },
        },
        select: {
          id: true,
          user: {
            select: {
              id: true,
              username: true,
              displayName: true,
              avatar: true,
            },
          },
        },
      },
      inbox: {
        select: {
          id: true,
        },
      },
    },
  });
};

export { getUserDMs };

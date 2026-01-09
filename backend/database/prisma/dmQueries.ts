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
          messages: {
            select: {
              content: true,
            },
            take: 1,
            orderBy: {
              createdAt: "desc",
            },
          },
        },
      },
    },
  });
};

interface GetDirectMessageByIdArgs {
  id: string;
  userId: string;
}

const getDirectMessageById = ({
  id,
  userId,
}: GetDirectMessageByIdArgs): PrismaPromise<UserDMData | null> => {
  return prisma.directMessage.findUnique({
    where: {
      id: id,
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
          messages: {
            select: {
              content: true,
            },
            take: 1,
            orderBy: {
              createdAt: "desc",
            },
          },
        },
      },
    },
  });
};

export { getUserDMs, getDirectMessageById };

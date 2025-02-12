import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

const getUserByUsername = async (username: string) => {
  const user = await prisma.user.findFirst({
    where: {
      username: {
        equals: username,
        mode: "insensitive",
      },
    },
  });

  return user;
};

const getUserById = async (id: string) => {
  const user = prisma.user.findFirst({
    where: {
      id: id,
    },
  });

  return user;
};

const createUser = async ({
  username,
  displayName,
  password,
}: {
  username: string;
  displayName: string;
  password: string;
}) => {
  const user = prisma.user.create({
    data: {
      username,
      displayName,
      password,
    },
  });

  return user;
};

export { getUserByUsername, getUserById, createUser };

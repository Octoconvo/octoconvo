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
  const user = await prisma.user.findFirst({
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
  const user = await prisma.user.create({
    data: {
      username,
      displayName,
      password,
    },
  });

  return user;
};

const deleteUserByUsername = async (username: string) => {
  const user = await prisma.user.delete({
    where: {
      username,
    },
  });

  return user;
};

export { getUserByUsername, getUserById, createUser, deleteUserByUsername };

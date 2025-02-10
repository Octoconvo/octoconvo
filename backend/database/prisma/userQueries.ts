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

export { getUserByUsername, getUserById };

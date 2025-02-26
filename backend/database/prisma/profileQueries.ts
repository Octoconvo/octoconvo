import prisma from "./client";

const getUserProfileById = async (id: string) => {
  const userProfile = await prisma.user.findFirst({
    where: {
      id: id,
    },
    omit: {
      password: true,
      isDeleted: true,
    },
  });

  return userProfile;
};

export { getUserProfileById };

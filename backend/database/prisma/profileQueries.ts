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

const updateUserProfileById = async ({
  id,
  displayName,
  bio,
  avatarURL,
  bannerURL,
  currentTime,
}: {
  id: string;
  displayName: null | string;
  bio: null | string;
  avatarURL: null | string;
  bannerURL: null | string;
  currentTime: Date;
}) => {
  const userProfile = await prisma.user.update({
    where: {
      id: id,
    },
    data: {
      ...(displayName ? { displayName: displayName } : {}),
      ...(bio ? { bio: bio } : {}),
      ...(avatarURL ? { avatar: avatarURL } : {}),
      ...(bannerURL ? { banner: bannerURL } : {}),
      updatedAt: currentTime,
    },
    omit: {
      password: true,
      isDeleted: true,
    },
  });

  return userProfile;
};

export { getUserProfileById, updateUserProfileById };

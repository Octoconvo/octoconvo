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

const searchProfiles = async ({
  name,
  cursor,
  limit,
}: {
  name: string;
  cursor: null | {
    username: string;
    displayName: string;
  };
  limit: number;
}) => {
  console.log({
    cursor,
    name,
  });
  const profiles = await prisma.user.findMany({
    where: {
      ...(name
        ? {
            OR: [
              {
                username: {
                  startsWith: name,
                  mode: "insensitive",
                },
              },
              {
                displayName: {
                  startsWith: name,
                  mode: "insensitive",
                },
              },
            ],
          }
        : {}),
      ...(cursor
        ? {
            OR: [
              {
                displayName: {
                  gt: cursor.displayName,
                },
              },
              {
                displayName: cursor.displayName,
                username: {
                  gt: cursor.username,
                },
              },
            ],
          }
        : {}),
    },
    orderBy: [{ displayName: "asc" }, { username: "asc" }],
    ...(limit ? { take: limit } : {}),
  });

  return profiles;
};

export { getUserProfileById, updateUserProfileById, searchProfiles };

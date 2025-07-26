#!/usr/bin/env node
import prisma from "./database/prisma/client";

const unpopulateDB = async () => {
  const seedData: {
    username: string;
  }[] = [];

  const addUser = async () => {
    const pushUser = new Promise(resolve => {
      for (let i = 1; i <= 1000; i++) {
        const user = {
          username: `seeduser${i}`,
        };

        seedData.push(user);
      }

      resolve(1);
    });

    return pushUser;
  };

  await addUser();

  const deleteData = async ({ username }: { username: string }) => {
    try {
      console.log(`\x1b[33mDeleting ${username}'s associated data`);
      const user = await prisma.user.findUnique({
        where: {
          username: username,
        },
      });

      if (user !== null) {
        const communities = await prisma.community.findMany({
          where: {
            participants: {
              some: {
                AND: [{ userId: user?.id }, { role: "OWNER" }],
              },
            },
          },
          include: {
            inbox: true,
          },
        });

        // Delete communities and their related data

        for (const community of communities) {
          // eslint-disable-next-line
          const cascadeDelete = async (community: any) => {
            console.log(
              `\x1b[33mDeleting ${community.name} and its related data`,
            );

            const deleteMessages = prisma.message.deleteMany({
              where: {
                inboxId: community.inbox?.id as string,
              },
            });

            const deleteParticipants = prisma.participant.deleteMany({
              where: {
                communityId: community.id,
              },
            });

            const deleteInboxes = prisma.inbox.deleteMany({
              where: {
                communityId: community.id,
              },
            });

            const deleteCommunities = prisma.community.deleteMany({
              where: {
                id: community.id,
              },
            });

            const deleteNotifications = prisma.notification.deleteMany({
              where: { triggeredById: user.id },
            });

            await prisma.$transaction([
              deleteMessages,
              deleteParticipants,
              deleteInboxes,
              deleteCommunities,
              deleteNotifications,
            ]);
          };

          await cascadeDelete(community);
          console.log(
            `\x1b[33mFinished deleting ${community.name}'s` +
              " associated community",
          );
        }
      } else {
        console.log(`\x1b[31m${username} doesn't exist`);
      }
    } catch (err) {
      if (err instanceof Error) {
        console.log(err.message);
      }
    }
  };

  const deleteUser = async ({ username }: { username: string }) => {
    console.log(`\x1b[31mDeleting user ${username}.`);

    await prisma.user.delete({
      where: {
        username: username,
      },
    });
  };

  const deleteCommunityData = seedData.map(async data => {
    return new Promise(resolve => {
      (async () => {
        await deleteData({ username: data.username });
        resolve(1);
      })();
    });
  });

  try {
    await Promise.all(deleteCommunityData);

    for (const data of seedData) {
      await deleteUser({ username: data.username });
    }
  } catch (err) {
    if (err instanceof Error) {
      console.log(err.message);
    }
  }
};

unpopulateDB();

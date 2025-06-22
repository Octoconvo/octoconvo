#!/usr/bin/env node
import prisma from "./database/prisma/client";

const unpopulateDB = async () => {
  const seedData = [
    {
      username: "seeduser1",
    },
    {
      username: "seeduser2",
    },
  ];

  const addUser = async () => {
    const pushUser = new Promise(resolve => {
      for (let i = 3; i < 103; i++) {
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
    console.log(`\x1b[31mDeleting ${username} with its associated data`);
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
            `\x1b[31mDeleting ${community.name} and its related data`,
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

          const deleteInbox = prisma.inbox.deleteMany({
            where: {
              communityId: community.id,
            },
          });

          const deleteCommunity = prisma.community.deleteMany({
            where: {
              id: community.id,
            },
          });

          await prisma.$transaction([
            deleteMessages,
            deleteParticipants,
            deleteInbox,
            deleteCommunity,
          ]);
        };

        await cascadeDelete(community);
        console.log(`\x1b[31mFinished deleting ${community.name}`);
      }

      // Delete user

      console.log(`\x1b[31mDeleting ${username}`);

      await prisma.user.delete({
        where: {
          username: username,
        },
      });

      console.log(`\x1b[31mFinished deleting ${username}`);
    } else {
      console.log(`\x1b[33m${username} doesn't exist`);
    }
  };

  for (const data of seedData) {
    try {
      await deleteData({ username: data.username });
    } catch (err) {
      console.error(err);
    }
  }
};

unpopulateDB();

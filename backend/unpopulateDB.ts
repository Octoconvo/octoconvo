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

  const deleteData = async ({ username }: { username: string }) => {
    const user = await prisma.user.findUnique({
      where: {
        username: "seeduser1",
      },
    });

    const communities = await prisma.community.findMany({
      where: {
        participants: {
          some: { userId: user?.id },
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
        console.log(`\x1b[31mDeleting ${community.name} and its related data`);

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

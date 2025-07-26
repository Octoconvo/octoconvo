#!/usr/bin/env node
import prisma from "./database/prisma/client";

const unpopulateDB = async () => {
  const clientUsers = [
    {
      username: "clientuser1",
    },
    {
      username: "clientuser2",
    },
  ];

  const clientCommunity = [
    {
      name: "clientcommunity1",
    },
    {
      name: "clientcommunity2",
    },
  ];

  const deleteUsers = async ({ username }: { username: string }) => {
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

      console.log(communities);

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
            where: {
              triggeredById: user.id,
            },
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

  const deleteCommunity = async ({
    communityName,
  }: {
    communityName: string;
  }) => {
    console.log(`\x1b[31mDeleting ${communityName} with its associated data`);
    const community = await prisma.community.findUnique({
      where: {
        name: communityName,
      },
    });

    if (community !== null) {
      // Delete community related data
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
  };

  for (const data of clientUsers) {
    try {
      await deleteUsers({ username: data.username });
    } catch (err) {
      console.error(err);
    }
  }

  for (const community of clientCommunity) {
    try {
      await deleteCommunity({ communityName: community.name });
    } catch (err) {
      console.log(err);
    }
  }
};

unpopulateDB();

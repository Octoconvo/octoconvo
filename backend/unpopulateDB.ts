#!/usr/bin/env node
import { User } from "@prisma/client";
import prisma from "./database/prisma/client";

const unpopulateDB = async () => {
  const seedData = await prisma.user.findMany({
    where: {
      username: {
        startsWith: "seeduser",
      },
    },
  });

  const deleteData = async ({ user }: { user: User }) => {
    try {
      console.log(`\x1b[33mDeleting ${user.username}'s associated data`);

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

      // Delete user's notifications
      await prisma.notification.deleteMany({
        where: {
          OR: [{ triggeredById: user.id }, { triggeredForId: user.id }],
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

          await prisma.$transaction([
            deleteMessages,
            deleteParticipants,
            deleteInboxes,
            deleteCommunities,
          ]);
        };

        await cascadeDelete(community);
        console.log(
          `\x1b[33mFinished deleting ${community.name}'s` +
            " associated community",
        );
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

  const deleteCommunityData = seedData.map(async user => {
    return new Promise(resolve => {
      (async () => {
        await deleteData({ user });
        resolve(1);
      })();
    });
  });

  try {
    await Promise.all(deleteCommunityData);

    for (const user of seedData) {
      await deleteUser({ username: user.username });
    }
  } catch (err) {
    if (err instanceof Error) {
      console.log(err.message);
    }
  }
};

unpopulateDB();

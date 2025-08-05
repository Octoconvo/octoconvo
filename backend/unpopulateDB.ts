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

      // Delete communities and their related data

      for (const community of communities) {
        // eslint-disable-next-line
        const cascadeDelete = async (community: any) => {
          console.log(
            `\x1b[33mDeleting ${community.name} and its related data`,
          );

          // Delete user's notifications and community's notifications
          const deleteNotifications = prisma.notification.deleteMany({
            where: {
              OR: [
                { triggeredById: user.id },
                { triggeredForId: user.id },
                { communityId: community.id },
              ],
            },
          });

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
            deleteNotifications,
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

  try {
    for (const user of seedData) {
      await deleteData({ user });
    }

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

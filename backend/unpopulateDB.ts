#!/usr/bin/env node
import { Community, Inbox, User } from "@prisma/client";
import prisma from "./database/prisma/client";

const unpopulateDB = async () => {
  const seedUsers = await prisma.user.findMany({
    where: {
      username: {
        startsWith: "seeduser",
      },
    },
  });

  const deleteUserData = async ({ user }: { user: User }) => {
    console.log(`\x1b[33mDeleting ${user.username}'s associated data`);
    type CommunityWithInbox = Community & {
      inbox: Inbox;
    };

    const deleteUserNotifications = async () => {
      await prisma.notification.deleteMany({
        where: {
          OR: [{ triggeredById: user.id }, { triggeredForId: user.id }],
        },
      });
    };

    await deleteUserNotifications();

    const getUserCommunities = async (): Promise<CommunityWithInbox[]> => {
      const community = (await prisma.community.findMany({
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
      })) as CommunityWithInbox[];

      return community;
    };

    const communities: CommunityWithInbox[] = await getUserCommunities();

    const cascadeDeleteCommunityAndItsData = async (
      community: CommunityWithInbox,
    ) => {
      console.log(`\x1b[33mDeleting ${community.name} and its related data`);

      const deleteCommunityNotifications = prisma.notification.deleteMany({
        where: { communityId: community.id },
      });

      const deleteCommunityMessages = prisma.message.deleteMany({
        where: {
          inboxId: community.inbox?.id as string,
        },
      });

      const deleteCommunityParticipants = prisma.participant.deleteMany({
        where: {
          communityId: community.id,
        },
      });

      const deleteCommunityInboxes = prisma.inbox.deleteMany({
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
        deleteCommunityNotifications,
        deleteCommunityMessages,
        deleteCommunityParticipants,
        deleteCommunityInboxes,
        deleteCommunity,
      ]);
    };

    // Delete communities and their related data
    for (const community of communities) {
      await cascadeDeleteCommunityAndItsData(community);
      console.log(
        `\x1b[33mFinished deleting ${community.name}'s` +
          " associated community",
      );
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
    for (const user of seedUsers) {
      try {
        await deleteUserData({ user });
      } catch (err) {
        if (err instanceof Error) {
          console.log(err.message);
        }
      }
    }

    for (const user of seedUsers) {
      await deleteUser({ username: user.username });
    }
  } catch (err) {
    if (err instanceof Error) {
      console.log(err.message);
    }
  }
};

unpopulateDB();

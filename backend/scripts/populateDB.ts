#!/usr/bin/env node
import { Community, Inbox } from "@prisma/client";
import prisma from "../database/prisma/client";
import bcrypt from "bcrypt";
import { populateFriendsDB } from "./populateFriendsScript";
import { populateMessagesDB } from "./populateMessagesScript";
import { generateArrayOfSeedUsers } from "../utils/scriptUtils";
import { createTimer } from "../utils/timeUtils";

type Mode = "COMPACT" | "BALANCED" | "EXTENSIVE";

const mode: Mode = (process.env.SEED_MODE as Mode) || "COMPACT";

const modeSizes = {
  COMPACT: 125,
  BALANCED: 500,
  EXTENSIVE: 1000,
};

// Populate database for testing purposes
const populateDB = async (size: number) => {
  console.log(`\x1b[36mPopulating database...`);
  const timer = createTimer();

  try {
    const seedUsers = generateArrayOfSeedUsers(size);

    const populateDatabaseWithSeedData = async () => {
      const createSeedUserAndItsData = seedUsers.map(async seedUser => {
        return new Promise((resolve): void =>
          bcrypt.hash(seedUser.password, 10, async (err, hashedPassword) => {
            if (err) {
              if (err instanceof Error) console.log(err.message);
            }

            const createUser = async () => {
              const user = await prisma.user.create({
                data: {
                  username: seedUser.username,
                  displayName: seedUser.username,
                  password: hashedPassword,
                },
              });

              console.log(`\x1b[36mCreated user ${user.username}...`);

              return user;
            };

            const user = await createUser();

            type CommunityWithInbox = Community & { inbox: Inbox };

            const createCommunity = async (): Promise<CommunityWithInbox> => {
              const community = await prisma.community.create({
                data: {
                  name: seedUser.community,
                  bio: seedUser.community,
                  inbox: {
                    create: {
                      inboxType: "COMMUNITY",
                    },
                  },
                  participantsCount: 1,
                  participants: {
                    create: {
                      userId: user.id,
                      role: "OWNER",
                      status: "ACTIVE",
                      memberSince: new Date(),
                    },
                  },
                },
                include: {
                  inbox: true,
                },
              });

              console.log(`\x1b[36mCreated community ${seedUser.community}...`);

              return community as CommunityWithInbox;
            };

            await createCommunity();
            resolve(1);
          }),
        );
      });

      await Promise.all(createSeedUserAndItsData);

      const populateCommunitiesWithParticipants = async ({
        start,
        end,
      }: {
        start: number;
        end: number;
      }) => {
        seedUsers.map(async (seedUser, index) => {
          if (index > start && index <= end) {
            console.log(`\x1b[36mAdding participants to ${seedUser.community}`);
            const community = await prisma.community.findUnique({
              where: {
                name: seedUser.community,
              },
            });

            if (community) {
              for (let i = 0; i < index - 2; i++) {
                if (i !== index) {
                  const user = await prisma.user.findUnique({
                    where: {
                      username: seedUsers[i].username,
                    },
                  });

                  type ParticipantStatus = "PENDING" | "ACTIVE";

                  type AddParticipant = {
                    status: ParticipantStatus;
                    userId: string;
                  };

                  const createAddParticipant = ({
                    status,
                    userId,
                  }: AddParticipant) =>
                    prisma.participant.create({
                      data: {
                        role: "MEMBER",
                        status: status,
                        communityId: community?.id,
                        userId: userId,
                      },
                    });

                  type CreateIncrementParticipantsCount = {
                    status: ParticipantStatus;
                  };

                  const createIncrementParticipantsCount = ({
                    status,
                  }: CreateIncrementParticipantsCount) =>
                    prisma.community.update({
                      where: {
                        id: community.id,
                      },
                      data: {
                        participantsCount: {
                          increment: status === "ACTIVE" ? 1 : 0,
                        },
                      },
                    });

                  if (user) {
                    const addParticipantToTheCommunity = async () => {
                      const status =
                        (i + index) % 2 === 0 ? "PENDING" : "ACTIVE";

                      console.log(
                        `\x1b[36mAdding ${user.username} as a` +
                          ` ${community.name}'s ${status} participant`,
                      );

                      const addParticipant = createAddParticipant({
                        status,
                        userId: user.id,
                      });

                      const incrementParticipantsCount =
                        createIncrementParticipantsCount({ status });

                      await prisma.$transaction([
                        addParticipant,
                        incrementParticipantsCount,
                      ]);
                    };

                    await addParticipantToTheCommunity();
                  }
                }
              }
            }
          }
        });
      };

      /* 
        Add participants to communities starting in the middle to simulate
        different participants density with higher density in the community
        positioned in the middle the array to improve the cursor based testing.
        This way we can test the fetching communities with equal participants
        with communities created before and after our cursor's createdAt.
      */
      await populateCommunitiesWithParticipants({
        start: 0 + seedUsers.length / 4,
        end: seedUsers.length - seedUsers.length / 4,
      });

      // Create community requests notification for seeduser1
      const user1 = await prisma.user.findUnique({
        where: {
          username: "seeduser1",
        },
      });

      const users = await prisma.user.findMany({
        where: {
          username: {
            startsWith: "seeduser",
          },
          NOT: {
            AND: [{ username: "seeduser1" }],
          },
        },
        take: 100,
        orderBy: { username: "asc" },
      });

      const community1 = await prisma.community.findUnique({
        where: {
          name: "seedcommunity1",
        },
      });

      const createCommunityReqNotifications = async ({
        triggeredForId,
        communityId,
      }: {
        triggeredForId: string;
        communityId: string;
      }) => {
        for (const user of users) {
          await new Promise(resolve => setTimeout(resolve, 1000));

          await prisma.notification.create({
            data: {
              triggeredById: user.id,
              triggeredForId: triggeredForId,
              isRead: false,
              payload: "requested to join",
              type: "COMMUNITYREQUEST",
              communityId: communityId,
            },
          });
        }
      };

      if (user1 && community1) {
        await createCommunityReqNotifications({
          triggeredForId: user1.id,
          communityId: community1.id,
        });
      } else {
        throw new Error(
          `user1 && community is false: user1: ${user1} | community: ${community1}`,
        );
      }
    };

    await populateDatabaseWithSeedData();
    await populateMessagesDB();
    await populateFriendsDB();
  } catch (err) {
    if (err instanceof Error) console.log(err.message);
  } finally {
    timer.stopTimer();
    const timeInSecond = timer.timeInSecond;
    console.log(`\x1b[32mFinished populating database`);
    console.log(`\x1b[32m${timeInSecond} s`);
  }
};

const size = modeSizes[mode];

populateDB(size);

#!/usr/bin/env node
import { Community, Inbox } from "@prisma/client";
import prisma from "../database/prisma/client";
import bcrypt from "bcrypt";
import { populateFriendsDB } from "./populateFriendsScript";
import { populateMessagesDB } from "./populateMessagesScript";
import { generateArrayOfSeedUsers } from "../utils/scriptUtils";
import { createTimer } from "../utils/timeUtils";
import { populateNotificationsDB } from "./populateNotificationsScript";
import { populateParticipantsDB } from "./populateParticipantsScript";

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
    };

    await populateDatabaseWithSeedData();
    await populateParticipantsDB(size);
    await populateMessagesDB();
    await populateNotificationsDB();
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

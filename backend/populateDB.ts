#!/usr/bin/env node
import { User } from "@prisma/client";
import prisma from "./database/prisma/client";
import bcrypt from "bcrypt";
// Populate database for testing purposes
const populateDB = async () => {
  console.log(`\x1b[36mPopulating database...`);
  try {
    // Create Users
    const users: {
      username: string;
      displayName: string;
      password: string;
      community: string;
    }[] = [
      {
        username: "seeduser1",
        displayName: "seeduser1",
        password: "seed@User1",
        community: "seedcommunity1",
      },
      {
        username: "seeduser2",
        displayName: "seeduser2",
        password: "seed@User2",
        community: "seedcommunity2",
      },
    ];

    for (const user of users) {
      const createUserData = async () => {
        bcrypt.hash(user.password, 10, async (err, hashedPassword) => {
          if (err) {
            console.error(err);
          }

          const userData: User = await prisma.user.create({
            data: {
              username: user.username,
              displayName: user.username,
              password: hashedPassword,
            },
          });

          // Create communities
          const community = await prisma.community.create({
            data: {
              name: user.community,
              bio: user.community,
              inbox: {
                create: {
                  inboxType: "COMMUNITY",
                },
              },
              participants: {
                create: {
                  userId: userData.id,
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

          if (community?.inbox) {
            for (let i = 0; i < 10; i++) {
              await prisma.message.create({
                data: {
                  content: `seedmessage${i}`,
                  inboxId: community.inbox?.id,
                  authorId: userData.id,
                },
              });
            }
          }
        });
      };

      await createUserData();
    }
  } catch (err) {
    console.error(err);
  } finally {
    console.log(`\x1b[36mFinished populating database...`);
  }
};

populateDB();

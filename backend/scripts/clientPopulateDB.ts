#!/usr/bin/env node
import { User } from "@prisma/client";
import prisma from "../database/prisma/client";
import bcrypt from "bcrypt";
// Populate database for testing purposes
const populateDB = async () => {
  console.log(`\x1b[36mPopulating database for client testing...`);
  try {
    // Create Users
    const users: {
      username: string;
      displayName: string;
      password: string;
      community: string;
    }[] = [
      {
        username: "clientuser1",
        displayName: "clientuser1",
        password: "client@User1",
        community: "clientcommunity1",
      },
      {
        username: "clientuser2",
        displayName: "clientuser2",
        password: "client@User2",
        community: "clientcommunity2",
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
            for (let i = 1; i <= 100; i++) {
              await new Promise(resolve => setTimeout(resolve, 1000));

              const message = await prisma.message.create({
                data: {
                  content: `clientmessage${i}`,
                  inboxId: community.inbox?.id,
                  authorId: userData.id,
                },
              });

              console.log(
                `\x1b[36mFinished created message: ${message.content}`,
              );
            }
          }

          console.log(
            `\x1b[36mFinished populating database for ${user.username}`,
          );
        });
      };

      await createUserData();
    }
  } catch (err) {
    if (err instanceof Error) console.error(`\x1b[31m${err.message}`);
  }
};

populateDB();

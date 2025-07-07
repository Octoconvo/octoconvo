#!/usr/bin/env node
import { User } from "@prisma/client";
import prisma from "./database/prisma/client";
import bcrypt from "bcrypt";
// Populate database for testing purposes
const populateDB = async () => {
  console.log(`\x1b[36mPopulating database...`);
  try {
    // Create 102 Users
    /* The first two users are used for authorisation check so we'll exclude 
     them from the communities join loop */
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

    // Create another 100 users
    const addUser = async () => {
      const pushUser = new Promise(resolve => {
        for (let i = 3; i < 103; i++) {
          const user = {
            username: `seeduser${i}`,
            displayName: `seeduser${i}`,
            password: `seed@User${i}`,
            community: `seedcommunity${i}`,
          };

          users.push(user);
        }

        resolve(1);
      });

      return pushUser;
    };

    await addUser();

    const createUserData = async () => {
      const createData = users.map(user => {
        return new Promise((resolve): void =>
          bcrypt.hash(user.password, 10, async (err, hashedPassword) => {
            if (err) {
              if (err instanceof Error) console.log(err.message);
            }

            const userData: User = await prisma.user.create({
              data: {
                username: user.username,
                displayName: user.username,
                password: hashedPassword,
              },
            });

            console.log(`\x1b[36mCreated user ${user.username}...`);

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

            console.log(`\x1b[36mCreated community ${user.community}...`);

            if (community?.inbox) {
              for (let i = 1; i <= 20; i++) {
                await new Promise(resolve => setTimeout(resolve, 1000));

                await prisma.message.create({
                  data: {
                    content: `seedmessage${i}`,
                    inboxId: community.inbox?.id,
                    authorId: userData.id,
                  },
                });
              }
            }

            resolve(1);
          }),
        );
      });

      await Promise.all(createData);

      const joinCommunity = async () => {
        users.map(async (user, index) => {
          if (index > 1) {
            console.log(`\x1b[36mAdding participants to ${user.community}`);
            const community = await prisma.community.findUnique({
              where: {
                name: user.community,
              },
            });

            if (community) {
              for (let i = 0; i < index - 2; i++) {
                if (i !== index) {
                  const userData = await prisma.user.findUnique({
                    where: {
                      username: users[i].username,
                    },
                  });

                  if (userData) {
                    const status = (i + index) % 2 === 0 ? "PENDING" : "ACTIVE";

                    console.log(
                      `\x1b[36mAdding ${userData.username} as a ${community.name}'s` +
                        ` ${status} participant`,
                    );

                    await prisma.participant.create({
                      data: {
                        role: "MEMBER",
                        status: status,
                        communityId: community?.id,
                        userId: userData?.id,
                      },
                    });
                  }
                }
              }
            }
          }
        });
      };

      // handle communities participants

      await joinCommunity();
    };

    await createUserData();
  } catch (err) {
    if (err instanceof Error) console.log(err.message);
  } finally {
    console.log(`\x1b[36mFinished populating database...`);
  }
};

populateDB();

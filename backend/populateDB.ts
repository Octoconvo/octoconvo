#!/usr/bin/env node
import prisma from "./database/prisma/client";
import bcrypt from "bcrypt";
// Populate database for testing purposes
const populateDB = async () => {
  console.log(`\x1b[36mPopulating database...`);
  try {
    // Create Users
    const users = [
      {
        username: "seeduser1",
        displayName: "seeduser1",
        password: "seed@User1",
      },
      {
        username: "seeduser2",
        displayName: "seeduser2",
        password: "seed@User2",
      },
    ];

    for (const user of users) {
      const createUser = async () => {
        bcrypt.hash(user.password, 10, async (err, hashedPassword) => {
          if (err) {
            console.error(err);
          }

          await prisma.user.create({
            data: {
              username: user.username,
              displayName: user.username,
              password: hashedPassword,
            },
          });
        });
      };

      await createUser();
    }

    await prisma.user.createMany({
      data: [],
    });

    const user1 = await prisma.user.findUnique({
      where: {
        username: "seeduser1",
      },
    });

    const user2 = await prisma.user.findUnique({
      where: {
        username: "seeduser2",
      },
    });

    if (user1 === null || user2 === null) {
      throw new Error("Failed to fetch user1 and user2");
    }

    // Create communities
    await prisma.community.create({
      data: {
        name: "seedcommunity1",
        bio: "seedcommunity1",
        inbox: {
          create: {
            inboxType: "COMMUNITY",
          },
        },
        participants: {
          create: {
            userId: user1?.id as string,
            role: "OWNER",
            status: "ACTIVE",
            memberSince: new Date(),
          },
        },
      },
    });

    await prisma.community.create({
      data: {
        name: "seedcommunity2",
        bio: "seedcommunity2",
        inbox: {
          create: {
            inboxType: "COMMUNITY",
          },
        },
        participants: {
          create: {
            userId: user2?.id as string,
            role: "OWNER",
            status: "ACTIVE",
            memberSince: new Date(),
          },
        },
      },
    });

    // Create messages on community 1
    const community1 = await prisma.community.findFirst({
      where: {
        name: "seedcommunity1",
      },
      include: {
        inbox: true,
      },
    });

    if (community1 === null) {
      throw new Error("Failed to fetch community1");
    }

    await prisma.message.createMany({
      data: [
        {
          content: "seedmessage1",
          inboxId: community1?.inbox?.id as string,
          authorId: user1?.id as string,
        },
        {
          content: "seedmessage2",
          inboxId: community1?.inbox?.id as string,
          authorId: user1?.id as string,
        },
        {
          content: "seedmessage3",
          inboxId: community1?.inbox?.id as string,
          authorId: user1?.id as string,
        },
        {
          content: "seedmessage4",
          inboxId: community1?.inbox?.id as string,
          authorId: user1?.id as string,
        },
        {
          content: "seedmessage5",
          inboxId: community1?.inbox?.id as string,
          authorId: user1?.id as string,
        },
        {
          content: "seedmessage6",
          inboxId: community1?.inbox?.id as string,
          authorId: user1?.id as string,
        },
        {
          content: "seedmessage7",
          inboxId: community1?.inbox?.id as string,
          authorId: user1?.id as string,
        },
        {
          content: "seedmessage8",
          inboxId: community1?.inbox?.id as string,
          authorId: user1?.id as string,
        },
        {
          content: "seedmessage9",
          inboxId: community1?.inbox?.id as string,
          authorId: user1?.id as string,
        },
        {
          content: "seedmessage10",
          inboxId: community1?.inbox?.id as string,
          authorId: user1?.id as string,
        },
      ],
    });
  } catch (err) {
    console.error(err);
  } finally {
    console.log(`\x1b[36mFinished populating database...`);
  }
};

populateDB();

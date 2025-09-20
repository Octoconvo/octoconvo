#!/usr/bin/env node
import { User } from "@prisma/client";
import bcrypt from "bcrypt";
import {
  logErrorMessage,
  logPopulateMessage,
  logPopulateSuccessMessage,
} from "../utils/loggerUtils";
import { generateClientUserGenerators } from "../utils/scriptUtils";
import {
  createCommunity,
  createCommunityMessage,
  createUser,
  getClientUsers,
  getCommunityWithOwnerAndInboxByName,
} from "../database/prisma/scriptQueries";
import { createTimer, pause } from "../utils/timeUtils";
import { ClientUserGenerator } from "../@types/scriptTypes";

type GenerateClientUser = {
  username: string;
  displayName: string;
  password: string;
};

const generateClientUser = async ({
  username,
  displayName,
  password,
}: GenerateClientUser) => {
  const createUserPromise = async () =>
    new Promise((resolve, reject) => {
      bcrypt.hash(password, 10, async (err, hashedPassword) => {
        if (err) {
          logErrorMessage(err);
          reject(err);
        } else {
          await createUser({
            username,
            displayName,
            password: hashedPassword,
          });
          resolve(1);
        }
      });
    });

  await createUserPromise();
};

type GenerateCommunityMessages = {
  name: string;
  authorId: string;
  messageCount: number;
};

const generateCommunityMessages = async ({
  name,
  authorId,
  messageCount,
}: GenerateCommunityMessages) => {
  const community = await getCommunityWithOwnerAndInboxByName(name);

  if (community?.inbox) {
    const messageInflection = messageCount > 1 ? "messages" : "message";
    logPopulateMessage(
      `Creating ${messageCount} ${messageInflection} for ${community.name}`,
    );

    for (let i = 1; i <= messageCount; i++) {
      await pause(100);
      await createCommunityMessage({
        number: i,
        inboxId: community.inbox.id,
        authorId: authorId,
      });
    }

    logPopulateSuccessMessage(
      `Successfully created ${messageCount} ${messageInflection}` +
        ` for ${community.name}`,
    );
  }
};

type GenerateClientCommunities = {
  clientUsers: User[];
  clientUserGenerators: ClientUserGenerator[];
};

const generateClientCommunities = ({
  clientUsers,
  clientUserGenerators,
}: GenerateClientCommunities) => {
  return clientUserGenerators.map(async (clientUserGenerator, index) => {
    logPopulateMessage(
      `Creating user ${clientUserGenerator.username}'s community` +
        ` ${clientUserGenerator.community}...`,
    );
    const community = await createCommunity({
      name: clientUserGenerator.community,
      bio: clientUserGenerator.community,
      ownerId: clientUsers[index].id,
    });
    logPopulateSuccessMessage(
      `Successfully created user ${clientUserGenerator.username}'s` +
        ` community ${clientUserGenerator.community}`,
    );

    await generateCommunityMessages({
      name: community.name,
      authorId: clientUsers[index].id,
      messageCount: 100,
    });

    logPopulateMessage(
      `Successfully created ${clientUserGenerator.username} and its data`,
    );
  });
};

const doArraysHaveEqualLength = <TypeOne, TypeTwo>(
  arrayOne: TypeOne[],
  arrayTwo: TypeTwo[],
) => {
  return arrayOne.length === arrayTwo.length;
};

type PopulateClientCommunities = {
  clientUsers: User[];
  clientUserGenerators: ClientUserGenerator[];
};

const populateClientCommunities = async ({
  clientUsers,
  clientUserGenerators,
}: PopulateClientCommunities) => {
  if (doArraysHaveEqualLength(clientUsers, clientUserGenerators)) {
    await Promise.all(
      generateClientCommunities({ clientUsers, clientUserGenerators }),
    );
  } else {
    throw new Error("arrays have different lengths");
  }
};

const populateClientUsers = async (
  clientUserGenerators: ClientUserGenerator[],
): Promise<User[]> => {
  for (const clientUserGenerator of clientUserGenerators) {
    logPopulateMessage(
      `Creating ${clientUserGenerator.username} and its data...`,
    );
    await generateClientUser({
      username: clientUserGenerator.username,
      displayName: clientUserGenerator.displayName,
      password: clientUserGenerator.password,
    });
  }

  const clientUsers = await getClientUsers();
  return clientUsers;
};

const populateClientDB = async () => {
  logPopulateMessage("Populating database...");
  const timer = createTimer();
  try {
    const clientUserGenerators = generateClientUserGenerators(2);
    const clientUsers = await populateClientUsers(clientUserGenerators);
    await populateClientCommunities({ clientUserGenerators, clientUsers });
  } catch (err) {
    logErrorMessage(err);
  } finally {
    timer.stopTimer();
    const timeInSecond = timer.timeInSecond;
    logPopulateSuccessMessage("Finished populating database");
    logPopulateSuccessMessage(`${timeInSecond} s`);
  }
};

populateClientDB();

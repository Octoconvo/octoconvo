#!/usr/bin/env node
import {
  getClientUsers,
  getClientCommunities,
} from "../database/prisma/scriptQueries";
import { User, Community } from "@prisma/client";
import { unpopulateCommunities, unpopulateUsers } from "./unpopulateScript";
import {
  logUnpopulateMessage,
  logErrorMessage,
  logUnpopulateSuccessMessage,
} from "../utils/loggerUtils";
import { createTimer } from "../utils/timeUtils";

type Unpopulate = {
  users: User[];
  communities: Community[];
};

const unpopulate = async ({ users, communities }: Unpopulate) => {
  await unpopulateCommunities(communities);
  await unpopulateUsers(users);
};

const unpopulateDB = async () => {
  logUnpopulateMessage("Unpopulating database...");
  const timer = createTimer();
  try {
    const seedUsers = await getClientUsers();
    const seedCommunities = await getClientCommunities();
    await unpopulate({
      users: seedUsers,
      communities: seedCommunities,
    });
  } catch (err) {
    logErrorMessage(err);
  } finally {
    timer.stopTimer();
    const timeInSecond = timer.timeInSecond;
    logUnpopulateSuccessMessage("Finished unpopulating database");
    logUnpopulateSuccessMessage(`${timeInSecond} s`);
  }
};

unpopulateDB();

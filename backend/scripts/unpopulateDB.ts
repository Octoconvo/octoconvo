#!/usr/bin/env node
import { Community, User } from "@prisma/client";
import {
  getSeedCommunities,
  getSeedLoneUsers,
  getSeedUsers,
} from "../database/prisma/scriptQueries";
import { logErrorMessage } from "../utils/loggerUtils";
import {
  logUnpopulateMessage,
  logUnpopulateSuccessMessage,
} from "../utils/loggerUtils";
import { createTimer } from "../utils/timeUtils";
import { unpopulateCommunities, unpopulateUsers } from "./unpopulateScript";

type Unpopulate = {
  users: User[];
  loneUsers: User[];
  communities: Community[];
};

const unpopulate = async ({ users, loneUsers, communities }: Unpopulate) => {
  await unpopulateCommunities(communities);
  await unpopulateUsers(users);
  await unpopulateUsers(loneUsers);
};

const unpopulateDB = async () => {
  logUnpopulateMessage("Unpopulating database...");
  const timer = createTimer();
  try {
    const seedUsers = await getSeedUsers();
    const seedLoneUsers = await getSeedLoneUsers();
    const seedCommunities = await getSeedCommunities();
    await unpopulate({
      users: seedUsers,
      loneUsers: seedLoneUsers,
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

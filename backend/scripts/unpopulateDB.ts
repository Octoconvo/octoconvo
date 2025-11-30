#!/usr/bin/env node
import { Community, DirectMessage, User } from "@prisma/client";
import {
  getSeedCommunities,
  getSeedDirectMessages,
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
import { unpopulateDirectMessages } from "./unpopulateDirectMessagesScript";

type Unpopulate = {
  users: User[];
  loneUsers: User[];
  communities: Community[];
  directMessages: DirectMessage[];
};

const unpopulate = async ({
  users,
  loneUsers,
  communities,
  directMessages,
}: Unpopulate) => {
  await unpopulateCommunities(communities);
  await unpopulateUsers(users);
  await unpopulateDirectMessages(directMessages);
  await unpopulateUsers(loneUsers);
};

const unpopulateDB = async () => {
  logUnpopulateMessage("Unpopulating database...");
  const timer = createTimer();
  try {
    const seedUsers: User[] = await getSeedUsers();
    const seedLoneUsers: User[] = await getSeedLoneUsers();
    const seedCommunities: Community[] = await getSeedCommunities();
    const seedDirectMessages: DirectMessage[] = await getSeedDirectMessages();

    await unpopulate({
      users: seedUsers,
      loneUsers: seedLoneUsers,
      communities: seedCommunities,
      directMessages: seedDirectMessages,
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

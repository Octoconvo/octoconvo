#!/usr/bin/env node
import {
  getClientUsers,
  getClientCommunities,
  getClientDirectMessages,
} from "../database/prisma/scriptQueries";
import { User, Community, DirectMessage } from "@prisma/client";
import { unpopulateCommunities, unpopulateUsers } from "./unpopulateScript";
import {
  logUnpopulateMessage,
  logErrorMessage,
  logUnpopulateSuccessMessage,
} from "../utils/loggerUtils";
import { createTimer } from "../utils/timeUtils";
import { unpopulateDirectMessages } from "./unpopulateDirectMessagesScript";

type Unpopulate = {
  users: User[];
  communities: Community[];
  directMessages: DirectMessage[];
};

const unpopulate = async ({
  users,
  communities,
  directMessages,
}: Unpopulate): Promise<void> => {
  await unpopulateDirectMessages(directMessages);
  await unpopulateCommunities(communities);
  await unpopulateUsers(users);
};

const unpopulateDB = async (): Promise<void> => {
  logUnpopulateMessage("Unpopulating database...");
  const timer = createTimer();
  try {
    const seedUsers: User[] = await getClientUsers();
    const seedCommunities: Community[] = await getClientCommunities();
    const directMessages: DirectMessage[] = await getClientDirectMessages();

    await unpopulate({
      users: seedUsers,
      communities: seedCommunities,
      directMessages: directMessages,
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

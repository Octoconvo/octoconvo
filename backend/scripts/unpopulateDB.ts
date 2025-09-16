#!/usr/bin/env node
import { Community, User } from "@prisma/client";
import {
  deleteCommunityAndItsData,
  deleteUser,
  deleteUserFriends,
  deleteUserNotifications,
  getSeedCommunities,
  getSeedLoneUsers,
  getSeedUsers,
} from "../database/prisma/scriptQueries";
import { logErrorMessage } from "../utils/error";
import {
  logUnpopulateMessage,
  logUnpopulateSuccessMessage,
} from "../utils/loggerUtils";
import { createTimer } from "../utils/timeUtils";

const destroyCommunity = async (community: Community) => {
  try {
    logUnpopulateMessage(`Deleting ${community.name} with its data...`);
    await deleteCommunityAndItsData(community.id);
    logUnpopulateSuccessMessage(
      `Successfully deleted ${community.name} with its data`,
    );
  } catch (err) {
    logErrorMessage(err);
  }
};

const unpopulateCommunities = async (communities: Community[]) => {
  for (const community of communities) {
    await destroyCommunity(community);
  }
};

const destroyUser = async (user: User) => {
  try {
    logUnpopulateMessage(`Deleting ${user.username} with its data...`);
    await deleteUserNotifications(user.id);
    await deleteUserFriends(user.id);
    await deleteUser(user.id);
    logUnpopulateSuccessMessage(
      `Successfully deleted ${user.username} with its data`,
    );
  } catch (err) {
    logErrorMessage(err);
  }
};

const unpopulateUsers = async (users: User[]) => {
  for (const user of users) {
    await destroyUser(user);
  }
};

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

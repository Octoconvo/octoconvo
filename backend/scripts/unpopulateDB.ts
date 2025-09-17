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
import { breakArrayIntoSubArrays } from "../utils/array";

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

const createDeleteCommunitiesPromises = (communities: Community[]) => {
  return communities.map(async community => {
    await destroyCommunity(community);
  });
};

const unpopulateCommunities = async (communities: Community[]) => {
  const communitiesSubArrays = breakArrayIntoSubArrays({
    array: communities,
    subArraySize: 10,
  });

  for (const communitiesSubArray of communitiesSubArrays) {
    await Promise.all(createDeleteCommunitiesPromises(communitiesSubArray));
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

const createDeleteUsersPromises = (users: User[]) => {
  return users.map(async user => {
    await destroyUser(user);
  });
};

const unpopulateUsers = async (users: User[]) => {
  const usersSubArrays = breakArrayIntoSubArrays({
    array: users,
    subArraySize: 10,
  });

  for (const usersSubArray of usersSubArrays) {
    await Promise.all(createDeleteUsersPromises(usersSubArray));
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

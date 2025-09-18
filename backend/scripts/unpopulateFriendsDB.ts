import {
  getSeedUsers,
  deleteUserFriends,
} from "../database/prisma/scriptQueries";
import { User } from "@prisma/client";
import { logErrorMessage } from "../utils/loggerUtils";
import {
  logUnpopulateMessage,
  logUnpopulateSuccessMessage,
} from "../utils/loggerUtils";

const destroyUserFriends = async (user: User) => {
  try {
    logUnpopulateMessage(`\x1b[31mDeleting user ${user.username}'s friends...`);
    await deleteUserFriends(user.id);
    logUnpopulateSuccessMessage(
      `Successfully deleted user ${user.username}'s friends`,
    );
  } catch (error) {
    logErrorMessage(error);
  }
};

const unpopulateUsersFriends = async (users: User[]) => {
  for (const user of users) {
    destroyUserFriends(user);
  }
};

const unpopulateFriendsDB = async () => {
  try {
    const seedUsers: User[] = await getSeedUsers();
    await unpopulateUsersFriends(seedUsers);
  } catch (err) {
    logErrorMessage(err);
  }
};

unpopulateFriendsDB();

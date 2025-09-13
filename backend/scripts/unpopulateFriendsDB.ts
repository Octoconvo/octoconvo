import {
  getSeedUsers,
  deleteUserFriends,
} from "../database/prisma/scriptQueries";
import { User } from "@prisma/client";
import { logErrorMessage } from "../utils/error";
import {
  logUnpopulateMessage,
  logUnpopulateSuccessMessage,
} from "../utils/loggerUtils";

const deleteAllUsersFriends = async (users: User[]) => {
  for (const user of users) {
    try {
      logUnpopulateMessage(
        `\x1b[31mDeleting user ${user.username}'s friends...`,
      );
      await deleteUserFriends(user.id);
      logUnpopulateSuccessMessage(
        `Successfully deleted user ${user.username}'s friends`,
      );
    } catch (error) {
      logErrorMessage(error);
    }
  }
};

const unpopulateFriendsDB = async () => {
  const seedUsers: User[] = await getSeedUsers();

  await deleteAllUsersFriends(seedUsers);
};

unpopulateFriendsDB();

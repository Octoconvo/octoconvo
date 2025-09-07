import {
  getSeedUsers,
  deleteUserFriends,
} from "../database/prisma/scriptQueries";
import { User } from "@prisma/client";
import { logErrorMessage } from "../utils/error";

const deleteAllUsersFriends = async (users: User[]) => {
  for (const user of users) {
    try {
      console.log(`\x1b[31mDeleting user ${user.username}'s friends...`);
      await deleteUserFriends(user.id);
    } catch (error) {
      console.log(`\x1b[31mFailed to delete user ${user.username}'s friends`);
      logErrorMessage(error);
    }
  }
};

const unpopulateFriendsDB = async () => {
  const seedUsers: User[] = await getSeedUsers();

  await deleteAllUsersFriends(seedUsers);
};

unpopulateFriendsDB();

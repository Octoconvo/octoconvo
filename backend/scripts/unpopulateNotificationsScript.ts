import {
  deleteUserNotifications,
  getSeedUsers,
} from "../database/prisma/scriptQueries";
import { breakArrayIntoSubArrays } from "../utils/array";
import { logErrorMessage } from "../utils/error";
import { User } from "@prisma/client";
import {
  logUnpopulateMessage,
  logUnpopulateSuccessMessage,
} from "../utils/loggerUtils";

const destroyUserNotifications = async (user: User) => {
  try {
    logUnpopulateMessage(`Deleting ${user.username}'s notifications...`);
    await deleteUserNotifications(user.id);
    logUnpopulateSuccessMessage(
      `Successfully deleted ${user.username}'s notifications`,
    );
  } catch (err) {
    logErrorMessage(err);
  }
};

const unpopulateUserNotifications = async (users: User[]) => {
  const subNotificationsArrays = breakArrayIntoSubArrays({
    array: users,
    subArraySize: 10,
  });

  for (const subNotificationsArray of subNotificationsArrays) {
    const deleteNotificationsPromises = subNotificationsArray.map(
      async user => {
        await destroyUserNotifications(user);
      },
    );

    await Promise.all(deleteNotificationsPromises);
  }
};

const unpopulateNotificationsDB = async () => {
  try {
    const seedUsers = await getSeedUsers();
    await unpopulateUserNotifications(seedUsers);
  } catch (err) {
    logErrorMessage(err);
  }
};

export { unpopulateNotificationsDB };

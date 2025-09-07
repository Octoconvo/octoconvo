import { User } from "@prisma/client";
import {
  createFriendsRelationship,
  getUserByUsername,
  getSeedUsersToPopulateFriends,
} from "../database/prisma/scriptQueries";
import { isEven } from "../utils/numberUtils";
import { logErrorMessage } from "../utils/error";
import { logPopulateMessage } from "../utils/loggerUtils";

type GenerateUserFriends = {
  user: User;
  friends: User[];
};

const generateUserFriends = async ({ user, friends }: GenerateUserFriends) => {
  const createFriendsPromises = friends.map((friend: User, index: number) => {
    const status = isEven(index + 1) ? "PENDING" : "ACTIVE";

    return new Promise(resolve => {
      try {
        logPopulateMessage(
          `Creating friend relationships between ${user.username} ` +
            ` and ${friend.username} ...`,
        );
        createFriendsRelationship({
          userOneId: user.id,
          userTwoId: friend.id,
          status,
        });
        resolve(1);
      } catch (err) {
        logErrorMessage(err);
      }
    });
  });

  await Promise.all(createFriendsPromises);
};

type PopulateFriends = {
  friends: User[];
};

const populateFriends = async ({ friends }: PopulateFriends) => {
  const seedUserOne: User | null = await getUserByUsername("seeduser1");
  const seedUserTwo: User | null = await getUserByUsername("seeduser2");
  const seedUserThree: User | null = await getUserByUsername("seeduser3");

  if (seedUserOne && seedUserTwo && seedUserThree) {
    await generateUserFriends({ user: seedUserOne, friends });

    await createFriendsRelationship({
      userOneId: seedUserOne.id,
      userTwoId: seedUserTwo.id,
      status: "ACTIVE",
    });

    await createFriendsRelationship({
      userOneId: seedUserOne.id,
      userTwoId: seedUserThree.id,
      status: "PENDING",
    });
  }
};

const populateFriendsDB = async () => {
  const seedUsers: User[] = await getSeedUsersToPopulateFriends();

  await populateFriends({ friends: seedUsers });
};

populateFriendsDB();

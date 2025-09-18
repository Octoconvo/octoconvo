import { User } from "@prisma/client";
import {
  getSeedCommunitiesWithOwnerAndInbox,
  createCommunityNotification,
  getSeedUsersWithLimit,
} from "../database/prisma/scriptQueries";
import { logErrorMessage } from "../utils/loggerUtils";
import { CommunityWithOwnerAndInbox } from "../@types/scriptTypes";
import {
  logPopulateMessage,
  logPopulateSuccessMessage,
} from "../utils/loggerUtils";

type GenerateCommunityNotification = {
  community: CommunityWithOwnerAndInbox;
  user: User;
};

const generateCommunityNotification = async ({
  community,
  user,
}: GenerateCommunityNotification) => {
  try {
    if (community.owner) {
      await createCommunityNotification({
        communityId: community.id,
        triggeredById: user.id,
        triggeredForId: community.owner?.id,
      });
    }
  } catch (err) {
    logErrorMessage(err);
  }
};

type GenerateCommunityNotifications = {
  community: CommunityWithOwnerAndInbox;
  users: User[];
};

const generateCommunityNotifications = async ({
  community,
  users,
}: GenerateCommunityNotifications) => {
  logPopulateMessage(`Creating ${community.name}'s notifications`);

  for (const user of users) {
    await generateCommunityNotification({ community, user });
  }

  logPopulateSuccessMessage(
    `Successfully created ${community.name}'s notifications`,
  );
};

type PopulateCommunitiesNotifications = {
  communities: CommunityWithOwnerAndInbox[];
  users: User[];
};

const populateCommunitiesNotifications = async ({
  communities,
  users,
}: PopulateCommunitiesNotifications) => {
  const createNotificationsPromises = communities.map(async community => {
    await generateCommunityNotifications({ community, users });
  });

  await Promise.all(createNotificationsPromises);
};

const populateNotificationsDB = async () => {
  try {
    const seedCommunities = await getSeedCommunitiesWithOwnerAndInbox();
    const seedUsers = await getSeedUsersWithLimit(100);

    await populateCommunitiesNotifications({
      communities: seedCommunities,
      users: seedUsers,
    });
  } catch (err) {
    logErrorMessage(err);
  }
};

export { populateNotificationsDB };

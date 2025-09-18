import { Community } from "@prisma/client";
import {
  deleteCommunityMessages,
  getSeedCommunities,
} from "../database/prisma/scriptQueries";
import { logErrorMessage } from "../utils/loggerUtils";
import {
  logUnpopulateMessage,
  logUnpopulateSuccessMessage,
} from "../utils/loggerUtils";
import { breakArrayIntoSubArrays } from "../utils/array";

const destroyCommunityMessages = async (community: Community) => {
  try {
    logUnpopulateMessage(`Deleting ${community.name}'s messages`);
    await deleteCommunityMessages(community.id);
    logUnpopulateSuccessMessage(
      `Successfully deleted ${community.name}'s messages`,
    );
  } catch (err) {
    logErrorMessage(err);
  }
};

const unpopulateCommunitiesMessages = async (communities: Community[]) => {
  const subCommunitiesArrays = breakArrayIntoSubArrays({
    array: communities,
    subArraySize: 10,
  });

  for (const subCommunitiesArray of subCommunitiesArrays) {
    const deleteMessagesPromises = subCommunitiesArray.map(async community => {
      await destroyCommunityMessages(community);
    });

    await Promise.all(deleteMessagesPromises);
  }
};

const unpopulateMessagesDB = async () => {
  try {
    const seedCommunities = await getSeedCommunities();
    unpopulateCommunitiesMessages(seedCommunities);
  } catch (err) {
    logErrorMessage(err);
  }
};

unpopulateMessagesDB();

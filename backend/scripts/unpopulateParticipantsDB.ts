import {
  getSeedCommunities,
  deleteCommunityParticipants,
} from "../database/prisma/scriptQueries";
import { Community } from "@prisma/client";
import { breakArrayIntoSubArrays } from "../utils/array";
import { logErrorMessage } from "../utils/loggerUtils";
import {
  logUnpopulateMessage,
  logUnpopulateSuccessMessage,
} from "../utils/loggerUtils";

const destroyCommunityParticipants = async (community: Community) => {
  try {
    logUnpopulateMessage(`Deleting ${community.name}'s participants`);
    await deleteCommunityParticipants(community.id);
    logUnpopulateSuccessMessage(
      `Successfully deleted ${community.name}'s participants`,
    );
  } catch (err) {
    logErrorMessage(err);
  }
};

const unpopulateCommunitiesParticipants = async (communites: Community[]) => {
  const subCommunitiesArrays = breakArrayIntoSubArrays({
    array: communites,
    subArraySize: 10,
  });

  for (const subCommunitiesArray of subCommunitiesArrays) {
    const deleteParticipantsPromises = subCommunitiesArray.map(
      async community => {
        await destroyCommunityParticipants(community);
      },
    );

    await Promise.all(deleteParticipantsPromises);
  }
};

const unpopulateParticipantsDB = async () => {
  try {
    const communities = await getSeedCommunities();
    await unpopulateCommunitiesParticipants(communities);
  } catch (err) {
    logErrorMessage(err);
  }
};

unpopulateParticipantsDB();

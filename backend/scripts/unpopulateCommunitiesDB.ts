import { Community } from "@prisma/client";
import {
  deleteCommunityAndItsData,
  getSeedCommunities,
} from "../database/prisma/scriptQueries";
import { logErrorMessage } from "../utils/loggerUtils";
import {
  logUnpopulateMessage,
  logUnpopulateSuccessMessage,
} from "../utils/loggerUtils";

const destroyCommunity = async (community: Community) => {
  try {
    logUnpopulateMessage(`\x1b[31mDeleting community ${community.name}...`);
    await deleteCommunityAndItsData(community.id);
    logUnpopulateSuccessMessage(
      `Successfully deleted community ${community.name}`,
    );
  } catch (err) {
    logErrorMessage(err);
  }
};

const unpopulateCommunities = async (communities: Community[]) => {
  for (const community of communities) {
    destroyCommunity(community);
  }
};

const unpopulateCommunitiesDB = async () => {
  try {
    const seedCommunities = await getSeedCommunities();
    await unpopulateCommunities(seedCommunities);
  } catch (err) {
    logErrorMessage(err);
  }
};

unpopulateCommunitiesDB();

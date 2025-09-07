import { Community } from "@prisma/client";
import {
  deleteCommunityMessages,
  getSeedCommunities,
} from "../database/prisma/scriptQueries";
import { logErrorMessage } from "../utils/error";
import { logUnpopulateMessage } from "../utils/loggerUtils";

const destroyCommunityMessages = async (community: Community) => {
  try {
    logUnpopulateMessage(`Deleting ${community.name}'s messages`);
    await deleteCommunityMessages(community.id);
  } catch (err) {
    logErrorMessage(err);
  }
};

const unpopulateCommunitiesMessages = async (communities: Community[]) => {
  const deleteMessagesPromises = communities.map(community => {
    return new Promise(resolve => {
      destroyCommunityMessages(community);
      resolve(1);
    });
  });

  await Promise.all(deleteMessagesPromises);
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

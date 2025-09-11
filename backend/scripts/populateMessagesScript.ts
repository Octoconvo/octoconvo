import { CommunityWithOwnerAndInbox } from "../@types/scriptTypes";
import {
  getSeedCommunitiesWithOwnerAndInbox,
  createCommunitySeedMessage,
} from "../database/prisma/scriptQueries";
import { logErrorMessage } from "../utils/error";
import { logPopulateMessage } from "../utils/loggerUtils";

type GenerateCommunityMessages = {
  community: CommunityWithOwnerAndInbox;
  messageCount: number;
};

const generateCommunityMessages = async ({
  community,
  messageCount,
}: GenerateCommunityMessages) => {
  try {
    for (let i = 1; i <= messageCount; i++) {
      if (community.inbox && community.owner) {
        await new Promise(resolve => setTimeout(resolve, 250));

        logPopulateMessage(
          `Creating seedmessage${messageCount} for ${community.name}`,
        );

        await createCommunitySeedMessage({
          number: i,
          inboxId: community.inbox.id,
          authorId: community.owner.id,
        });
      }
    }
  } catch (err) {
    logErrorMessage(err);
  }
};

const populateCommunitiesMessages = async (
  communities: CommunityWithOwnerAndInbox[],
) => {
  const createMessagesPromises = communities.map(async community => {
    await generateCommunityMessages({ community, messageCount: 100 });
  });

  await Promise.all(createMessagesPromises);
};

const populateMessagesDB = async () => {
  try {
    const seedCommunities = await getSeedCommunitiesWithOwnerAndInbox();
    populateCommunitiesMessages(seedCommunities);
  } catch (err) {
    logErrorMessage(err);
  }
};

export { populateMessagesDB };

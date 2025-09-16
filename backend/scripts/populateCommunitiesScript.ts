import { SeedUserGenerator } from "../@types/scriptTypes";
import {
  createCommunity,
  getUserByUsername,
} from "../database/prisma/scriptQueries";
import { logErrorMessage } from "../utils/error";
import {
  logPopulateMessage,
  logPopulateSuccessMessage,
} from "../utils/loggerUtils";
import { generateArrayOfSeedUsers } from "../utils/scriptUtils";

type GenerateUserCommunity = {
  name: string;
  bio: string;
  ownerUsername: string;
};

const generateUserCommunity = async ({
  name,
  bio,
  ownerUsername,
}: GenerateUserCommunity) => {
  try {
    const user = await getUserByUsername(ownerUsername);

    if (user) {
      logPopulateMessage(
        `Creating user ${ownerUsername}'s community ${name}...`,
      );
      await createCommunity({
        name,
        bio,
        ownerId: user?.id,
      });
      logPopulateSuccessMessage(
        `Successfully created user ${ownerUsername}'s` + ` community ${name}`,
      );
    }
  } catch (err) {
    logErrorMessage(err);
  }
};

const populateCommunities = async (users: SeedUserGenerator[]) => {
  for (const user of users) {
    await generateUserCommunity({
      name: user.community,
      bio: user.community,
      ownerUsername: user.username,
    });
  }
};

const populateCommunitiesDB = async (size: number) => {
  const seedUsersArrays = generateArrayOfSeedUsers(size);
  await populateCommunities(seedUsersArrays);
};

export { populateCommunitiesDB };

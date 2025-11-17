import { User } from "@prisma/client";
import { getUserByUsername } from "../database/prisma/userQueries";
import {
  logPopulateMessage,
  logErrorMessage,
  logPopulateSuccessMessage,
} from "../utils/loggerUtils";
import { createDirectMessage } from "../database/prisma/scriptQueries";
import { SeedUserGenerator } from "../@types/scriptTypes";
import { generateSeedUserGenerators } from "../utils/scriptUtils";

interface GenerateUserDirectMessageArgs {
  userOneUsername: string;
  userTwoUsername: string;
}

const generateUserDirectMessage = async ({
  userOneUsername,
  userTwoUsername,
}: GenerateUserDirectMessageArgs) => {
  try {
    const userOne: null | User = await getUserByUsername(userOneUsername);
    const userTwo: null | User = await getUserByUsername(userTwoUsername);

    if (userOne && userTwo) {
      logPopulateMessage(
        `Creating a direct message between ${userOneUsername} and` +
          ` ${userTwoUsername}...`,
      );

      await createDirectMessage({
        userOneId: userOne.id,
        userTwoId: userTwo.id,
      });

      logPopulateSuccessMessage(
        `Successfully created a direct message between user` +
          ` ${userOneUsername} and ${userTwoUsername}`,
      );
    }
  } catch (err) {
    logErrorMessage(err);
  }
};

const populateDirectMessages = async (
  seedUserGenerators: SeedUserGenerator[],
): Promise<void> => {
  const userOne: SeedUserGenerator = seedUserGenerators[0];

  seedUserGenerators.map(
    async (seedUserGenerator: SeedUserGenerator, index: number) => {
      if (index !== 0) {
        await generateUserDirectMessage({
          userOneUsername: userOne.username,
          userTwoUsername: seedUserGenerator.username,
        });
      }
    },
  );
};

const populateDirectMessagesDB = async () => {
  const seedUserGenerators: SeedUserGenerator[] =
    generateSeedUserGenerators(100);

  await populateDirectMessages(seedUserGenerators);
};

export { populateDirectMessagesDB };

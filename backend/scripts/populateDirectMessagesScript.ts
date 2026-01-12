import { User } from "@prisma/client";
import { getUserByUsername } from "../database/prisma/userQueries";
import {
  logPopulateMessage,
  logErrorMessage,
  logPopulateSuccessMessage,
} from "../utils/loggerUtils";
import {
  createDirectMessage,
  createDMSeedMessage,
} from "../database/prisma/scriptQueries";
import { SeedUserGenerator } from "../@types/scriptTypes";
import { generateSeedUserGenerators } from "../utils/scriptUtils";

interface GenerateDMMessagesArgs {
  DMID: string;
  messageCount: number;
  userOneUsername: string;
  userTwoUsername: string;
}

const generateDMMessages = async ({
  DMID,
  messageCount,
  userOneUsername,
  userTwoUsername,
}: GenerateDMMessagesArgs) => {
  try {
    const messageInflection = messageCount > 1 ? "messages" : "message";
    logPopulateMessage(
      `Creating ${messageCount} ${messageInflection} between` +
        ` ${userOneUsername} and ${userTwoUsername}...`,
    );
    for (let i = 1; i <= messageCount; i++) {
      await new Promise(resolve => setTimeout(resolve, 250));
      await createDMSeedMessage({
        index: i,
        DMID: DMID,
        authorUsername: userOneUsername,
      });
    }

    logPopulateSuccessMessage(
      `Successfully created ${messageCount} ${messageInflection} between` +
        ` ${userOneUsername} and ${userTwoUsername}...`,
    );
  } catch (err) {
    logErrorMessage(err);
  }
};

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

      const DM = await createDirectMessage({
        userOneId: userOne.id,
        userTwoId: userTwo.id,
      });

      generateDMMessages({
        DMID: DM.id,
        messageCount: 100,
        userOneUsername,
        userTwoUsername,
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

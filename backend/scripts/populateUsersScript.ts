import bcrypt from "bcrypt";
import { logErrorMessage } from "../utils/error";
import {
  createSeedLoneUser,
  createUser,
} from "../database/prisma/scriptQueries";
import { SeedUserGenerator } from "../@types/scriptTypes";
import { generateSeedUserGenerators } from "../utils/scriptUtils";
import {
  logPopulateMessage,
  logPopulateSuccessMessage,
} from "../utils/loggerUtils";

type GenereateSeedLoneUser = {
  index: number;
};

const generateSeedLoneUser = async ({ index }: GenereateSeedLoneUser) => {
  bcrypt.hash(`seedlone@User${index}`, 10, async (err, hashedPassword) => {
    if (err) {
      logErrorMessage(err);
    }

    await createSeedLoneUser({
      index: index,
      password: hashedPassword,
    });
  });
};

type GenerateSeedUser = {
  username: string;
  displayName: string;
  password: string;
};

const generateSeedUser = async ({
  username,
  displayName,
  password,
}: GenerateSeedUser) => {
  try {
    logPopulateMessage(`Creating ${username}...`);
    const createUserPromise = async () =>
      new Promise((resolve, reject) => {
        bcrypt.hash(password, 10, async (err, hashedPassword) => {
          if (err) {
            logErrorMessage(err);
            reject(err);
          } else {
            await createUser({
              username,
              displayName,
              password: hashedPassword,
            });
            resolve(1);
          }
        });
      });

    await createUserPromise();

    logPopulateSuccessMessage(`Successfully created ${username}`);
  } catch (err) {
    logErrorMessage(err);
  }
};

const populateUsers = async (seedUserGenerators: SeedUserGenerator[]) => {
  for (const seedUserGenerator of seedUserGenerators) {
    await generateSeedUser({
      username: seedUserGenerator.username,
      displayName: seedUserGenerator.displayName,
      password: seedUserGenerator.password,
    });
  }
};

const populateUsersDB = async (size: number) => {
  const seedUserGenerators = generateSeedUserGenerators(size);

  try {
    await populateUsers(seedUserGenerators);
    await generateSeedLoneUser({
      index: 1,
    });
  } catch (err) {
    logErrorMessage(err);
  }
};

export { populateUsersDB };

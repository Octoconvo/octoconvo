import bcrypt from "bcrypt";
import { logErrorMessage } from "../utils/error";
import {
  createSeedLoneUser,
  createUser,
} from "../database/prisma/scriptQueries";
import { SeedUserGenerator } from "../@types/scriptTypes";
import { generateArrayOfSeedUsers } from "../utils/scriptUtils";
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
    await createUser({ username, displayName, password });
    logPopulateSuccessMessage(`Successfully created ${username}`);
  } catch (err) {
    logErrorMessage(err);
  }
};

const populateUsers = async (users: SeedUserGenerator[]) => {
  const createUsersPromises = users.map(user => {
    return bcrypt.hash(user.password, 10, async (err, hashedPassword) => {
      if (err) {
        logErrorMessage(err);
      } else {
        await generateSeedUser({
          username: user.username,
          displayName: user.displayName,
          password: hashedPassword,
        });
      }
    });
  });

  await Promise.all(createUsersPromises);
};

const populateUsersDB = async (size: number) => {
  const seedUsersGenerators = generateArrayOfSeedUsers(size);

  try {
    await populateUsers(seedUsersGenerators);
    await generateSeedLoneUser({
      index: 1,
    });
  } catch (err) {
    logErrorMessage(err);
  }
};

export { populateUsersDB };

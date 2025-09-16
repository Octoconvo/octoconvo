import bcrypt from "bcrypt";
import { logErrorMessage } from "../utils/error";
import { createSeedLoneUser } from "../database/prisma/scriptQueries";

type GenereateSeedLoneUser = {
  index: number;
};

const generateSeedLoneUser = ({ index }: GenereateSeedLoneUser) => {
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

export { generateSeedLoneUser };

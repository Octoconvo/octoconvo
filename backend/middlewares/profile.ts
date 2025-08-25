import { RequestHandler } from "express";
import { getProfileByUsername } from "../database/prisma/profileQueries";

const createCheckProfileByUsernameMiddleware = ({
  message,
}: {
  message: string;
}): RequestHandler => {
  return async (req, res, next) => {
    const username =
      (req.query.username as string) || (req.body.username as string);
    const profile = await getProfileByUsername(username);

    if (profile === null) {
      res.status(404).json({
        message,
        error: {
          message: "User with that username doesn't exist",
        },
      });

      return;
    }

    req.friend = profile;
    next();
  };
};

export { createCheckProfileByUsernameMiddleware };

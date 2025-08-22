import asyncHandler from "express-async-handler";
import { Request, RequestHandler, Response } from "express";
import { createAuthenticationHandler } from "../utils/authentication";
import { createValidationErrorMiddleware } from "../utils/error";
import { query } from "express-validator";
import { getProfileByUsername } from "../database/prisma/profileQueries";
import { getFriendByUsername } from "../database/prisma/friendQueries";

const friendValidation = {
  usernameQuery: query("username", "Username query is required")
    .trim()
    .isLength({ min: 1 })
    .bail()
    .isLength({ max: 32 })
    .withMessage("Username query must not exceed 32 characters")
    .custom(async val => {
      const regex = new RegExp("^[a-zA-Z0-9_]+$");
      const match = regex.test(val);
      if (!match) {
        throw new Error(
          "Username query must only contain alphanumeric characters" +
            " and underscores",
        );
      }
    })
    .escape(),
};

const userFriendshipStatusGETAuthenticationMiddleware =
  createAuthenticationHandler({
    message: "Failed to fetch your friendship status with the user",
    errMessage: "You are not authenticated",
  });

const userFriendshipStatusGETUserNotFoundMiddleware: RequestHandler = async (
  req,
  res,
  next,
) => {
  const username = req.query.username as string;
  const profile = await getProfileByUsername(username);

  if (profile === null) {
    res.status(404).json({
      message: "Failed to fetch your friendship status with the user",
      error: {
        message: "User with that username doesn't exist",
      },
    });

    return;
  }

  next();
};

const userFriendShipStatusGETValidationErrorMiddleware =
  createValidationErrorMiddleware({
    message: "Failed to fetch your friendship status with the user",
  });

const user_friendship_status_get = [
  userFriendshipStatusGETAuthenticationMiddleware,
  friendValidation.usernameQuery,
  userFriendShipStatusGETValidationErrorMiddleware,
  asyncHandler(userFriendshipStatusGETUserNotFoundMiddleware),
  asyncHandler(async (req: Request, res: Response) => {
    const userUsername = req.user?.username as string;
    const friendUsername = req.query.username as string;

    const friend = await getFriendByUsername({
      userUsername,
      friendUsername,
    });

    const friendshipStatus = friend ? friend.status : "NONE";

    res.json({
      message:
        "Successfully fetched your friendship status with" +
        ` ${friendUsername}`,
      friendshipStatus,
    });
  }),
];

export { user_friendship_status_get };

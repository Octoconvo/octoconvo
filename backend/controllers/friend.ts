import asyncHandler from "express-async-handler";
import { Request, RequestHandler, Response } from "express";
import { createAuthenticationMiddleware } from "../utils/authentication";
import { createValidationErrorMiddleware } from "../middlewares/error";
import { query } from "express-validator";
import { getProfileByUsername } from "../database/prisma/profileQueries";
import {
  addFriend,
  getFriendByUsername,
} from "../database/prisma/friendQueries";
import { createCheckProfileByUsernameMiddleware } from "../middlewares/profile";

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

const userFriendshipStatusGETAuthentication = createAuthenticationMiddleware({
  message: "Failed to fetch your friendship status with the user",
  errMessage: "You are not authenticated",
});

const userFriendshipStatusGETUserNotFound: RequestHandler = async (
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

const userFriendShipStatusGETValidationError = createValidationErrorMiddleware({
  message: "Failed to fetch your friendship status with the user",
});

const user_friendship_status_get = [
  userFriendshipStatusGETAuthentication,
  friendValidation.usernameQuery,
  userFriendShipStatusGETValidationError,
  asyncHandler(userFriendshipStatusGETUserNotFound),
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

const friendAddPOSTAuthentication = createAuthenticationMiddleware({
  message: "Failed to send a friend request to the user",
  errMessage: "You are not authenticated",
});

const friendAddPOSTValidationError = createValidationErrorMiddleware({
  message: "Failed to send a friend request to the user",
});

const friendAddPOSTProfileNotFound = createCheckProfileByUsernameMiddleware({
  message: "Failed to send a friend request to the user",
});

const friendAddPOSTFriendshipCheck: RequestHandler = async (req, res, next) => {
  const userUsername = req.user?.username as string;
  const friendUsername = req.query.username as string;

  const friend = await getFriendByUsername({
    userUsername,
    friendUsername,
  });

  if (friend) {
    const responseMessages = {
      ACTIVE: "You are already friends with the user",
      PENDING: "You already sent a friend request to the user",
    };
    const message = responseMessages[friend.status];

    res.status(409).json({
      message: "Failed to send a friend request to the user",
      error: {
        message,
      },
    });

    return;
  }

  next();
};

const friend_add_post = [
  friendAddPOSTAuthentication,
  friendValidation.usernameQuery,
  friendAddPOSTValidationError,
  asyncHandler(friendAddPOSTProfileNotFound),
  asyncHandler(friendAddPOSTFriendshipCheck),
  asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?.id as string;
    const friendId = req.friend.id as string;

    const { friends, notification } = await addFriend({
      userId,
      friendId,
      payload: "sent a friend request",
    });

    req.app
      .get("io")
      .to(`notification:${notification.triggeredForId}`)
      .emit("notificationcreate", notification);

    res.json({
      message: "Successfully sent a friend request to the user",
      friends,
    });
  }),
];

export { user_friendship_status_get, friend_add_post };

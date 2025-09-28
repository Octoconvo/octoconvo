import asyncHandler from "express-async-handler";
import { NextFunction, Request, RequestHandler, Response } from "express";
import { createAuthenticationMiddleware } from "../utils/authentication";
import { createValidationErrorMiddleware } from "../middlewares/error";
import { query, body } from "express-validator";
import { getProfileByUsername } from "../database/prisma/profileQueries";
import {
  addFriend,
  getFriendByUsername,
  getUserFriendsWithCursor,
  handleFriendRequest,
} from "../database/prisma/friendQueries";
import { createCheckProfileByUsernameMiddleware } from "../middlewares/profile";
import { isUUID } from "../utils/validation";
import { getFriendRequestNotificationById } from "../database/prisma/notificationQueries";
import {
  constructFriendCursor,
  deconstructFriendCursor,
} from "../utils/cursor";
import { getLastItemInTheArray } from "../utils/array";
import { UserFriendData } from "../@types/database";
import { UserFriendsGETResponse } from "../@types/apiResponse";

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
  username: body("username", "Username query is required")
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
  action: body("action").custom(val => {
    const actionRegex = /^(REJECT|ACCEPT)$/;

    if (!actionRegex.test(val)) {
      throw new Error("Action must either be REJECT or ACCEPT");
    }

    return true;
  }),
  notificationId: body("notificationid").custom(val => {
    if (!isUUID(val)) {
      throw new Error("Friend request notification id is invalid");
    }

    return true;
  }),
  limit: query("limit")
    .optional({ values: "falsy" })
    .bail()
    .isInt({
      min: 1,
      max: 100,
      allow_leading_zeroes: false,
    })
    .withMessage("Limit must be an integer and between 1 and 100"),
  cursor: query("cursor")
    .trim()
    .optional({
      values: "falsy",
    })
    .bail()
    .custom(value => {
      const cursor = value;
      const id = cursor ? cursor.split("_")[0] : null;
      const username = cursor ? cursor.split("_")[1] : null;
      const usernameRegex = new RegExp("^[a-zA-Z0-9_]+$");
      const isUsername = usernameRegex.test(username);

      // validate cusor's createdAt and id fields
      if (!(isUUID(id) && isUsername)) {
        throw new Error("Cursor value is invalid");
      }

      return true;
    }),
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
  const friendUsername = req.body.username as string;

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
  friendValidation.username,
  (req: Request, res: Response, next: NextFunction) => {
    const userUsername = req.user?.username as string;
    const friendUsername = req.body.username as string;

    if (userUsername === friendUsername) {
      res.status(409).json({
        message: "Failed to send a friend request to the user",
        error: {
          message: "You can't send a friend request to yourself",
        },
      });

      return;
    }

    next();
  },
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

    req.app
      .get("io")
      .to(`notification:${notification.triggeredForId}`)
      .emit("notificationupdate");

    res.json({
      message: "Successfully sent a friend request to the user",
      friends,
    });
  }),
];

const friendRequestPOSTAuthentication = createAuthenticationMiddleware({
  message: "Failed to perform the action on the friend request",
  errMessage: "You are not authenticated",
});
const friendRequestPOSTValidationError = createValidationErrorMiddleware({
  message: "Failed to perform the action on the friend request",
});
const friendRequestPOSTNotificationNotFound = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const notificationId = req.body.notificationid;

  const notification = await getFriendRequestNotificationById(notificationId);

  if (notification === null) {
    res.status(404).json({
      message: "Failed to perform the action on the friend request",
      error: {
        message: "The friend request doesn't exist",
      },
    });

    return;
  }

  req.notification = notification;
  next();
};

const friend_request_post = [
  friendRequestPOSTAuthentication,
  friendValidation.action,
  friendValidation.notificationId,
  friendRequestPOSTValidationError,
  asyncHandler(friendRequestPOSTNotificationNotFound),
  asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?.id as string;
    const friendId = req.notification?.triggeredById as string;
    const notificationTriggeredForId = req.notification
      ?.triggeredForId as string;
    const notificationId = req.notification?.id as string;
    const action = req.body.action;

    if (userId !== notificationTriggeredForId) {
      res.status(403).json({
        message: "Failed to perform the action on the friend request",
        error: {
          message:
            "You are not authorised to perform any action on this" +
            " friend request",
        },
      });

      return;
    }

    const { friends, notification, newNotification } =
      await handleFriendRequest({
        userId: userId,
        friendId: friendId,
        notificationId: notificationId,
        action: action,
      });

    const message =
      action === "REJECT"
        ? "Successfully rejected the friend request"
        : "Successfully accepted the friend request";

    // trigger notification update and create for the accepted user
    if (newNotification) {
      req.app
        .get("io")
        .to(`notification:${newNotification.triggeredForId}`)
        .emit(`notificationupdate`);

      req.app
        .get("io")
        .to(`notification:${newNotification.triggeredForId}`)
        .emit(`notificationcreate`, newNotification);
    }

    /// trigger notification update to the user
    req.app.get("io").to(`notification:${userId}`).emit("notificationupdate");

    res.json({
      message: message,
      friends: friends,
      notification,
      newNotification,
    });
  }),
];

const userFriendsGETErrorMessage = "Failed to fetch user's friends";

const userFriendsGETAuthentication = createAuthenticationMiddleware({
  message: userFriendsGETErrorMessage,
  errMessage: "You are not authenticated",
});

const userFriendsGETValidationError = createValidationErrorMiddleware({
  message: userFriendsGETErrorMessage,
});

const user_friends_get = [
  userFriendsGETAuthentication,
  friendValidation.limit,
  friendValidation.cursor,
  userFriendsGETValidationError,
  asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?.id as string;
    const limit = req.query.limit ? Number(req.query.limit) : 30;
    const cursorString = req.query.cursor as string;
    const cursorObject = cursorString
      ? deconstructFriendCursor(cursorString)
      : { id: "", username: "" };

    const userFriends = await getUserFriendsWithCursor({
      cursor: cursorObject,
      userId,
      limit,
    });

    const lastFriendOnTheList =
      getLastItemInTheArray<UserFriendData>(userFriends);
    let nextCursor: string | false = false;
    const isFull = userFriends.length === limit;

    if (lastFriendOnTheList && isFull) {
      nextCursor = constructFriendCursor({
        id: lastFriendOnTheList.friendId,
        username: lastFriendOnTheList.friend.username,
      });
    }

    const responseData: UserFriendsGETResponse = {
      message: "Successfully fetched user's friends",
      friends: userFriends,
      nextCursor: nextCursor,
    };

    res.json(responseData);
  }),
];

export {
  user_friendship_status_get,
  friend_add_post,
  friend_request_post,
  user_friends_get,
};

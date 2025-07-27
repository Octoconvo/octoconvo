import asyncHandler from "express-async-handler";
import { Request, Response } from "express";
import { createAuthenticationHandler } from "../utils/authentication";
import {
  getUserUnreadNotificationCount,
  getUserNotifications,
} from "../database/prisma/notificationQueries";
import { query, validationResult } from "express-validator";
import { isUUID, isISOString } from "../utils/validation";
import { createValidationErrObj } from "../utils/error";

const notificationValidation = {
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
      const createdAt = cursor ? cursor.split("_")[1] : null;

      // validate cusor's createdAt and id fields
      if (!(isUUID(id) && isISOString(createdAt))) {
        console.log({
          isUUID: isUUID(id),
          isISOString: isISOString(createdAt),
          cursor,
        });
        throw new Error("Cursor value is invalid");
      }

      return true;
    }),
};

const unread_notification_count_get = [
  createAuthenticationHandler({
    message: "Failed to fetch user's unread notification count",
    errMessage: "You are not authenticated",
  }),
  asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?.id as string;

    const unreadNotificationCount = await getUserUnreadNotificationCount({
      userId: userId,
    });

    res.json({
      message: "Successfully fetched user's unread notification count",
      unreadNotificationCount,
    });
  }),
];

const notifications_get = [
  createAuthenticationHandler({
    message: "Failed to fetch user's notifications",
    errMessage: "You are not authenticated",
  }),
  notificationValidation.limit,
  notificationValidation.cursor,
  asyncHandler(async (req: Request, res: Response) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      const obj = createValidationErrObj(
        errors,
        "Failed to fetch user's notifications",
      );

      res.status(422).json(obj);
      return;
    }

    const userId = req.user?.id as string;
    const cursor =
      req.query.cursor && typeof req.query.cursor === "string"
        ? req.query.cursor
        : null;
    const id = cursor ? cursor.split("_")[0] : "";
    const createdAt = cursor ? cursor.split("_")[1] : "";
    const limit = req.query.limit ? Number(req.query.limit) : 100;

    const notifications = await getUserNotifications({
      userId,
      cursor: cursor ? { id, createdAt } : null,
      limit,
    });

    const lastNotification = notifications
      ? notifications[notifications.length - 1]
      : null;
    const nextCursor = lastNotification
      ? `${lastNotification.id}` +
        "_" +
        `${new Date(lastNotification.createdAt).toISOString()}`
      : false;

    res.json({
      message: "Successfully fetched user's notifications",
      notifications,
      nextCursor: notifications.length < limit ? false : nextCursor,
    });
  }),
];

export { unread_notification_count_get, notifications_get };

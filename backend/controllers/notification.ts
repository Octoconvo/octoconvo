import asyncHandler from "express-async-handler";
import { Request, Response } from "express";
import { createAuthenticationHandler } from "../utils/authentication";
import {
  getUserUnreadNotificationCount,
  getUserNotifications,
  updateNotificationsReadStatus,
} from "../database/prisma/notificationQueries";
import { query, body, validationResult } from "express-validator";
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
  startDate: body("startdate")
    .trim()
    .isLength({
      min: 1,
    })
    .withMessage("The starting date cannot be empty")
    .custom(value => {
      if (!isISOString(value)) {
        throw new Error("The starting date is invalid");
      }

      return true;
    }),
  endDate: body("enddate")
    .trim()
    .optional({
      values: "falsy",
    })
    .custom(value => {
      if (!isISOString(value)) {
        throw new Error("The end date is invalid");
      }

      return true;
    }),
  updateMode: query("mode")
    .trim()
    .custom(value => {
      const regex = new RegExp(/^(SILENT|ALERT)$/);

      if (!regex.test(value)) {
        throw new Error("Mode must either be SILENT or ALERT");
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

const notifications_update_read_status_post = [
  createAuthenticationHandler({
    message: "Failed to update user's notifications' read statuses",
    errMessage: "You are not authenticated",
  }),
  notificationValidation.updateMode,
  notificationValidation.startDate,
  notificationValidation.endDate,
  asyncHandler(async (req: Request, res: Response) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      const obj = createValidationErrObj(
        errors,
        "Failed to update user's notifications' read statuses",
      );

      res.status(422).json(obj);

      return;
    }

    const userId = req.user?.id as string;
    const startDate = req.body.startdate;
    const endDate = req.body.enddate;

    const notifications = await updateNotificationsReadStatus({
      userId,
      startDate,
      endDate,
    });

    const mode = req.query.mode;

    if (mode === "ALERT") {
      req.app.get("io").to(`notification:${userId}`).emit("notificationupdate");
    }

    if (mode === "SILENT") {
      req.app
        .get("io")
        .to(`notification:${userId}`)
        .emit("notificationupdate--silent");
    }

    res.json({
      message:
        "Successfully updated user's notifications' read statuses" +
        ` in ${mode} mode`,
      notifications,
    });
  }),
];

export {
  unread_notification_count_get,
  notifications_get,
  notifications_update_read_status_post,
};

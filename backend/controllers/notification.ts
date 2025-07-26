import asyncHandler from "express-async-handler";
import { Request, Response } from "express";
import { createAuthenticationHandler } from "../utils/authentication";
import { getUserUnreadNotificationCount } from "../database/prisma/notificationQueries";

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

export { unread_notification_count_get };

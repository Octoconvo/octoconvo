import asyncHandler from "express-async-handler";
import { Request, Response } from "express";
import { createAuthenticationMiddleware } from "../utils/authentication";
import { getUserDMs } from "../database/prisma/dmQueries";

const userDMsGetAuth = createAuthenticationMiddleware({
  message: "Failed to fetch user's DMs",
  errMessage: "You are not authenticated",
});

const user_DMs_get = [
  userDMsGetAuth,
  asyncHandler(async (req: Request, res: Response) => {
    const id: string = req.user?.id as string;

    const userDMs = await getUserDMs({
      userId: id,
    });

    res.json({
      message: "Successfully fethed user's direct messages",
      directMessages: userDMs,
    });
  }),
];

export { user_DMs_get };

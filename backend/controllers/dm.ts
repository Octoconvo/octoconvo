import asyncHandler from "express-async-handler";
import { Request, Response } from "express";
import { createAuthenticationMiddleware } from "../utils/authentication";
import { getUserDMs } from "../database/prisma/dmQueries";
import { UserDMData } from "../@types/database";
import { UserDMsGETResponse } from "../@types/apiResponse";

const userDMsGetAuth = createAuthenticationMiddleware({
  message: "Failed to fetch user's DMs",
  errMessage: "You are not authenticated",
});

const user_DMs_get = [
  userDMsGetAuth,
  asyncHandler(async (req: Request, res: Response) => {
    const id: string = req.user?.id as string;

    const userDMs: UserDMData[] = await getUserDMs({
      userId: id,
    });

    const processedUserDMs: UserDMsGETResponse[] = userDMs.map(
      (DM: UserDMData): UserDMsGETResponse => {
        const { participants, ...rest } = DM;

        return { ...rest, recipient: participants[0] };
      },
    );

    res.json({
      message: "Successfully fethed user's direct messages",
      directMessages: processedUserDMs,
    });
  }),
];

export { user_DMs_get };

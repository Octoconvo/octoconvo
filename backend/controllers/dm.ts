import asyncHandler from "express-async-handler";
import { Request, Response } from "express";
import { createAuthenticationMiddleware } from "../utils/authentication";
import { getDirectMessageById, getUserDMs } from "../database/prisma/dmQueries";
import { UserDMData } from "../@types/database";
import { LastMessage, UserDMsGETResponse } from "../@types/apiResponse";
import { check, validationResult } from "express-validator";
import { isUUID } from "../utils/validation";
import { createValidationErrObj } from "../utils/error";

const DMValidation = {
  DMIdParam: check("directmessageid").custom((_val, { req }) => {
    const DMId = req.params?.directmessageid;

    if (!isUUID(DMId)) {
      throw new Error("DM id is invalid");
    }

    return true;
  }),
};

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
        const { participants, inbox, ...rest } = DM;
        const lastMessage: LastMessage = inbox
          ? inbox.messages.length
            ? inbox.messages[0]
            : null
          : null;

        return {
          ...rest,
          recipient: { ...participants[0].user },
          inbox: inbox ? { id: inbox.id } : null,
          lastMessage: lastMessage,
        };
      },
    );

    res.json({
      message: "Successfully fethed user's direct messages",
      directMessages: processedUserDMs,
    });
  }),
];

const DMGETAuthentication = createAuthenticationMiddleware({
  message: "Failed to fetch DM with that id",
  errMessage: "You are not authenticated",
});

const DM_get = [
  DMGETAuthentication,
  DMValidation.DMIdParam,
  asyncHandler(async (req: Request, res: Response) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      const obj = createValidationErrObj(
        errors,
        "Failed to fetch DM with that id",
      );

      res.status(422).json(obj);
      return;
    }

    const DMId: string = req.params.directmessageid;
    const userId: string = req.user?.id as string;
    const DM = await getDirectMessageById({
      id: DMId,
      userId,
    });

    if (DM === null) {
      res.status(404).json({
        message: "Failed to fetch DM with that id",
        error: {
          message: "Can't find DM with that id",
        },
      });

      return;
    }

    res.json({
      message: `Successfully fetched DM with that id`,
      directMessage: DM,
    });
  }),
];

export { user_DMs_get, DM_get };

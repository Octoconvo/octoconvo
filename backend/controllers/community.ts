import asyncHandler from "express-async-handler";
import { Request, Response } from "express";
import { createAuthenticationHandler } from "../utils/authentication";
import { body, check, query, validationResult } from "express-validator";
import { createValidationErrObj } from "../utils/error";
import {
  getCommunityById,
  getCommunityByName,
  createCommunity,
  getUserCommunities,
  searchCommunities,
  updateCommunity,
  joinCommunity,
  handleCommunityRequest,
} from "../database/prisma/communityQueries";
import { convertFileName } from "../utils/file";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import sharp from "sharp";
import { getPublicURL, uploadFile } from "../database/supabase/supabaseQueries";
import multer from "multer";
import { isUUID, isISOString } from "../utils/validation";
import {
  getCommunityOwner,
  getCommunityParticipant,
} from "../database/prisma/participantQueries";
import { getNotificationById } from "../database/prisma/notificationQueries";
const storage = multer.memoryStorage();
const upload = multer({ storage });

const imageMimeTypes = ["image/jpeg", "image/png"];

const communityValidation = {
  name: body("name")
    .trim()
    .isLength({ min: 1 })
    .withMessage("Community name is required")
    .isLength({ max: 128 })
    .withMessage("Community name must not exceed 128 characters")
    .escape()
    .custom(async (val: string) => {
      const community = await getCommunityByName(val);

      if (community) {
        throw new Error("Community name is already taken");
      }
    }),
  name_query: query("name")
    .trim()
    .optional({ values: "falsy" })
    .isLength({ max: 128 })
    .withMessage("Community name must not exceed 128 characters")
    .escape(),
  bio: body("bio")
    .trim()
    .isLength({ max: 255 })
    .withMessage("Community bio must not exceed 255 characters")
    .escape(),
  avatar: check("avatar").custom((val, { req }) => {
    const files = req?.files;
    const avatar =
      files && files?.avatar && files.avatar.length > 0
        ? (files.avatar[0] as Express.Multer.File)
        : null;

    if (avatar) {
      const isMimeTypeValid = imageMimeTypes.includes(avatar.mimetype);

      if (!isMimeTypeValid) {
        throw new Error("Avatar must only be in jpeg or png format");
      }
    }

    return true;
  }),
  banner: check("banner", "Something went wrong").custom((val, { req }) => {
    const files = req?.files;
    const banner =
      files && files?.banner && files.banner.length > 0
        ? (files.banner[0] as Express.Multer.File)
        : null;

    if (banner) {
      const isMimeTypeValid = imageMimeTypes.includes(banner.mimetype);

      if (!isMimeTypeValid) {
        throw new Error("Banner must only be in jpeg or png format");
      }
    }

    return true;
  }),
  communityIdParam: check("communityid").custom((val, { req }) => {
    const communityId = req.params?.communityid;

    if (!isUUID(communityId)) {
      throw new Error("Community id is invalid");
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
    .withMessage("Limit must be an integer between 1 and 100"),
  cursor: query("cursor")
    .trim()
    .optional({
      values: "falsy",
    })
    .bail()
    .custom(
      // eslint-disable-next-line
      (value, { req }) => {
        const cursor = value;
        const memberCount = cursor ? cursor.split("_")[0] : null;
        const id = cursor ? cursor.split("_")[1] : null;
        const createdAt = cursor ? cursor.split("_")[2] : null;

        // Validate cursor createdAt and id
        if (
          !(
            Number.isInteger(Number(memberCount)) &&
            isUUID(id) &&
            isISOString(createdAt)
          )
        ) {
          throw new Error("Cursor value is invalid");
        }

        return true;
      },
    ),
  action: body("action").custom(val => {
    const regex = new RegExp("^(REJECT|ACCEPT)$");

    if (!regex.test(val)) {
      throw new Error(
        "Community request's action must either be REJECT or ACCEPT" +
          " and must always be capitalised",
      );
    }

    return true;
  }),
  notificationId: body("notificationid").custom(val => {
    if (!isUUID(val)) {
      throw new Error("Community notification id is invalid");
    }

    return true;
  }),
};

const community_get = [
  createAuthenticationHandler({
    message: "Failed to fetch community",
    errMessage: "You are not authenticated",
  }),
  communityValidation.communityIdParam,
  asyncHandler(async (req: Request, res: Response) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      const obj = createValidationErrObj(errors, "Failed to fetch community");

      res.status(422).json(obj);
      return;
    }

    const communityId = req.params.communityid;

    const community = await getCommunityById(communityId);

    if (community === null) {
      res.status(404).json({
        message: "Failed to fetch community",
        error: {
          message: "Community with that id doesn't exist",
        },
      });

      return;
    }

    res.json({
      message: `Successfully fetched community with id ${communityId}`,
      community,
    });
  }),
];

const community_post = [
  createAuthenticationHandler({
    message: "Failed to create community",
    errMessage: "You are not authenticated",
  }),
  upload.fields([
    { name: "avatar", maxCount: 1 },
    { name: "banner", maxCount: 1 },
  ]),
  communityValidation.name,
  communityValidation.bio,
  communityValidation.avatar,
  communityValidation.banner,
  asyncHandler(async (req: Request, res: Response) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      const obj = createValidationErrObj(errors, "Failed to create community");

      res.status(422).json(obj);
      return;
    }

    const id = req.user?.id as string;
    const communityName = req.body.name;
    const bio = req.body.bio;

    // Files body fields
    const files = req.files as {
      avatar: Express.Multer.File[];
      banner: Express.Multer.File[];
    };

    const avatar: null | Express.Multer.File = files?.avatar
      ? convertFileName(files.avatar[0])
      : null;
    const banner: null | Express.Multer.File = files?.banner
      ? convertFileName(files.banner[0])
      : null;
    // Avatar and banner urls
    let avatarURL: null | string = null;
    let bannerURL: null | string = null;

    try {
      const community = await createCommunity({
        id: id,
        name: communityName,
        bio,
        avatar: avatarURL,
        banner: bannerURL,
      });

      if (avatar) {
        // Resize and compress image
        const buffer = await sharp(avatar.buffer)
          .jpeg({ quality: 80 })
          .resize({ width: 320, height: 320, fit: "cover" })
          .toBuffer();

        avatar.buffer = buffer;

        // upload image
        const data = await uploadFile({
          file: avatar,
          bucketName: "community-avatar",
          folder: community.id,
        });

        const url = getPublicURL({
          path: data.path,
          bucketName: "community-avatar",
        });

        if (url) avatarURL = url.publicUrl;
      }

      if (banner) {
        // Resize and compress image
        const buffer = await sharp(banner.buffer)
          .jpeg({ quality: 80 })
          .resize({ width: 1920, height: 1080, fit: "cover" })
          .toBuffer();

        banner.buffer = buffer;

        const data = await uploadFile({
          file: banner,
          bucketName: "community-banner",
          folder: community.id,
        });

        const url = getPublicURL({
          path: data.path,
          bucketName: "community-banner",
        });

        if (url) bannerURL = url.publicUrl;
      }

      const updatedCommunity = await updateCommunity({
        id: community.id,
        avatar: avatarURL,
        banner: bannerURL,
        includeParticipant: true,
      });

      console.log({ updatedCommunity });

      req.app.get("io").to(`communities:${id}`).emit("communitycreate");

      res.json({
        message: "Successfully created community",
        community: updatedCommunity,
      });
    } catch (err) {
      if (err instanceof PrismaClientKnownRequestError) {
        if (err.code.toLowerCase() === "p2002") {
          res.status(422).json({
            message: "Failed to create community",
            error: {
              validationError: [
                {
                  field: "name",
                  value: communityName,
                  msg: "Community with that name already exist",
                },
              ],
            },
          });
        }
      }
    }
  }),
];

const communities_get = [
  createAuthenticationHandler({
    message: "Failed to fetch user's communities",
    errMessage: "You are not authenticated",
  }),
  asyncHandler(async (req: Request, res: Response) => {
    const id = req.user?.id as string;

    const communities = await getUserCommunities({ userId: id });

    res.json({
      message: "Successfully fetched user's communities",
      communities,
    });
  }),
];

const communities_explore_get = [
  createAuthenticationHandler({
    message: "Failed to fetch communities",
    errMessage: "You are not authenticated",
  }),
  communityValidation.name_query,
  communityValidation.limit,
  communityValidation.cursor,
  asyncHandler(async (req: Request, res: Response) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      const obj = createValidationErrObj(errors, "Failed to fetch communities");

      res.status(422).json(obj);
      return;
    }

    const name = req.query?.name ? (req.query.name as string) : null;
    const limit = req.query?.limit ? (Number(req.query.limit) as number) : 30;
    const cursor = req.query?.cursor
      ? (req.query.cursor as string).split("_")
      : null;

    const communities = await searchCommunities({
      name,
      limit,
      cursor: cursor
        ? {
            memberCount: Number(cursor[0]),
            id: cursor[1],
            createdAt: cursor[2],
          }
        : cursor,
    });

    const lastCommunity = communities.length
      ? communities[communities.length - 1]
      : null;
    const nextCursor = lastCommunity
      ? `${lastCommunity._count.participants}` +
        "_" +
        `${lastCommunity.id}` +
        "_" +
        `${new Date(lastCommunity.createdAt).toISOString()}`
      : null;

    res.json({
      message: "Successfully fetched communities",
      communities,
      nextCursor: communities.length < limit ? false : nextCursor,
    });
  }),
];

const community_participation_status_get = [
  createAuthenticationHandler({
    message: "Failed to fetch your community participation status",
    errMessage: "You are not authenticated",
  }),
  communityValidation.communityIdParam,
  asyncHandler(async (req: Request, res: Response) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      const obj = createValidationErrObj(
        errors,
        "Failed to fetch your community participation status",
      );

      res.status(422).json(obj);
      return;
    }

    const userId = req.user?.id as string;
    const communityId = req.params.communityid;

    console.log({
      communityId,
    });

    const community = await getCommunityById(communityId);

    if (community === null) {
      res.status(404).json({
        message: "Failed to fetch your community participation status",
        error: {
          message: "Community with that id doesn't exist",
        },
      });

      return;
    }

    // Check if user participant object already exists in the community

    const participant = await getCommunityParticipant({
      userId: userId,
      communityId: communityId,
    });

    const participationStatus = participant ? participant.status : "NONE";

    res.json({
      message: "Successfully fetched your community participation status",
      participationStatus: participationStatus,
    });
  }),
];

const community_join_post = [
  createAuthenticationHandler({
    message: "Failed to send a join request to the community",
    errMessage: "You are not authenticated",
  }),
  communityValidation.communityIdParam,
  asyncHandler(async (req: Request, res: Response) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      const obj = createValidationErrObj(
        errors,
        "Failed to send a join request to the community",
      );

      res.status(422).json(obj);
      return;
    }

    const userId = req.user?.id as string;
    const communityId = req.params.communityid;

    const community = await getCommunityById(communityId);

    console.log({ communityId, community });
    if (community === null) {
      console.log(`Is community === null?: ${community === null}`);
      res.status(404).json({
        message: "Failed to send a join request to the community",
        error: {
          message: "Community with that id doesn't exist",
        },
      });

      return;
    }

    const owner = await getCommunityOwner({ communityId: communityId });

    if (owner === null) {
      throw new Error("Can't find the community's owner");
    }

    const currentParticipant = await getCommunityParticipant({
      communityId: communityId,
      userId: userId,
    });

    if (currentParticipant !== null) {
      const message =
        currentParticipant.status === "ACTIVE"
          ? "You already joined the community"
          : "You already sent a request to join the community";
      res.status(409).json({
        message: "Failed to send a join request to the community",
        error: {
          message: message,
        },
      });

      return;
    }

    const { participant, notifications } = await joinCommunity({
      communityId: communityId,
      triggeredForIds: [owner.userId],
      userId: userId,
      payload: "requested to join",
    });

    // trigger notification for the community's owner
    req.app
      .get("io")
      .to(`notification:${owner.userId}`)
      .emit("notificationupdate");

    // trigger notification creation for the community's owner

    const ownerNotification = notifications.find(notification => {
      return notification.triggeredForId === owner.userId;
    });

    req.app
      .get("io")
      .to(`notification:${owner.userId}`)
      .emit("notificationcreate", ownerNotification);

    res.json({
      message: "Successfully sent a join request to the community",
      participant,
    });
  }),
];

// This controller is used to accept or reject community join requests
const community_request_POST = [
  createAuthenticationHandler({
    message: "Failed to trigger the action on the community request",
    errMessage: "You are not authenticated",
  }),
  communityValidation.communityIdParam,
  communityValidation.action,
  communityValidation.notificationId,
  asyncHandler(async (req: Request, res: Response) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      const obj = createValidationErrObj(
        errors,
        "Failed to trigger the action on the community request",
      );

      res.status(422).json(obj);

      return;
    }

    const userId = req.user?.id as string;

    const communityId = req.params.communityid;
    const community = await getCommunityById(communityId);

    if (community === null) {
      res.status(404).json({
        message: "Failed to trigger the action on the community request",
        error: {
          message: "Community with that id doesn't exist",
        },
      });

      return;
    }

    const notificationId = req.body.notificationid;
    const currentNotification = await getNotificationById(notificationId);

    if (currentNotification === null) {
      res.status(404).json({
        message: "Failed to trigger the action on the community request",
        error: {
          message: "Notification with that id doesn't exist",
        },
      });

      return;
    }

    if (currentNotification.type !== "COMMUNITYREQUEST") {
      res.status(409).json({
        message: "Failed to trigger the action on the community request",
        error: {
          message: "Can only perform action on a community request",
        },
      });

      return;
    }

    if (currentNotification.status !== "PENDING") {
      res.status(409).json({
        message: "Failed to trigger the action on the community request",
        error: {
          message:
            "Can only perform action on a community request with" +
            " PENDING status",
        },
      });

      return;
    }

    const currentParticipant = await getCommunityParticipant({
      userId: currentNotification.triggeredById,
      communityId: community.id,
    });

    if (currentParticipant === null) {
      res.status(400).json({
        message: "Failed to trigger the action on the community request",
        error: {
          message:
            "Cannot find the corresponding notification's participant data",
        },
      });

      return;
    }

    // Check whether the user is authorised to update the community's request
    const owner = await getCommunityOwner({ communityId: communityId });

    if (owner === null) {
      throw new Error("Can't find the community's owner");
    }

    if (owner.userId !== userId) {
      res.status(403).json({
        message:
          "You are not authorised to perform any actions on this community",
        error: {
          message: "You are not the owner of this community",
        },
      });

      return;
    }

    const action = req.body.action;
    const actionRes = req.body.action === "ACCEPT" ? "accepted" : "rejected";

    let notificationRes;
    let participantRes;

    if (action === "REJECT") {
      const { notification, participant } = await handleCommunityRequest({
        communityId,
        triggeredById: owner.userId,
        notificationId,
        participantId: currentParticipant.id,
        action: "REJECT",
      });

      notificationRes = notification;
      participantRes = participant;
    }

    if (action === "ACCEPT") {
      const { notification, participant, newNotifications } =
        await handleCommunityRequest({
          communityId,
          triggeredById: owner.userId,
          notificationId,
          participantId: currentParticipant.id,
          action: "ACCEPT",
        });

      notificationRes = notification;
      participantRes = participant;

      // trigger notification update and create for the accepted user
      if (newNotifications)
        newNotifications.forEach(notification => {
          req.app
            .get("io")
            .to(`notification:${notification.triggeredForId}`)
            .emit(`notificationupdate`);

          req.app
            .get("io")
            .to(`notification:${notification.triggeredForId}`)
            .emit(`notificationcreate`, notification);
        });
    }

    // trigger notification for the community's owner
    req.app
      .get("io")
      .to(`notification:${owner.userId}`)
      .emit("notificationupdate");

    res.json({
      message: `Successfully ${actionRes} the community request`,
      notification: notificationRes,
      participant: participantRes,
    });
  }),
];

export {
  community_get,
  community_post,
  communities_get,
  communities_explore_get,
  community_participation_status_get,
  community_join_post,
  community_request_POST,
};

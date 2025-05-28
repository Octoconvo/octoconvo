import asyncHandler from "express-async-handler";
import { Request, Response } from "express";
import { createAuthenticationHandler } from "../utils/authentication";
import { body, check, validationResult } from "express-validator";
import { createValidationErrObj } from "../utils/error";
import {
  getCommunityById,
  getCommunityByName,
  createCommunity,
  getUserCommunities,
} from "../database/prisma/communityQueries";
import { convertFileName } from "../utils/file";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import sharp from "sharp";
import { getPublicURL, uploadFile } from "../database/supabase/supabaseQueries";
import multer from "multer";
import { isUUID } from "../utils/validation";
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
  communityId: check("communityid").custom((val, { req }) => {
    const communityId = req.params?.communityid;

    if (!isUUID(communityId)) {
      throw new Error("Community id is invalid");
    }

    return true;
  }),
};

const community_get = [
  createAuthenticationHandler({
    message: "Failed to fetch community",
    errMessage: "You are not authenticated",
  }),
  communityValidation.communityId,
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
        folder: communityName,
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
        folder: communityName,
      });

      const url = getPublicURL({ path: data.path, bucketName: "banner" });

      if (url) bannerURL = url.publicUrl;
    }

    try {
      const community = await createCommunity({
        id: id,
        name: communityName,
        bio,
        avatar: avatarURL,
        banner: bannerURL,
      });

      req.app.get("io").to(`communities:${id}`).emit("communitycreate");

      res.json({
        message: "Successfully created community",
        community,
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

export { community_get, community_post, communities_get };

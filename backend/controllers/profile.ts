import asyncHandler from "express-async-handler";
import { Request, Response } from "express";
import {
  getUserProfileById,
  updateUserProfileById,
} from "../database/prisma/profileQueries";
import { createAuthenticationHandler } from "../utils/authentication";
import { body, check, validationResult } from "express-validator";
import { createValidationErrObj } from "../utils/error";
import multer from "multer";
import { convertFileName } from "../utils/file";
import sharp from "sharp";
import { getPublicURL, uploadFile } from "../database/supabase/supabaseQueries";
const storage = multer.memoryStorage();
const upload = multer({ storage });

const imageMimeTypes = ["image/jpeg", "image/png"];

const profileValidation = {
  displayname: body("displayname")
    .trim()
    .optional({ values: "falsy" })
    .isLength({ max: 32 })
    .withMessage("Display name must not exceed 32 characters")
    .escape(),
  bio: body("bio")
    .trim()
    .optional({ values: "falsy" })
    .isLength({ max: 255 })
    .withMessage("Bio must not exxceed 255 characters")
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
        throw new Error("Banner must be in jpeg or png format");
      }
    }

    return true;
  }),
};

const user_profile_get = asyncHandler(async (req: Request, res: Response) => {
  const id = req.params.id;

  const userProfile = await getUserProfileById(id);

  if (!userProfile) {
    res.status(404).json({
      message: "Failed to retrieve user profile",
      error: {
        message: "User profile doesn't exist",
      },
    });
    return;
  }

  res.json({
    message: "Succesfully retrieved user profile",
    userProfile,
  });
});

const user_profile_post = [
  createAuthenticationHandler({
    message: "Failed to update user profile",
    errMessage: "You are not authenticated",
  }),
  upload.fields([
    { name: "avatar", maxCount: 1 },
    { name: "banner", maxCount: 1 },
  ]),
  profileValidation.displayname,
  profileValidation.bio,
  profileValidation.avatar,
  profileValidation.banner,
  asyncHandler(async (req: Request, res: Response) => {
    const user = req?.user;
    const id = req.params.id;

    const userProfile = await getUserProfileById(id);

    // Handle non-existent profile
    if (!userProfile) {
      res.status(404).json({
        message: "Failed to update user profile",
        error: {
          message: "User profile doesn't exist",
        },
      });
      return;
    }

    // Check authorization: users can only update their own profiles
    if (id !== user?.id) {
      res.status(403).json({
        message: "You are not authorized to edit this profile",
        error: {
          message: "This profile is not yours to edit!",
        },
      });
      return;
    }

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      const obj = createValidationErrObj(
        errors,
        "Failed to update user profile",
      );

      res.status(422).json(obj);
      return;
    }

    const files = req.files as {
      avatar: Express.Multer.File[];
      banner: Express.Multer.File[];
    };
    const displayName: null | string = req.body?.displayname
      ? req.body.displayName
      : null;
    const bio: null | string = req.body?.bio ? req.body.bio : null;
    const avatar: null | Express.Multer.File = files?.avatar
      ? convertFileName(files.avatar[0])
      : null;
    const banner: null | Express.Multer.File = files?.banner
      ? convertFileName(files.banner[0])
      : null;

    let avatarURL: null | string = null;
    let bannerURL: null | string = null;

    if (avatar) {
      // Resize and compress image
      const buffer = await sharp(avatar.buffer)
        .jpeg({ quality: 80 })
        .resize({ width: 320, height: 320, fit: "cover" })
        .toBuffer();

      avatar.buffer = buffer;

      const data = await uploadFile({
        file: avatar,
        bucketName: "avatar",
        folder: id,
      });

      const url = getPublicURL({ path: data.path, bucketName: "avatar" });

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
        bucketName: "banner",
        folder: id,
      });

      const url = getPublicURL({ path: data.path, bucketName: "banner" });

      if (url) bannerURL = url.publicUrl;
    }

    const currentTime = new Date();

    const updatedUserProfile = await updateUserProfileById({
      id,
      displayName,
      bio,
      avatarURL: avatarURL,
      bannerURL: bannerURL,
      currentTime,
    });

    res.json({
      message: "Successfully updated user profile",
      userProfile: updatedUserProfile,
    });
  }),
];

export { user_profile_get, user_profile_post };

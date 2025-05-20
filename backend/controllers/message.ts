import asyncHandler from "express-async-handler";
import { Request, Response, NextFunction } from "express";
import { createAuthenticationHandler } from "../utils/authentication";
import { createValidationErrObj } from "../utils/error";
import { body, check, validationResult } from "express-validator";
import { getInboxById } from "../database/prisma/inboxQueries";
import { createMessage } from "../database/prisma/messageQueries";
import sharp from "sharp";
import multer from "multer";
import { getPublicURL, uploadFile } from "../database/supabase/supabaseQueries";
import { getCommunityByIdAndParticipant } from "../database/prisma/communityQueries";
import { convertFileName } from "../utils/file";
const storage = multer.memoryStorage();
const imageMimeTypes = ["image/jpeg", "image/png", "image/gif"];
const upload = multer({
  storage,
  limits: {
    fileSize: 1000 * 1000 * 5,
  },
  fileFilter: (req, file, cb) => {
    if (!imageMimeTypes.includes(file.mimetype)) {
      return cb(new Error("INVALID_MIMETYPE"));
    }

    cb(null, true);
  },
});

const messageValidation = {
  content: body("content")
    .trim()
    .isLength({ min: 1 })
    .withMessage("Message is required")
    .isLength({ max: 2048 })
    .withMessage("Message must not exceed 2048 characters")
    .escape(),
  inboxId: body("inboxid")
    .trim()
    .isLength({ min: 1 })
    .withMessage("Inbox id is required")
    .bail()
    .custom(val => {
      const uuidRegex = new RegExp(
        /^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/,
      );

      if (!uuidRegex.test(val)) {
        throw new Error("Invalid inbox id");
      }

      return true;
    }),
  attachments: check("attachments").custom((val, { req }) => {
    const files = req?.files;
    let totalSize = 0;

    if (files) {
      files.map((file: Express.Multer.File) => {
        totalSize += file.size;
      });

      if (totalSize > 1024 * 10000) {
        throw new Error("Message attachments total size must not exceed 10 MB");
      }
    }

    return true;
  }),
};

const message_post = [
  createAuthenticationHandler({
    message: "Failed to create message",
    errMessage: "You are not authenticated",
  }),
  (req: Request, res: Response, next: NextFunction) => {
    upload.array("attachments", 10)(req, res, function (err) {
      // Handle file validation
      if (err instanceof multer.MulterError) {
        if (err.code === "LIMIT_FILE_SIZE") {
          res.status(413).json({
            message: "Failed to create message",
            error: {
              validationError: [
                {
                  field: "attachments",
                  msg: "Individual file in attachments must not exceed 5 MB",
                },
              ],
            },
          });
        }

        return;
      } else if (err) {
        if (err.message === "INVALID_MIMETYPE") {
          res.status(422).json({
            message: "Failed to create message",
            error: {
              validationError: [
                {
                  field: "attachments",
                  msg: "Message attachments can only be in jpeg, png, or gif format",
                },
              ],
            },
          });

          return;
        } else {
          next(err);
        }
      }

      next();
    });
  },
  messageValidation.content,
  messageValidation.inboxId,
  messageValidation.attachments,
  asyncHandler(async (req: Request, res: Response) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      const obj = createValidationErrObj(errors, "Failed to create message");

      res.status(422).json(obj);
      return;
    }

    const user = req.user as Express.User;
    const inboxId = req.body.inboxid;
    const content = req.body.content;
    type Attachments = {
      type: "IMAGE";
      subtype: "JPEG" | "PNG" | "GIF";
      height: number;
      width: number;
      size: number;
      url: string;
      thumbnailUrl: string;
    };
    const attachments: Attachments[] = [];

    // Check if inbox exists
    const inbox = await getInboxById(inboxId);

    // send 404 error if the inbox doesn't exist
    if (inbox === null) {
      res.status(404).json({
        message: "Failed to create message",
        error: {
          message: "The recipient's inbox doesn't exist",
        },
      });

      return;
    }

    if (inbox.inboxType === "COMMUNITY") {
      const community = await getCommunityByIdAndParticipant({
        communityId: inbox.communityId as string,
        participantId: user.id as string,
      });

      if (community === null) {
        res.status(403).json({
          message: "Failed to create message",
          error: {
            message: "You are not a member of this community",
          },
        });

        return;
      }
    }

    if (req.files !== null && req.files !== undefined) {
      // Handle files upload
      const files = req.files as Express.Multer.File[];

      for (const file of files) {
        const handleFileAttachment = async (file: Express.Multer.File) => {
          // Compress image
          const fileCopy = convertFileName(file);
          const thumbnailCopy = convertFileName(file);

          type ValidMimetype = "jpeg" | "png" | "gif";
          const type: ValidMimetype = fileCopy.mimetype.split(
            "/",
          )[1] as ValidMimetype;

          const fileBuffer = await sharp(file.buffer)[type]().toBuffer();
          const metadata = await sharp(file.buffer).metadata();
          let thumbnailBuffer;

          if (metadata?.height || 0 > (metadata?.width || 0)) {
            // prettier-ignore
            thumbnailBuffer = await sharp(file.buffer)[type]({ quality: 70 })
              .resize({ height: 720, fit: "cover" })
              .toBuffer();
          } else {
            // prettier-ignore
            thumbnailBuffer = await sharp(file.buffer)[type]({ quality: 70 })
              .resize({ width: 720, fit: "cover" })
              .toBuffer();
          }

          fileCopy.buffer = fileBuffer;
          thumbnailCopy.buffer = thumbnailBuffer;

          const uploadFileAndGetUrl = async (file: Express.Multer.File) => {
            const fileData = await uploadFile({
              file: file,
              bucketName: "attachment",
              folder: inboxId,
            });

            const fileUrl = getPublicURL({
              path: fileData.path,
              bucketName: "attachment",
            });

            return fileUrl;
          };

          const fileUrl = await uploadFileAndGetUrl(fileCopy);
          const thumbnailUrl = await uploadFileAndGetUrl(thumbnailCopy);

          if (fileUrl && thumbnailUrl) {
            const type = file.mimetype.split("/")[0].toUpperCase() as "IMAGE";
            const subtype = file.mimetype.split("/")[1].toUpperCase() as
              | "JPEG"
              | "PNG"
              | "GIF";

            const attachment = {
              type: type,
              subtype: subtype,
              width: metadata.width as number,
              height: metadata.height as number,
              size: file.size,
              url: fileUrl.publicUrl,
              thumbnailUrl: thumbnailUrl.publicUrl,
            };
            attachments.push(attachment);
          }
        };

        await handleFileAttachment(file);
      }
    }

    const message = await createMessage({
      authorId: user.id,
      inboxId,
      content,
      attachments,
    });

    if (inbox.inboxType === "COMMUNITY") {
      req.app
        .get("io")
        .to(`communities:${inbox.communityId}`)
        .emit("communitycreate");
    }

    console.log(message);

    res.json({
      message: "Successfully created message",
      messageData: message,
    });
  }),
];

export { message_post };
